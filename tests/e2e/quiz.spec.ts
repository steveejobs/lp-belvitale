import { expect, test, type Page } from "@playwright/test";
import { quizPromotion } from "../../src/features/quiz/campaign/campaign.config";
import { buildCheckoutUrl } from "../../src/features/quiz/checkout/checkout.utm";
import { calculateRecommendedPlan } from "../../src/features/quiz/domain/quiz.recommendation";
import { calculateQuizResult } from "../../src/features/quiz/domain/quiz.scoring";
import { parseQuizSession } from "../../src/features/quiz/domain/quiz.schema";
import { quizStageDefinitions } from "../../src/features/quiz/domain/quiz.machine";
import { quizQuestionIds, QUIZ_VERSION, type QuizAnswers } from "../../src/features/quiz/domain/quiz.types";
import { sanitizeFirstName } from "../../src/features/quiz/domain/quiz.validation";
import { calculatePrice } from "../../src/features/quiz/pricing/pricing.calculate";
import { issueReward } from "../../src/features/quiz/reward/reward.engine";
import { calculatePromotionTime } from "../../src/features/quiz/timer/timer.machine";
import { quizQuestions } from "../../src/features/quiz/content/questions";
import { quizTestimonials } from "../../src/features/quiz/content/testimonials";

async function waitForHeading(page: Page, name: RegExp) {
  await expect(page.getByRole("heading", { name })).toBeVisible();
}

async function choose(page: Page, name: RegExp) {
  await page.getByRole("button", { name }).click();
}

async function completeToResult(page: Page) {
  await page.goto("/quiz");
  await choose(page, /Começar agora|Descobrir meu caminho/);
  await choose(page, /Prefiro continuar sem informar/);
  await choose(page, /Quando experimento uma roupa/);
  await choose(page, /Depois eu resolvo/);
  await choose(page, /Na hora de me vestir/);
  await waitForHeading(page, /Até aqui, percebemos uma coisa interessante/);
  await choose(page, /^Continuar/);
  await choose(page, /Troco de roupa/);
  await choose(page, /Algumas vezes/);
  await choose(page, /Não conseguir manter uma rotina/);
  await choose(page, /Prometi a mim mesma/);
  await waitForHeading(page, /Talvez o problema nunca tenha sido falta de vontade/);
  await choose(page, /Faz sentido/);
  await choose(page, /Começo animada e paro depois/);
  await choose(page, /Falta de tempo/);
  await choose(page, /Quero algo simples/);
  await choose(page, /Usaria aquela roupa guardada/);
  await choose(page, /Quero criar uma rotina/);
  await waitForHeading(page, /Sua dificuldade parece estar menos ligada à disciplina/);
  await choose(page, /Ver meu resultado/);
  await waitForHeading(page, /O seu maior desafio hoje não parece ser a celulite/);
}

