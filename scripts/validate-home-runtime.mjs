/* eslint-disable no-undef */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseURL = process.env.HOME_AUDIT_URL ?? "http://127.0.0.1:4173";
const output = path.resolve("artifacts", "home-audit-after", "performance.json");
const browser = await chromium.launch();
const result = {
  generatedAt: new Date().toISOString(),
  baseURL,
  note: "interactionLatencyProxyMs is lab Event Timing; it is not field INP.",
  viewports: [],
  routeChecks: {},
};

for (const viewport of [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 1440, height: 900 },
]) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  const failures = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => failures.push({ url: request.url(), error: request.failure()?.errorText ?? "unknown" }));
  await page.addInitScript(() => {
    globalThis.__homeEvents = [];
    addEventListener("belvitale:home", (event) => globalThis.__homeEvents.push(event.detail.event));
    globalThis.__homeVitals = { lcp: 0, cls: 0, longTasks: [], events: [] };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) globalThis.__homeVitals.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) globalThis.__homeVitals.cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) globalThis.__homeVitals.longTasks.push(entry.duration);
      }).observe({ type: "longtask", buffered: true });
    } catch { /* Event Timing pode não existir no browser de teste. */ }
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) globalThis.__homeVitals.events.push({ duration: entry.duration, interactionId: entry.interactionId });
      }).observe({ type: "event", buffered: true, durationThreshold: 0 });
    } catch { /* Event Timing pode não existir no browser de teste. */ }
  });
  await page.goto(`${baseURL}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.locator("#celuclin").evaluate((element) => element.scrollIntoView({ behavior: "instant", block: "start" }));
  await page.getByRole("tab", { name: "De frente" }).click();
  await page.locator("#faq").evaluate((element) => element.scrollIntoView({ behavior: "instant", block: "start" }));
  await page.getByRole("button", { name: /O que é o CeluClin/ }).click();
  const data = await page.evaluate(({ runtimeErrors, runtimeFailures }) => {
    const resources = performance.getEntriesByType("resource");
    const navigation = performance.getEntriesByType("navigation")[0];
    const eventDurations = globalThis.__homeVitals.events
      .filter((entry) => entry.interactionId > 0)
      .map((entry) => entry.duration);
    return {
      lcpMs: globalThis.__homeVitals.lcp,
      cls: globalThis.__homeVitals.cls,
      interactionLatencyProxyMs: eventDurations.length ? Math.max(...eventDurations) : null,
      longTaskCount: globalThis.__homeVitals.longTasks.length,
      maxLongTaskMs: globalThis.__homeVitals.longTasks.length ? Math.max(...globalThis.__homeVitals.longTasks) : 0,
      transferBytes: (navigation?.transferSize ?? 0) + resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
      resourceCount: resources.length,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      errors: runtimeErrors,
      requestFailures: runtimeFailures,
      homeEvents: [...new Set(globalThis.__homeEvents)],
    };
  }, { runtimeErrors: errors, runtimeFailures: failures });
  result.viewports.push({ viewport, ...data });
  await context.close();
}

const routeContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const routePage = await routeContext.newPage();
const routeErrors = [];
routePage.on("console", (message) => {
  if (message.type() === "error") routeErrors.push(message.text());
});
routePage.on("pageerror", (error) => routeErrors.push(error.message));
const quizResponse = await routePage.goto(`${baseURL}/quiz`, { waitUntil: "networkidle" });
result.routeChecks.quiz = {
  status: quizResponse?.status() ?? null,
  headingVisible: await routePage.getByRole("heading").first().isVisible().catch(() => false),
  errors: routeErrors,
};
await routeContext.close();

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`, "utf8");
await browser.close();
console.log(JSON.stringify(result, null, 2));
