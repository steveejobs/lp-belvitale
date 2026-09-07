/* global localStorage, location, fetch, console */
import { chromium } from "@playwright/test";
import process from "node:process";
import { createServer } from "vite";

const root = process.cwd();
const baseUrl = "http://127.0.0.1:4173";
const vite = await createServer({ root, appType: "custom", server: { middlewareMode: true }, logLevel: "silent" });
const { quizQuestions } = await vite.ssrLoadModule("/src/features/quiz/content/questions.ts");
const { calculateQuizResult } = await vite.ssrLoadModule("/src/features/quiz/domain/quiz.scoring.ts");
const exemplars = {};
let cursor = 0;
const narrativeQuestions = quizQuestions.filter((question) => question.options.some((option) => option.narrative));
while (Object.keys(exemplars).length < 4 && cursor < 4 ** narrativeQuestions.length) {
  const answers = Object.fromEntries(quizQuestions.map((question) => {
    const narrativeIndex = narrativeQuestions.findIndex((candidate) => candidate.id === question.id);
    const optionIndex = narrativeIndex < 0 ? 0 : Math.floor(cursor / (4 ** narrativeIndex)) % question.options.length;
    return [question.id, question.options[optionIndex].id];
  }));
  const profile = calculateQuizResult(answers)?.id;
  if (profile && !exemplars[profile]) exemplars[profile] = answers;
  cursor += 1;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const renderedProfiles = [];
for (const [profile, answers] of Object.entries(exemplars)) {
  const now = new Date();
  const profileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const state = {
    version: "7.0.0", sessionId: `premium-profile-${profile}`, stageId: "result", visitedStageIds: ["opening", "result"], answers,
    firstName: "Marina", nameProvided: true, completedAt: now.toISOString(), savedAt: now.toISOString(), expiresAt: new Date(now.getTime() + 86_400_000).toISOString(),
  };
  await profileContext.addInitScript((value) => localStorage.setItem("belvitale.quiz.v7", JSON.stringify(value)), state);
  const profilePage = await profileContext.newPage();
  await profilePage.goto(`${baseUrl}/quiz`, { waitUntil: "domcontentloaded" });
  await profilePage.locator("#q7-result-title").waitFor({ timeout: 5_000 });
  renderedProfiles.push({ profile, title: (await profilePage.locator("#q7-result-title").textContent())?.trim() });
  await profileContext.close();
}

await page.goto(`${baseUrl}/quiz`, { waitUntil: "domcontentloaded" });
const now = new Date();
const offerAnswers = Object.fromEntries(quizQuestions.map((question) => [question.id, question.options[0].id]));
await page.evaluate((state) => { localStorage.setItem("belvitale.quiz.v7", JSON.stringify(state)); location.reload(); }, {
  version: "7.0.0", sessionId: "premium-offer-baseline", stageId: "offer", visitedStageIds: ["opening", "offer"], answers: offerAnswers,
  firstName: "Marina", nameProvided: true, completedAt: now.toISOString(), savedAt: now.toISOString(), expiresAt: new Date(now.getTime() + 86_400_000).toISOString(),
});
await page.waitForLoadState("networkidle");
const offerCards = await page.locator(".q7-comparison__card").evaluateAll((cards) => cards.map((card) => ({
  text: card.textContent?.trim(), selected: card.getAttribute("data-selected"), recommended: card.getAttribute("data-recommended"),
})));
const checkoutHref = await page.locator(".q7-offer-main .q7-checkout").getAttribute("href");
const trustBlock = (await page.locator(".q7-offer-trust").textContent())?.trim();
const response = await fetch(`${baseUrl}/`);
const html = await response.text();
const result = {
  renderedProfiles,
  offerCards,
  kit210Hidden: offerCards.length === 2 && !offerCards.some((card) => card.text?.includes("210")),
  trustBlockPresent: Boolean(trustBlock),
  checkoutHref,
  metaNoscriptAfterBodyOpen: html.indexOf("<noscript>") > html.indexOf("<body"),
  noUnprovedSavingsCopy: !/economize|economia|de\s+r\$/i.test(await page.locator(".q7-offer").innerText()),
};
console.log(JSON.stringify(result, null, 2));
await context.close();
await browser.close();
await vite.close();
