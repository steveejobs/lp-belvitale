import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

const previewURL = process.env.PREVIEW_URL;
const skipStatic = process.argv.includes("--skip-static");
const skipHome = process.argv.includes("--skip-home");
const skipGalleries = process.argv.includes("--skip-galleries");
const skipLabel = process.argv.includes("--skip-label");
const skipCheckouts = process.argv.includes("--skip-checkouts");
const skipQuiz = process.argv.includes("--skip-quiz");

if (!previewURL) {
  throw new Error("Defina PREVIEW_URL com o link compartilhavel do preview Vercel.");
}

const root = process.cwd();
const outputDirectory = path.join(root, "artifacts", "final-v2", "after");
const screenshotDirectory = path.join(outputDirectory, "screenshots");
const videoDirectory = path.join(outputDirectory, "videos");
const temporaryVideoDirectory = path.join(root, ".tmp", "final-v2-videos");
const origin = new globalThis.URL(previewURL).origin;

await Promise.all([
  fs.mkdir(screenshotDirectory, { recursive: true }),
  fs.mkdir(videoDirectory, { recursive: true }),
  fs.mkdir(temporaryVideoDirectory, { recursive: true }),
]);

const browser = await chromium.launch({ channel: "chrome" });
const runtime = {
  previewOrigin: origin,
  capturedAt: new Date().toISOString(),
  viewports: [],
  consoleErrors: [],
  requestFailures: [],
  pageErrors: [],
  checkouts: [],
};

const sectionSelectors = [
  "#inicio",
  "#liberdade",
  "#celuclin",
  "#composicao",
  "#rotina",
  "#resultados",
  "#ofertas",
  "#rotulo",
  "#faq",
  "#belvitale",
];

const quizOptions = [
  "begin-small",
  "perfect-start",
  "make-it-smaller",
  "direct-to-essential",
  "light-enough-to-return",
];

function outputPath(directory, name) {
  return path.join(directory, name);
}

function observePage(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") {
      runtime.consoleErrors.push({ label, text: message.text() });
    }
  });
  page.on("pageerror", (error) => {
    runtime.pageErrors.push({ label, text: error.message });
  });
  page.on("requestfailed", (request) => {
    const error = request.failure()?.errorText ?? "unknown";
    if (error === "net::ERR_ABORTED") return;
    runtime.requestFailures.push({
      label,
      url: request.url(),
      error,
    });
  });
}

async function openPreview(page, route = "/") {
  await page.goto(previewURL, { waitUntil: "domcontentloaded", timeout: 60_000 });
  if (route !== "/") {
    await page.goto(origin + route, { waitUntil: "domcontentloaded", timeout: 60_000 });
  }
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  await page.waitForTimeout(1_200);
}

async function activateSections(page) {
  for (const selector of sectionSelectors) {
    const section = page.locator(selector);
    if (await section.count()) {
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(180);
    }
  }
  await Promise.race([
    page.locator("img[loading='lazy']").evaluateAll(async (images) => {
      await Promise.all(images.map(async (image) => {
        try {
          await image.decode();
        } catch {
          // A auditoria de imagens registra qualquer falha depois da captura.
        }
      }));
    }),
    new Promise((resolve) => globalThis.setTimeout(resolve, 3_000)),
  ]);
  await page.evaluate(() => globalThis.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(500);
}

async function captureFullPage(width, height) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  observePage(page, `full-${width}x${height}`);
  await openPreview(page);
  await activateSections(page);
  await page.addStyleTag({
    content:
      "#conteudo-principal > section, .site-footer { content-visibility: visible !important; contain-intrinsic-size: none !important; }",
  });
  await page.waitForTimeout(350);

  const audit = await page.evaluate(() => {
    const images = [...globalThis.document.images];
    return {
      documentWidth: globalThis.document.documentElement.scrollWidth,
      viewportWidth: globalThis.document.documentElement.clientWidth,
      bodyFontSize: globalThis.getComputedStyle(globalThis.document.body).fontSize,
      brokenImages: images
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
      imageCount: images.length,
      mainCta: globalThis.document.querySelector(".campaign-hero .button--primary")?.textContent?.trim() ?? null,
      offersVisible: Boolean(globalThis.document.querySelector("#ofertas")),
    };
  });
  runtime.viewports.push({ width, height, ...audit });

  await page.screenshot({
    path: outputPath(screenshotDirectory, `home-${width}x${height}-full.png`),
    fullPage: true,
    animations: "disabled",
  });
  await context.close();
}

