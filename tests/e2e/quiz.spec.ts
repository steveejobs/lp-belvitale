import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import {
  adaptiveQuizQuestions,
  commonQuizQuestions,
  quizDimensionIds,
  quizQuestions,
  quizTotalSteps,
  type QuizAnswer,
  type QuizQuestion,
} from "../../src/data/quizQuestions";
import {
  quizProfileOrder,
  quizProfiles,
  type QuizProfile,
} from "../../src/data/quizProfiles";
import {
  getQuizAccessMode,
  resolveQuizPublicationStatus,
} from "../../src/data/quizPublication";
import {
  getQuizQuestionPath,
  selectAdaptiveQuestionId,
} from "../../src/quiz/quizAdaptive";
import {
  quizVersion,
  type LocalQuizEvent,
} from "../../src/quiz/quizEvents";
import { getStableQuizExperiment } from "../../src/quiz/quizExperiment";
import { deriveQuizMicroInsight } from "../../src/quiz/quizInsights";
import {
  calculateRecommendedPlan,
  quizPlanOrder,
  type QuizPlan,
} from "../../src/quiz/quizRecommendation";
import {
  calculateQuizResult,
  hasCompleteQuizAnswers,
} from "../../src/quiz/quizScoring";
import {
  inspectQuizStoredState,
  quizStorageKey,
  quizStorageMaxAgeMs,
  quizStorageVersion,
  saveQuizState,
} from "../../src/quiz/quizStorage";

const checkoutTokens: Readonly<Record<QuizPlan, string>> = {
  "30-days": "PWJOI4I112",
  "90-days": "1E8NNCGJW9",
  "210-days": "41CHX4MGPX",
};

function choicesFor(question: QuizQuestion): readonly QuizAnswer[] {
  return question.options.map((option) => ({
    questionId: question.id,
    optionId: option.id,
  }));
}

function enumerateCombinations(): readonly (readonly QuizAnswer[])[] {
  const [first, second, third] = commonQuizQuestions;
  const combinations: QuizAnswer[][] = [];
  for (const answer1 of choicesFor(first)) {
    for (const answer2 of choicesFor(second)) {
      for (const answer3 of choicesFor(third)) {
        const early = [answer1, answer2, answer3];
        const path = getQuizQuestionPath(early);
        const adaptive = path[3];
        const closing1 = path[4];
        const closing2 = path[5];
        if (
          adaptive === undefined ||
          closing1 === undefined ||
          closing2 === undefined
        ) {
          throw new Error("Caminho do quiz incompleto.");
        }
        for (const answer4 of choicesFor(adaptive)) {
          for (const answer5 of choicesFor(closing1)) {
            for (const answer6 of choicesFor(closing2)) {
              combinations.push([
                ...early,
                answer4,
                answer5,
                answer6,
              ]);
            }
          }
        }
      }
    }
  }
  return combinations;
}

const allCombinations = enumerateCombinations();
const evaluatedCombinations = allCombinations.map((answers) => {
  const result = calculateQuizResult(answers);
  const plan = calculateRecommendedPlan(result.dimensions).plan;
  return { answers, result, plan };
});

function findAnswersForProfile(profile: QuizProfile): readonly QuizAnswer[] {
  const evaluated = evaluatedCombinations.find(
    (candidate) => candidate.result.profile === profile,
  );
  if (evaluated === undefined) throw new Error(`Perfil inalcançável: ${profile}`);
  return evaluated.answers;
}

function findAnswersForPlan(plan: QuizPlan): readonly QuizAnswer[] {
  const evaluated = evaluatedCombinations.find(
    (candidate) => candidate.plan === plan,
  );
  if (evaluated === undefined) throw new Error(`Plano inalcançável: ${plan}`);
  return evaluated.answers;
}

async function startQuiz(page: Page) {
  await page.goto("/quiz");
  const button = page.getByRole("button", { name: /Descobrir meu ritmo|Continuar meu ritmo/ });
  await expect(button).toBeVisible();
  await button.click();
  await expect(page.getByRole("progressbar", { name: "Progresso do quiz" })).toHaveAttribute("aria-valuenow", "1");
}

