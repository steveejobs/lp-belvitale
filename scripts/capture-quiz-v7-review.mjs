import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

const baseUrl = "http://127.0.0.1:4173";
const output = path.resolve("artifacts/quiz-v7/review");
await mkdir(output, { recursive: true });

const answers = {
  perception: "clothes",
  "first-thought": "care-again",
  "situation-weight": "getting-dressed",
  reaction: "promise-care",
  avoidance: "sometimes",
  "deepest-impact": "routine",
  "restart-trigger": "promise-different",
  history: "start-stop",
  dropoff: "time",
  "decision-weight": "simple",
  "future-scene": "saved-clothes",
  "future-goal": "lasting-routine",
};

const browser = await chromium.launch({ headless: true });
const report = { consoleErrors: [], pageErrors: [], failedRequests: [], screenshots: [] };

async function capture(name, viewport, setup) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") report.consoleErrors.push({ name, text: message.text() });
  });
  page.on("pageerror", (error) => report.pageErrors.push({ name, text: error.message }));
  page.on("requestfailed", (request) => report.failedRequests.push({ name, url: request.url(), error: request.failure()?.errorText }));
  await page.goto(`${baseUrl}/quiz`, { waitUntil: "networkidle" });
  if (setup) await setup(page);
  const target = path.join(output, `${name}.png`);
  await page.screenshot({ path: target, fullPage: true });
  report.screenshots.push({ name, viewport, path: target, scrollWidth: await page.evaluate(() => globalThis.document.documentElement.scrollWidth) });
  await context.close();
}

await capture("opening-mobile-390x844", { width: 390, height: 844 });
await capture("opening-desktop-1440x900", { width: 1440, height: 900 });
await capture("question-mobile-390x844", { width: 390, height: 844 }, async (page) => {
  await page.getByRole("button", { name: /Começar agora/ }).click();
  await page.getByRole("button", { name: /Prefiro continuar/ }).click();
  await page.getByRole("heading", { name: /Quando você percebe/ }).waitFor();
});
await capture("insight-routine-mobile-390x844", { width: 390, height: 844 }, async (page) => {
  const now = new Date();
  const insightAnswers = Object.fromEntries(Object.entries(answers).slice(0, 7));
  await page.evaluate(({ insightAnswers, now }) => {
    globalThis.localStorage.setItem("belvitale.quiz.v7", JSON.stringify({
      version: "7.0.0",
      sessionId: "session-review-insight-v7",
      stageId: "insight-two",
      visitedStageIds: ["opening", "insight-one", "insight-two"],
      answers: insightAnswers,
      firstName: "Marina",
      nameProvided: true,
      savedAt: now,
      expiresAt: new Date(Date.parse(now) + 86_400_000).toISOString(),
    }));
  }, { insightAnswers, now: now.toISOString() });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /Talvez o problema nunca/ }).waitFor();
});
await capture("result-mobile-390x844", { width: 390, height: 844 }, async (page) => {
  const now = new Date();
  await page.evaluate(({ answers, now }) => {
    globalThis.localStorage.setItem("belvitale.quiz.v7", JSON.stringify({
      version: "7.0.0",
      sessionId: "session-review-v7",
      stageId: "result",
      visitedStageIds: ["opening", "result"],
      answers,
      firstName: "Marina",
      nameProvided: true,
      completedAt: now,
      savedAt: now,
      expiresAt: new Date(Date.parse(now) + 86_400_000).toISOString(),
    }));
  }, { answers, now: now.toISOString() });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /O seu maior desafio/ }).waitFor();
  const resultImages = page.locator(".q7-result img");
  for (let index = 0; index < await resultImages.count(); index += 1) {
    const image = resultImages.nth(index);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element) => {
      if (element.complete && element.naturalWidth > 0) return;
      return new Promise((resolve, reject) => {
        element.addEventListener("load", resolve, { once: true });
        element.addEventListener("error", reject, { once: true });
      });
    });
  }
  await page.locator(".q7-result-proof__rail").evaluate((element) => { element.scrollLeft = 0; });
  await page.evaluate(() => globalThis.scrollTo({ top: 0, behavior: "instant" }));
});
await capture("offer-desktop-1440x900", { width: 1440, height: 900 }, async (page) => {
  const now = new Date();
  await page.evaluate(({ answers, now }) => {
    globalThis.localStorage.setItem("belvitale.quiz.v7", JSON.stringify({
      version: "7.0.0",
      sessionId: "session-review-offer-v7",
      stageId: "offer",
      visitedStageIds: ["opening", "result", "offer"],
      answers,
      firstName: "Marina",
      nameProvided: true,
      selectedOfferId: "three-months",
      completedAt: now,
      savedAt: now,
      expiresAt: new Date(Date.parse(now) + 86_400_000).toISOString(),
    }));
  }, { answers, now: now.toISOString() });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /Nossa sugestão/ }).waitFor();
});

await writeFile(path.join(output, "audit.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
await browser.close();
process.stdout.write(JSON.stringify(report, null, 2) + "\n");