test.describe("domínio do Quiz CeluClin 7.0", () => {
  test("mantém 19 etapas e 12 perguntas da consultoria", () => {
    expect(quizStageDefinitions).toHaveLength(19);
    expect(quizQuestions).toHaveLength(12);
    expect(quizQuestionIds).toHaveLength(12);
    expect(quizStageDefinitions.every((stage) => stage.kind.length > 0)).toBe(true);
  });

  test("publica todas as conversas uma única vez", () => {
    expect(quizTestimonials).toHaveLength(42);
    expect(new Set(quizTestimonials.map((testimonial) => testimonial.src)).size).toBe(42);
  });

  test("sanitiza e limita o primeiro nome", () => {
    expect(sanitizeFirstName("  M<ar!ina Silva  ")).toBe("Marina");
    expect(sanitizeFirstName("Ana-Maria")).toBe("Ana-Maria");
    expect(sanitizeFirstName("123")).toBe("");
    expect(sanitizeFirstName("A".repeat(40))).toHaveLength(24);
  });

  test("só recomenda depois que o bloco final foi respondido", () => {
    expect(calculateRecommendedPlan({})).toBeNull();
    expect(calculateRecommendedPlan({ history: "start-stop", "decision-weight": "simple" })).toBeNull();
    expect(calculateRecommendedPlan({ history: "start-stop", "decision-weight": "simple", "future-goal": "lasting-routine" })?.offerId).toBe("three-months");
  });

  test("calcula o perfil em combinações válidas sem kit impossível", () => {
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
    for (const answers of combinations) {
      expect(calculateQuizResult(answers)).not.toBeNull();
      expect(calculateRecommendedPlan(answers)?.offerId).toBe("three-months");
      const result = calculateQuizResult(answers);
      if (result !== null) profiles.add(result.id);
    }
    expect(combinations).toHaveLength(10_000);
    expect(profiles.size).toBeGreaterThanOrEqual(2);
  });

  test("calcula os preços oficiais sem arredondamento incorreto", () => {
    expect(calculatePrice(quizPromotion.offers["one-month"]).finalPrice).toBe(89.9);
    expect(calculatePrice(quizPromotion.offers["three-months"]).savingsValue).toBe(421.1);
    expect(calculatePrice(quizPromotion.offers["seven-months"]).savingsPercentage).toBe(56.71);
  });

  test("mantém recompensas e cronômetro desativados sem campanha validada", () => {
    expect(issueReward(quizPromotion, "session-123")).toBeNull();
    const expires = "2026-07-17T13:00:00.000Z";
    expect(calculatePromotionTime(expires, Date.parse("2026-07-17T11:00:00.000Z")).state).toBe("normal");
    expect(calculatePromotionTime(expires, Date.parse("2026-07-17T13:00:01.000Z")).state).toBe("expired");
  });

  test("preserva UTMs e metadados do quiz no checkout", () => {
    const url = new URL(buildCheckoutUrl(
      quizPromotion.offers["three-months"].checkoutUrl,
      "?utm_source=meta&utm_campaign=quiz-v7&utm_content=video-a",
      {
        campaignId: quizPromotion.id,
        offerId: "three-months",
        experimentId: "opening-cta-v1",
        experimentVariant: "b",
        experimentMode: "randomized",
      },
    ));
    expect(url.searchParams.get("utm_source")).toBe("meta");
    expect(url.searchParams.get("campaignId")).toBe(quizPromotion.id);
    expect(url.searchParams.get("metadata[ab_experiment]")).toBe("opening-cta-v1");
    expect(url.searchParams.get("metadata[ab_variant]")).toBe("b");
    expect(url.searchParams.get("metadata[ab_mode]")).toBe("randomized");
  });

  test("reprova sessão expirada e aceita schema v7 íntegro", () => {
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

  test("mantém o progresso visual sem exibir números de etapas", async ({ page }) => {
    const visibleStageCount = /\b\d+\s*(?:de|\/)\s*\d+\b/i;

    await expect(page.locator("body")).not.toContainText(visibleStageCount);
    await choose(page, /Começar agora|Descobrir meu caminho/);
    await expect(page.getByRole("heading", { name: /Como posso te chamar/ })).toBeVisible();
    await expect(page.locator("body")).not.toContainText(visibleStageCount);
    await choose(page, /Prefiro continuar sem informar/);
    await expect(page.getByRole("heading", { name: /Quando você percebe mais a celulite/ })).toBeVisible();
    await expect(page.locator("body")).not.toContainText(visibleStageCount);
  });

  test("conclui a conversa, mostra resultado sustentado e alcança checkout", async ({ page }) => {
    await completeToResult(page);
    expect(page.url()).toContain("/quiz/resultado");
    await expect(page.getByText(/Você já reconhece o momento/)).toBeVisible();
    await expect(page.getByText(/Você busca algo que caiba na rotina real/)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Quando o cuidado encontra espaço na rotina/ })).toBeVisible();
    await choose(page, /^Continuar/);
    await waitForHeading(page, /Nossa sugestão para quem busca/);
    await expect(page.getByRole("heading", { name: /90 dias/ })).toBeVisible();
    await expect(page.getByText("180", { exact: true })).toBeVisible();
    await expect(page.getByText("R$ 169,90").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Quero construir 90 dias/ }).first()).toHaveAttribute("href", /1E8NNCGJW9/);
  });

  test("voltar preserva e permite trocar resposta", async ({ page }) => {
    await choose(page, /Começar agora|Descobrir meu caminho/);
    await choose(page, /Prefiro continuar sem informar/);
    await choose(page, /Quando experimento uma roupa/);
    await waitForHeading(page, /Qual pensamento costuma aparecer primeiro/);
    await page.getByRole("button", { name: /Voltar à etapa anterior/ }).click();
    await waitForHeading(page, /Quando você percebe mais a celulite/);
    await expect(page.getByRole("button", { name: /Quando experimento uma roupa/ })).toHaveAttribute("aria-pressed", "true");
    await choose(page, /Quando vejo uma foto minha/);
    await waitForHeading(page, /Qual pensamento costuma aparecer primeiro/);
  });

  test("refresh preserva etapa, resposta e nome opcional", async ({ page }) => {
    await choose(page, /Começar agora|Descobrir meu caminho/);
    await page.getByLabel("Seu primeiro nome").fill("Marina");
    await choose(page, /^Continuar/);
    await choose(page, /Quando experimento uma roupa/);
    await waitForHeading(page, /Qual pensamento costuma aparecer primeiro/);
    await page.reload();
    await waitForHeading(page, /Qual pensamento costuma aparecer primeiro/);
    const stored = await page.evaluate(() => localStorage.getItem("belvitale.quiz.v7"));
    expect(stored).toContain("Marina");
  });

  test("sincroniza a etapa entre duas abas", async ({ page, context }) => {
    const secondPage = await context.newPage();
    await secondPage.setViewportSize({ width: 390, height: 844 });
    await secondPage.goto("/quiz");
    await choose(page, /Começar agora|Descobrir meu caminho/);
    await expect(secondPage.getByRole("heading", { name: /Como posso te chamar/ })).toBeVisible();
    await choose(page, /Prefiro continuar sem informar/);
    await expect(secondPage.getByRole("heading", { name: /Quando você percebe mais a celulite/ })).toBeVisible();
    await secondPage.close();
  });

  test("rejeita UTM com possível dado pessoal e não tem overflow horizontal", async ({ page }) => {
    await page.goto("/quiz?utm_source=contato%40email.com&utm_campaign=12345678");
    await expect(page.getByRole("heading", { name: /Descubra por que cuidar de você/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Começar agora|Descobrir meu caminho/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test("mantém controles tocáveis e reduced motion legível", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await expect(page.getByRole("heading", { name: /Descubra por que cuidar de você/ })).toBeVisible();
    await choose(page, /Começar agora|Descobrir meu caminho/);
    const geometry = await page.locator("button:visible, a:visible").evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height));
    expect(Math.min(...geometry)).toBeGreaterThanOrEqual(44);
    await expect(page.locator(".q7-stage")).toHaveAttribute("data-reduced-motion", "true");
  });

  test("funciona em telefone de 375 px e em orientação horizontal", async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());

    for (const viewport of [{ width: 375, height: 667 }, { width: 844, height: 390 }]) {
      await page.setViewportSize(viewport);
      await page.goto("/quiz");
      await expect(page.getByRole("heading", { name: /Descubra por que cuidar de você/ })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
      await choose(page, /Começar agora|Descobrir meu caminho/);
      await expect(page.getByRole("heading", { name: /Como posso te chamar/ })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    }
  });
});

