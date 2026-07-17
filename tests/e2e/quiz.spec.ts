import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { quizOffers } from "../../src/features/quiz/content/offers";
import { quizProfiles, quizProfileOrder } from "../../src/features/quiz/content/profiles";
import { quizQuestions } from "../../src/features/quiz/content/questions";
import { calculateRecommendedPlan } from "../../src/features/quiz/domain/quiz.recommendation";
import { calculateQuizResult } from "../../src/features/quiz/domain/quiz.scoring";
import {
  quizPlanIds,
  quizQuestionIds,
  quizSceneIds,
  quizVersion,
  type QuizAnswerMap,
  type QuizMachineState,
  type QuizPlanId,
  type QuizProfileId,
} from "../../src/features/quiz/domain/quiz.types";
import {
  auditQuizQuestionContent,
  hasCompleteQuizAnswers,
} from "../../src/features/quiz/domain/quiz.validation";
import {
  createInitialQuizState,
  quizMachineReducer,
} from "../../src/features/quiz/state/quiz-machine";
import {
  loadQuizState,
  quizStorageKey,
  quizStorageTtlMs,
  saveQuizState,
} from "../../src/features/quiz/state/quiz-storage";
import type { LocalQuizEvent } from "../../src/features/quiz/analytics/quiz.events";

function enumerateAnswers(): readonly QuizAnswerMap[] {
  const combinations: QuizAnswerMap[] = [];
  const walk = (index: number, answers: QuizAnswerMap) => {
    const question = quizQuestions[index];
    if (question === undefined) {
      combinations.push(answers);
      return;
    }
    question.options.forEach((option) => {
      walk(index + 1, { ...answers, [question.id]: option.id });
    });
  };
  walk(0, {});
  return combinations;
}

const combinations = enumerateAnswers();
const evaluated = combinations.map((answers) => ({
  answers,
  result: calculateQuizResult(answers),
  recommendation: calculateRecommendedPlan(answers),
}));

function findAnswersForPlan(plan: QuizPlanId): QuizAnswerMap {
  const match = evaluated.find((candidate) => candidate.recommendation?.plan === plan);
  if (match === undefined) throw new Error(`Plano inalcançável: ${plan}`);
  return match.answers;
}

async function startQuiz(page: Page) {
  await page.goto("/quiz");
  await page.getByRole("button", { name: /Começar a descoberta/ }).click();
  await expect(page.getByRole("heading", { name: quizQuestions[0]?.prompt ?? "" })).toBeVisible();
}

async function answerCurrent(page: Page, label: string) {
  await page.getByRole("button", { name: new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }).click();
}

async function completeNarrative(page: Page, answers: QuizAnswerMap) {
  await startQuiz(page);
  await answerCurrent(page, quizQuestions[0]?.options.find((option) => option.id === answers["appearance-moment"])?.label ?? "");
  await answerCurrent(page, quizQuestions[1]?.options.find((option) => option.id === answers["way-of-starting"])?.label ?? "");
  await page.getByRole("button", { name: /Continuar/ }).click();
  await answerCurrent(page, quizQuestions[2]?.options.find((option) => option.id === answers["routine-friction"])?.label ?? "");
  await page.getByRole("button", { name: /Ver como eu retomo/ }).click();
  await answerCurrent(page, quizQuestions[3]?.options.find((option) => option.id === answers["after-a-missed-day"])?.label ?? "");
  await answerCurrent(page, quizQuestions[4]?.options.find((option) => option.id === answers["trust-language"])?.label ?? "");
  await page.getByRole("button", { name: /Continuar com estes limites/ }).click();
  await answerCurrent(page, quizQuestions[5]?.options.find((option) => option.id === answers["planning-horizon"])?.label ?? "");
  await answerCurrent(page, quizQuestions[6]?.options.find((option) => option.id === answers["honest-commitment"])?.label ?? "");
  await page.getByRole("button", { name: /Revelar meu resultado/ }).click();
  await expect(page).toHaveURL(/\/quiz\/resultado(?:\?|$)/);
}

