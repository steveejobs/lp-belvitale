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

async function settle(page, milliseconds = 450) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(milliseconds);
}

async function scrollTo(page, selector) {
  await page.locator(selector).evaluate((element) => {
    element.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await page.waitForTimeout(550);
}

function screenshotPath(name) {
  return path.join(screenshotDirectory, name + ".png");
}

async function captureHome(width, height) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.goto(baseURL + "/");
  await settle(page, 900);
  const prefix = String(width) + "x" + String(height) + "-";

  await page.screenshot({ path: screenshotPath(prefix + "home-hero") });

  const sections =
    width < 700
      ? [
          ["home-emotional", ".freedom-editorial"],
          ["home-product", "#celuclin"],
          ["home-formula", "#composicao"],
          ["home-offers", "#kits"],
        ]
      : [
          ["home-product", "#celuclin"],
          ["home-offers", "#kits"],
        ];

  for (const [name, selector] of sections) {
    await scrollTo(page, selector);
    await page.screenshot({ path: screenshotPath(prefix + name) });
  }

  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.addStyleTag({
    content:
      "#conteudo-principal > section { content-visibility: visible !important; contain-intrinsic-size: none !important; }",
  });
  await page.waitForTimeout(700);
  await page.screenshot({
    path: screenshotPath(prefix + "home-full"),
    fullPage: true,
  });
  await context.close();
}

async function completeQuiz(page) {
  for (const [index, optionId] of simpleQuizOptions.entries()) {
    await page
      .locator('input[value="' + optionId + '"]')
      .locator("..")
      .click();
    await page
      .getByRole("button", {
        name:
          index === simpleQuizOptions.length - 1
            ? "Ver meu ritmo"
            : "Continuar",
      })
      .click();
    await page.waitForTimeout(180);
  }
}

async function captureQuiz(width, height) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.goto(baseURL + "/quiz");
  await settle(page, 700);
  const prefix = String(width) + "x" + String(height) + "-";

  await page.screenshot({ path: screenshotPath(prefix + "quiz-start") });
  await page.getByRole("button", { name: "Descobrir meu ritmo" }).click();
  await page.waitForTimeout(350);
  if (width < 700) {
    await page.screenshot({
      path: screenshotPath(prefix + "quiz-question"),
    });
  }
  await completeQuiz(page);
  await page.waitForTimeout(600);
  await page.screenshot({ path: screenshotPath(prefix + "quiz-result") });
  await page.screenshot({
    path: screenshotPath(prefix + "quiz-result-full"),
    fullPage: true,
  });
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
  if (video !== null) {
    await video.saveAs(path.join(recordingDirectory, name));
  }
}

async function recordHomeFirstMinute() {
  await recordVideo("home-first-60-seconds.webm", async (page) => {
    await page.goto(baseURL + "/");
    await settle(page, 2500);
    const maximum = await page.evaluate(
      () => globalThis.document.documentElement.scrollHeight - globalThis.innerHeight,
    );
    const steps = 78;
    for (let index = 1; index <= steps; index += 1) {
      await page.evaluate(
        ({ top }) => scrollTo({ top, behavior: "smooth" }),
        { top: (maximum * index) / steps },
      );
      await page.waitForTimeout(500);
    }
    await page.waitForTimeout(1800);
  });
}

async function recordFormula() {
  await recordVideo("formula-interaction.webm", async (page) => {
    await page.goto(baseURL + "/");
    await settle(page);
    await scrollTo(page, "#composicao");
    const tabs = page.getByRole("tab");
    for (let index = 1; index < (await tabs.count()); index += 1) {
      await tabs.nth(index).click();
      await page.waitForTimeout(550);
    }
    await tabs.last().focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(900);
  });
}

async function recordLabel() {
  await recordVideo("label-interaction.webm", async (page) => {
    await page.goto(baseURL + "/");
    await settle(page);
    await page.locator("#rotulo").evaluate((element) => {
      element.scrollIntoView({ block: "start", behavior: "smooth" });
    });
    await page.waitForTimeout(1800);
    await page.getByRole("button", { name: "Ampliar para ler" }).click();
    await page.waitForTimeout(1800);
    const viewport = page.locator(".label-modal__viewport");
    await viewport.evaluate((element) => {
      element.scrollTo({ left: element.scrollWidth, behavior: "smooth" });
    });
    await page.waitForTimeout(1400);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(700);
  });
}

async function recordQuizFlow() {
  await recordVideo("quiz-complete-flow.webm", async (page) => {
    await page.goto(baseURL + "/quiz");
    await settle(page, 1200);
    await page.getByRole("button", { name: "Descobrir meu ritmo" }).click();
    await page.waitForTimeout(700);
    for (const [index, optionId] of simpleQuizOptions.entries()) {
      await page
        .locator('input[value="' + optionId + '"]')
        .locator("..")
        .click();
      await page.waitForTimeout(450);
      await page
        .getByRole("button", {
          name:
            index === simpleQuizOptions.length - 1
              ? "Ver meu ritmo"
              : "Continuar",
        })
        .click();
      await page.waitForTimeout(600);
    }
    await page.waitForTimeout(1800);
    await page.evaluate(() =>
      globalThis.scrollBy({ top: 360, behavior: "smooth" }),
    );
    await page.waitForTimeout(1200);
  });
}

async function recordCheckoutHandoff() {
  await recordVideo("home-to-checkout.webm", async (page) => {
    await page.addInitScript((offers) => {
      const target = globalThis;
      target.__BELVITALE_COMMERCIAL_FIXTURE__ = {
        name: "commercial-ready",
        offers,
        dependencies: {
          refundPolicyStatus: "approved",
          institutionalIdentificationStatus: "confirmed",
        },
      };
    }, fixtureOffers);
    await page.route(
      "https://belvitale.pay.yampi.com.br/r/1E8NNCGJW9",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "text/html; charset=utf-8",
          body:
            "<!doctype html><meta name='viewport' content='width=device-width'><style>body{margin:0;display:grid;min-height:100vh;place-content:center;padding:24px;background:#24101e;color:#fff;font:18px Arial;text-align:center}strong{font:600 48px Georgia;color:#ffb8d8}p{max-width:28ch;line-height:1.5}</style><strong>Saída validada</strong><p>Checkout Yampi exato interceptado apenas para esta gravação interna. Nenhuma oferta foi publicada.</p>",
        });
      },
    );
    await page.goto(baseURL + "/");
    await settle(page);
    await scrollTo(page, "#kits");
    await page.waitForTimeout(1000);
    await page
      .getByRole("link", { name: "Escolher continuidade" })
      .click();
    await page.waitForTimeout(2200);
  });
}

try {
  await captureHome(390, 844);
  await captureQuiz(390, 844);
  await captureHome(1440, 900);
  await captureQuiz(1440, 900);
  await recordHomeFirstMinute();
  await recordFormula();
  await recordLabel();
  await recordQuizFlow();
  await recordCheckoutHandoff();
} finally {
  await browser.close();
  await server.close();
}

process.stdout.write(
  "Screenshots e gravações finais salvos em artifacts/screenshots e artifacts/recordings.\n",
);