async function chooseAnswer(page: Page, answer: QuizAnswer) {
  const button = page.locator(`[data-question-id="${answer.questionId}"][data-option-id="${answer.optionId}"]`);
  await expect(button).toBeVisible();
  await button.click();
}

async function completeQuiz(
  page: Page,
  answers: readonly QuizAnswer[] = findAnswersForProfile("fits-now"),
) {
  await startQuiz(page);
  for (const answer of answers) await chooseAnswer(page, answer);
  await expect(page).toHaveURL(/\/quiz\/resultado(?:\?|$)/);
}

async function openStoredResult(page: Page, answers: readonly QuizAnswer[]) {
  const result = calculateQuizResult(answers);
  const now = new Date().toISOString();
  await page.evaluate(
    ({ key, value }) => localStorage.setItem(key, value),
    {
      key: quizStorageKey,
      value: JSON.stringify({
        version: quizStorageVersion,
        savedAt: now,
        answers,
        currentStep: quizTotalSteps,
        startedAt: now,
        profile: result.profile,
        completedAt: now,
      }),
    },
  );
  await page.goto("/quiz/resultado");
}

test("conteúdo tem cinco perguntas comuns, quatro ramos e seis formatos reais", () => {
  expect(commonQuizQuestions).toHaveLength(5);
  expect(adaptiveQuizQuestions).toHaveLength(4);
  expect(quizTotalSteps).toBe(6);
  expect(new Set(quizQuestions.map((question) => question.id)).size).toBe(9);
  expect(new Set(quizQuestions.map((question) => question.presentation))).toEqual(
    new Set(["scenes", "tactile", "contrast", "path", "sentence", "priority"]),
  );
  for (const question of quizQuestions) {
    expect(question.options.length).toBeGreaterThanOrEqual(3);
    expect(question.options.length).toBeLessThanOrEqual(4);
    expect(question.title).not.toMatch(/celulite|gordura|peso|medida|tratamento/i);
    for (const option of question.options) {
      const affected = Object.values(option.impact).filter(
        (value) => value !== 0,
      );
      expect(affected.length).toBeGreaterThanOrEqual(2);
    }
  }
});

test("ramificação esclarece a incerteza e todos os quatro caminhos são alcançáveis", () => {
  const branches = new Set(
    allCombinations.map((answers) => getQuizQuestionPath(answers)[3]?.id),
  );
  expect(branches).toEqual(
    new Set([
      "adaptive-return",
      "adaptive-supply",
      "adaptive-simple",
      "adaptive-real-life",
    ]),
  );
  const firstThree = allCombinations[0]?.slice(0, 3) ?? [];
  expect(selectAdaptiveQuestionId(firstThree)).toMatch(/^adaptive-/);
});

test("4.096 combinações validam alcance, distribuição e independência", () => {
  expect(allCombinations.length).toBeGreaterThanOrEqual(500);
  const profiles = new Map<QuizProfile, number>();
  const plans = new Map<QuizPlan, number>();
  const profileByAnswer = new Map<string, Set<QuizProfile>>();
  const planByAnswer = new Map<string, Set<QuizPlan>>();
  let incomplete = 0;

  for (const { answers, result, plan } of evaluatedCombinations) {
    if (!hasCompleteQuizAnswers(answers)) incomplete += 1;
    profiles.set(result.profile, (profiles.get(result.profile) ?? 0) + 1);
    plans.set(plan, (plans.get(plan) ?? 0) + 1);
    for (const answer of answers) {
      const key = `${answer.questionId}:${answer.optionId}`;
      const answerProfiles = profileByAnswer.get(key) ?? new Set<QuizProfile>();
      answerProfiles.add(result.profile);
      profileByAnswer.set(key, answerProfiles);
      const answerPlans = planByAnswer.get(key) ?? new Set<QuizPlan>();
      answerPlans.add(plan);
      planByAnswer.set(key, answerPlans);
    }
  }

  expect(incomplete).toBe(0);
  expect([...profiles.keys()].sort()).toEqual([...quizProfileOrder].sort());
  expect([...plans.keys()].sort()).toEqual([...quizPlanOrder].sort());
  expect(Math.max(...profiles.values()) / allCombinations.length).toBeLessThan(0.5);
  expect(Math.max(...plans.values()) / allCombinations.length).toBeLessThan(0.75);
  expect(Math.min(...plans.values()) / allCombinations.length).toBeGreaterThan(0.08);
  for (const outcomes of profileByAnswer.values()) {
    expect(outcomes.size).toBeGreaterThanOrEqual(2);
  }
  for (const outcomes of planByAnswer.values()) {
    expect(outcomes.size).toBeGreaterThanOrEqual(2);
  }
});