async function openStoredResult(page: Page, answers: QuizAnswerMap, scene: "result" | "offer" = "result") {
  const timestamp = "2026-07-16T12:00:00.000Z";
  const state: QuizMachineState = {
    version: quizVersion,
    scene,
    answers,
    direction: "forward",
    startedAt: timestamp,
    updatedAt: timestamp,
    completedAt: timestamp,
  };
  await page.goto("/quiz");
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
    key: quizStorageKey,
    value: JSON.stringify(state),
  });
  await page.goto("/quiz/resultado");
}

test("arquitetura contém 14 momentos, 7 perguntas e pontuação cruzada", () => {
  expect(quizSceneIds).toHaveLength(14);
  expect(quizQuestions).toHaveLength(7);
  expect(quizQuestionIds).toHaveLength(7);
  expect(quizQuestions.filter((question) => question.commercial).map((question) => question.id)).toEqual([
    "planning-horizon",
    "honest-commitment",
  ]);
  expect(auditQuizQuestionContent()).toEqual({ valid: true, errors: [] });
  for (const question of quizQuestions.slice(0, 5)) {
    expect(`${question.prompt} ${question.context}`).not.toMatch(/kit|frasco|30 dias|90 dias|210 dias|reposição/i);
  }
});

test("16.384 combinações cobrem perfis e ofertas sem domínio artificial", () => {
  expect(combinations).toHaveLength(16_384);
  const profiles = new Map<QuizProfileId, number>();
  const plans = new Map<QuizPlanId, number>();
  let invalid = 0;
  for (const candidate of evaluated) {
    if (candidate.result === null || candidate.recommendation === null) {
      invalid += 1;
      continue;
    }
    profiles.set(candidate.result.profile, (profiles.get(candidate.result.profile) ?? 0) + 1);
    plans.set(candidate.recommendation.plan, (plans.get(candidate.recommendation.plan) ?? 0) + 1);
  }
  expect(invalid).toBe(0);
  expect([...profiles.keys()].sort()).toEqual([...quizProfileOrder].sort());
  expect([...plans.keys()].sort()).toEqual([...quizPlanIds].sort());
  expect(Math.max(...plans.values()) / combinations.length).toBeLessThanOrEqual(0.7);
  expect(Math.max(...profiles.values()) / combinations.length).toBeLessThanOrEqual(0.7);
});

test("duração ignora aparência, fricção, começo, retomada e tipo de prova", () => {
  const groups = new Map<string, Set<QuizPlanId>>();
  for (const candidate of evaluated) {
    if (candidate.recommendation === null) continue;
    const key = `${String(candidate.answers["planning-horizon"])}:${String(candidate.answers["honest-commitment"])}`;
    const plans = groups.get(key) ?? new Set<QuizPlanId>();
    plans.add(candidate.recommendation.plan);
    groups.set(key, plans);
  }
  expect(groups.size).toBe(16);
  for (const plans of groups.values()) expect(plans.size).toBe(1);
});

test("fronteiras de 30, 90 e 210 dias respeitam compromisso explícito", () => {
  let invalid210 = 0;
  let invalid30 = 0;
  for (const candidate of evaluated) {
    const plan = candidate.recommendation?.plan;
    if (
      plan === "210-days" &&
      (candidate.answers["honest-commitment"] !== "explicit-long-commitment" ||
        candidate.answers["planning-horizon"] === "one-step-first")
    ) invalid210 += 1;
    if (
      plan === "30-days" &&
      candidate.answers["honest-commitment"] !== "try-before-continuity" &&
      candidate.answers["honest-commitment"] !== "not-ready-to-buy"
    ) invalid30 += 1;
  }
  expect(invalid210).toBe(0);
  expect(invalid30).toBe(0);
  const conflict = {
    ...combinations[0],
    "planning-horizon": "one-step-first",
    "honest-commitment": "explicit-long-commitment",
  };
  expect(calculateRecommendedPlan(conflict)?.plan).toBe("90-days");
});

