import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const root = process.cwd();
const screenshotDirectory = path.join(root, "artifacts", "screenshots");
const recordingDirectory = path.join(root, "artifacts", "recordings");
const temporaryVideoDirectory = path.join(root, ".tmp", "videos");

await Promise.all([
  fs.mkdir(screenshotDirectory, { recursive: true }),
  fs.mkdir(recordingDirectory, { recursive: true }),
  fs.mkdir(temporaryVideoDirectory, { recursive: true }),
]);

const server = await createServer({
  server: { host: "127.0.0.1", port: 4174, strictPort: true },
});
await server.listen();

const browser = await chromium.launch({ channel: "chrome" });
const baseURL = "http://127.0.0.1:4174";

async function captureInstitutionalScreenshots(width, height) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.goto(baseURL);
  await page.waitForLoadState("networkidle");
  await page.waitForFunction((selector) => {
    const element = globalThis.document.querySelector(selector);
    return (
      element !== null && globalThis.getComputedStyle(element).opacity === "1"
    );
  }, ".institutional-hero__copy");
  await page.waitForTimeout(150);

  await page.screenshot({
    path: path.join(
      screenshotDirectory,
      `${String(width)}x${String(height)}-institutional-hero.png`,
    ),
  });

  await page
    .locator(".celuclin-intro")
    .evaluate((element) =>
      element.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(
      screenshotDirectory,
      `${String(width)}x${String(height)}-institutional-intro.png`,
    ),
  });

  await context.close();
}

async function captureProductDetailScreenshots(width, height) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.goto(baseURL);
  await page.waitForLoadState("networkidle");

  await page
    .locator("#composicao")
    .evaluate((element) =>
      element.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  await page.waitForTimeout(650);
  await page.screenshot({
    path: path.join(
      screenshotDirectory,
      `${String(width)}x${String(height)}-formula.png`,
    ),
  });

  await page
    .locator("#rotina")
    .evaluate((element) =>
      element.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  await page.waitForTimeout(650);
  await page.screenshot({
    path: path.join(
      screenshotDirectory,
      `${String(width)}x${String(height)}-routine.png`,
    ),
  });

  await context.close();
}

async function captureInstitutionalCompletionScreenshots(width, height) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.goto(baseURL);
  await page.waitForLoadState("networkidle");

  await page
    .locator("#faq")
    .evaluate((element) =>
      element.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  await page
    .getByRole("button", { name: /O que é o CeluClin/ })
    .evaluate((element) => element.click());
  await page.waitForTimeout(350);
  await page.screenshot({
    path: path.join(
      screenshotDirectory,
      `${String(width)}x${String(height)}-faq.png`,
    ),
  });

  await page
    .locator("#belvitale")
    .evaluate((element) =>
      element.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(
      screenshotDirectory,
      `${String(width)}x${String(height)}-institutional-brand.png`,
    ),
  });

  await page
    .locator(".site-footer")
    .evaluate((element) =>
      element.scrollIntoView({ block: "end", behavior: "instant" }),
    );
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(
      screenshotDirectory,
      `${String(width)}x${String(height)}-footer.png`,
    ),
  });

  await context.close();
}

async function captureScreenshots(width, height) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.goto(baseURL);
  await page.waitForLoadState("networkidle");

  await page.locator(".proof-gallery").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: path.join(
      screenshotDirectory,
      `${String(width)}x${String(height)}-gallery.png`,
    ),
  });

  const label = page.locator("#rotulo");
  await label.evaluate((element) =>
    element.scrollIntoView({ block: "start", behavior: "instant" }),
  );
  await label.waitFor({ state: "visible" });
  await page.waitForTimeout(1800);
  await page.screenshot({
    path: path.join(
      screenshotDirectory,
      `${String(width)}x${String(height)}-label.png`,
    ),
  });

  await context.close();
}