test("empates próximos usam o vetor inteiro e não a última resposta", () => {
  const nearTie = [...evaluatedCombinations]
    .sort((left, right) => {
      const leftGap = (left.result.ranking[1]?.distance ?? 1) - (left.result.ranking[0]?.distance ?? 0);
      const rightGap = (right.result.ranking[1]?.distance ?? 1) - (right.result.ranking[0]?.distance ?? 0);
      return leftGap - rightGap;
    })[0];
  expect(nearTie).toBeDefined();
  if (nearTie === undefined) return;
  expect(nearTie.result.confidence).toBe("subtle");
  const reversed = calculateQuizResult([...nearTie.answers].reverse());
  expect(reversed.profile).toBe(nearTie.result.profile);
  expect(reversed.dimensions).toEqual(nearTie.result.dimensions);
});

test("combinações contraditórias reduzem assertividade sem quebrar o cálculo", () => {
  const contradictory = evaluatedCombinations.find(
    ({ answers, result }) =>
      result.confidence === "subtle" &&
      answers.some((answer) => answer.optionId === "start-tiny-now") &&
      answers.some((answer) => answer.optionId === "future-decided") &&
      answers.some((answer) => answer.optionId === "small-commitment"),
  );
  expect(contradictory).toBeDefined();
  if (contradictory === undefined) return;
  const result = contradictory.result;
  expect(result.confidence).not.toBe("clear");
  expect(Object.values(result.dimensions).every((value) => value >= 0 && value <= 100)).toBe(true);
});

test("mudanças pequenas alteram dimensões de forma limitada e não tornam tudo instável", () => {
  let comparisons = 0;
  let sameProfile = 0;
  let largestAverageChange = 0;
  for (const answers of allCombinations.filter((_, index) => index % 8 === 0)) {
    const original = calculateQuizResult(answers);
    const path = getQuizQuestionPath(answers);
    const question = path[4];
    const current = answers[4];
    const alternative = question?.options.find((option) => option.id !== current?.optionId);
    if (question === undefined || alternative === undefined) continue;
    const changed = answers.map((answer) =>
      answer.questionId === question.id
        ? { questionId: question.id, optionId: alternative.id }
        : answer,
    );
    const next = calculateQuizResult(changed);
    const averageChange =
      quizDimensionIds.reduce(
        (total, dimension) => total + Math.abs(original.dimensions[dimension] - next.dimensions[dimension]),
        0,
      ) / quizDimensionIds.length;
    largestAverageChange = Math.max(largestAverageChange, averageChange);
    comparisons += 1;
    if (original.profile === next.profile) sameProfile += 1;
  }
  expect(comparisons).toBeGreaterThanOrEqual(500);
  expect(largestAverageChange).toBeLessThan(24);
  expect(sameProfile / comparisons).toBeGreaterThan(0.45);
});

test("microinsights são derivados de dimensões realmente medidas", () => {
  const lowFriction = findAnswersForProfile("fits-now").slice(0, 2);
  const first = deriveQuizMicroInsight("after-planning", lowFriction);
  expect(first.derivedFrom.length).toBeGreaterThanOrEqual(2);
  expect(first.text.length).toBeGreaterThan(20);
  const planned = evaluatedCombinations.find(({ answers }) =>
    deriveQuizMicroInsight("after-adaptive", answers.slice(0, 4)).derivedFrom.includes("planning"),
  )?.answers.slice(0, 4);
  expect(planned).toBeDefined();
  if (planned === undefined) return;
  const second = deriveQuizMicroInsight("after-adaptive", planned);
  expect(second.derivedFrom).toContain("planning");
});

