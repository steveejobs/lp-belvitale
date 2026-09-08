import { mkdir } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { quizQuestions } from "../../src/features/quiz/content/questions";
import { monjQuestions } from "../../src/features/quiz-monj/quizMonjData";
import { createQuizSession } from "../../src/features/quiz/state/quiz.storage";
import { resolveStableAssignment } from "../../src/features/quiz/experiment/stableAssignment";
import { buildPersonalizedInsight } from "../../src/features/quiz/content/insights";

const output = "artifacts/funnel-review/validation";
const normalAnswers = Object.fromEntries(quizQuestions.map(q => [q.id, q.options[0].id]));
const monjAnswers = { ...Object.fromEntries(monjQuestions.map(q => [q.id, q.options[0].id])), "treatment-stage": "other-strategy", "first-change": "loose-skin", "body-area": "abdomen-arms" };

async function loadedImages(page: Page, selector: string) {
  await page.locator(selector).evaluateAll(async elements => {
    await Promise.all(elements.map(async element => {
      const img = element as HTMLImageElement;
      if (!img.complete) await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
    }));
  });
  expect(await page.locator(selector).evaluateAll(elements => elements.every(element => (element as HTMLImageElement).naturalWidth > 0))).toBe(true);
}

test("50/50, locks independentes e storage corrompido", () => {
  const makeStorage = () => {
    const data = new Map<string, string>();
    return { get length() { return data.size; }, clear: () => data.clear(), key: (index: number) => [...data.keys()][index] ?? null, getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v); }, removeItem: (k: string) => { data.delete(k); } } satisfies Storage;
  };
  const storage = makeStorage();
  expect(resolveStableAssignment("normal", "?ab=a", storage).variant).toBe("a");
  expect(resolveStableAssignment("normal", "?ab=b", storage).variant).toBe("a");
  expect(resolveStableAssignment("monj", "?ab=b", storage).variant).toBe("b");
  storage.setItem("corrupt.session", "{");
  expect(resolveStableAssignment("corrupt", "", storage, () => .49).variant).toBe("a");
  expect(resolveStableAssignment("boundary", "", storage, () => .5).variant).toBe("b");
  const variants = Array.from({ length: 1000 }, (_, i) => resolveStableAssignment(`sample-${String(i)}`, "", storage, () => i / 1000).variant);
  expect(variants.filter(v => v === "a")).toHaveLength(500);
  const readOnly = { ...makeStorage(), setItem: () => { throw new Error("Quota exceeded"); } };
  expect(resolveStableAssignment("read-only", "", readOnly, () => .1).variant).toBe("a");
  expect(resolveStableAssignment("read-only", "", readOnly, () => .9).variant).toBe("a");
});

test("insights respeitam ceticismo, baixo incômodo e fonte de relato", () => {
  expect(buildPersonalizedInsight(2, { ...normalAnswers, avoidance: "never" }).title).toContain("preferência");
  expect(buildPersonalizedInsight(3, { ...normalAnswers, history: "disappointed" }).title).toContain("decepção");
  for (const scene of ["photos", "beach", "comparison", "getting-dressed"]) {
    for (const sequence of [1, 2, 3] as const) {
      expect(buildPersonalizedInsight(sequence, { ...normalAnswers, "situation-weight": scene, "deepest-impact": "nothing-works" }).testimonial.src).not.toContain("conversa-07");
    }
  }
});