async function captureSectionScreenshots() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  observePage(page, "sections-390x844");
  await openPreview(page);

  await page.screenshot({
    path: outputPath(screenshotDirectory, "hero-390x844.png"),
    animations: "disabled",
  });

  const sections = [
    ["recognition", "#liberdade"],
    ["product", "#celuclin"],
    ["formula", "#composicao"],
    ["label", "#rotulo"],
    ["offers", "#ofertas"],
    ["closing", "#belvitale"],
  ];

  for (const [name, selector] of sections) {
    const section = page.locator(selector);
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(450);
    await section.screenshot({
      path: outputPath(screenshotDirectory, `${name}-390.png`),
      animations: "disabled",
    });
  }

  await page.locator("#resultados").scrollIntoViewIfNeeded();
  const categories = [
    ["cellulite", "#resultados-cellulite"],
    ["laxity", "#resultados-laxity"],
    ["localized-fat", "#resultados-localized-fat"],
  ];
  for (const [name, selector] of categories) {
    const section = page.locator(selector);
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(450);
    await section.screenshot({
      path: outputPath(screenshotDirectory, `results-${name}-390.png`),
      animations: "disabled",
    });
  }

  await page.locator("#rotulo").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Ampliar rótulo" }).click();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: outputPath(screenshotDirectory, "label-modal-390x844.png"),
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  await context.close();
}

async function completeQuiz(page, delay = 220) {
  for (const [index, option] of quizOptions.entries()) {
    await page.locator(`input[value="${option}"]`).locator("..").click();
    await page.waitForTimeout(delay);
    await page.getByRole("button", {
      name: index === quizOptions.length - 1 ? "Ver meu ritmo" : "Continuar",
    }).click();
    await page.waitForTimeout(delay + 80);
  }
}

async function captureQuizScreenshots() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  observePage(page, "quiz-screenshots");
  await openPreview(page, "/quiz");
  await page.screenshot({
    path: outputPath(screenshotDirectory, "quiz-start-390x844.png"),
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Começar" }).click();
  await completeQuiz(page);
  await page.waitForTimeout(700);
  await page.screenshot({
    path: outputPath(screenshotDirectory, "quiz-result-390x844.png"),
    animations: "disabled",
  });
  await context.close();
}

async function recordVideo(name, run, options = {}) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    recordVideo: {
      dir: temporaryVideoDirectory,
      size: { width: 390, height: 844 },
    },
    ...options,
  });
  const page = await context.newPage();
  observePage(page, `video-${name}`);
  const video = page.video();
  await run(page);
  await context.close();
  if (video) {
    await video.saveAs(outputPath(videoDirectory, name));
  }
}

async function recordHome() {
  await recordVideo("home-first-60-seconds.webm", async (page) => {
    await openPreview(page);
    const maximum = await page.evaluate(
      () => globalThis.document.documentElement.scrollHeight - globalThis.innerHeight,
    );
    for (let index = 0; index <= 70; index += 1) {
      await page.evaluate(
        (top) => globalThis.scrollTo({ top, behavior: "smooth" }),
        maximum * (index / 70),
      );
      await page.waitForTimeout(800);
    }
    await page.waitForTimeout(1_500);
  });
}

async function recordGalleries() {
  await recordVideo("galleries-autoplay-swipe-pause.webm", async (page) => {
    await openPreview(page);
    await page.locator("#resultados-cellulite").scrollIntoViewIfNeeded();
    await page.waitForTimeout(6_000);

    const media = page.locator("#resultados-cellulite .proof-gallery__stage");
    const box = await media.boundingBox();
    if (box) {
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.move(box.x + box.width * 0.78, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();
    }
    await page.waitForTimeout(2_000);
    await page.locator("#resultados-laxity").scrollIntoViewIfNeeded();
    await page.waitForTimeout(6_000);
    await page.locator("#resultados-localized-fat").scrollIntoViewIfNeeded();
    await page.waitForTimeout(6_000);
    await page.locator("#resultados-localized-fat .proof-gallery__controls button").last().focus();
    await page.waitForTimeout(2_500);
    await page.keyboard.press("Tab");
    await page.waitForTimeout(6_000);
  });
}

async function recordLabelAndOffers() {
  await recordVideo("label-modal-and-offers.webm", async (page) => {
    await openPreview(page);
    await page.locator("#rotulo").scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await page.getByRole("button", { name: "Ampliar rótulo" }).click();
    await page.waitForTimeout(1_000);
    await page.locator('.label-modal__tools button[aria-label="Ampliar rótulo"]').click();
    await page.waitForTimeout(900);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(700);
    await page.getByRole("link", { name: "Ver opções" }).first().click();
    await page.waitForTimeout(1_400);
  });
}

async function recordCheckouts() {
  const labels = ["Escolher 1 mês", "Escolher 3 meses", "Escolher 7 meses"];
  await recordVideo("checkout-links.webm", async (page) => {
    await openPreview(page);
    for (const label of labels) {
      await page.goto(origin + "/#ofertas", { waitUntil: "domcontentloaded" });
      await page.locator("#ofertas").scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);
      await page.getByRole("link", { name: label }).click();
      await page.waitForLoadState("domcontentloaded", { timeout: 60_000 });
      await page.waitForTimeout(4_500);
    }
  });
}