test("feature flag é explícita e permanece estável durante a sessão", () => {
  const values = new Map<string, string>();
  const storage: Storage = {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
  const first = getStableQuizExperiment(storage, "rhythm-routine-v3");
  const stable = getStableQuizExperiment(storage, "rhythm-curiosity-v3");
  expect(first.id).toBe("rhythm-routine-v3");
  expect(stable.id).toBe(first.id);
});

test("publicação exige literal aprovado, mas acesso interno continua possível", () => {
  expect(resolveQuizPublicationStatus("approved", false)).toBe("approved");
  expect(resolveQuizPublicationStatus("Approved", false)).toBe("blocked");
  expect(resolveQuizPublicationStatus(undefined, true)).toBe("development");
  expect(getQuizAccessMode("blocked", false, false)).toBe("unavailable");
  expect(getQuizAccessMode("blocked", false, true)).toBe("interactive");
});

test("storage v3 expira, rejeita PII e migra o schema anterior sem inventar resultado", () => {
  expect(quizStorageVersion).toBe(3);
  expect(quizStorageMaxAgeMs).toBe(30 * 24 * 60 * 60 * 1000);
  const now = new Date("2026-07-16T12:00:00.000Z");
  const partial = findAnswersForProfile("fits-now").slice(0, 2);
  const values = new Map<string, string>();
  saveQuizState(
    {
      answers: partial,
      currentStep: 2,
      startedAt: "2026-07-16T11:59:00.000Z",
    },
    {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
    now,
  );
  const saved = values.get(quizStorageKey);
  expect(saved).toBeDefined();
  expect(saved).not.toMatch(/email|phone|name/i);
  expect(inspectQuizStoredState(saved ?? null, now).status).toBe("valid");

  const old = new Date(now.getTime() - quizStorageMaxAgeMs - 1).toISOString();
  expect(
    inspectQuizStoredState(
      JSON.stringify({
        version: 3,
        savedAt: old,
        answers: [],
        currentStep: -1,
      }),
      now,
    ).status,
  ).toBe("expired");
  expect(
    inspectQuizStoredState(
      JSON.stringify({
        version: 3,
        savedAt: now.toISOString(),
        answers: [],
        currentStep: -1,
        email: "pessoa@dominio.invalid",
      }),
      now,
    ).status,
  ).toBe("invalid");

  const migration = inspectQuizStoredState(
    JSON.stringify({
      version: 2,
      savedAt: now.toISOString(),
      answers: [
        { questionId: "how-it-begins", optionId: "begin-small" },
        { questionId: "what-breaks-the-rhythm", optionId: "replacement-late" },
        { questionId: "after-a-missed-day", optionId: "make-it-smaller" },
      ],
      currentStep: 5,
      profile: "simple-start",
      completedAt: now.toISOString(),
    }),
    now,
  );
  expect(migration.status).toBe("migrated");
  expect(migration.state.currentStep).toBe(3);
  expect(migration.state.profile).toBeUndefined();
  expect(migration.state.answers).toHaveLength(3);
});

test("abertura comunica proposta, tempo, produto e privacidade em três segundos", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/quiz");
  await expect(page.getByRole("heading", { name: "Seu jeito de começar muda o que você consegue manter." })).toBeVisible();
  await expect(page.getByText("60–90 segundos")).toBeVisible();
  await expect(page.getByText(/orientação de rotina e uma opção do CeluClin/)).toBeVisible();
  await expect(page.getByAltText("Frasco CeluClin em vista frontal.")).toBeVisible();
  await expect(page.getByText(/Sem diagnóstico e sem dados pessoais/)).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
});

test("perguntas avançam por botões reais, anunciam progresso e preservam voltar + refresh", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const answers = findAnswersForProfile("marked-place");
  const [firstAnswer, secondAnswer] = answers;
  if (firstAnswer === undefined || secondAnswer === undefined) {
    throw new Error("Caminho de teste incompleto.");
  }
  await startQuiz(page);
  await chooseAnswer(page, firstAnswer);
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
  await chooseAnswer(page, secondAnswer);
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
  await page.reload();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
  await expect(page.locator(`[data-option-id="${answers[1]?.optionId ?? ""}"]`)).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#quiz-question-title")).toBeFocused();
});