test("resultado é determinístico, rejeita resposta inválida e não nasce incompleto", () => {
  const answers = combinations[817];
  expect(answers).toBeDefined();
  if (answers === undefined) return;
  const reordered = Object.fromEntries(Object.entries(answers).reverse());
  expect(calculateQuizResult(reordered)).toEqual(calculateQuizResult(answers));
  const incomplete = Object.fromEntries(Object.entries(answers).slice(1));
  expect(hasCompleteQuizAnswers(incomplete)).toBe(false);
  expect(calculateQuizResult(incomplete)).toBeNull();
  expect(calculateQuizResult({ ...answers, "appearance-moment": "invalid" })).toBeNull();
});

test("storage v4 retoma, expira em 30 dias e rejeita schema inválido", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
  const now = Date.parse("2026-07-16T12:00:00.000Z");
  const state: QuizMachineState = {
    ...createInitialQuizState(new Date(now).toISOString()),
    scene: "routine-friction",
    answers: {
      "appearance-moment": "clothes-waited",
      "way-of-starting": "small-visible-cue",
    },
    startedAt: new Date(now).toISOString(),
  };
  saveQuizState(state, storage);
  expect(loadQuizState(storage, now)).toEqual(state);
  const expired = { ...state, updatedAt: new Date(now - quizStorageTtlMs - 1).toISOString() };
  values.set(quizStorageKey, JSON.stringify(expired));
  expect(loadQuizState(storage, now).scene).toBe("intro");
  values.set(quizStorageKey, JSON.stringify({ ...state, email: "pessoa@exemplo.test", version: 3 }));
  expect(loadQuizState(storage, now).scene).toBe("intro");
});

test("reducer permite voltar, revisar e atualizar sem perder respostas", () => {
  const timestamp = "2026-07-16T12:00:00.000Z";
  let state = createInitialQuizState(timestamp);
  state = quizMachineReducer(state, { type: "START", now: timestamp });
  state = quizMachineReducer(state, {
    type: "ANSWER",
    questionId: "appearance-moment",
    optionId: "clothes-waited",
    now: timestamp,
  });
  state = quizMachineReducer(state, { type: "NEXT", now: timestamp });
  expect(state.scene).toBe("way-of-starting");
  state = quizMachineReducer(state, { type: "BACK", now: timestamp });
  expect(state.answers["appearance-moment"]).toBe("clothes-waited");
  state = quizMachineReducer(state, {
    type: "ANSWER",
    questionId: "appearance-moment",
    optionId: "noticed-and-lived",
    now: timestamp,
  });
  expect(state.answers["appearance-moment"]).toBe("noticed-and-lived");
});

test("ofertas têm checkout oficial, preço bloqueado e quantidade documentada", () => {
  expect(quizOffers["30-days"].checkoutUrl).toContain("PWJOI4I112");
  expect(quizOffers["90-days"].checkoutUrl).toContain("1E8NNCGJW9");
  expect(quizOffers["210-days"].checkoutUrl).toContain("41CHX4MGPX");
  expect(quizOffers["210-days"].bottles).toBe(7);
  expect(quizOffers["210-days"].paidBottles).toBe(5);
  expect(quizOffers["210-days"].additionalBottles).toBe(2);
  for (const offer of Object.values(quizOffers)) expect(offer.priceStatus).toBe("blocked");
});

test("abertura mobile mostra produto inteiro, proposta, tempo e venda identificada", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/quiz");
  await expect(page.getByRole("heading", { name: /O cuidado que cabe na vida/ })).toBeVisible();
  await expect(page.getByAltText(/Frasco do suplemento alimentar CeluClin/)).toBeVisible();
  await expect(page.getByText(/90–150 s/)).toBeVisible();
  await expect(page.getByText(/recomendação comercial identificada/)).toBeVisible();
  const product = page.getByAltText(/Frasco do suplemento alimentar CeluClin/);
  const box = await product.boundingBox();
  expect(box).not.toBeNull();
  if (box !== null) {
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.scrollHeight));
  }
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
});