async function recordSwipe() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    recordVideo: {
      dir: temporaryVideoDirectory,
      size: { width: 390, height: 844 },
    },
  });
  const page = await context.newPage();
  await page.goto(baseURL);
  await page.waitForLoadState("networkidle");
  const video = page.video();
  const scroller = page.locator(".gallery-mobile");
  await scroller.evaluate((element) =>
    element.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await page.waitForTimeout(300);
  const box = await scroller.boundingBox();
  if (box === null) throw new Error("Área de swipe ausente na gravação.");

  const session = await context.newCDPSession(page);
  const startX = box.x + box.width * 0.8;
  const y = box.y + box.height * 0.5;
  await page.waitForTimeout(600);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: startX, y }],
  });
  for (let step = 1; step <= 10; step += 1) {
    await page.waitForTimeout(34);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: startX - step * 23, y }],
    });
  }
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await page.waitForTimeout(900);
  await session.detach();
  await context.close();
  await video?.saveAs(path.join(recordingDirectory, "gallery-swipe.webm"));
}

async function recordMobileMenu() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    recordVideo: {
      dir: temporaryVideoDirectory,
      size: { width: 390, height: 844 },
    },
  });
  const page = await context.newPage();
  await page.goto(baseURL);
  await page.waitForLoadState("networkidle");
  const video = page.video();

  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.waitForTimeout(900);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.waitForTimeout(650);
  await page.getByRole("button", { name: "Fechar menu" }).click();
  await page.waitForTimeout(350);

  await context.close();
  await video?.saveAs(path.join(recordingDirectory, "mobile-menu.webm"));
}

async function recordFormulaToLabel() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    recordVideo: {
      dir: temporaryVideoDirectory,
      size: { width: 390, height: 844 },
    },
  });
  const page = await context.newPage();
  await page.goto(baseURL);
  await page.waitForLoadState("networkidle");
  const video = page.video();

  await page
    .locator("#composicao")
    .evaluate((element) =>
      element.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  await page.waitForTimeout(900);
  const labelLink = page.getByRole("link", {
    name: "Consultar rótulo original",
  });
  await labelLink.evaluate((element) => element.click());
  await page.waitForTimeout(1800);

  await context.close();
  await video?.saveAs(path.join(recordingDirectory, "formula-to-label.webm"));
}

async function recordFaqInteraction() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    recordVideo: {
      dir: temporaryVideoDirectory,
      size: { width: 390, height: 844 },
    },
  });
  const page = await context.newPage();
  await page.goto(baseURL);
  await page.waitForLoadState("networkidle");
  const video = page.video();

  await page
    .locator("#faq")
    .evaluate((element) =>
      element.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  await page.waitForTimeout(650);
  const first = page.getByRole("button", { name: /O que é o CeluClin/ });
  const second = page.getByRole("button", { name: /CeluClin é medicamento/ });
  await first.click();
  await page.waitForTimeout(650);
  await second.click();
  await page.waitForTimeout(650);
  await first.click();
  await page.waitForTimeout(450);

  await context.close();
  await video?.saveAs(path.join(recordingDirectory, "faq-interaction.webm"));
}

async function recordLabelOpening() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    recordVideo: {
      dir: temporaryVideoDirectory,
      size: { width: 390, height: 844 },
    },
  });
  const page = await context.newPage();
  await page.goto(baseURL);
  await page.waitForLoadState("networkidle");
  const video = page.video();
  await page.waitForTimeout(350);
  await page
    .locator("#rotulo")
    .evaluate((element) =>
      element.scrollIntoView({ block: "start", behavior: "smooth" }),
    );
  await page.waitForTimeout(1800);
  await page.getByRole("button", { name: "Ampliar rótulo" }).click();
  await page.waitForTimeout(900);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(350);
  await context.close();
  await video?.saveAs(
    path.join(recordingDirectory, "label-reveal-and-modal.webm"),
  );
}

try {
  await captureInstitutionalScreenshots(390, 844);
  await captureInstitutionalScreenshots(1440, 900);
  await captureProductDetailScreenshots(390, 844);
  await captureProductDetailScreenshots(1440, 900);
  await captureInstitutionalCompletionScreenshots(390, 844);
  await captureInstitutionalCompletionScreenshots(1440, 900);
  await captureScreenshots(390, 844);
  await captureScreenshots(1440, 900);
  await recordMobileMenu();
  await recordFormulaToLabel();
  await recordFaqInteraction();
  await recordSwipe();
  await recordLabelOpening();
} finally {
  await browser.close();
  await server.close();
}

process.stdout.write("Screenshots e gravações salvos em artifacts/.\n");
