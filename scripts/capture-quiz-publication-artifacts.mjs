import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

process.env.VITE_QUIZ_PUBLICATION_STATUS = "approved";
process.env.VITE_CANONICAL_URL = "https://example.test/";

const root = process.cwd();
const screenshotDirectory = path.join(root, "artifacts", "screenshots");
const recordingDirectory = path.join(root, "artifacts", "recordings");
const temporaryVideoDirectory = path.join(root, ".tmp", "quiz-public-videos");

await Promise.all([
  fs.mkdir(screenshotDirectory, { recursive: true }),
  fs.mkdir(recordingDirectory, { recursive: true }),
  fs.mkdir(temporaryVideoDirectory, { recursive: true }),
]);

const server = await createServer({
  server: { host: "127.0.0.1", port: 4177, strictPort: true },
});
await server.listen();

const browser = await chromium.launch({ channel: "chrome" });
const baseURL = "http://127.0.0.1:4177";

async function captureViewport(width, height) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();

  await page.goto(`${baseURL}/quiz/`, { waitUntil: "networkidle" });
  await page.screenshot({
    path: path.join(
      screenshotDirectory,
      `${String(width)}x${String(height)}-quiz-public.png`,
    ),
  });

  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.locator(".home-quiz-cta").scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await page.screenshot({
    path: path.join(
      screenshotDirectory,
      `${String(width)}x${String(height)}-home-quiz-cta.png`,
    ),
  });

  await context.close();
}

async function recordHomeToQuiz() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    recordVideo: {
      dir: temporaryVideoDirectory,
      size: { width: 390, height: 844 },
    },
  });
  const page = await context.newPage();
  const video = page.video();

  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.locator(".home-quiz-cta").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.getByRole("link", { name: "Fazer o quiz" }).click();
  await page.waitForURL(/\/quiz\/?$/);
  await page.waitForTimeout(900);
  await context.close();
  await video?.saveAs(path.join(recordingDirectory, "home-to-quiz.webm"));
}

try {
  await captureViewport(390, 844);
  await captureViewport(1440, 900);
  await recordHomeToQuiz();
} finally {
  await browser.close();
  await server.close();
}

process.stdout.write("Evidências da publicação controlada salvas em artifacts/.\n");
