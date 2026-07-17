/* global document, getComputedStyle, localStorage, sessionStorage, window */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

const root = process.cwd();
const baseURL = process.env.PREVIEW_URL ?? "http://127.0.0.1:4173";
const storageSetupURL = baseURL + "/favicon.ico";
const outputDirectory = path.join(root, "artifacts", "quiz-v6");
const screenshotDirectory = path.join(outputDirectory, "screenshots");
const videoDirectory = path.join(outputDirectory, "videos");
const temporaryVideoDirectory = path.join(root, ".tmp", "quiz-v6-videos");
const storageKey = "belvitale.quiz.v6";
const stages = [
  "opening", "name", "trigger", "concern", "insight-one", "impact", "attempts",
  "story", "recovery", "proof-preference", "proof", "insight-two", "readiness",
  "continuity", "anticipation", "result", "offer",
];
const viewports = [
  { width: 360, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 430, height: 932 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
];
const baseAnswers = {
  trigger: "clothes-fit",
  concern: "cellulite",
  impact: "care-restart",
  attempts: "routine-tightened",
  recovery: "restart-small",
  "proof-preference": "authorized-experiences",
  readiness: "months-ready",
  continuity: "moderate-continuity",
};
const answerOrder = ["trigger", "concern", "impact", "attempts", "recovery", "proof-preference", "readiness", "continuity"];
const stageAnswerCount = {
  opening: 0, name: 0, trigger: 0, concern: 1, "insight-one": 2, impact: 2,
  attempts: 3, story: 4, recovery: 4, "proof-preference": 5, proof: 6,
  "insight-two": 6, readiness: 6, continuity: 7, anticipation: 8, result: 8, offer: 8,
};

await Promise.all([
  fs.mkdir(screenshotDirectory, { recursive: true }),
  fs.mkdir(videoDirectory, { recursive: true }),
  fs.mkdir(temporaryVideoDirectory, { recursive: true }),
]);

const validation = JSON.parse(await fs.readFile(path.join(outputDirectory, "validation.json"), "utf8"));
const browser = await chromium.launch({ headless: true });
const audit = {
  capturedAt: new Date().toISOString(),
  previewURL: baseURL + "/quiz",
  viewports,
  screenshots: [],
  videos: [],
  states: [],
  journeyRuns: [],
  consoleErrors: [],
  pageErrors: [],
  requestFailures: [],
};

function answersForStage(stageId) {
  const count = stageAnswerCount[stageId] ?? 0;
  return Object.fromEntries(answerOrder.slice(0, count).map((id) => [id, baseAnswers[id]]));
}

function makeState(stageId, answers = answersForStage(stageId), selectedOfferId) {
  const now = new Date();
  const completed = stageId === "result" || stageId === "offer";
  return {
    version: "6.0.0",
    sessionId: "capture-" + stageId + "-" + now.getTime(),
    stageId,
    visitedStageIds: stages.slice(0, stages.indexOf(stageId) + 1),
    answers,
    firstName: "Marina",
    nameProvided: true,
    ...(selectedOfferId === undefined ? {} : { selectedOfferId }),
    startedAt: now.toISOString(),
    ...(completed ? { completedAt: now.toISOString() } : {}),
    savedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 86_400_000).toISOString(),
  };
}

function observe(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") audit.consoleErrors.push({ label, text: message.text() });
  });
  page.on("pageerror", (error) => audit.pageErrors.push({ label, text: error.message }));
  page.on("requestfailed", (request) => {
    const reason = request.failure()?.errorText ?? "unknown";
    if (reason !== "net::ERR_ABORTED") audit.requestFailures.push({ label, url: request.url(), reason });
  });
}