test("seleção responde em até 100 ms com estado forte e voltar preserva resposta", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startQuiz(page);
  const choice = page.getByRole("button", { name: /Uma roupa ficou no armário/ });
  const feedback = await choice.evaluate(async (element) => {
    const started = performance.now();
    (element as HTMLButtonElement).click();
    await Promise.resolve();
    return {
      elapsed: performance.now() - started,
      selected: element.getAttribute("aria-pressed"),
      transition: getComputedStyle(element).transitionDuration,
    };
  });
  expect(feedback.selected).toBe("true");
  expect(feedback.elapsed).toBeLessThan(100);
  expect(Number.parseFloat(feedback.transition)).toBeLessThanOrEqual(0.1);
  await expect.poll(async () => page.getByRole("heading").first().textContent()).toContain("Quando você decide cuidar");
  await page.getByRole("button", { name: "Voltar um momento" }).click();
  await expect(page.getByRole("button", { name: /Uma roupa ficou no armário/ })).toHaveAttribute("aria-pressed", "true");
});

test("retomada após refresh conserva a cena e a resposta", async ({ page }) => {
  await startQuiz(page);
  await answerCurrent(page, "Uma roupa ficou no armário");
  await expect(page.getByRole("heading", { name: quizQuestions[1]?.prompt ?? "" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: quizQuestions[1]?.prompt ?? "" })).toBeVisible();
  await page.getByRole("button", { name: "Voltar um momento" }).click();
  await expect(page.getByRole("button", { name: /Uma roupa ficou no armário/ })).toHaveAttribute("aria-pressed", "true");
});

test("teclado, alvos de toque e reduced motion permanecem funcionais", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await startQuiz(page);
  const first = page.locator(".quiz-choice").first();
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: quizQuestions[1]?.prompt ?? "" })).toBeVisible();
  const boxes = await page.locator(".quiz-choice, .quiz-icon-button").evaluateAll((elements) =>
    elements.map((element) => {
      const rectangle = element.getBoundingClientRect();
      return { width: rectangle.width, height: rectangle.height };
    }),
  );
  for (const box of boxes) {
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  const duration = await page.locator(".quiz-question-stage").evaluate((element) => getComputedStyle(element).animationDuration);
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.001);
});

test("fluxo completo entrega microinsights, resultado específico, prova e revisão", async ({ page }) => {
  test.setTimeout(120_000);
  const answers = findAnswersForPlan("90-days");
  await completeNarrative(page, answers);
  const result = calculateQuizResult(answers);
  expect(result).not.toBeNull();
  if (result === null) return;
  await expect(page.getByRole("heading", { name: quizProfiles[result.profile].name })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Seu pequeno ritual de sete dias/ })).toBeVisible();
  await expect(page.getByText(/Perfil e oferta foram calculados em trilhas separadas/)).toBeVisible();
  await expect(page.getByText(/não apresentamos estas imagens como resultado causado pelo produto/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Ver recomendação e opções/ })).toBeVisible();
  const proofImage = page.locator(".quiz-proof--result .quiz-proof__stage img");
  await proofImage.scrollIntoViewIfNeeded();
  await expect(proofImage).toBeVisible();
  expect(await proofImage.evaluate((element) => getComputedStyle(element).objectFit)).toBe("contain");
});

