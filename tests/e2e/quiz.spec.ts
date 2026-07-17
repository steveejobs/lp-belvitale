import { expect, test, type Page } from "@playwright/test";
import { quizPromotion } from "../../src/features/quiz/campaign/campaign.config";
import type { QuizPromotion } from "../../src/features/quiz/campaign/campaign.types";
import { buildCheckoutUrl } from "../../src/features/quiz/checkout/checkout.utm";
import { calculateRecommendedPlan, isConcernIndependentFromRecommendation } from "../../src/features/quiz/domain/quiz.recommendation";
import { calculateQuizResult } from "../../src/features/quiz/domain/quiz.scoring";
import { parseQuizSession } from "../../src/features/quiz/domain/quiz.schema";
import { quizStageDefinitions } from "../../src/features/quiz/domain/quiz.machine";
import { quizQuestionIds, QUIZ_VERSION, type QuizAnswers } from "../../src/features/quiz/domain/quiz.types";
import { sanitizeFirstName } from "../../src/features/quiz/domain/quiz.validation";
import { calculatePrice } from "../../src/features/quiz/pricing/pricing.calculate";
import { issueReward } from "../../src/features/quiz/reward/reward.engine";
import { calculatePromotionTime } from "../../src/features/quiz/timer/timer.machine";
import { quizQuestions } from "../../src/features/quiz/content/questions";

const commercialBase: QuizAnswers = {
  trigger: "clothes-fit",
  concern: "cellulite",
  impact: "care-restart",
  attempts: "routine-tightened",
  recovery: "restart-small",
  "proof-preference": "authorized-experiences",
  readiness: "months-ready",
  continuity: "moderate-continuity",
};

async function waitForHeading(page: Page, name: RegExp) {
  await expect(page.getByRole("heading", { name })).toBeVisible();
}

async function choose(page: Page, name: RegExp) {
  await page.getByRole("button", { name }).click();
}

async function completeToResult(page: Page) {
  await page.goto("/quiz");
  await choose(page, /Começar a descoberta/);
  await choose(page, /Continuar sem informar/);
  await choose(page, /roupa não veste/);
  await choose(page, /Aparência da celulite/);
  await waitForHeading(page, /Já apareceu um padrão/);
  await choose(page, /^Continuar/);
  await choose(page, /retomar algum cuidado/);
  await choose(page, /Comecei animada/);
  await waitForHeading(page, /saber o que fazer/);
  await choose(page, /Ver como eu retomo/);
  await choose(page, /Retomo com um gesto menor/);
  await choose(page, /Continuar com esta resposta/);
  await choose(page, /Ver experiências autorizadas/);
  await waitForHeading(page, /vem primeiro nesta galeria/);
  await choose(page, /Continuar com este contexto/);
  await waitForHeading(page, /Já apareceu um padrão/);
  await choose(page, /^Continuar/);
  await choose(page, /organizar alguns meses/);
  await choose(page, /continuidade sem planejar tão longe/);
  await waitForHeading(page, /leitura está pronta/);
  await choose(page, /Revelar meu resultado/);
  await waitForHeading(page, /Retomar vale mais|Clareza antes|Confiança move|Estrutura reduz/);
}