async function decodeImages(page, scroll = false) {
  if (scroll) {
    await page.evaluate(async () => {
      const maximum = document.documentElement.scrollHeight - window.innerHeight;
      for (let position = 0; position <= maximum; position += Math.max(240, window.innerHeight * 0.7)) {
        window.scrollTo({ top: position, behavior: "instant" });
        await new Promise((resolve) => window.setTimeout(resolve, 70));
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }
  await page.locator("img").evaluateAll(async (images) => {
    await Promise.all(images.map(async (image) => {
      try { await image.decode(); } catch { /* request audit captures failures */ }
    }));
  });
}

async function openState(page, stageId, options = {}) {
  const state = makeState(stageId, options.answers ?? answersForStage(stageId), options.selectedOfferId);
  // Prepara o storage em um documento estatico para evitar que a app anterior
  // regrave o estado enquanto a captura muda de etapa.
  await page.goto(storageSetupURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(({ key, stateValue, reveal }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(key, JSON.stringify(stateValue));
    if (reveal) localStorage.setItem("belvitale.quiz.content-reward.v1:" + stateValue.sessionId, "revealed");
  }, { key: storageKey, stateValue: state, reveal: options.reveal ?? false });
  const route = stageId === "result" || stageId === "offer" ? "/quiz/resultado" : "/quiz";
  await page.goto(baseURL + route, { waitUntil: "domcontentloaded" });
  await page.locator('.q6-stage[data-stage="' + stageId + '"][data-phase="active"]').waitFor({ state: "visible", timeout: 30_000 });
  await page.waitForTimeout(850);
  await decodeImages(page, options.fullPage ?? false);
  return state;
}

async function measure(page, label, viewport) {
  const metrics = await page.evaluate(() => {
    const interactive = [...document.querySelectorAll("button, a, input, summary")]
      .filter((element) => {
        const rectangle = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return style.visibility !== "hidden" && rectangle.width > 0 && rectangle.height > 0;
      })
      .map((element) => {
        const rectangle = element.getBoundingClientRect();
        return { tag: element.tagName, text: element.textContent?.trim().slice(0, 40), width: rectangle.width, height: rectangle.height };
      });
    const images = [...document.images].map((image) => ({
      src: image.getAttribute("src"),
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      objectFit: getComputedStyle(image).objectFit,
    }));
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      undersized: interactive.filter((item) => item.width < 44 || item.height < 44),
      brokenImages: images.filter((image) => !image.complete || image.naturalWidth === 0),
      proofFits: images.filter((image) => image.src?.includes("/proof/")).every((image) => image.objectFit === "contain"),
      productSvgCount: document.querySelectorAll('.q6 svg, .q6 [class*="bottle"][class*="svg"]').length,
    };
  });
  audit.states.push({ label, viewport, ...metrics });
}

async function screenshot(page, name, fullPage = false) {
  await page.screenshot({
    path: path.join(screenshotDirectory, name),
    fullPage,
    animations: "disabled",
    caret: "hide",
  });
  audit.screenshots.push(name);
}

async function captureEveryStage() {
  const viewport = { width: 390, height: 844 };
  const context = await browser.newContext({ viewport, hasTouch: true });
  const page = await context.newPage();
  observe(page, "all-stages-mobile");
  for (const [index, stageId] of stages.entries()) {
    await openState(page, stageId);
    await measure(page, "stage-" + stageId, viewport);
    await screenshot(page, String(index + 1).padStart(2, "0") + "-" + stageId + "-390x844.png");
  }
  await openState(page, "result", { fullPage: true });
  await screenshot(page, "result-full-390x844.png", true);
  await openState(page, "offer", { reveal: true, fullPage: true });
  await screenshot(page, "offer-revealed-full-390x844.png", true);
  await context.close();
}

async function captureResponsiveGate() {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, hasTouch: viewport.width < 768 });
    const page = await context.newPage();
    observe(page, "responsive-" + viewport.width + "x" + viewport.height);
    for (const stageId of ["opening", "trigger", "proof", "result", "offer"]) {
      const reveal = stageId === "offer";
      await openState(page, stageId, { reveal, fullPage: stageId === "result" || stageId === "offer" });
      const label = stageId + "-" + viewport.width + "x" + viewport.height;
      await measure(page, label, viewport);
      await screenshot(page, label + ".png");
    }
    await context.close();
  }
}

