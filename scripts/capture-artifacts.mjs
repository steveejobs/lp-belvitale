import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const root = process.cwd();
const screenshotDirectory = path.join(root, "artifacts", "screenshots");
const recordingDirectory = path.join(root, "artifacts", "recordings");
const temporaryVideoDirectory = path.join(root, ".tmp", "videos");
const temporaryScreenshotDirectory = path.join(root, ".tmp", "screenshots");
const screenshotsOnly = process.argv.includes("--screenshots-only");
const execFileAsync = promisify(execFile);

await Promise.all([
  fs.mkdir(screenshotDirectory, { recursive: true }),
  fs.mkdir(recordingDirectory, { recursive: true }),
  fs.mkdir(temporaryVideoDirectory, { recursive: true }),
  fs.mkdir(temporaryScreenshotDirectory, { recursive: true }),
]);

const server = await createServer({
  server: { host: "127.0.0.1", port: 4174, strictPort: true },
});
await server.listen();

const browser = await chromium.launch({ channel: "chrome" });
const baseURL = "http://127.0.0.1:4174";

const simpleQuizOptions = [
  "begin-small",
  "perfect-start",
  "make-it-smaller",
  "direct-to-essential",
  "notice-last-minute",
  "light-enough-to-return",
];

const fixtureBase = {
  title: "1 mês",
  bottles: 1,
  approximateDurationMonths: 1,
  totalCapsules: 60,
  checkoutStatus: "confirmed",
  contentsStatus: "confirmed",
  price: {
    cash: 120,
    installments: 3,
    installmentValue: 40,
    hasInterest: false,
    status: "confirmed",
  },
  image: {
    src: "/internal-fixture.webp",
    width: 1600,
    height: 1600,
    rightsConfirmed: true,
    resolutionApproved: true,
    status: "confirmed",
  },
  publicationStatus: "confirmed",
};

const fixtureOffers = [
  {
    ...fixtureBase,
    id: "one-month",
    checkoutUrl: "https://belvitale.pay.yampi.com.br/r/PWJOI4I112",
  },
  {
    ...fixtureBase,
    id: "three-months",
    title: "3 meses",
    bottles: 3,
    approximateDurationMonths: 3,
    totalCapsules: 180,
    checkoutUrl: "https://belvitale.pay.yampi.com.br/r/1E8NNCGJW9",
    price: {
      cash: 300,
      installments: 3,
      installmentValue: 100,
      hasInterest: false,
      status: "confirmed",
    },
  },
  {
    ...fixtureBase,
    id: "seven-months",
    title: "7 meses",
    bottles: 5,
    additionalBottles: 2,
    approximateDurationMonths: 7,
    totalCapsules: 420,
    checkoutUrl: "https://belvitale.pay.yampi.com.br/r/41CHX4MGPX",
    price: {
      cash: 560,
      installments: 4,
      installmentValue: 140,
      hasInterest: false,
      status: "confirmed",
    },
  },
];

async function settle(page, milliseconds = 700) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(milliseconds);
}