test("teclado, alvos de toque e reduced motion continuam operáveis", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await startQuiz(page);
  const firstButton = page.locator(".quiz-answer").first();
  await firstButton.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
  const controls = page.locator(".quiz-answer, .quiz-back");
  for (const rect of await controls.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect()),
  )) {
    expect(rect.height).toBeGreaterThanOrEqual(44);
    expect(rect.width).toBeGreaterThanOrEqual(44);
  }
  expect(await page.locator(".quiz-question-stage").evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
});

test("todos os perfis e kits chegam a um resultado útil antes da oferta", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/quiz");
  for (const profileId of quizProfileOrder) {
    await openStoredResult(page, findAnswersForProfile(profileId));
    const profile = quizProfiles[profileId];
    await expect(page.getByRole("heading", { name: profile.title })).toBeVisible();
    const useful = page.locator(".quiz-reading");
    const offer = page.locator(".quiz-recommendation");
    expect(await useful.evaluate((element) => element.getBoundingClientRect().top)).toBeLessThan(
      await offer.evaluate((element) => element.getBoundingClientRect().top),
    );
    await expect(page.getByText(/não é diagnóstico/i).first()).toBeVisible();
  }

  for (const plan of quizPlanOrder) {
    await openStoredResult(page, findAnswersForPlan(plan));
    const expectedToken = checkoutTokens[plan];
    await expect(page.locator(`.quiz-recommendation a[href*="${expectedToken}"]`)).toHaveCount(1);
  }
});

test("resultado mostra três opções, checkout correto e UTMs permitidas", async ({ page }) => {
  const answers = findAnswersForPlan("90-days");
  await page.goto("/quiz?utm_source=instagram&utm_medium=social&utm_campaign=ritmo&utm_content=story&utm_term=autocuidado&email=nao");
  await page.getByRole("button", { name: "Descobrir meu ritmo" }).click();
  for (const answer of answers) await chooseAnswer(page, answer);
  await expect(page).toHaveURL(/\/quiz\/resultado\?/);
  await expect(page.getByRole("link", { name: "Começar com 30 dias" })).toHaveAttribute("href", /PWJOI4I112/);
  await expect(page.getByRole("link", { name: "Escolher 90 dias" }).first()).toHaveAttribute("href", /1E8NNCGJW9/);
  await expect(page.getByRole("link", { name: "Escolher 7 meses" })).toHaveAttribute("href", /41CHX4MGPX/);
  for (const link of await page.locator('a[href*="belvitale.pay.yampi.com.br"]').evaluateAll((elements) => elements.map((element) => (element as HTMLAnchorElement).href))) {
    expect(link).toContain("utm_source=instagram");
    expect(link).toContain("utm_campaign=ritmo");
    expect(link).not.toContain("email=");
  }
});

test("resultado direto inválido recupera e refazer apaga o resultado", async ({ page }) => {
  await page.goto("/quiz/resultado");
  await expect(page.getByRole("heading", { name: "Seu ritmo precisa das seis escolhas." })).toBeVisible();
  await page.getByRole("button", { name: "Começar o quiz" }).click();
  await expect(page).toHaveURL(/\/quiz(?:\?|$)/);
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");

  await page.evaluate(() => localStorage.clear());
  await page.goto("/quiz");
  await completeQuiz(page);
  await page.getByRole("button", { name: "Refazer o quiz" }).click();
  await expect(page).toHaveURL(/\/quiz(?:\?|$)/);
  await expect(page.getByRole("button", { name: "Descobrir meu ritmo" })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), quizStorageKey)).toBeNull();
});

