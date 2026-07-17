/* global document, getComputedStyle, localStorage, window */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { URL } from "node:url";
import { chromium } from "@playwright/test";

const root = process.cwd();
const baseURL = new URL(process.env.PREVIEW_URL ?? "http://127.0.0.1:4173");
const outputDirectory = path.join(root, "artifacts", "quiz-v4");
const screenshotDirectory = path.join(outputDirectory, "screenshots");
const videoDirectory = path.join(outputDirectory, "videos");
const temporaryVideoDirectory = path.join(root, ".tmp", "quiz-v4-videos");
const storageKey = "belvitale.quiz.v4";
const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
];
const answers = {
  "appearance-moment": "clothes-waited",
  "way-of-starting": "small-visible-cue",
  "routine-friction": "full-days",
  "after-a-missed-day": "next-opportunity",
  "trust-language": "label-and-facts",
  "planning-horizon": "next-few-months",
  "honest-commitment": "moderate-commitment",
};

await Promise.all([
  fs.mkdir(screenshotDirectory, { recursive: true }),
  fs.mkdir(videoDirectory, { recursive: true }),
  fs.mkdir(temporaryVideoDirectory, { recursive: true }),
]);

const browser = await chromium.launch({ headless: true });
const audit = {
  capturedAt: new Date().toISOString(),
  previewURL: baseURL.origin,
  viewports,
  states: [],
  screenshots: [],
  videos: [],
  consoleErrors: [],
  pageErrors: [],
  requestFailures: [],
};

function observe(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") audit.consoleErrors.push({ label, text: message.text() });
  });
  page.on("pageerror", (error) => audit.pageErrors.push({ label, text: error.message }));
  page.on("requestfailed", (request) => {
    const error = request.failure()?.errorText ?? "unknown";
    if (error !== "net::ERR_ABORTED") audit.requestFailures.push({ label, url: request.url(), error });
  });
}

function stateFor(scene, stateAnswers, complete = false) {
  const timestamp = new Date().toISOString();
  return {
    version: "4.0.0",
    scene,
    answers: stateAnswers,
    direction: "forward",
    startedAt: timestamp,
    updatedAt: timestamp,
    ...(complete ? { completedAt: timestamp } : {}),
  };
}

async function decodeImages(page) {
  await page.locator("img").evaluateAll(async (images) => {
    await Promise.all(images.map(async (image) => {
      try { await image.decode(); } catch { /* A auditoria de rede registra a falha. */ }
    }));
  });
}

async function openState(page, scene, stateAnswers, route = "/quiz", complete = false) {
  await page.goto(new URL("/quiz", baseURL).href, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.evaluate(({ key, state }) => {
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: storageKey, state: stateFor(scene, stateAnswers, complete) });
  await page.goto(new URL(route, baseURL).href, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.locator(".quiz-route").waitFor({ state: "visible", timeout: 15_000 });
  await decodeImages(page);
  await page.waitForTimeout(700);
}

async function measure(page, label, viewport) {
  const result = await page.evaluate(() => {
    const targets = [...document.querySelectorAll("button, a")]
      .filter((element) => {
        const rectangle = element.getBoundingClientRect();
        return getComputedStyle(element).visibility !== "hidden" && rectangle.width > 0 && rectangle.height > 0;
      })
      .map((element) => {
        const rectangle = element.getBoundingClientRect();
        return { width: rectangle.width, height: rectangle.height };
      });
    const product = document.querySelector(".quiz-intro__visual > img");
    const productRect = product?.getBoundingClientRect();
    const visualRect = product?.parentElement?.getBoundingClientRect();
    return {
      documentWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      minimumTargetWidth: targets.length === 0 ? null : Math.min(...targets.map((target) => target.width)),
      minimumTargetHeight: targets.length === 0 ? null : Math.min(...targets.map((target) => target.height)),
      productInsideVisual: productRect === undefined || visualRect === undefined
        ? null
        : productRect.left >= visualRect.left &&
          productRect.right <= visualRect.right &&
          productRect.top >= visualRect.top &&
          productRect.bottom <= visualRect.bottom,
    };
  });
  audit.states.push({ label, viewport, ...result });
}

async function screenshot(page, name) {
  // Os vídeos preservam o motion. Para o gate estático, avançamos animações
  // finitas até o frame final para evitar artefatos do compositor headless.
  await page.screenshot({
    path: path.join(screenshotDirectory, name),
    fullPage: false,
    animations: "disabled",
    caret: "hide",
  });
  audit.screenshots.push(name);
}

const stages = [
  { name: "start", scene: "intro", answers: {} },
  { name: "question-1", scene: "appearance-moment", answers: {} },
  { name: "selected", scene: "appearance-moment", answers: { "appearance-moment": answers["appearance-moment"] } },
  { name: "insight-1", scene: "insight-start", answers: { "appearance-moment": answers["appearance-moment"], "way-of-starting": answers["way-of-starting"] } },
  { name: "story", scene: "story-bridge", answers: Object.fromEntries(Object.entries(answers).slice(0, 3)) },
  { name: "proof", scene: "proof-and-insight", answers: Object.fromEntries(Object.entries(answers).slice(0, 5)) },
  { name: "anticipation", scene: "anticipation", answers },
  { name: "result", scene: "result", answers, route: "/quiz/resultado", complete: true },
  { name: "offer", scene: "offer", answers, route: "/quiz/resultado", complete: true },
  { name: "comparison", scene: "offer", answers, route: "/quiz/resultado", complete: true, selector: ".quiz-offer-comparison" },
];

async function captureVisualGate() {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, reducedMotion: "no-preference" });
    const page = await context.newPage();
    for (const stage of stages) {
      const label = `${stage.name}-${String(viewport.width)}x${String(viewport.height)}`;
      observe(page, label);
      await openState(page, stage.scene, stage.answers, stage.route, stage.complete);
      if (stage.selector !== undefined) {
        await page.locator(stage.selector).evaluate((element) => {
          const top = element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top, behavior: "instant" });
        });
        await page.waitForTimeout(350);
      }
      await measure(page, label, viewport);
      await screenshot(page, `${label}.png`);
    }
    await context.close();
  }
}

