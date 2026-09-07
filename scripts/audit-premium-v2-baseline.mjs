/* global PerformanceObserver, localStorage, document, getComputedStyle, innerWidth, KeyframeEffect, Element, performance, fetch */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

const baseUrl = "http://127.0.0.1:4173";
const output = path.resolve(process.env.PREMIUM_AUDIT_DIR ?? "artifacts/premium-cro-v2-baseline");
const auditLabel = process.env.PREMIUM_AUDIT_LABEL ?? "post-78";
await mkdir(output, { recursive: true });

const answers = {
  perception: "outfit",
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

const stageAnswers = {
  perception: Object.fromEntries(Object.entries(answers).slice(0, 1)),
  "insight-one": Object.fromEntries(Object.entries(answers).slice(0, 3)),
  "insight-two": Object.fromEntries(Object.entries(answers).slice(0, 7)),
  "insight-three": answers,
  result: answers,
  offer: answers,
};

function session(stageId, selectedOfferId) {
  const now = new Date();
  return {
    version: "7.0.0",
    sessionId: `premium-baseline-${stageId}-${selectedOfferId ?? "default"}`,
    stageId,
    visitedStageIds: ["opening", stageId],
    answers: stageAnswers[stageId] ?? {},
    firstName: "Marina",
    nameProvided: true,
    ...(selectedOfferId ? { selectedOfferId } : {}),
    ...(stageId === "result" || stageId === "offer" ? { completedAt: now.toISOString() } : {}),
    savedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 86_400_000).toISOString(),
  };
}

const browser = await chromium.launch({ headless: true });
const report = {
  generatedAt: new Date().toISOString(),
  baseline: auditLabel,
  states: [],
  motion: [],
  vitals: [],
  assertions: [],
  errors: [],
};

async function instrument(context) {
  await context.addInitScript(() => {
    globalThis.__premiumAudit = { lcp: 0, cls: 0, longTasks: [], events: [] };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) globalThis.__premiumAudit.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) globalThis.__premiumAudit.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) globalThis.__premiumAudit.longTasks.push({ start: entry.startTime, duration: entry.duration });
      }).observe({ type: "longtask", buffered: true });
    } catch { /* unsupported */ }
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          globalThis.__premiumAudit.events.push({ name: entry.name, duration: entry.duration, interactionId: entry.interactionId });
        }
      }).observe({ type: "event", buffered: true, durationThreshold: 0 });
    } catch { /* unsupported */ }
  });
}

function wireErrors(page, name) {
  page.on("console", (message) => { if (message.type() === "error") report.errors.push({ name, type: "console", text: message.text() }); });
  page.on("pageerror", (error) => report.errors.push({ name, type: "pageerror", text: error.message }));
  page.on("requestfailed", (request) => report.errors.push({ name, type: "request", text: `${request.url()} ${request.failure()?.errorText ?? ""}` }));
}

async function openStage(page, stageId, selectedOfferId) {
  await page.goto(`${baseUrl}/brand/belvitale-wordmark-editorial.webp`, { waitUntil: "load" });
  if (stageId !== "opening") {
    await page.evaluate((value) => localStorage.setItem("belvitale.quiz.v7", JSON.stringify(value)), session(stageId, selectedOfferId));
  } else {
    await page.evaluate(() => localStorage.removeItem("belvitale.quiz.v7"));
  }
  await page.goto(`${baseUrl}/quiz`, { waitUntil: "domcontentloaded" });
  await page.locator(`[data-current-stage="${stageId}"]`).waitFor();
}

async function collectState(page, name, viewport) {
  const metrics = await page.evaluate(() => {
    const root = document.documentElement;
    const controls = [...document.querySelectorAll("button:enabled, a[href]")]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { label: element.textContent?.trim().slice(0, 80), width: rect.width, height: rect.height };
      })
      .filter((item) => item.width > 0 && item.height > 0);
    const images = [...document.querySelectorAll("img")].map((image) => ({
      src: image.getAttribute("src"),
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      objectFit: getComputedStyle(image).objectFit,
      loading: image.loading,
    }));
    return {
      stage: document.querySelector("[data-current-stage]")?.getAttribute("data-current-stage"),
      scrollWidth: root.scrollWidth,
      viewportWidth: innerWidth,
      scrollHeight: root.scrollHeight,
      headings: [...document.querySelectorAll("h1,h2")].map((item) => item.textContent?.trim()),
      controlCount: controls.length,
      smallControls: controls.filter((item) => item.width < 44 || item.height < 44),
      brokenImages: images.filter((item) => item.complete && item.naturalWidth === 0),
      images,
      bodyText: document.body.innerText,
    };
  });
  const file = path.join(output, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  report.states.push({ name, viewport, file, ...metrics });
}