test("analytics central cobre navegação, resposta, abandono, resultado e não envia PII", async ({ page }) => {
  await page.addInitScript(() => {
    const target = window as Window & { __QUIZ_EVENTS__?: LocalQuizEvent[] };
    target.__QUIZ_EVENTS__ = [];
    window.addEventListener("belvitale:quiz", (event) => {
      target.__QUIZ_EVENTS__?.push((event as CustomEvent<LocalQuizEvent>).detail);
    });
  });
  const answers = findAnswersForPlan("30-days");
  await completeQuiz(page, answers);
  await page.locator(".quiz-recommendation").scrollIntoViewIfNeeded();
  await page.locator(".quiz-all-plans").scrollIntoViewIfNeeded();
  await expect.poll(async () =>
    page.evaluate(() => (window as Window & { __QUIZ_EVENTS__?: LocalQuizEvent[] }).__QUIZ_EVENTS__?.map((event) => event.event)),
  ).toContain("quiz_all_options_view");
  const events = await page.evaluate(
    () => (window as Window & { __QUIZ_EVENTS__?: LocalQuizEvent[] }).__QUIZ_EVENTS__ ?? [],
  );
  const names = events.map((event) => event.event);
  expect(names).toEqual(expect.arrayContaining([
    "quiz_view",
    "quiz_start",
    "quiz_question_view",
    "quiz_answer",
    "quiz_checkpoint_view",
    "quiz_complete",
    "quiz_result_view",
    "quiz_recommendation_view",
    "quiz_all_options_view",
  ]));
  const allowedKeys = new Set([
    "quiz_version",
    "experiment_variant",
    "question_id",
    "answer_id",
    "step",
    "result_profile",
    "recommended_plan",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ]);
  for (const event of events) {
    expect(event.payload.quiz_version).toBe(quizVersion);
    expect(Object.keys(event.payload).every((key) => allowedKeys.has(key))).toBe(true);
  }
  const serialized = JSON.stringify(events);
  expect(serialized).not.toMatch(/email|telefone|phone|@|\b\d{8,}\b/i);
});

test("abandono é emitido na pergunta atual sem resposta livre", async ({ page }) => {
  await page.addInitScript(() => {
    const target = window as Window & { __QUIZ_EVENTS__?: LocalQuizEvent[] };
    target.__QUIZ_EVENTS__ = [];
    window.addEventListener("belvitale:quiz", (event) => {
      target.__QUIZ_EVENTS__?.push((event as CustomEvent<LocalQuizEvent>).detail);
    });
  });
  await startQuiz(page);
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pagehide")));
  const abandon = await page.evaluate(() =>
    (window as Window & { __QUIZ_EVENTS__?: LocalQuizEvent[] }).__QUIZ_EVENTS__?.find((event) => event.event === "quiz_abandon"),
  );
  expect(abandon?.payload.question_id).toBe("first-move");
  expect(abandon?.payload.step).toBe(1);
});

test("quiz suporta 200% de texto sem overflow horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startQuiz(page);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  const size = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(size.scroll).toBeLessThanOrEqual(size.client + 1);
  await expect(page.locator(".quiz-answer").first()).toBeVisible();
});

test("código e copy do quiz não contêm claims ou coleta proibida", () => {
  const files = [
    "src/components/QuizRoute.tsx",
    "src/components/quiz/QuizQuestionExperience.tsx",
    "src/components/quiz/QuizResultExperience.tsx",
    "src/components/quiz/QuizResultProof.tsx",
    "src/components/quiz/QuizPlanOptions.tsx",
    "src/data/quizQuestions.ts",
    "src/data/quizProfiles.ts",
    "src/quiz/quizRecommendation.ts",
  ];
  const source = files
    .map((file) => readFileSync(path.resolve(process.cwd(), file), "utf8"))
    .join("\n");
  expect(source).not.toMatch(/cura ou elimina|queima gordura|reduz gordura localizada|resultado garantido|cientificamente comprovado|aprovado pela anvisa|transformação comprovada|tratamento ideal|protocolo recomendado|plano necessário|o seu corpo precisa|maior chance de resultado/i);
  expect(source).not.toMatch(/type=["'](?:email|tel|text)["']|name=["'](?:email|phone|telefone|nome|idade|peso)["']/i);
});
