/* eslint-disable no-undef */
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseURL = process.env.HOME_AUDIT_URL ?? "http://127.0.0.1:5173";
const root = process.cwd();
const output = process.env.HOME_AUDIT_OUTPUT ?? path.join(root, "artifacts", "home-audit-before");
const browser = await chromium.launch();
const runtime = {
  capturedAt: new Date().toISOString(),
  url: baseURL,
  viewports: [],
  consoleErrors: [],
  pageErrors: [],
  requestFailures: [],
  links: [],
  sections: [],
  images: [],
  performance: null,
};

await fs.mkdir(output, { recursive: true });

function watch(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") runtime.consoleErrors.push({ label, text: message.text() });
  });
  page.on("pageerror", (error) => runtime.pageErrors.push({ label, text: error.message }));
  page.on("requestfailed", (request) => {
    const error = request.failure()?.errorText ?? "unknown";
    if (error !== "net::ERR_ABORTED") runtime.requestFailures.push({ label, url: request.url(), error });
  });
}

async function openPage(viewport, label, options = {}) {
  const context = await browser.newContext({
    viewport,
    reducedMotion: options.reducedMotion ?? "reduce",
    isMobile: viewport.width < 600,
    hasTouch: viewport.width < 600,
  });
  const page = await context.newPage();
  watch(page, label);
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  await page.waitForTimeout(900);
  return { context, page };
}

async function revealEverything(page) {
  await page.addStyleTag({
    content: "#conteudo-principal > section, .site-footer { content-visibility: visible !important; contain-intrinsic-size: none !important; }",
  });
  const sections = page.locator("#conteudo-principal > section, .site-footer");
  for (let index = 0; index < await sections.count(); index += 1) {
    await sections.nth(index).evaluate((element) => element.scrollIntoView({ block: "start", behavior: "instant" }));
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(250);
}

async function captureFullPage(width, height) {
  const { context, page } = await openPage({ width, height }, `full-${width}x${height}`);
  await revealEverything(page);
  const audit = await page.evaluate(() => {
    const mainSections = [...document.querySelectorAll("#conteudo-principal > section")].map((section) => ({
      id: section.id || null,
      className: section.className,
      heading: section.querySelector("h1,h2")?.textContent?.replace(/\s+/g, " ").trim() ?? null,
      height: Math.round(section.getBoundingClientRect().height),
    }));
    const images = [...document.images].map((image) => ({
      src: image.currentSrc || image.src,
      alt: image.alt,
      width: image.naturalWidth,
      height: image.naturalHeight,
      loading: image.loading,
      complete: image.complete,
    }));
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      bodyFontSize: getComputedStyle(document.body).fontSize,
      h1: document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim() ?? null,
      ctas: [...document.querySelectorAll("a,button")]
        .map((element) => element.textContent?.replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .slice(0, 80),
      links: [...document.querySelectorAll("a")].map((link) => ({ text: link.textContent?.replace(/\s+/g, " ").trim(), href: link.getAttribute("href") })),
      mainSections,
      images,
      brokenImages: images.filter((image) => image.complete && image.width === 0),
      performance: {
        lcp: null,
        cls: null,
        resourceCount: performance.getEntriesByType("resource").length,
        transferSize: performance.getEntriesByType("resource").reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
      },
    };
  });
  runtime.viewports.push({ width, height, ...audit });
  runtime.links.push(...audit.links);
  runtime.sections = audit.mainSections;
  runtime.images = audit.images;
  runtime.performance = audit.performance;
  await page.screenshot({ path: path.join(output, `home-${width}x${height}-full.png`), fullPage: true, animations: "disabled" });
  await context.close();
}

async function captureSections() {
  const { context, page } = await openPage({ width: 390, height: 844 }, "sections-390x844");
  const firstViewportNames = [
    ["first-viewport-mobile", null],
    ["header-mobile", ".site-header"],
    ["hero-mobile", "#inicio"],
  ];
  for (const [name, selector] of firstViewportNames) {
    if (selector) await page.locator(selector).evaluate((element) => element.scrollIntoView({ block: "start", behavior: "instant" }));
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(output, `${name}.png`), animations: "disabled" });
  }

  const targets = [
    ["brand", "#marca"],
    ["choice", "#liberdade"],
    ["education", ".skin-context"],
    ["quiz-bridge", "#descobrir"],
    ["product", "#celuclin"],
    ["proof", "#resultados"],
    ["formula", "#composicao"],
    ["routine", "#rotina"],
    ["offers", "#ofertas"],
    ["label", "#rotulo"],
    ["faq", "#faq"],
    ["closing", "#belvitale"],
    ["footer", ".site-footer"],
  ];
  for (const [name, selector] of targets) {
    const target = page.locator(selector).first();
    if (await target.count()) {
      await target.evaluate((element) => element.scrollIntoView({ block: "start", behavior: "instant" }));
      await page.waitForTimeout(350);
      await target.screenshot({ path: path.join(output, `${name}-390.png`), animations: "disabled" });
    }
  }

  await page.locator("#inicio").evaluate((element) => element.scrollIntoView({ block: "start", behavior: "instant" }));
  await page.locator(".site-header__mobile-actions button").click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(output, "mobile-menu-open-390.png"), animations: "disabled" });
  await page.keyboard.press("Escape");

  await page.locator("#inicio").evaluate((element) => element.scrollIntoView({ block: "start", behavior: "instant" }));
  await page.locator(".campaign-hero .button--primary").focus();
  await page.screenshot({ path: path.join(output, "hero-focus-390.png"), animations: "disabled" });
  await page.locator(".campaign-hero .button--primary").hover();
  await page.screenshot({ path: path.join(output, "hero-hover-390.png"), animations: "disabled" });
  await context.close();
}

async function captureDesktopStates() {
  const { context, page } = await openPage({ width: 1440, height: 900 }, "desktop-states");
  await page.screenshot({ path: path.join(output, "first-viewport-desktop.png"), animations: "disabled" });
  await page.locator(".site-header").screenshot({ path: path.join(output, "header-desktop.png"), animations: "disabled" });
  await page.locator("#inicio").screenshot({ path: path.join(output, "hero-desktop.png"), animations: "disabled" });
  await page.locator("#inicio").evaluate((element) => element.scrollIntoView({ block: "start", behavior: "instant" }));
  await page.locator(".campaign-hero .button--primary").focus();
  await page.screenshot({ path: path.join(output, "hero-focus-desktop.png"), animations: "disabled" });
  await page.locator(".campaign-hero .button--primary").hover();
  await page.screenshot({ path: path.join(output, "hero-hover-desktop.png"), animations: "disabled" });
  await context.close();
}

try {
  await captureFullPage(390, 844);
  await captureFullPage(430, 932);
  await captureFullPage(1440, 900);
  await captureFullPage(1920, 1080);
  await captureSections();
  await captureDesktopStates();
} finally {
  await fs.writeFile(path.join(output, "runtime-audit.json"), JSON.stringify(runtime, null, 2) + "\n", "utf8");
  await browser.close();
}

console.log(`Home audit screenshots saved to ${output}`);
