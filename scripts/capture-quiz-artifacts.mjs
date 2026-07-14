import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const root = process.cwd();
const screenshotDirectory = path.join(root, "artifacts", "screenshots");
const recordingDirectory = path.join(root, "artifacts", "recordings");
const temporaryVideoDirectory = path.join(root, ".tmp", "quiz-videos");

await Promise.all([
  fs.mkdir(screenshotDirectory, { recursive: true }),
  fs.mkdir(recordingDirectory, { recursive: true }),
  fs.mkdir(temporaryVideoDirectory, { recursive: true }),
]);

const server = await createServer({
  server: { host: "127.0.0.1", port: 4176, strictPort: true },
});
await server.listen();

const browser = await chromium.launch({ channel: "chrome" });
const baseURL = "http://127.0.0.1:4176";

async function openQuizPage(context) {
  const page = await context.newPage();
  await page.goto(`${baseURL}/quiz/`, { waitUntil: "networkidle" });
  return page;
}

async function finishQuiz(page, optionIndex, pause = 0) {
  for (let step = 0; step < 6; step += 1) {
    await page.getByRole("radio").nth(optionIndex).check();
    if (pause > 0) await page.waitForTimeout(pause);
    await page
      .getByRole("button", {
        name: step === 5 ? "Ver meu perfil" : "Continuar",
      })
      .click();
    if (pause > 0) await page.waitForTimeout(pause);
  }
}

async function captureScreenshots(width, height) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await openQuizPage(context);
  await page.waitForTimeout(350);
  await page.screenshot({
    path: path.join(
      screenshotDirectory,
      `${String(width)}x${String(height)}-quiz-start.png`,
    ),
  });

  await page.getByRole("button", { name: "Começar o quiz" }).click();
  await page.getByRole("radio").nth(1).check();
  await page.waitForTimeout(450);
  await page.screenshot({
    path: path.join(
      screenshotDirectory,
      `${String(width)}x${String(height)}-quiz-question.png`,
    ),
  });

  await page.getByRole("button", { name: "Continuar" }).click();
  for (let step = 1; step < 6; step += 1) {
    await page.getByRole("radio").nth(1).check();
    await page
      .getByRole("button", {
        name: step === 5 ? "Ver meu perfil" : "Continuar",
      })
      .click();
  }
  await page.waitForTimeout(450);
  await page.screenshot({
    path: path.join(
      screenshotDirectory,
      `${String(width)}x${String(height)}-quiz-result.png`,
    ),
  });

  await context.close();
}

async function recordCompleteFlow() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    recordVideo: {
      dir: temporaryVideoDirectory,
      size: { width: 390, height: 844 },
    },
  });
  const page = await openQuizPage(context);
  const video = page.video();
  await page.waitForTimeout(650);
  await page.getByRole("button", { name: "Começar o quiz" }).click();
  await page.waitForTimeout(450);
  await finishQuiz(page, 1, 320);
  await page.waitForTimeout(900);
  await context.close();
  await video?.saveAs(
    path.join(recordingDirectory, "quiz-complete-flow.webm"),
  );
}

async function recordResumeFlow() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    recordVideo: {
      dir: temporaryVideoDirectory,
      size: { width: 390, height: 844 },
    },
  });
  const page = await openQuizPage(context);
  const video = page.video();
  await page.waitForTimeout(550);
  await page.getByRole("button", { name: "Começar o quiz" }).click();
  await page.waitForTimeout(450);
  await page.getByRole("radio").nth(2).check();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForTimeout(650);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(850);
  await page.getByRole("button", { name: "Voltar" }).click();
  await page.waitForTimeout(750);
  await context.close();
  await video?.saveAs(path.join(recordingDirectory, "quiz-resume-flow.webm"));
}

try {
  await captureScreenshots(390, 844);
  await captureScreenshots(1440, 900);
  await recordCompleteFlow();
  await recordResumeFlow();
} finally {
  await browser.close();
  await server.close();
}

process.stdout.write("Evidências do quiz salvas em artifacts/.\n");
