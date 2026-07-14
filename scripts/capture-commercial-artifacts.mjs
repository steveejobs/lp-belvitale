import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const root = process.cwd();
const screenshotDirectory = path.join(root, "artifacts", "screenshots");
const recordingDirectory = path.join(root, "artifacts", "recordings");
const temporaryVideoDirectory = path.join(root, ".tmp", "commercial-videos");

await Promise.all([
  fs.mkdir(screenshotDirectory, { recursive: true }),
  fs.mkdir(recordingDirectory, { recursive: true }),
  fs.mkdir(temporaryVideoDirectory, { recursive: true }),
]);

const checkoutUrls = {
  oneMonth: "https://belvitale.pay.yampi.com.br/r/PWJOI4I112",
  threeMonths: "https://belvitale.pay.yampi.com.br/r/1E8NNCGJW9",
  sevenMonths: "https://belvitale.pay.yampi.com.br/r/41CHX4MGPX",
};

const baseFixtureOffer = {
  id: "one-month",
  title: "1 mês",
  bottles: 1,
  approximateDurationMonths: 1,
  totalCapsules: 60,
  checkoutUrl: checkoutUrls.oneMonth,
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
    src: "/__fixtures__/not-rendered-kit-1.webp",
    width: 1600,
    height: 1600,
    rightsConfirmed: true,
    resolutionApproved: true,
    status: "confirmed",
  },
  publicationStatus: "confirmed",
};

const readyFixture = {
  name: "commercial-ready",
  dependencies: {
    refundPolicyStatus: "approved",
    institutionalIdentificationStatus: "confirmed",
  },
  offers: [
    baseFixtureOffer,
    {
      ...baseFixtureOffer,
      id: "three-months",
      title: "3 meses",
      bottles: 3,
      approximateDurationMonths: 3,
      totalCapsules: 180,
      checkoutUrl: checkoutUrls.threeMonths,
      price: {
        cash: 300,
        installments: 3,
        installmentValue: 100,
        hasInterest: false,
        status: "confirmed",
      },
      image: {
        ...baseFixtureOffer.image,
        src: "/__fixtures__/not-rendered-kit-3.webp",
      },
    },
    {
      ...baseFixtureOffer,
      id: "seven-months",
      title: "7 meses",
      bottles: 5,
      additionalBottles: 2,
      approximateDurationMonths: 7,
      totalCapsules: 420,
      checkoutUrl: checkoutUrls.sevenMonths,
      price: {
        cash: 560,
        installments: 4,
        installmentValue: 140,
        hasInterest: false,
        status: "confirmed",
      },
      image: {
        ...baseFixtureOffer.image,
        src: "/__fixtures__/not-rendered-kit-7.webp",
      },
    },
  ],
};

const server = await createServer({
  server: { host: "127.0.0.1", port: 4175, strictPort: true },
});
await server.listen();

const browser = await chromium.launch({ channel: "chrome" });
const baseURL = "http://127.0.0.1:4175";

async function installReadyFixture(context) {
  await context.addInitScript((fixture) => {
    globalThis.__BELVITALE_COMMERCIAL_FIXTURE__ = fixture;
    globalThis.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (
          target instanceof globalThis.Element &&
          target.closest('a[href*="belvitale.pay.yampi.com.br"]') !== null
        ) {
          event.preventDefault();
        }
      },
      true,
    );
  }, readyFixture);
}

async function captureState(width, height, state) {
  const context = await browser.newContext({ viewport: { width, height } });
  if (state === "ready-fixture") await installReadyFixture(context);
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "networkidle" });
  const screenshotAnchor =
    state === "ready-fixture"
      ? page.locator("#kits .commercial-internal-state")
      : page.locator("#kits");
  await screenshotAnchor
    .evaluate((element) =>
      element.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  await page.waitForTimeout(650);
  await page.screenshot({
    path: path.join(
      screenshotDirectory,
      `${String(width)}x${String(height)}-commercial-${state}.png`,
    ),
  });
  await context.close();
}

async function recordSelection() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    recordVideo: {
      dir: temporaryVideoDirectory,
      size: { width: 390, height: 844 },
    },
  });
  await installReadyFixture(context);
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "networkidle" });
  const video = page.video();

  await page
    .locator("#kits")
    .evaluate((element) =>
      element.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  await page.waitForTimeout(900);
  const firstCard = page.locator('[data-offer-id="one-month"]');
  await firstCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  const firstCta = page.getByRole("link", { name: "Escolher 1 mês" });
  await firstCta.focus();
  await page.waitForTimeout(500);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(850);
  await page
    .locator('[data-offer-id="three-months"]')
    .scrollIntoViewIfNeeded();
  await page.waitForTimeout(650);
  await page.getByRole("link", { name: "Escolher 3 meses" }).click();
  await page.waitForTimeout(650);

  await context.close();
  await video?.saveAs(
    path.join(recordingDirectory, "commercial-selection.webm"),
  );
}

try {
  await captureState(390, 844, "blocked");
  await captureState(390, 844, "ready-fixture");
  await captureState(1440, 900, "blocked");
  await captureState(1440, 900, "ready-fixture");
  await recordSelection();
} finally {
  await browser.close();
  await server.close();
}

process.stdout.write("Evidências comerciais salvas em artifacts/.\n");