test.describe("experimento A/B do quiz", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/quiz");
    await page.evaluate(() => localStorage.clear());
  });

  test("permite conferir A e B por links forçados sem misturar a experiência", async ({ page }) => {
    await page.goto("/quiz?ab=a");
    await expect(page.locator("[data-experiment-variant='a']")).toBeVisible();
    await expect(page.getByRole("button", { name: "Começar agora" })).toHaveAttribute("data-ab-variant", "a");

    await page.goto("/quiz?ab=b");
    await expect(page.locator("[data-experiment-variant='b']")).toBeVisible();
    await expect(page.getByRole("button", { name: "Descobrir meu caminho" })).toHaveAttribute("data-ab-variant", "b");
  });

  test("mantém a variante aleatória estável durante o retorno", async ({ page }) => {
    await page.goto("/quiz");
    const initial = await page.locator(".quiz-route").getAttribute("data-experiment-variant");
    expect(initial === "a" || initial === "b").toBe(true);
    await page.reload();
    await expect(page.locator(".quiz-route")).toHaveAttribute("data-experiment-variant", initial ?? "");
  });

  test("separa visitas de QA e apresenta o funil no painel", async ({ page }) => {
    await page.goto("/quiz?ab=b");
    await expect(page.getByRole("heading", { name: /Descubra por que cuidar de você/ })).toBeVisible();
    await page.goto("/quiz/analytics");
    await expect(page.getByRole("heading", { name: /O que as pessoas fazem/ })).toBeVisible();
    await expect(page.locator(".ab-dashboard__metrics article").first()).toContainText("B 0");

    await page.getByRole("button", { name: "Carregar demonstração" }).click();
    await expect(page.locator(".ab-dashboard__metrics article").first()).toContainText("240");
    await expect(page.getByRole("heading", { name: /Variante B lidera nos cliques/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1280);
  });
});
