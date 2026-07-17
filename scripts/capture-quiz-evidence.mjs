import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

const root = process.cwd();
const screenshotsOnly = process.argv.includes("--screenshots-only");
const baseURL = new globalThis.URL(
  process.env.PREVIEW_URL ?? "http://127.0.0.1:5173",
);
const outputDirectory = path.join(root, "artifacts", "quiz-v3");
const screenshotDirectory = path.join(outputDirectory, "screenshots");
const videoDirectory = path.join(outputDirectory, "videos");
const temporaryVideoDirectory = path.join(root, ".tmp", "quiz-v3-videos");
const validation = JSON.parse(
  await fs.readFile(path.join(outputDirectory, "validation.json"), "utf8"),
);
let previousAudit = null;
if (screenshotsOnly) {
  try {
    previousAudit = JSON.parse(
      await fs.readFile(path.join(outputDirectory, "visual-audit.json"), "utf8"),
    );
  } catch {
    previousAudit = null;
  }
}

await Promise.all([
  fs.mkdir(screenshotDirectory, { recursive: true }),
  fs.mkdir(videoDirectory, { recursive: true }),
  fs.mkdir(temporaryVideoDirectory, { recursive: true }),
]);

const browser = await chromium.launch({ channel: "chrome", headless: true });
const audit = {
  capturedAt: new Date().toISOString(),
  previewURL: baseURL.origin,
  consoleErrors: [],
  pageErrors: [],
  requestFailures: [],
  viewports: previousAudit?.viewports ?? [],
  screenshots: [],
  videos: previousAudit?.videos ?? [],
};

function routeURL(route) {
  return new globalThis.URL(route, baseURL.origin).href;
}

function outputPath(directory, name) {
  return path.join(directory, name);
}

function observePage(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") {
      audit.consoleErrors.push({ label, text: message.text() });
    }
  });
  page.on("pageerror", (error) => {
    audit.pageErrors.push({ label, text: error.message });
  });
  page.on("requestfailed", (request) => {
    const error = request.failure()?.errorText ?? "unknown";
    if (error === "net::ERR_ABORTED") return;
    audit.requestFailures.push({ label, url: request.url(), error });
  });
}

async function openQuiz(page, route = "/quiz") {
  await page.goto(routeURL(route), {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.locator(".quiz-route").waitFor({ state: "visible", timeout: 20_000 });
}

async function startFreshQuiz(page) {
  await openQuiz(page);
  await page.evaluate(() => {
    globalThis.localStorage.removeItem("belvitale:quiz:v1");
    globalThis.sessionStorage.removeItem("belvitale:quiz:experiment:v1");
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".quiz-start").waitFor({ state: "visible" });
}

async function saveScreenshot(page, name, options = {}) {
  await page.screenshot({
    path: outputPath(screenshotDirectory, name),
    ...options,
  });
  audit.screenshots.push(name);
}

async function selectAnswer(page, answer, nextAnswer, isLast) {
  const selector = `[data-question-id="${answer.questionId}"][data-option-id="${answer.optionId}"]`;
  await page.locator(selector).click();
  if (isLast) {
    await page.locator(".quiz-result h1").waitFor({ state: "visible", timeout: 15_000 });
    return;
  }
  await page
    .locator(`[data-question-id="${nextAnswer.questionId}"]`)
    .first()
    .waitFor({ state: "visible", timeout: 15_000 });
}

function storedState(example) {
  const now = new Date().toISOString();
  return {
    version: 3,
    savedAt: now,
    answers: example.answers,
    currentStep: 6,
    startedAt: now,
    profile: example.resultProfile,
    completedAt: now,
  };
}

async function openStoredResult(page, example) {
  await openQuiz(page);
  await page.evaluate((state) => {
    globalThis.localStorage.setItem("belvitale:quiz:v1", JSON.stringify(state));
  }, storedState(example));
  await openQuiz(page, "/quiz/resultado");
  await page.locator(".quiz-result h1").waitFor({ state: "visible", timeout: 15_000 });
  await page.waitForTimeout(1_550);
}

async function decodeImages(locator) {
  await locator.locator("img").evaluateAll(async (images) => {
    await Promise.all(images.map(async (image) => {
      try {
        await image.decode();
      } catch {
        // A auditoria de rede registra imagens que falharem de fato.
      }
    }));
  });
}

async function captureJourneyScreenshots() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  observePage(page, "journey-screenshots");
  const example = validation.examplesByProfile["fits-now"];
  await startFreshQuiz(page);
  await page.waitForTimeout(900);
  await saveScreenshot(page, "opening-390x844.png");
  await page.getByRole("button", { name: "Descobrir meu ritmo" }).click();

  for (let index = 0; index < example.answers.length; index += 1) {
    const answer = example.answers[index];
    const stage = page.locator(".quiz-question-stage");
    await stage.waitFor({ state: "visible" });
    const presentation = await stage.getAttribute("data-presentation");
    await saveScreenshot(
      page,
      `question-${index + 1}-${presentation ?? "unknown"}-390x844.png`,
    );
    await selectAnswer(
      page,
      answer,
      example.answers[index + 1],
      index === example.answers.length - 1,
    );
    if (index === 1 || index === 3) {
      const insight = page.locator('.quiz-insight-toast[data-visible="true"]');
      await insight.waitFor({ state: "visible", timeout: 3_000 });
      await page.waitForTimeout(500);
      await saveScreenshot(page, `microinsight-${index === 1 ? 1 : 2}-390x844.png`);
      await page
        .locator('.quiz-insight-toast[data-visible="false"]')
        .waitFor({ state: "attached", timeout: 3_000 });
    }
  }

  await page.waitForTimeout(1_550);
  await saveScreenshot(page, "result-complete-390x844.png");
  const proof = page.locator(".quiz-proof");
  await proof.scrollIntoViewIfNeeded();
  await decodeImages(proof);
  await proof.screenshot({ path: outputPath(screenshotDirectory, "proof-real-390.png") });
  audit.screenshots.push("proof-real-390.png");
  const allPlans = page.locator(".quiz-all-plans");
  await allPlans.scrollIntoViewIfNeeded();
  await decodeImages(allPlans);
  await allPlans.screenshot({ path: outputPath(screenshotDirectory, "all-options-390.png") });
  audit.screenshots.push("all-options-390.png");
  await context.close();
}

async function captureProfilesAndPlans() {
  for (const [profile, example] of Object.entries(validation.examplesByProfile)) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    observePage(page, `profile-${profile}`);
    await openStoredResult(page, example);
    await saveScreenshot(page, `profile-${profile}-390x844.png`);
    await context.close();
  }

  for (const [plan, example] of Object.entries(validation.examplesByPlan)) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    observePage(page, `recommendation-${plan}`);
    await openStoredResult(page, example);
    const recommendation = page.locator(".quiz-recommendation");
    await recommendation.scrollIntoViewIfNeeded();
    await decodeImages(recommendation);
    await page.waitForTimeout(350);
    await recommendation.screenshot({
      path: outputPath(screenshotDirectory, `recommendation-${plan}-390.png`),
    });
    audit.screenshots.push(`recommendation-${plan}-390.png`);
    await context.close();
  }
}

