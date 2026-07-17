import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

const checkouts = [
  {
    plan: "30-days",
    url: "https://belvitale.pay.yampi.com.br/r/PWJOI4I112",
    expectedDuration: /1\s*m[eê]s|30\s*dias/i,
  },
  {
    plan: "90-days",
    url: "https://belvitale.pay.yampi.com.br/r/1E8NNCGJW9",
    expectedDuration: /3\s*m[eê]s|90\s*dias/i,
  },
  {
    plan: "210-days",
    url: "https://belvitale.pay.yampi.com.br/r/41CHX4MGPX",
    expectedDuration: /7\s*m[eê]s|210\s*dias/i,
  },
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];

try {
  for (const checkout of checkouts) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      locale: "pt-BR",
    });
    const page = await context.newPage();
    const response = await page.goto(checkout.url, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await page.waitForLoadState("networkidle", { timeout: 12_000 }).catch(() => undefined);
    await page.waitForTimeout(1_500);
    const pageState = await page.evaluate(() => ({
      title: globalThis.document.title,
      text: globalThis.document.body.innerText.replace(/\s+/g, " ").trim(),
    }));
    const status = response?.status() ?? null;
    results.push({
      plan: checkout.plan,
      expectedURL: checkout.url,
      finalOrigin: new globalThis.URL(page.url()).origin,
      httpStatus: status,
      title: pageState.title,
      celuClinPresent: /celuclin/i.test(pageState.text),
      durationPresent: checkout.expectedDuration.test(pageState.text),
      emptyCartMessage: /carrinho\s+(?:est[aá]\s+)?vazio/i.test(pageState.text),
      fivePlusTwoVisible: /5\s*\+\s*2\s*gr[aá]tis/i.test(pageState.text),
      reachable: status !== null && status >= 200 && status < 400,
    });
    await context.close();
  }
} finally {
  await browser.close();
}

const report = {
  auditedAt: new Date().toISOString(),
  scope: "Validação técnica de acesso e identificação; nenhuma compra foi realizada.",
  results,
};
const output = path.join(process.cwd(), "artifacts", "quiz-v3", "checkout-audit.json");
await fs.writeFile(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
