import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

const baseUrl = "http://127.0.0.1:4173";
const output = path.resolve("artifacts/quiz-v7/review-7.1");
await mkdir(output, { recursive: true });

const baseAnswers = {
  perception: "cellulite",
  "first-thought": "care-again",
  "situation-weight": "getting-dressed",
  reaction: "change-clothes",
  avoidance: "sometimes",
  "deepest-impact": "confidence",
  "restart-trigger": "promise-different",
  history: "disappointed",
  dropoff: "time",
  "decision-weight": "expectation",
  "future-scene": "saved-clothes",
  "future-goal": "trust",
};

const browser = await chromium.launch({ headless: true });
const report = { consoleErrors: [], pageErrors: [], failedRequests: [], states: [] };

function session(stageId, answers, selectedOfferId) {
  const now = new Date();
  return {
    version: "7.0.0",
    sessionId: `review-${stageId}-71`,
    stageId,
    visitedStageIds: ["opening", stageId],
    answers,
    firstName: "Marina",
    nameProvided: true,
    ...(selectedOfferId ? { selectedOfferId } : {}),
    ...(stageId === "result" || stageId === "offer" ? { completedAt: now.toISOString() } : {}),
    savedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 86_400_000).toISOString(),
  };
}

async function capture(name, viewport, setup) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  page.on("console", (message) => { if (message.type() === "error") report.consoleErrors.push({ name, text: message.text() }); });
  page.on("pageerror", (error) => report.pageErrors.push({ name, text: error.message }));
  page.on("requestfailed", (request) => report.failedRequests.push({ name, url: request.url(), error: request.failure()?.errorText }));
  await page.goto(`${baseUrl}/quiz`, { waitUntil: "networkidle" });
  if (setup) await setup(page);
  const images = page.locator("img");
  for (let index = 0; index < await images.count(); index += 1) {
    await images.nth(index).scrollIntoViewIfNeeded();
  }
  await page.waitForFunction(() => [...globalThis.document.images].every((image) => image.complete), undefined, { timeout: 5_000 }).catch(() => undefined);
  await page.evaluate(() => globalThis.scrollTo({ top: 0, behavior: "instant" }));
  const metrics = await page.evaluate(() => ({
    scrollWidth: globalThis.document.documentElement.scrollWidth,
    viewportWidth: globalThis.window.innerWidth,
    brokenImages: [...globalThis.document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
    smallControls: [...globalThis.document.querySelectorAll("button:enabled, a[href]")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.height < 44;
      }).length,
  }));
  const target = path.join(output, `${name}.png`);
  await page.screenshot({ path: target, fullPage: true });
  report.states.push({ name, viewport, target, ...metrics });
  await context.close();
}

await capture("opening-390x844", { width: 390, height: 844 });
await capture("opening-1440x900", { width: 1440, height: 900 });
await capture("question-concern-390x844", { width: 390, height: 844 }, async (page) => {
  await page.getByRole("button", { name: /Quero entender o que está por trás/ }).click();
  await page.getByRole("button", { name: /Prefiro continuar/ }).click();
  await page.getByRole("heading", { name: /O que mais chama sua atenção/ }).waitFor();
});
await capture("insight-personalized-390x844", { width: 390, height: 844 }, async (page) => {
  await page.evaluate((value) => globalThis.localStorage.setItem("belvitale.quiz.v7", JSON.stringify(value)), session("insight-two", Object.fromEntries(Object.entries(baseAnswers).slice(0, 7))));
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /confiança encolhe junto/ }).waitFor();
});
await capture("result-cellulite-390x844", { width: 390, height: 844 }, async (page) => {
  await page.evaluate((value) => globalThis.localStorage.setItem("belvitale.quiz.v7", JSON.stringify(value)), session("result", baseAnswers));
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /Não é só a celulite/ }).waitFor();
});
await capture("result-flacidez-390x844", { width: 390, height: 844 }, async (page) => {
  const answers = { ...baseAnswers, perception: "firmness" };
  await page.evaluate((value) => globalThis.localStorage.setItem("belvitale.quiz.v7", JSON.stringify(value)), session("result", answers));
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /Não é só a flacidez/ }).waitFor();
});
await capture("offer-390x844", { width: 390, height: 844 }, async (page) => {
  await page.evaluate((value) => globalThis.localStorage.setItem("belvitale.quiz.v7", JSON.stringify(value)), session("offer", baseAnswers, "three-months"));
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /Agora escolha por quanto tempo/ }).waitFor();
});
await capture("offer-1440x900", { width: 1440, height: 900 }, async (page) => {
  await page.evaluate((value) => globalThis.localStorage.setItem("belvitale.quiz.v7", JSON.stringify(value)), session("offer", baseAnswers, "three-months"));
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /Agora escolha por quanto tempo/ }).waitFor();
});

await writeFile(path.join(output, "audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await browser.close();
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