async function captureProfilesAndOffers() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await context.newPage();
  for (const [profileId, answers] of Object.entries(validation.profileExamples)) {
    await openState(page, "result", { answers, fullPage: true });
    await screenshot(page, "profile-" + profileId + ".png", true);
  }
  for (const [offerId, answers] of Object.entries(validation.offerExamples)) {
    await openState(page, "offer", { answers, selectedOfferId: offerId, reveal: true, fullPage: true });
    await screenshot(page, "offer-" + offerId + ".png", true);
  }
  await context.close();
}

async function waitStage(page, stageId, extra = 40) {
  await page.locator('.q6-stage[data-stage="' + stageId + '"][data-phase="active"]').waitFor({ state: "visible", timeout: 12_000 });
  if (extra > 0) await page.waitForTimeout(extra);
}

async function clickChoice(page, index, nextStage) {
  await page.locator(".q6-choice").nth(index).click();
  await waitStage(page, nextStage);
}

async function runJourney(page, indexes, recordPacing = false) {
  const pause = recordPacing ? 420 : 30;
  await page.goto(storageSetupURL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto(baseURL + "/quiz", { waitUntil: "domcontentloaded" });
  await waitStage(page, "opening", pause);
  await page.locator(".q6-opening .q6-primary").click();
  await waitStage(page, "name", pause);
  if (indexes.name) {
    await page.getByLabel("Primeiro nome").fill("Marina");
    await page.locator(".q6-name .q6-primary").click();
  } else {
    await page.locator(".q6-name .q6-secondary").click();
  }
  await waitStage(page, "trigger", pause);
  await clickChoice(page, indexes.trigger, "concern");
  await clickChoice(page, indexes.concern, "insight-one");
  await page.locator(".q6-insight .q6-primary").click();
  await waitStage(page, "impact", pause);
  await clickChoice(page, indexes.impact, "attempts");
  await clickChoice(page, indexes.attempts, "story");
  await page.locator(".q6-story .q6-primary").click();
  await waitStage(page, "recovery", pause);
  await page.locator(".q6-choice").nth(indexes.recovery).click();
  await page.locator(".q6-question__continue").click();
  await waitStage(page, "proof-preference", pause);
  await clickChoice(page, indexes.proof, "proof");
  await page.locator(".q6-proof > .q6-primary").click();
  await waitStage(page, "insight-two", pause);
  await page.locator(".q6-insight .q6-primary").click();
  await waitStage(page, "readiness", pause);
  await clickChoice(page, indexes.readiness, "continuity");
  await clickChoice(page, indexes.continuity, "anticipation");
  await page.locator(".q6-anticipation .q6-primary").click();
  await waitStage(page, "result", recordPacing ? 900 : 60);
}

async function runTwentyJourneys() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  observe(page, "twenty-journeys");
  for (let index = 0; index < 20; index += 1) {
    const startedAt = Date.now();
    const choices = {
      name: index % 2 === 0,
      trigger: index % 4,
      concern: Math.floor(index / 2) % 4,
      impact: Math.floor(index / 3) % 4,
      attempts: Math.floor(index / 4) % 4,
      recovery: Math.floor(index / 5) % 4,
      proof: Math.floor(index / 6) % 4,
      readiness: index % 4,
      continuity: Math.floor(index / 4) % 4,
    };
    try {
      await runJourney(page, choices, false);
      const title = await page.locator(".q6-result__hero h1").innerText();
      await page.locator(".q6-result__recommendation .q6-primary").click();
      await waitStage(page, "offer");
      await page.locator(".q6-reward-tease .q6-primary").click();
      await page.locator(".q6-reward-reveal").waitFor({ state: "visible", timeout: 5_000 });
      const checkout = await page.locator(".q6-offer-main .q6-checkout").getAttribute("href");
      audit.journeyRuns.push({ index: index + 1, status: "passed", choices, title, checkout, elapsedMs: Date.now() - startedAt });
    } catch (error) {
      audit.journeyRuns.push({ index: index + 1, status: "failed", choices, error: String(error), elapsedMs: Date.now() - startedAt });
    }
  }
  await context.close();
}

