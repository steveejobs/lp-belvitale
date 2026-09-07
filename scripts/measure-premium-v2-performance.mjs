/* global PerformanceObserver, performance, document, KeyframeEffect, console */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = "http://127.0.0.1:4173";
const output = path.resolve("artifacts/premium-cro-v2-final/performance.json");
const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of [{ width: 390, height: 844 }, { width: 430, height: 932 }, { width: 1440, height: 900 }]) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await page.addInitScript(() => {
    globalThis.__v2Vitals = { lcp: 0, cls: 0, longTasks: [], events: [] };
    new PerformanceObserver((list) => { for (const entry of list.getEntries()) globalThis.__v2Vitals.lcp = entry.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) globalThis.__v2Vitals.cls += entry.value; }).observe({ type: "layout-shift", buffered: true });
    try { new PerformanceObserver((list) => { for (const entry of list.getEntries()) globalThis.__v2Vitals.longTasks.push(entry.duration); }).observe({ type: "longtask", buffered: true }); } catch { /* unsupported */ }
    try { new PerformanceObserver((list) => { for (const entry of list.getEntries()) globalThis.__v2Vitals.events.push({ name: entry.name, duration: entry.duration, interactionId: entry.interactionId }); }).observe({ type: "event", buffered: true, durationThreshold: 0 }); } catch { /* unsupported */ }
  });

  await page.goto(`${baseUrl}/quiz`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: /agora|meu caminho/i }).click();
  await page.getByRole("button", { name: /Prefiro continuar/ }).click();
  await page.locator(".q7-choice").first().click();
  await page.waitForTimeout(800);
  const data = await page.evaluate(() => {
    const resources = performance.getEntriesByType("resource");
    const nav = performance.getEntriesByType("navigation")[0];
    const eventDurations = globalThis.__v2Vitals.events.filter((entry) => entry.interactionId > 0).map((entry) => entry.duration);
    const layoutAnimationProperties = [...new Set(document.getAnimations().flatMap((animation) => {
      const effect = animation.effect;
      if (!(effect instanceof KeyframeEffect)) return [];
      return effect.getKeyframes().flatMap((frame) => Object.keys(frame)).filter((name) => ["width", "height", "top", "left", "right", "bottom", "margin", "padding"].includes(name));
    }))];
    return {
      lcpMs: globalThis.__v2Vitals.lcp,
      cls: globalThis.__v2Vitals.cls,
      interactionLatencyProxyMs: eventDurations.length ? Math.max(...eventDurations) : null,
      longTaskCount: globalThis.__v2Vitals.longTasks.length,
      maxLongTaskMs: globalThis.__v2Vitals.longTasks.length ? Math.max(...globalThis.__v2Vitals.longTasks) : 0,
      transferBytes: (nav?.transferSize ?? 0) + resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
      decodedBytes: (nav?.decodedBodySize ?? 0) + resources.reduce((sum, entry) => sum + (entry.decodedBodySize || 0), 0),
      blockingJsMs: resources.filter((entry) => entry.initiatorType === "script").reduce((sum, entry) => sum + entry.duration, 0),
      layoutAnimationProperties,
      resourceCount: resources.length,
    };
  });

  const reduced = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(`${baseUrl}/quiz`, { waitUntil: "networkidle" });
  await reducedPage.waitForTimeout(300);
  data.reducedMotionRunningAnimations = await reducedPage.evaluate(() => document.getAnimations().filter((animation) => animation.playState === "running").length);
  await reduced.close();
  results.push({ viewport, ...data });
  await context.close();
}

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), note: "INP is a field metric; interactionLatencyProxyMs is trusted-event lab Event Timing, not field INP.", results }, null, 2)}\n`, "utf8");
await browser.close();
console.log(JSON.stringify({ output, results }, null, 2));
