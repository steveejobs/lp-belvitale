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
  await waitForHeading(page, /Clareza antes|Retomar vale|Confiança move|Estrutura reduz/);
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
    expect(calculateRecommendedPlan({ history: "disappointed", "decision-weight": "money", "future-goal": "trust" })?.offerId).toBe("three-months");
    expect(calculateRecommendedPlan({ history: "start-stop", "decision-weight": "a-path", "future-goal": "stop-restarting" })?.disposition).toBe("extended-ready");
  });

  test("valida seis caminhos editoriais sem pseudo-diagnóstico", () => {
    const pick = (optionIndex: number): QuizAnswers => Object.fromEntries(
      quizQuestions.map((question) => [question.id, question.options[optionIndex]?.id ?? question.options[0].id]),
    );
    const combinations: QuizAnswers[] = [
      pick(0), pick(1), pick(2), pick(3),
      { ...pick(0), history: "disappointed", "decision-weight": "money", "future-goal": "trust" },
      { ...pick(0), history: "start-stop", "decision-weight": "a-path", "future-goal": "stop-restarting" },
    ];
    const profiles = new Set<string>();
    for (const answers of combinations) {
      expect(calculateQuizResult(answers)).not.toBeNull();
      expect(calculateRecommendedPlan(answers)?.offerId).toBe("three-months");
      const result = calculateQuizResult(answers);
      if (result !== null) profiles.add(result.id);
    }
    expect(combinations).toHaveLength(6);
    expect(profiles.size).toBeGreaterThanOrEqual(2);
    expect(combinations.every((answers) => calculateRecommendedPlan(answers)?.offerId === "three-months")).toBe(true);
    expect(calculateRecommendedPlan(combinations[5] ?? {})?.disposition).toBe("extended-ready");
  });

  test("publica apenas preços atuais verificados, sem ancoragem não comprovada", () => {
    expect(calculatePrice(quizPromotion.offers["one-month"]).finalPrice).toBe(89.9);
    expect(calculatePrice(quizPromotion.offers["three-months"]).savingsValue).toBe(0);
    expect(calculatePrice(quizPromotion.offers["seven-months"]).savingsPercentage).toBe(0);
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
    await expect(page.locator(".q7-opening__visual > img")).toHaveAttribute("src", "/lifestyle/quiz-hero-confidence.jpg");
    await expect(page.getByText("sem promessa milagrosa", { exact: true })).toBeVisible();
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
    await expect(page.getByText(/Começo animada e paro depois/)).toBeVisible();
    await expect(page.getByText(/Quero algo simples/)).toBeVisible();
    await expect(page.getByText(/Quero criar uma rotina/)).toBeVisible();
    const proofMosaic = page.locator(".q7-result-proof__mosaic");
    await proofMosaic.scrollIntoViewIfNeeded();
    await expect(proofMosaic.locator("img")).toHaveCount(3);
    await expect(proofMosaic.locator("img").first()).toBeVisible();
    expect(await proofMosaic.locator("img").evaluateAll((images) => images.every((element) => {
      const image = element as HTMLImageElement;
      const rectangle = image.getBoundingClientRect();
      const naturalRatio = image.naturalWidth / image.naturalHeight;
      return image.naturalWidth > 0 && Math.abs(rectangle.width / rectangle.height - naturalRatio) < 0.02;
    }))).toBe(true);
    await page.getByRole("button", { name: /Ver todos os 9 registros/ }).click();
    await expect(proofMosaic.locator("img")).toHaveCount(9);
    await choose(page, /Comparar 30 e 90 dias/);
    await waitForHeading(page, /Nossa sugestão para quem busca/);
    await expect(page.getByRole("heading", { name: "90 dias · 3 frascos", exact: true })).toBeVisible();
    await expect(page.getByText("180", { exact: true })).toBeVisible();
    await expect(page.getByText("R$ 169,90").first()).toBeVisible();
    await expect(page.getByText("R$ 591,00")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /30 ou 90 dias/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Quero construir 90 dias/ }).first()).toHaveAttribute("href", /1E8NNCGJW9/);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const footerFit = await page.evaluate(() => {
      const footerContent = document.querySelector(".q7-footer__inner")?.getBoundingClientRect();
      const checkout = document.querySelector(".q7-mobile-checkout")?.getBoundingClientRect();
      const contentBottom = footerContent?.bottom ?? Infinity;
      return {
        fits: checkout !== undefined && contentBottom <= checkout.top + 1,
        contentBottom,
        checkoutTop: checkout?.top,
      };
    });
    expect(footerFit).toEqual(expect.objectContaining({ fits: true }));
  });

  test("mantém 90 dias como caminho central mesmo diante de cautela", async ({ page }) => {
    await choose(page, /Começar agora|Descobrir meu caminho/);
    await choose(page, /Prefiro continuar sem informar/);
    await choose(page, /Quando me olho no espelho/);
    await choose(page, /Já tentei tanta coisa/);
    await choose(page, /Em fotos/);
    await choose(page, /^Continuar/);
    await choose(page, /Tento ignorar/);
    await choose(page, /Algumas vezes/);
    await choose(page, /Sentir que nada funciona/);
    await choose(page, /Uma roupa deixou de servir/);
    await choose(page, /Faz sentido/);
    await choose(page, /Já investi em produtos/);
    await choose(page, /Não vejo resultados rápidos/);
    await choose(page, /Tenho medo de criar expectativa/);
    await choose(page, /Tiraria fotos sem pensar tanto/);
    await choose(page, /Quero voltar a confiar em mim/);
    await choose(page, /Ver meu resultado/);
    await waitForHeading(page, /Clareza antes|Retomar vale|Confiança move|Estrutura reduz/);
    await page.evaluate(() => {
      const eventWindow = window as Window & { __quizEvents?: { event?: string; properties?: Record<string, unknown> }[] };
      eventWindow.__quizEvents = [];
      window.addEventListener("belvitale:quiz-v7", (event) => {
        eventWindow.__quizEvents?.push((event as CustomEvent<{ event?: string; properties?: Record<string, unknown> }>).detail);
      });
    });
    await choose(page, /Comparar 30 e 90 dias/);
    await expect(page.getByRole("heading", { name: "90 dias · 3 frascos", exact: true })).toBeVisible();
    await expect(page.getByText("R$ 169,90").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Quero construir 90 dias/ }).first()).toHaveAttribute("href", /1E8NNCGJW9/);
    await expect(page.locator(".q7-comparison__card")).toHaveCount(2);
    await expect(page.locator(".q7-offer")).toHaveAttribute("data-recommended-offer", "three-months");
    await page.locator(".q7-comparison__card").first().click();
    await expect(page.locator(".q7-offer")).toHaveAttribute("data-selected-offer", "one-month");
    await expect(page.locator(".q7-offer")).toHaveAttribute("data-recommendation-override", "true");
    const offerEvents = await page.evaluate(() => {
      const eventWindow = window as Window & { __quizEvents?: { event?: string; properties?: Record<string, unknown> }[] };
      return eventWindow.__quizEvents ?? [];
    });
    expect(offerEvents).toEqual(expect.arrayContaining([
      expect.objectContaining({
        event: "quiz_offer_changed",
        properties: expect.objectContaining({
          recommended_offer: "three-months",
          selected_offer: "one-month",
          recommendation_override: true,
        }),
      }),
    ]));
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