test.describe("domínio do Quiz CeluClin 6.0", () => {
  test("mantém 17 momentos, no máximo 8 perguntas e função explícita por etapa", () => {
    expect(quizStageDefinitions).toHaveLength(17);
    expect(quizQuestions).toHaveLength(8);
    expect(quizQuestionIds).toHaveLength(8);
    expect(quizStageDefinitions.every((stage) => stage.adds.length > 0)).toBe(true);
  });

  test("sanitiza e limita o primeiro nome sem transformar texto livre em analytics", () => {
    expect(sanitizeFirstName("  M<ar!ina Silva  ")).toBe("Marina");
    expect(sanitizeFirstName("Ana-Maria")).toBe("Ana-Maria");
    expect(sanitizeFirstName("123")).toBe("");
    expect(sanitizeFirstName("A".repeat(40))).toHaveLength(24);
  });

  test("isola preocupação visual da recomendação comercial", () => {
    expect(isConcernIndependentFromRecommendation(commercialBase)).toBe(true);
  });

  test("distribui a matriz comercial em 25% / 56,25% / 18,75%", () => {
    const readiness = quizQuestions.find((question) => question.id === "readiness");
    const continuity = quizQuestions.find((question) => question.id === "continuity");
    expect(readiness).toBeDefined();
    expect(continuity).toBeDefined();
    const plans = readiness?.options.flatMap((left) => continuity?.options.map((right) =>
      calculateRecommendedPlan({ ...commercialBase, readiness: left.id, continuity: right.id })?.offerId,
    ) ?? []) ?? [];
    expect(plans.filter((plan) => plan === "one-month")).toHaveLength(4);
    expect(plans.filter((plan) => plan === "three-months")).toHaveLength(9);
    expect(plans.filter((plan) => plan === "seven-months")).toHaveLength(3);
  });

  test("simula 10.000 combinações válidas sem resultado ou kit impossível", () => {
    const combinations: QuizAnswers[] = [];
    const walk = (index: number, answers: Record<string, string>) => {
      if (combinations.length >= 10_000) return;
      const question = quizQuestions[index];
      if (question === undefined) {
        combinations.push(answers);
        return;
      }
      for (const option of question.options) {
        walk(index + 1, { ...answers, [question.id]: option.id });
        if (combinations.length >= 10_000) break;
      }
    };
    walk(0, {});
    const profiles = new Set<string>();
    const offers = new Set<string>();
    for (const answers of combinations) {
      const result = calculateQuizResult(answers);
      const recommendation = calculateRecommendedPlan(answers);
      expect(result).not.toBeNull();
      expect(recommendation).not.toBeNull();
      if (result !== null) profiles.add(result.id);
      if (recommendation !== null) offers.add(recommendation.offerId);
    }
    expect(combinations).toHaveLength(10_000);
    expect(profiles.size).toBeGreaterThanOrEqual(3);
    expect(offers).toEqual(new Set(["one-month", "three-months", "seven-months"]));
  });

  test("calcula os três preços com precisão decimal", () => {
    expect(calculatePrice(quizPromotion.offers["one-month"]).finalPrice).toBe(89.9);
    expect(calculatePrice(quizPromotion.offers["three-months"]).savingsValue).toBe(421.1);
    expect(calculatePrice(quizPromotion.offers["seven-months"]).savingsPercentage).toBe(56.71);
  });

  test("não emite reward comercial em campanha draft sem cupom validado", () => {
    expect(issueReward(quizPromotion, "session-123")).toBeNull();
  });

  test("emite recompensa determinística uma única condição para a mesma sessão", () => {
    const active: QuizPromotion = {
      ...quizPromotion,
      status: "active",
      startsAt: "2026-01-01T00:00:00.000Z",
      endsAt: "2027-01-01T00:00:00.000Z",
      rewards: [
        { id: "a", couponCode: "VALID-A", discountType: "fixed", discountValue: 10, eligibleOffers: ["one-month"], probabilityWeight: 1 },
        { id: "b", couponCode: "VALID-B", discountType: "percentage", discountValue: 10, eligibleOffers: ["three-months"], probabilityWeight: 1 },
      ],
    };
    const first = issueReward(active, "session-fixed", new Date("2026-07-17T12:00:00.000Z"));
    const refresh = issueReward(active, "session-fixed", new Date("2026-07-17T12:00:01.000Z"));
    expect(first?.rewardId).toBe(refresh?.rewardId);
    expect(first?.couponCode).toBe(refresh?.couponCode);
  });

  test("usa tempo absoluto e cobre todos os estados do cronômetro", () => {
    const expires = "2026-07-17T13:00:00.000Z";
    expect(calculatePromotionTime(expires, Date.parse("2026-07-17T11:00:00.000Z")).state).toBe("normal");
    expect(calculatePromotionTime(expires, Date.parse("2026-07-17T12:30:00.000Z")).state).toBe("under-hour");
    expect(calculatePromotionTime(expires, Date.parse("2026-07-17T12:56:00.000Z")).state).toBe("under-five-minutes");
    expect(calculatePromotionTime(expires, Date.parse("2026-07-17T12:59:30.000Z")).state).toBe("under-minute");
    expect(calculatePromotionTime(expires, Date.parse("2026-07-17T13:00:01.000Z")).state).toBe("expired");
  });

  test("preserva UTMs e metadados do quiz no checkout", () => {
    const url = new URL(buildCheckoutUrl(
      quizPromotion.offers["three-months"].checkoutUrl,
      "?utm_source=meta&utm_campaign=quiz-v6&utm_content=video-a",
      { campaignId: quizPromotion.id, rewardId: "reward-1", offerId: "three-months" },
    ));
    expect(url.searchParams.get("utm_source")).toBe("meta");
    expect(url.searchParams.get("campaignId")).toBe(quizPromotion.id);
    expect(url.searchParams.get("rewardId")).toBe("reward-1");
  });

  test("reprova sessão expirada e aceita schema v6 íntegro", () => {
    const state = {
      version: QUIZ_VERSION,
      sessionId: "session-valid",
      stageId: "opening",
      visitedStageIds: ["opening"],
      answers: {},
      firstName: "",
      nameProvided: false,
      savedAt: "2026-07-17T10:00:00.000Z",
      expiresAt: "2026-07-18T10:00:00.000Z",
    };
    expect(parseQuizSession(state, Date.parse("2026-07-17T11:00:00.000Z"))).not.toBeNull();
    expect(parseQuizSession(state, Date.parse("2026-07-19T11:00:00.000Z"))).toBeNull();
  });
});