test("oferta explicita critérios, compara três opções e omite preço incompleto", async ({ page }) => {
  const answers = findAnswersForPlan("210-days");
  await openStoredResult(page, answers);
  await page.getByRole("button", { name: /Ver recomendação e opções/ }).click();
  await expect(page.getByRole("heading", { name: /5 \+ 2 frascos/ })).toBeVisible();
  await expect(page.getByText(/Recomendamos esta opção porque/).first()).toBeVisible();
  await expect(page.locator(".quiz-comparison-card")).toHaveCount(3);
  await expect(page.getByText(/Preço não exibido/)).toBeVisible();
  await expect(page.locator(".quiz-offer")).not.toContainText(/R\$\s*\d/);
  await expect(page.getByRole("link", { name: /Ir ao checkout oficial/ })).toHaveAttribute("href", quizOffers["210-days"].checkoutUrl);
  await page.locator(".quiz-comparison-card").first().click();
  await expect(page.getByRole("link", { name: /Ir ao checkout oficial/ })).toHaveAttribute("href", quizOffers["30-days"].checkoutUrl);
});

test("resultado inválido recupera sem inventar perfil", async ({ page }) => {
  await page.goto("/quiz/resultado");
  await expect(page.getByRole("heading", { name: /sete escolhas válidas/ })).toBeVisible();
  await page.getByRole("button", { name: "Começar o quiz" }).click();
  await expect(page).toHaveURL(/\/quiz(?:\?|$)/);
  await expect(page.getByRole("heading", { name: /O cuidado que cabe na vida/ })).toBeVisible();
});

test("analytics cobre o funil sem conteúdo de resposta", async ({ page }) => {
  await page.addInitScript(() => {
    const target = window as Window & { __QUIZ_EVENTS__?: LocalQuizEvent[] };
    target.__QUIZ_EVENTS__ = [];
    window.addEventListener("belvitale:quiz", (event) => {
      target.__QUIZ_EVENTS__?.push((event as CustomEvent<LocalQuizEvent>).detail);
    });
  });
  await completeNarrative(page, findAnswersForPlan("30-days"));
  await page.getByRole("button", { name: /Ver recomendação e opções/ }).click();
  await page.locator(".quiz-comparison-card").nth(1).click();
  const events = await page.evaluate(() =>
    (window as Window & { __QUIZ_EVENTS__?: LocalQuizEvent[] }).__QUIZ_EVENTS__ ?? [],
  );
  const names = events.map((event) => event.event);
  expect(names).toEqual(expect.arrayContaining([
    "quiz_started",
    "quiz_question_viewed",
    "quiz_question_answered",
    "quiz_insight_viewed",
    "quiz_completed",
    "quiz_profile_viewed",
    "quiz_offer_recommended",
    "quiz_offer_changed",
  ]));
  const allowed = new Set([
    "quiz_version",
    "question_id",
    "step",
    "insight_id",
    "result_profile",
    "recommended_plan",
    "selected_plan",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ]);
  for (const event of events) {
    expect(Object.keys(event.payload).every((key) => allowed.has(key))).toBe(true);
    expect(event.payload).not.toHaveProperty("answer_id");
  }
  expect(JSON.stringify(events)).not.toMatch(/clothes-waited|small-visible-cue|@|telefone|email/i);
});

test("zoom de texto a 200% não cria rolagem horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startQuiz(page);
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  const width = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
  await expect(page.locator(".quiz-choice").first()).toBeVisible();
});

test("feature não contém claims, diagnóstico ou coleta pessoal", () => {
  const files = [
    "src/features/quiz/content/questions.ts",
    "src/features/quiz/content/profiles.ts",
    "src/features/quiz/content/interstitials.ts",
    "src/features/quiz/content/offers.ts",
    "src/features/quiz/components/QuizExperience.tsx",
    "src/features/quiz/components/ResultReveal.tsx",
    "src/features/quiz/components/OfferRecommendation.tsx",
  ];
  const source = files.map((file) => readFileSync(path.resolve(process.cwd(), file), "utf8")).join("\n");
  expect(source).not.toMatch(/\bcura\b|elimina celulite|queima gordura|resultado garantido|cientificamente comprovado|aprovado pela anvisa|duração (?:é|será) necessária|oferece maior eficácia|celulite extrema|\bsalvação\b/i);
  expect(source).not.toMatch(/type=["'](?:email|tel|text)["']|name=["'](?:email|phone|telefone|nome|idade|peso)["']/i);
});