for (const audience of ["NORMAL", "MOUNJARO"] as const) for (const variant of ["a", "b"] as const) {
  const route = audience === "NORMAL" ? "/quiz" : "/quiz-monj";
  test(`${audience}_${variant}: mantém atribuição em refresh, marca, voltar e avançar`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${route}?ab=${variant}&utm_source=campaign-test`);
    await expect(page.locator(".quiz-route")).toHaveAttribute("data-experiment-variant", variant);
    await page.locator(".q7-opening .q7-primary").click();
    await page.getByRole("button", { name: "Prefiro continuar sem informar" }).click();
    await expect(page.locator(".q7-question")).toBeVisible();
    await page.reload();
    await expect(page.locator(".q7-question")).toBeVisible();
    await page.locator(".q7-brand").click();
    await expect(page).toHaveURL(/utm_source=campaign-test/);
    await expect(page.locator(".quiz-route")).toHaveAttribute("data-experiment-variant", variant);
    await page.goto(`${route}?ab=${variant === "a" ? "b" : "a"}`);
    await expect(page.locator(".quiz-route")).toHaveAttribute("data-experiment-variant", variant);
    await page.locator(".q7-choice").first().click();
    const nextPrompt = audience === "NORMAL" ? quizQuestions[1].prompt : monjQuestions[1].prompt;
    await expect(page.getByRole("heading", { name: nextPrompt, exact: true })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole("heading", { name: audience === "NORMAL" ? quizQuestions[0].prompt : monjQuestions[0].prompt, exact: true })).toBeVisible();
    await page.goForward();
    await expect(page.getByRole("heading", { name: nextPrompt, exact: true })).toBeVisible();
  });

  for (const width of [375, 390, 430, 1440]) {
    test(`${audience}_${variant}: resultado e scroll em ${String(width)}px`, async ({ page }) => {
      await mkdir(output, { recursive: true });
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript(({ audience, normal, monj }) => {
        localStorage.setItem(audience === "NORMAL" ? "belvitale.quiz.v7" : "belvitale.quiz-monj.v1", JSON.stringify(audience === "NORMAL" ? normal : monj));
      }, { audience, normal: { ...createQuizSession(), answers: normalAnswers, stageId: "result" }, monj: { version: 1, stageIndex: 20, answers: monjAnswers, name: "", sessionId: "test-monj-result", savedAt: Date.now() } });
      await page.goto(`${route}?ab=${variant}&utm_source=campaign-test`);
      await expect(page.locator(".q7-result")).toBeVisible();
      const targets = audience === "NORMAL" ? [".q7-desire", ".q7-product-decision", ".q7-result__transition"] : [".qmon-scoreboard", ".q7-product-decision", ".q7-result__transition"];
      for (const [index, selector] of targets.entries()) {
        await page.locator(selector).scrollIntoViewIfNeeded();
        await loadedImages(page, `${selector} img`);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        await page.screenshot({ path: `${output}/${audience}_${variant}-${String(width)}-${String(index)}.png` });
      }
      const product = await page.locator(".q7-product-portrait img").boundingBox();
      expect(product?.width).toBeGreaterThan(width < 500 ? width * .8 : 300);
      expect(product?.height).toBeGreaterThan(280);
      const header = page.locator(".q7-header");
      for (const top of [1000, 600, 0]) {
        await page.evaluate(y => window.scrollTo({ top: y, behavior: "instant" }), top);
        await expect(header).toHaveCSS("backdrop-filter", "none");
        await expect(header).toHaveCSS("background-color", "rgb(255, 249, 246)");
        await expect(page.locator(".q7-brand img")).toHaveCount(0);
        expect((await header.boundingBox())?.y).toBeGreaterThanOrEqual(0);
      }
      if (audience === "NORMAL") {
        await page.getByRole("button", { name: "Comparar opções e preços" }).click();
        const link = page.locator(".q7-checkout").first();
        await expect(link).toHaveAttribute("href", new RegExp(`experience_id%5D=${audience}_${variant.toUpperCase()}`));
        await expect(link).toHaveAttribute("href", /utm_source=campaign-test/);
      } else {
        await expect(page.locator(".qmon-result__context")).toContainText("Abdômen e braços");
        const link = page.locator(".qmon-transition .q7-primary");
        await expect(link).toHaveAttribute("href", /bv_funnel=MOUNJARO/);
        await expect(link).toHaveAttribute("href", /utm_source=campaign-test/);
      }
    });
  }
}

test("Mounjaro percorre 14 perguntas e transmite origem à venda e ao checkout", async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/quiz-monj?ab=b&utm_source=monj-test&utm_campaign=post-loss");
  await page.locator(".q7-opening .q7-primary").click();
  await page.getByRole("button", { name: "Prefiro continuar sem informar" }).click();
  for (const [index, question] of monjQuestions.entries()) {
    await expect(page.getByRole("heading", { name: question.prompt, exact: true })).toBeVisible();
    await page.locator(".q7-choice").nth(index === 0 ? 4 : 0).click();
    if ([3, 8, 13].includes(index)) {
      await expect(page.locator(".qmon-insight")).toBeVisible();
      await expect(page.locator(".q7-insight__count")).toHaveCount(0);
      await expect(page.locator(".q7-insight .q7-kinetic-title__word").first()).toHaveCSS("color", "rgb(48, 28, 41)");
      await page.locator(".qmon-insight .q7-primary").click();
    }
  }
  await expect(page.locator(".qmon-result")).toBeVisible();
  await page.locator(".qmon-transition .q7-primary").click();
  await expect(page).toHaveURL(/bv_funnel=MOUNJARO/);
  await expect(page.locator("#composicao")).toBeVisible();
  const checkout = page.locator(".offer-card__cta").first();
  await expect(checkout).toHaveAttribute("href", /experience_id%5D=MOUNJARO_B/);
  await expect(checkout).toHaveAttribute("href", /utm_campaign=post-loss/);
});

test("storage indisponível mantém navegação e variante por URL", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new Error("unavailable"); } });
    Object.defineProperty(window, "sessionStorage", { get() { throw new Error("unavailable"); } });
  });
  await page.goto("/quiz?ab=b");
  await expect(page.locator(".quiz-route")).toHaveAttribute("data-experiment-variant", "b");
  await page.locator(".q7-opening .q7-primary").click();
  await expect(page.locator(".q7-name")).toBeVisible();
  await page.reload();
  await expect(page.locator(".quiz-route")).toHaveAttribute("data-experiment-variant", "b");
});

for (const audience of ["NORMAL", "MOUNJARO"] as const) for (const width of [375, 390, 430]) {
  test(`${audience}: três insights legíveis em ${String(width)}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const normal = audience === "NORMAL";
    await page.goto(normal ? "/quiz?ab=a" : "/quiz-monj?ab=a");
    const stages = normal ? ["insight-one", "insight-two", "insight-three"] : [6, 12, 18];
    for (const [index, stage] of stages.entries()) {
      await page.evaluate(({ normal, normalState, monjState }) => {
        localStorage.setItem(normal ? "belvitale.quiz.v7" : "belvitale.quiz-monj.v1", JSON.stringify(normal ? normalState : monjState));
      }, { normal, normalState: { ...createQuizSession(), answers: normalAnswers, stageId: stage }, monjState: { version: 1, stageIndex: stage, answers: monjAnswers, name: "", sessionId: "test-insight", savedAt: Date.now() } });
      await page.reload();
      await expect(page.locator(".q7-insight")).toBeVisible();
      await expect(page.locator(".q7-insight__count")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.locator(".q7-insight__pattern summary").click();
      await expect(page.locator(".q7-insight__signals")).toBeVisible();
      if (normal) {
        await page.getByRole("button", { name: "Abrir depoimento completo" }).click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog")).not.toBeVisible();
      }
      await mkdir(output, { recursive: true });
      await page.screenshot({ path: `${output}/${audience}-insight-${String(index + 1)}-${String(width)}.png`, fullPage: true });
    }
  });
}