test.describe("experiência mobile", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/quiz");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("conclui a jornada, preserva imagens inteiras e alcança checkout", async ({ page }) => {
    await completeToResult(page);
    expect(page.url()).toContain("/quiz/resultado");
    const resultImage = page.locator(".q6-result .q6-proof__viewer img");
    await expect(resultImage).toBeVisible();
    expect(await resultImage.evaluate((image) => getComputedStyle(image).objectFit)).toBe("contain");
    await choose(page, /Ver preço, benefício e opções/);
    await choose(page, /Desbloquear meu roteiro/);
    await expect(page.getByRole("heading", { name: /Três regras/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /90 dias/ })).toBeVisible();
    await expect(page.getByText("R$ 169,90").first()).toBeVisible();
    const checkout = page.getByRole("link", { name: /Escolher 90 dias/ }).first();
    await expect(checkout).toHaveAttribute("href", /1E8NNCGJW9/);
  });

  test("voltar preserva e permite trocar resposta", async ({ page }) => {
    await choose(page, /Começar a descoberta/);
    await choose(page, /Continuar sem informar/);
    await choose(page, /roupa não veste/);
    await waitForHeading(page, /Hoje, o que mais chama/);
    await page.getByRole("button", { name: /Voltar à etapa anterior/ }).click();
    await waitForHeading(page, /Qual momento mais/);
    await expect(page.getByRole("button", { name: /roupa não veste/ })).toHaveAttribute("aria-pressed", "true");
    await choose(page, /foto sem estar preparada/);
    await waitForHeading(page, /Hoje, o que mais chama/);
  });

  test("refresh preserva etapa, resposta e nome opcional", async ({ page }) => {
    await choose(page, /Começar a descoberta/);
    await page.getByLabel("Primeiro nome").fill("Marina");
    await choose(page, /^Continuar$/);
    await choose(page, /roupa não veste/);
    await waitForHeading(page, /Hoje, o que mais chama/);
    await page.reload();
    await waitForHeading(page, /Hoje, o que mais chama/);
    const stored = await page.evaluate(() => localStorage.getItem("belvitale.quiz.v6"));
    expect(stored).toContain("Marina");
  });

  test("sincroniza a etapa entre duas abas sem ciclo de storage", async ({ page, context }) => {
    const secondPage = await context.newPage();
    await secondPage.setViewportSize({ width: 390, height: 844 });
    await secondPage.goto("/quiz");

    await choose(page, /Come.ar a descoberta/);
    await waitForHeading(secondPage, /Como posso te chamar/);
    await choose(page, /Continuar sem informar/);
    await waitForHeading(secondPage, /Qual momento mais/);

    await page.waitForTimeout(300);
    const synchronizedStage = await secondPage.evaluate(() => {
      const stored = localStorage.getItem("belvitale.quiz.v6");
      if (stored === null) return null;
      const parsed: unknown = JSON.parse(stored);
      if (typeof parsed !== "object" || parsed === null || !("stageId" in parsed)) return null;
      return typeof parsed.stageId === "string" ? parsed.stageId : null;
    });
    expect(synchronizedStage).toBe("trigger");
    await secondPage.close();
  });

  test("deduplica montagem e rejeita UTM com possivel dado pessoal", async ({ page }) => {
    await page.addInitScript(() => {
      const events: unknown[] = [];
      Object.defineProperty(window, "__quizEvents", { value: events, writable: false });
      window.addEventListener("belvitale:quiz-v6", (event) => {
        events.push((event as CustomEvent).detail);
      });
    });
    await page.goto("/quiz?utm_source=contato%40email.com&utm_campaign=12345678");
    await choose(page, /Come.ar a descoberta/);
    const events = await page.evaluate(() => (window as unknown as { __quizEvents: { event: string; properties: { utm: object } }[] }).__quizEvents);
    expect(events.filter((event) => event.event === "quiz_opened")).toHaveLength(1);
    expect(events.find((event) => event.event === "quiz_opened")?.properties.utm).toEqual({});
    expect(JSON.stringify(events)).not.toContain("contato@email.com");
  });

  test("mantém controles com pelo menos 44 px e sem overflow horizontal", async ({ page }) => {
    await choose(page, /Começar a descoberta/);
    await choose(page, /Continuar sem informar/);
    const geometry = await page.locator("button:visible, a:visible").evaluateAll((elements) => elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }));
    expect(Math.min(...geometry.map((item) => item.height))).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test("galeria usa swipe, setas de 44 px e nunca recorta o arquivo", async ({ page }) => {
    await page.evaluate(() => {
      const now = new Date();
      localStorage.setItem("belvitale.quiz.v6", JSON.stringify({
        version: "6.0.0",
        sessionId: "session-proof",
        stageId: "proof",
        visitedStageIds: ["opening", "proof"],
        answers: {
          trigger: "clothes-fit",
          concern: "cellulite",
          impact: "care-restart",
          attempts: "routine-tightened",
          recovery: "restart-small",
          "proof-preference": "authorized-experiences"
        },
        firstName: "",
        nameProvided: false,
        savedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 86400000).toISOString()
      }));
    });
    await page.reload();
    const image = page.locator(".q6-proof__viewer img");
    await expect(image).toBeVisible();
    expect(await image.evaluate((node) => getComputedStyle(node).objectFit)).toBe("contain");
    const buttons = page.locator(".q6-proof__controls button");
    await expect(buttons).toHaveCount(2);
    expect(await buttons.first().evaluate((node) => node.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
    const source = await image.getAttribute("src");
    await buttons.nth(1).click();
    await expect(image).not.toHaveAttribute("src", source ?? "");
  });

  test("reduced motion mantém conteúdo legível imediatamente", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await expect(page.getByRole("heading", { name: /O que incomoda aparece/ })).toBeVisible();
    const stage = page.locator(".q6-stage");
    await expect(stage).toHaveAttribute("data-reduced-motion", "true");
  });

  test("não renderiza frasco em SVG nem cupom/urgência sem campanha válida", async ({ page }) => {
    await expect(page.locator(".q6 svg")).toHaveCount(0);
    await expect(page.getByText(/cupom validado|Esta condição fica reservada/)).toHaveCount(0);
  });
});