async function recordQuiz() {
  await recordVideo("quiz-complete.webm", async (page) => {
    await openPreview(page, "/quiz");
    await page.waitForTimeout(900);
    await page.getByRole("button", { name: "Começar" }).click();
    await completeQuiz(page, 500);
    await page.waitForTimeout(1_600);
    await page.evaluate(() => globalThis.scrollBy({ top: 480, behavior: "smooth" }));
    await page.waitForTimeout(1_500);
  });
}

async function auditCheckouts() {
  const expected = [
    {
      id: "one-month",
      url: "https://belvitale.pay.yampi.com.br/r/PWJOI4I112",
      product: "CeluClin 1 Mês (1 pote)",
    },
    {
      id: "three-months",
      url: "https://belvitale.pay.yampi.com.br/r/1E8NNCGJW9",
      product: "CeluClin 3 Meses (3 potes)",
    },
    {
      id: "seven-months",
      url: "https://belvitale.pay.yampi.com.br/r/41CHX4MGPX",
      product: "CeluClin 7 Meses (5 + 2 grátis)",
    },
  ];

  for (const item of expected) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    observePage(page, `checkout-${item.id}`);
    const response = await page.goto(item.url, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await page.waitForLoadState("networkidle", { timeout: 12_000 }).catch(() => undefined);
    await page.waitForTimeout(2_000);
    const details = await page.evaluate(() => {
      const bodyText = globalThis.document.body.innerText.replace(/\s+/g, " ").trim();
      const images = [...globalThis.document.images]
        .map((image) => ({
          src: image.currentSrc || image.src,
          width: image.naturalWidth,
          height: image.naturalHeight,
        }))
        .filter((image) => image.width > 0 && image.height > 0)
        .sort((a, b) => b.width * b.height - a.width * a.height);
      return { bodyText, images };
    });
    runtime.checkouts.push({
      id: item.id,
      initialURL: item.url,
      finalURL: page.url(),
      status: response?.status() ?? null,
      expectedProduct: item.product,
      productPresent: details.bodyText.includes(item.product),
      cartEmpty: /carrinho vazio|seu carrinho está vazio/i.test(details.bodyText),
      largestImage: details.images[0] ?? null,
    });
    await context.close();
  }
}

try {
  if (!skipStatic) {
    process.stdout.write("Capturando paginas completas...\n");
    await captureFullPage(390, 844);
    await captureFullPage(430, 932);
    await captureFullPage(1440, 900);
    process.stdout.write("Capturando secoes e quiz...\n");
    await captureSectionScreenshots();
    await captureQuizScreenshots();
  }
  if (!skipHome) {
    process.stdout.write("Gravando jornada da home...\n");
    await recordHome();
  }
  if (!skipGalleries) {
    process.stdout.write("Gravando galerias...\n");
    await recordGalleries();
  }
  if (!skipLabel) {
    process.stdout.write("Gravando rotulo e ofertas...\n");
    await recordLabelAndOffers();
  }
  if (!skipCheckouts) {
    process.stdout.write("Gravando checkouts...\n");
    await recordCheckouts();
  }
  if (!skipQuiz) {
    process.stdout.write("Gravando quiz...\n");
    await recordQuiz();
  }
  process.stdout.write("Auditando checkouts limpos...\n");
  await auditCheckouts();
} finally {
  await fs.writeFile(
    outputPath(outputDirectory, "remote-audit.json"),
    JSON.stringify(runtime, null, 2) + "\n",
    "utf8",
  );
  await browser.close();
}

process.stdout.write(`Evidencias finais salvas em ${outputDirectory}.\n`);