async function recordVideo(name, viewport, action, hasTouch = viewport.width < 768) {
  const context = await browser.newContext({
    viewport,
    hasTouch,
    recordVideo: { dir: temporaryVideoDirectory, size: viewport },
  });
  const page = await context.newPage();
  observe(page, "video-" + name);
  const video = page.video();
  await action(page);
  await context.close();
  if (video !== null) {
    const fileName = name + ".webm";
    await video.saveAs(path.join(videoDirectory, fileName));
    audit.videos.push(fileName);
  }
}

const fixedJourney = { name: true, trigger: 0, concern: 0, impact: 2, attempts: 0, recovery: 0, proof: 0, readiness: 0, continuity: 3 };

async function recordEvidence() {
  await recordVideo("01-complete-mobile-390x844", { width: 390, height: 844 }, async (page) => {
    await runJourney(page, fixedJourney, true);
    await page.locator(".q6-result__recommendation").scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await page.locator(".q6-result__recommendation .q6-primary").click();
    await waitStage(page, "offer", 700);
    await page.locator(".q6-reward-tease .q6-primary").click();
    await page.waitForTimeout(1_600);
    await page.locator(".q6-offer-main").scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
  });
  await recordVideo("02-complete-desktop-1440x900", { width: 1440, height: 900 }, async (page) => {
    await runJourney(page, fixedJourney, true);
    await page.locator(".q6-result__recommendation .q6-primary").click();
    await waitStage(page, "offer", 700);
    await page.locator(".q6-reward-tease .q6-primary").click();
    await page.waitForTimeout(1_600);
  }, false);
  await recordVideo("03-stage-enter-exit-back", { width: 390, height: 844 }, async (page) => {
    await page.goto(storageSetupURL, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.goto(baseURL + "/quiz", { waitUntil: "domcontentloaded" });
    await page.locator(".q6-opening .q6-primary").click();
    await page.waitForTimeout(900);
    await page.locator(".q6-name .q6-secondary").click();
    await page.waitForTimeout(900);
    await page.locator(".q6-choice").first().click();
    await page.waitForTimeout(900);
    await page.locator(".q6-icon-button").click();
    await page.waitForTimeout(900);
    await page.locator(".q6-choice").nth(1).click();
    await page.waitForTimeout(900);
  });
  await recordVideo("04-result-scroll", { width: 390, height: 844 }, async (page) => {
    await openState(page, "result", { fullPage: true });
    for (const selector of [".q6-result__recognitions", ".q6-result__guidance", ".q6-proof", ".q6-result-reasoning", ".q6-result__recommendation"]) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(750);
    }
  });
  await recordVideo("05-reward-reveal", { width: 390, height: 844 }, async (page) => {
    await openState(page, "offer");
    await page.waitForTimeout(600);
    await page.locator(".q6-reward-tease .q6-primary").click();
    await page.waitForTimeout(1_700);
  });
  await recordVideo("06-checkout-handoff", { width: 390, height: 844 }, async (page) => {
    await openState(page, "offer", { reveal: true });
    await page.locator(".q6-offer-main .q6-checkout").click();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3_000);
  });
}

try {
  await captureEveryStage();
  await captureResponsiveGate();
  await captureProfilesAndOffers();
  await runTwentyJourneys();
  await recordEvidence();
} finally {
  const timerStatus = {
    recorded: false,
    reason: "Nenhum cupom ou prazo comercial foi aprovado. O timer permanece coberto por teste de máquina, mas não é exibido nem gravado para evitar urgência falsa.",
  };
  await fs.writeFile(path.join(outputDirectory, "timer-recording-status.json"), JSON.stringify(timerStatus, null, 2) + "\n", "utf8");
  await fs.writeFile(path.join(outputDirectory, "visual-audit.json"), JSON.stringify(audit, null, 2) + "\n", "utf8");
  await browser.close();
}

process.stdout.write(JSON.stringify({
  screenshots: audit.screenshots.length,
  videos: audit.videos.length,
  journeyRuns: audit.journeyRuns.length,
  journeyFailures: audit.journeyRuns.filter((item) => item.status !== "passed").length,
  consoleErrors: audit.consoleErrors.length,
  pageErrors: audit.pageErrors.length,
  requestFailures: audit.requestFailures.length,
}, null, 2) + "\n");