async function auditViewport(width, height) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  observePage(page, `viewport-${width}x${height}`);
  await startFreshQuiz(page);
  await page.waitForTimeout(80);
  const opening = await page.evaluate(() => ({
    documentWidth: globalThis.document.documentElement.scrollWidth,
    clientWidth: globalThis.document.documentElement.clientWidth,
    scrollHeight: globalThis.document.documentElement.scrollHeight,
    viewportHeight: globalThis.innerHeight,
    h1Count: globalThis.document.querySelectorAll("h1").length,
  }));
  await page.getByRole("button", { name: "Descobrir meu ritmo" }).click();
  await page.locator(".quiz-question-stage").waitFor({ state: "visible" });
  const question = await page.evaluate(() => {
    const answerHeights = [...globalThis.document.querySelectorAll(".quiz-answer")]
      .map((element) => element.getBoundingClientRect().height);
    return {
      documentWidth: globalThis.document.documentElement.scrollWidth,
      clientWidth: globalThis.document.documentElement.clientWidth,
      scrollHeight: globalThis.document.documentElement.scrollHeight,
      viewportHeight: globalThis.innerHeight,
      minimumAnswerHeight: Math.min(...answerHeights),
      h1Count: globalThis.document.querySelectorAll("h1").length,
    };
  });
  audit.viewports.push({ width, height, opening, question });
  await context.close();
}

async function recordJourney(name, viewport, reducedMotion) {
  const context = await browser.newContext({
    viewport,
    hasTouch: viewport.width <= 430,
    reducedMotion,
    recordVideo: { dir: temporaryVideoDirectory, size: viewport },
  });
  const page = await context.newPage();
  observePage(page, `video-${name}`);
  const video = page.video();
  const example = validation.examplesByProfile["return-counts"];
  await startFreshQuiz(page);
  await page.waitForTimeout(reducedMotion === "reduce" ? 450 : 1_000);
  await page.getByRole("button", { name: "Descobrir meu ritmo" }).click();

  for (let index = 0; index < example.answers.length; index += 1) {
    await page.waitForTimeout(900);
    await selectAnswer(
      page,
      example.answers[index],
      example.answers[index + 1],
      index === example.answers.length - 1,
    );
    if (index === 1 || index === 3) await page.waitForTimeout(700);
  }

  await page.waitForTimeout(reducedMotion === "reduce" ? 250 : 1_550);
  for (const selector of [
    ".quiz-reading",
    ".quiz-guidance",
    ".quiz-product-bridge",
    ".quiz-proof",
    ".quiz-recommendation",
    ".quiz-all-plans",
    ".quiz-result-footer",
  ]) {
    const section = page.locator(selector);
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(650);
  }
  await context.close();
  if (video !== null) {
    await video.saveAs(outputPath(videoDirectory, name));
    audit.videos.push(name);
  }
}

try {
  await captureJourneyScreenshots();
  await captureProfilesAndPlans();
  if (!screenshotsOnly) {
    for (const [width, height] of [
      [360, 800],
      [375, 812],
      [390, 844],
      [412, 915],
      [430, 932],
      [1366, 768],
      [1440, 900],
    ]) {
      await auditViewport(width, height);
    }
    await recordJourney(
      "quiz-complete-390x844.webm",
      { width: 390, height: 844 },
      "no-preference",
    );
    await recordJourney(
      "quiz-complete-1440x900.webm",
      { width: 1440, height: 900 },
      "no-preference",
    );
    await recordJourney(
      "quiz-reduced-motion-390x844.webm",
      { width: 390, height: 844 },
      "reduce",
    );
  }
} finally {
  await fs.writeFile(
    path.join(outputDirectory, "visual-audit.json"),
    `${JSON.stringify(audit, null, 2)}\n`,
    "utf8",
  );
  await browser.close();
}

process.stdout.write(
  `Evidências do quiz salvas em ${outputDirectory}. Erros de console: ${audit.consoleErrors.length}.\n`,
);