async function captureViewport(viewport) {
  const suffix = `${viewport.width}x${viewport.height}`;
  const context = await browser.newContext({ viewport, recordVideo: { dir: output, size: viewport } });
  await instrument(context);
  const page = await context.newPage();
  wireErrors(page, suffix);

  await openStage(page, "opening");
  await page.waitForTimeout(50);
  await page.screenshot({ path: path.join(output, `opening-first-${suffix}.png`) });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(output, `opening-mid-${suffix}.png`) });
  await page.waitForTimeout(450);
  await collectState(page, `opening-final-${suffix}`, viewport);

  const openingMotion = await page.evaluate(() => document.getAnimations().map((animation) => {
    const effect = animation.effect;
    const target = effect instanceof KeyframeEffect ? effect.target : null;
    const timing = effect?.getComputedTiming();
    return {
      target: target instanceof Element ? `${target.tagName.toLowerCase()}.${target.className}` : null,
      animationName: target instanceof Element ? getComputedStyle(target).animationName : null,
      duration: timing?.duration,
      delay: timing?.delay,
      easing: effect?.getTiming().easing,
      playState: animation.playState,
    };
  }));
  report.motion.push({ viewport, stage: "opening", animations: openingMotion });

  const resources = await page.evaluate(() => {
    const entries = performance.getEntriesByType("resource");
    const nav = performance.getEntriesByType("navigation")[0];
    return {
      transferBytes: entries.reduce((sum, entry) => sum + (entry.transferSize || 0), nav?.transferSize || 0),
      decodedBytes: entries.reduce((sum, entry) => sum + (entry.decodedBodySize || 0), nav?.decodedBodySize || 0),
      resources: entries.map((entry) => ({ name: entry.name, initiatorType: entry.initiatorType, transferSize: entry.transferSize, duration: entry.duration })),
      audit: globalThis.__premiumAudit,
    };
  });
  report.vitals.push({ viewport, stage: "opening", ...resources });

  await openStage(page, "perception");
  await page.waitForTimeout(700);
  await collectState(page, `question-idle-${suffix}`, viewport);
  const before = Date.now();
  await page.locator(".q7-choice").first().click();
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(output, `question-selected-${suffix}.png`), fullPage: true });
  await page.locator('[data-current-stage="first-thought"]').waitFor({ timeout: 2_000 });
  report.assertions.push({ viewport, assertion: "auto-advance", measuredMs: Date.now() - before, passed: true });

  for (const stageId of ["insight-one", "insight-two", "insight-three", "result", "offer"]) {
    await openStage(page, stageId);
    await page.waitForTimeout(900);
    await collectState(page, `${stageId}-${suffix}`, viewport);
    const animations = await page.evaluate(() => document.getAnimations().map((animation) => {
      const effect = animation.effect;
      const target = effect instanceof KeyframeEffect ? effect.target : null;
      const timing = effect?.getComputedTiming();
      return {
        target: target instanceof Element ? `${target.tagName.toLowerCase()}.${target.className}` : null,
        animationName: target instanceof Element ? getComputedStyle(target).animationName : null,
        duration: timing?.duration,
        delay: timing?.delay,
        easing: effect?.getTiming().easing,
        playState: animation.playState,
      };
    }));
    report.motion.push({ viewport, stage: stageId, animations });

    if (stageId === "insight-three") {
      await page.locator(".q7-primary").click();
      await page.waitForTimeout(100);
      await page.screenshot({ path: path.join(output, `analysis-${suffix}.png`), fullPage: true });
      const analysisStarted = Date.now();
      await page.locator('[data-current-stage="result"]').waitFor({ timeout: 3_000 });
      report.assertions.push({ viewport, assertion: "analysis-transition", measuredMs: Date.now() - analysisStarted + 100, passed: true });
    }
    if (stageId === "result") {
      const proofRail = page.locator(".q7-result-proof__mosaic");
      await proofRail.scrollIntoViewIfNeeded();
      const initialCount = await proofRail.locator("figure").count();
      const scrollBefore = await proofRail.evaluate((element) => element.scrollLeft);
      await proofRail.evaluate((element) => { element.scrollLeft += element.clientWidth * 0.8; });
      const scrollAfter = await proofRail.evaluate((element) => element.scrollLeft);
      const toggle = page.locator(".q7-result-proof__toggle");
      await toggle.click();
      const expandedCount = await proofRail.locator("figure").count();
      report.assertions.push({ viewport, assertion: "progressive-proof", initialCount, expandedCount, scrollBefore, scrollAfter, passed: initialCount === 3 && expandedCount >= initialCount });
    }
  }

  await openStage(page, "offer", "three-months");
  const offerButtons = page.locator(".q7-comparison__card");
  const buttonCount = await offerButtons.count();
  const trustText = await page.locator(".q7-offer-trust").textContent().catch(() => null);
  report.assertions.push({ viewport, assertion: "offer-baseline", buttonCount, kit210Hidden: buttonCount === 2, trustBlockPresent: Boolean(trustText), trustText });
  if (buttonCount >= 2) {
    await offerButtons.first().click();
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(output, `offer-override-30d-${suffix}.png`), fullPage: true });
  }

  const metaPlacement = await page.evaluate(async () => {
    const html = await fetch("/").then((response) => response.text());
    return { inHead: html.indexOf("<noscript>") < html.indexOf("<body"), inBody: html.indexOf("<noscript>") > html.indexOf("<body") };
  });
  report.assertions.push({ viewport, assertion: "meta-noscript-placement", ...metaPlacement });
  await context.close();
}

for (const viewport of [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 1440, height: 900 },
]) await captureViewport(viewport);

await writeFile(path.join(output, "baseline-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await browser.close();
process.stdout.write(`${JSON.stringify({
  states: report.states.length,
  motionSamples: report.motion.length,
  assertions: report.assertions,
  errors: report.errors,
  output,
}, null, 2)}\n`);