async function scrollToSection(page, selector, milliseconds = 750) {
  await page.locator(selector).evaluate((element) => {
    element.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await page.waitForTimeout(milliseconds);
}

function screenshotPath(name) {
  return path.join(screenshotDirectory, name + ".png");
}

async function captureFullPage(page, name) {
  const output = screenshotPath(name);
  const viewport = page.viewportSize();
  if (viewport === null) throw new Error("Viewport ausente na captura");
  const dimensions = await page.evaluate(() => ({
    width: globalThis.document.documentElement.clientWidth,
    height: globalThis.document.documentElement.scrollHeight,
  }));

  if (dimensions.height <= viewport.height) {
    await page.screenshot({ path: output, fullPage: true });
    return;
  }

  const parts = [];
  const fullSegments = Math.floor(dimensions.height / viewport.height);
  for (let index = 0; index < fullSegments; index += 1) {
    const top = index * viewport.height;
    const part = path.join(
      temporaryScreenshotDirectory,
      name + "-part-" + String(index).padStart(2, "0") + ".png",
    );
    await fs.rm(part, { force: true });
    await page.evaluate(
      (scrollTop) => globalThis.scrollTo({ top: scrollTop, behavior: "instant" }),
      top,
    );
    await page.waitForFunction(
      (scrollTop) => Math.abs(globalThis.scrollY - scrollTop) < 2,
      top,
    );
    await page.waitForTimeout(40);
    await page.screenshot({ path: part });
    parts.push(part);
  }

  const remainder = dimensions.height - fullSegments * viewport.height;
  if (remainder > 0) {
    const part = path.join(
      temporaryScreenshotDirectory,
      name + "-part-" + String(fullSegments).padStart(2, "0") + ".png",
    );
    await fs.rm(part, { force: true });
    await page.evaluate(() => globalThis.scrollTo({
      top: globalThis.document.documentElement.scrollHeight,
      behavior: "instant",
    }));
    await page.waitForFunction(() =>
      Math.abs(
        globalThis.scrollY -
        (globalThis.document.documentElement.scrollHeight - globalThis.innerHeight),
      ) < 2,
    );
    await page.waitForTimeout(40);
    await page.screenshot({
      path: part,
      clip: {
        x: 0,
        y: viewport.height - remainder,
        width: dimensions.width,
        height: remainder,
      },
    });
    parts.push(part);
  }

  await execFileAsync("powershell.exe", [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    path.join(root, "scripts", "stitch-screenshots.ps1"),
    output,
    ...parts,
  ]);
  await Promise.all(parts.map((part) => fs.rm(part, { force: true })));
}

async function captureViewportSection(page, prefix, name, selector) {
  await scrollToSection(page, selector);
  await page.screenshot({ path: screenshotPath(prefix + name) });
}

async function captureHome(width, height) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.goto(baseURL + "/");
  await settle(page, 1200);
  const prefix = String(width) + "x" + String(height) + "-";

  await page.screenshot({ path: screenshotPath(prefix + "home-hero") });
  const sections = width < 700
    ? [
        ["home-gallery", "#acervo"],
        ["home-emotional", "#liberdade"],
        ["home-product", "#celuclin"],
        ["home-formula", "#composicao"],
        ["home-results", "#resultados"],
        ["home-label", "#rotulo"],
        ["home-routine", "#rotina"],
        ["home-offers", "#kits"],
        ["home-closing", ".campaign-closing"],
      ]
    : [
        ["home-gallery", "#acervo"],
        ["home-product", "#celuclin"],
        ["home-results", "#resultados"],
        ["home-offers", "#kits"],
      ];

  for (const [name, selector] of sections) {
    await captureViewportSection(page, prefix, name, selector);
  }

  await page.addStyleTag({
    content:
      "html { scroll-behavior: auto !important; } #conteudo-principal > section, .proof-chapter, .site-footer { content-visibility: visible !important; contain-intrinsic-size: none !important; } .site-header, .choice-sequence__media, .product-story__media, .faq-section__heading { position: relative !important; top: auto !important; } .choice-sequence__story, .product-story__content { margin-top: 0 !important; }",
  });
  await page.locator("img[loading='lazy']").evaluateAll(async (images) => {
    for (const image of images) image.loading = "eager";
    await Promise.all(images.map(async (image) => {
      try {
        await image.decode();
      } catch {
        // O estado de erro continua visível no screenshot e é coberto em teste.
      }
    }));
  });
  await page.waitForTimeout(900);
  await captureFullPage(page, prefix + "home-full");
  await context.close();
}

async function completeQuiz(page, pause = 180) {
  for (const [index, optionId] of simpleQuizOptions.entries()) {
    await page.locator('input[value="' + optionId + '"]').locator("..").click();
    await page.getByRole("button", {
      name: index === simpleQuizOptions.length - 1 ? "Ver meu ritmo" : "Continuar",
    }).click();
    await page.waitForTimeout(pause);
  }
}

async function captureQuiz(width, height) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.goto(baseURL + "/quiz");
  await settle(page, 900);
  const prefix = String(width) + "x" + String(height) + "-";

  await page.screenshot({ path: screenshotPath(prefix + "quiz-start") });
  await page.getByRole("button", { name: "Entrar na experiência" }).click();
  await page.waitForTimeout(450);
  await page.screenshot({ path: screenshotPath(prefix + "quiz-question") });
  await completeQuiz(page);
  await page.waitForTimeout(700);
  await page.screenshot({ path: screenshotPath(prefix + "quiz-result") });
  await page.locator("img[loading='lazy']").evaluateAll(async (images) => {
    for (const image of images) image.loading = "eager";
    await Promise.all(images.map(async (image) => {
      try {
        await image.decode();
      } catch {
        // A aplicação mantém seu fallback; a captura não oculta falhas.
      }
    }));
  });
  await captureFullPage(page, prefix + "quiz-result-full");
  await context.close();
}

async function recordVideo(name, run) {
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
  const video = page.video();
  await run(page);
  await context.close();
  if (video !== null) await video.saveAs(path.join(recordingDirectory, name));
}

