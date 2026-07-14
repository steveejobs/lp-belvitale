import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";
import { preview } from "vite";

const root = process.cwd();
const dist = path.join(root, "dist");

assert.notEqual(
  process.env.VITE_QUIZ_PUBLICATION_STATUS,
  "approved",
  "o gate sanitário pendente proíbe build aprovado do quiz",
);

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

for (const requiredFile of [
  path.join(dist, "index.html"),
  path.join(dist, "quiz", "index.html"),
  path.join(dist, "quiz", "resultado", "index.html"),
  path.join(dist, "label", "celuclin-label-front.webp"),
  path.join(dist, "label", "celuclin-label-front-hero.webp"),
  path.join(dist, "label", "celuclin-label-complete.pdf"),
]) {
  assert.equal(
    await exists(requiredFile),
    true,
    "arquivo obrigatório ausente: " + requiredFile,
  );
}

assert.equal(
  await exists(path.join(dist, "sitemap.xml")),
  false,
  "sitemap criado sem domínio e release aprovados",
);

for (const folder of ["proof", "product", "lifestyle", "brand"]) {
  assert.equal(
    await exists(path.join(dist, folder)),
    false,
    "mídia restrita publicada em dist/" + folder,
  );
}

const assetsDirectory = path.join(dist, "assets");
const bundledFiles = await fs.readdir(assetsDirectory);
const codeFiles = bundledFiles.filter((file) => /\.(?:js|css)$/.test(file));
const bundleText = (
  await Promise.all(
    codeFiles.map((file) =>
      fs.readFile(path.join(assetsDirectory, file), "utf8"),
    ),
  )
).join("\n");

for (const forbiddenReference of [
  "/proof/",
  "/product/",
  "/lifestyle/",
  "/brand/",
  "belvitale.pay.yampi.com.br",
  "commercial-ready",
  "fixture interna",
  "FAQPage",
  "example.test",
]) {
  assert.equal(
    bundleText.includes(forbiddenReference),
    false,
    "referência bloqueada presente no bundle: " + forbiddenReference,
  );
}

for (const requiredCopy of [
  "Vista o que você quiser.",
  "Sem negociar",
  "Celulite não é uma medida de peso",
  "Uma rotina. Não uma promessa de perfeição.",
  "Toque. Compare. Leia sem pressa.",
  "Duas cápsulas.",
  "O rótulo não é rodapé.",
  "Sua pele não precisa ser perfeita",
  "61.493.515/0001-65",
  "(63) 99108-1785",
]) {
  assert.equal(
    bundleText.includes(requiredCopy),
    true,
    "conteúdo crítico ausente do bundle: " + requiredCopy,
  );
}

const mainHtml = await fs.readFile(path.join(dist, "index.html"), "utf8");
assert.equal(mainHtml.includes("noindex, nofollow"), true);
assert.equal(mainHtml.includes("Vista o que você quiser."), true);
assert.equal(mainHtml.includes("Fibra da casca da maçã"), true);
assert.equal(mainHtml.includes("pay.yampi.com.br"), false);
assert.equal(mainHtml.includes("example.test"), false);
assert.equal(mainHtml.includes('rel="canonical"'), false);
assert.equal(mainHtml.includes('property="og:url"'), false);
assert.equal(mainHtml.includes('"@type":"Product"'), false);

for (const legalPath of [
  "/politica-de-privacidade",
  "/termos-de-uso",
  "/trocas-e-reembolso",
]) {
  assert.equal(
    mainHtml.includes('href="' + legalPath + '"'),
    false,
    "documento legal draft vinculado: " + legalPath,
  );
}

for (const quizHtmlPath of [
  path.join(dist, "quiz", "index.html"),
  path.join(dist, "quiz", "resultado", "index.html"),
]) {
  const quizHtml = await fs.readFile(quizHtmlPath, "utf8");
  assert.equal(
    quizHtml.includes('name="robots" content="noindex, nofollow"'),
    true,
    "robots incorreto em " + quizHtmlPath,
  );
  assert.equal(quizHtml.includes('rel="canonical"'), false);
  assert.equal(quizHtml.includes('property="og:url"'), false);
  assert.equal(quizHtml.includes("application/ld+json"), false);
  assert.equal(quizHtml.includes("pay.yampi.com.br"), false);
  assert.equal(quizHtml.includes("example.test"), false);
}

const mainScript = bundledFiles.find(
  (file) => file.startsWith("main-") && file.endsWith(".js"),
);
const mainStyle = bundledFiles.find(
  (file) => file.startsWith("main-") && file.endsWith(".css"),
);
assert.notEqual(mainScript, undefined, "chunk principal ausente");
assert.notEqual(mainStyle, undefined, "CSS principal ausente");
if (mainScript !== undefined) {
  const size = (await fs.stat(path.join(assetsDirectory, mainScript))).size;
  assert.ok(size <= 250_000, "JS inicial acima de 250 kB: " + String(size));
}
if (mainStyle !== undefined) {
  const size = (await fs.stat(path.join(assetsDirectory, mainStyle))).size;
  assert.ok(size <= 45_000, "CSS inicial acima de 45 kB: " + String(size));
}

const server = await preview({
  preview: { host: "127.0.0.1", port: 4180, strictPort: true },
});
const browser = await chromium.launch({ channel: "chrome" });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const runtimeProblems = [];
  const requested = [];
  page.on("console", (message) => {
    if (message.type() === "error") runtimeProblems.push(message.text());
  });
  page.on("pageerror", (error) => runtimeProblems.push(error.message));
  page.on("request", (request) => requested.push(request.url()));

  await page.goto("http://127.0.0.1:4180/", {
    waitUntil: "networkidle",
  });
  assert.equal(
    await page.locator(".site").getAttribute("data-regulatory-status"),
    "pending",
  );
  assert.equal(await page.locator("#kits").count(), 0);
  assert.equal(await page.locator(".proof-direction").count(), 0);
  assert.equal(await page.locator('a[href="/quiz"]').count(), 0);
  assert.equal(await page.locator('a[href*="pay.yampi.com.br"]').count(), 0);
  assert.equal(await page.locator('link[rel="canonical"]').count(), 0);
  assert.equal(
    await page.locator('meta[name="robots"]').getAttribute("content"),
    "noindex, nofollow",
  );
  assert.match(
    await page.locator("h1").innerText(),
    /Vista o que você quiser/,
  );
  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);

  assert.equal(
    requested.join("\n").match(/\/(?:proof|product|lifestyle|brand)\//i),
    null,
    "mídia restrita solicitada pelo runtime",
  );

  for (const quizPath of ["/quiz/", "/quiz/resultado/"]) {
    await page.goto("http://127.0.0.1:4180" + quizPath, {
      waitUntil: "networkidle",
    });
    assert.equal(
      await page
        .getByRole("heading", { name: "O quiz ainda não está publicado." })
        .count(),
      1,
      "quiz exposto sem gate em " + quizPath,
    );
    assert.equal(await page.locator('input[type="radio"]').count(), 0);
    assert.equal(await page.locator('a[href*="pay.yampi.com.br"]').count(), 0);
    assert.equal(await page.locator('link[rel="canonical"]').count(), 0);
    assert.equal(
      await page.locator('meta[name="robots"]').getAttribute("content"),
      "noindex, nofollow",
    );
  }

  assert.deepEqual(runtimeProblems, [], "erros no runtime de produção");
} finally {
  await browser.close();
  await new Promise((resolve, reject) => {
    server.httpServer.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

process.stdout.write(
  "Produção bloqueada validada: sem checkout, mídia restrita, canonical, indexação ou erro de runtime.\n",
);