async function captureOfferVariants() {
  const variants = {
    "30-days": {
      ...answers,
      "planning-horizon": "one-step-first",
      "honest-commitment": "try-before-continuity",
    },
    "90-days": answers,
    "210-days": {
      ...answers,
      "planning-horizon": "longer-stock",
      "honest-commitment": "explicit-long-commitment",
    },
  };
  for (const viewport of [{ width: 390, height: 844 }, { width: 1366, height: 768 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    for (const [plan, variantAnswers] of Object.entries(variants)) {
      const label = `offer-${plan}-${String(viewport.width)}x${String(viewport.height)}`;
      observe(page, label);
      await openState(page, "offer", variantAnswers, "/quiz/resultado", true);
      await screenshot(page, `${label}.png`);
    }
    await context.close();
  }
}

async function click(page, name) {
  await page.getByRole("button", { name }).click();
  await page.waitForTimeout(440);
}

async function recordCompleteJourney() {
  const viewport = { width: 390, height: 844 };
  const context = await browser.newContext({
    viewport,
    hasTouch: true,
    reducedMotion: "no-preference",
    recordVideo: { dir: temporaryVideoDirectory, size: viewport },
  });
  const page = await context.newPage();
  observe(page, "video-complete-mobile");
  const video = page.video();
  await page.goto(new URL("/quiz", baseURL).href, { waitUntil: "domcontentloaded" });
  await page.evaluate((key) => localStorage.removeItem(key), storageKey);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);
  await click(page, /Começar a descoberta/);
  await click(page, /Uma roupa ficou no armário/);
  await click(page, /Crio um lembrete pequeno e visível/);
  await click(page, /^Continuar/);
  await click(page, /Dias cheios mudam a prioridade/);
  await click(page, /Ver como eu retomo/);
  await click(page, /Volto na próxima oportunidade/);
  await click(page, /Rótulo e informações objetivas/);
  await page.locator(".quiz-proof__stage").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await click(page, /Continuar com estes limites/);
  await click(page, /Organizo os próximos meses/);
  await click(page, /Alguns meses organizados fazem sentido/);
  await click(page, /Revelar meu resultado/);
  await page.locator(".quiz-result__portrait").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.locator(".quiz-ritual").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.locator(".quiz-result-reasoning").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.locator(".quiz-proof--result").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.locator(".quiz-result__next").scrollIntoViewIfNeeded();
  await click(page, /Ver recomendação e opções/);
  await page.locator(".quiz-offer__copy").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.locator(".quiz-offer-comparison").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await context.close();
  if (video !== null) {
    const name = "quiz-complete-mobile-390x844.webm";
    await video.saveAs(path.join(videoDirectory, name));
    audit.videos.push(name);
  }
}

async function recordResult() {
  const viewport = { width: 390, height: 844 };
  const context = await browser.newContext({
    viewport,
    hasTouch: true,
    recordVideo: { dir: temporaryVideoDirectory, size: viewport },
  });
  const page = await context.newPage();
  observe(page, "video-result-mobile");
  const video = page.video();
  await openState(page, "result", answers, "/quiz/resultado", true);
  for (const selector of [
    ".quiz-result__portrait",
    ".quiz-ritual",
    ".quiz-result-reasoning",
    ".quiz-proof--result",
    ".quiz-result__next",
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(650);
  }
  await context.close();
  if (video !== null) {
    const name = "quiz-result-mobile-390x844.webm";
    await video.saveAs(path.join(videoDirectory, name));
    audit.videos.push(name);
  }
}

try {
  await captureVisualGate();
  await captureOfferVariants();
  await recordCompleteJourney();
  await recordResult();
} finally {
  await fs.writeFile(
    path.join(outputDirectory, "visual-audit.json"),
    `${JSON.stringify(audit, null, 2)}\n`,
    "utf8",
  );
  await browser.close();
}

process.stdout.write(`Gate visual salvo em ${outputDirectory}: ${String(audit.screenshots.length)} screenshots, ${String(audit.videos.length)} vídeos, ${String(audit.consoleErrors.length)} erros de console.\n`);