async function recordHomeCampaign() {
  const target = path.join(recordingDirectory, "home-full-campaign.webm");
  await recordVideo("home-first-60-seconds.webm", async (page) => {
    await page.goto(baseURL + "/");
    await settle(page, 2600);
    const maximum = await page.evaluate(
      () => globalThis.document.documentElement.scrollHeight - globalThis.innerHeight,
    );
    const steps = 90;
    for (let index = 1; index <= steps; index += 1) {
      await page.evaluate(
        ({ top }) => globalThis.scrollTo({ top, behavior: "smooth" }),
        { top: (maximum * index) / steps },
      );
      await page.waitForTimeout(540);
    }
    await page.waitForTimeout(1800);
  });
  await fs.copyFile(
    path.join(recordingDirectory, "home-first-60-seconds.webm"),
    target,
  );
}

async function recordFormula() {
  await recordVideo("formula-interaction.webm", async (page) => {
    await page.goto(baseURL + "/");
    await settle(page);
    await scrollToSection(page, "#composicao");
    const tabs = page.getByRole("tab");
    for (let index = 1; index < (await tabs.count()); index += 1) {
      await tabs.nth(index).click();
      await page.waitForTimeout(450);
    }
    await tabs.last().focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(850);
  });
}

async function recordLabel() {
  await recordVideo("label-interaction.webm", async (page) => {
    await page.goto(baseURL + "/");
    await settle(page);
    await scrollToSection(page, "#rotulo", 1400);
    await page.getByRole("button", { name: "Ampliar para ler" }).click();
    await page.waitForTimeout(1400);
    await page.locator(".label-modal__viewport").evaluate((element) => {
      element.scrollTo({ left: element.scrollWidth, behavior: "smooth" });
    });
    await page.waitForTimeout(1300);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(650);
  });
}

async function recordProofStories() {
  await recordVideo("results-section.webm", async (page) => {
    await page.goto(baseURL + "/");
    await settle(page);
    await scrollToSection(page, "#resultados", 1300);
    for (let index = 0; index < 3; index += 1) {
      await page.getByRole("button", { name: "Próximo registro de celulite" }).click();
      await page.waitForTimeout(900);
    }
    await scrollToSection(page, ".proof-chapter--laxity", 1400);
    await scrollToSection(page, ".proof-chapter--localized", 1600);
  });
}

async function recordQuizFlow() {
  await recordVideo("quiz-complete-flow.webm", async (page) => {
    await page.goto(baseURL + "/quiz");
    await settle(page, 1200);
    await page.getByRole("button", { name: "Entrar na experiência" }).click();
    await page.waitForTimeout(650);
    for (const [index, optionId] of simpleQuizOptions.entries()) {
      await page.locator('input[value="' + optionId + '"]').locator("..").click();
      await page.waitForTimeout(450);
      await page.getByRole("button", {
        name: index === simpleQuizOptions.length - 1 ? "Ver meu ritmo" : "Continuar",
      }).click();
      await page.waitForTimeout(600);
    }
    await page.waitForTimeout(1600);
    await page.evaluate(() => globalThis.scrollBy({ top: 520, behavior: "smooth" }));
    await page.waitForTimeout(1400);
  });
}

async function recordCheckoutHandoff() {
  await recordVideo("home-to-checkout.webm", async (page) => {
    await page.addInitScript((offers) => {
      globalThis.__BELVITALE_COMMERCIAL_FIXTURE__ = {
        name: "commercial-ready",
        offers,
        dependencies: {
          refundPolicyStatus: "approved",
          institutionalIdentificationStatus: "confirmed",
        },
      };
    }, fixtureOffers);
    await page.route("https://belvitale.pay.yampi.com.br/r/1E8NNCGJW9", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html; charset=utf-8",
        body: "<!doctype html><meta name='viewport' content='width=device-width'><style>body{margin:0;display:grid;min-height:100vh;place-content:center;padding:24px;background:#1b0814;color:#fff;font:18px Arial;text-align:center}strong{font:600 48px Georgia;color:#f59bc5}p{max-width:28ch;line-height:1.5}</style><strong>Saída validada</strong><p>Checkout Yampi exato interceptado apenas para esta gravação interna. Nenhuma oferta foi publicada.</p>",
      });
    });
    await page.goto(baseURL + "/");
    await settle(page);
    await scrollToSection(page, "#kits", 1200);
    await page.getByRole("link", { name: "Escolher continuar" }).click();
    await page.waitForTimeout(2200);
  });
}

try {
  await captureHome(390, 844);
  await captureQuiz(390, 844);
  await captureHome(1440, 900);
  await captureQuiz(1440, 900);
  if (!screenshotsOnly) {
    await recordHomeCampaign();
    await recordFormula();
    await recordLabel();
    await recordProofStories();
    await recordQuizFlow();
    await recordCheckoutHandoff();
  }
} finally {
  await browser.close();
  await server.close();
}

process.stdout.write(
  screenshotsOnly
    ? "Screenshots de auditoria salvos em artifacts/screenshots.\n"
    : "Screenshots e gravações finais salvos em artifacts/screenshots e artifacts/recordings.\n",
);
