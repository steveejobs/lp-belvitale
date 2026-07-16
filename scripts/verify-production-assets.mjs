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

const proofFiles = [
  "proof/cellulite/cellulite-01.webp",
  "proof/cellulite/cellulite-02.webp",
  "proof/cellulite/cellulite-03.webp",
  "proof/cellulite/cellulite-04.webp",
  "proof/laxity/laxity-01.webp",
  "proof/laxity/laxity-02.webp",
  "proof/localized-fat/localized-fat-01.webp",
  "proof/localized-fat/localized-fat-02.webp",
  "proof/localized-fat/localized-fat-03.webp",
];

const homeMediaFiles = [
  "product/celuclin-front-01.webp",
  "product/celuclin-front-02.webp",
  "product/celuclin-front-02-640.webp",
  "product/celuclin-front-02-640.avif",
  "product/celuclin-angle.webp",
  "product/celuclin-hand.webp",
  "product/celuclin-capsules.webp",
  "lifestyle/celuclin-hero.webp",
  "lifestyle/freedom-01.webp",
  "lifestyle/routine-01.webp",
  "brand/belvitale-wordmark-dark.webp",
  "brand/belvitale-wordmark-light.webp",
  "brand/belvitale-monogram-light.webp",
];

for (const relativeFile of [
  "index.html",
  "quiz/index.html",
  "quiz/resultado/index.html",
  "label/celuclin-label-front.webp",
  "label/celuclin-label-complete.pdf",
  ...homeMediaFiles,
  ...proofFiles,
]) {
  assert.equal(
    await exists(path.join(dist, relativeFile)),
    true,
    "arquivo obrigatório ausente: " + relativeFile,
  );
}

for (const forbiddenTarget of [
  "sitemap.xml",
  "checkout",
  "label/celuclin-label-front-hero.webp",
]) {
  assert.equal(
    await exists(path.join(dist, forbiddenTarget)),
    false,
    "asset ou artefato bloqueado presente: dist/" + forbiddenTarget,
  );
}

const assetsDirectory = path.join(dist, "assets");
const bundledFiles = await fs.readdir(assetsDirectory);
const codeFiles = bundledFiles.filter((file) => /\.(?:js|css)$/.test(file));
const bundleText = (
  await Promise.all(
    codeFiles.map((file) => fs.readFile(path.join(assetsDirectory, file), "utf8")),
  )
).join("\n");

for (const forbiddenReference of [
  "celuclin-label-front-hero",
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
  "A celulite não precisa",
  "decidir o que você veste",
  "Celulite não mede peso",
  "CeluClin, visto por inteiro",
  "Resultados organizados",
  "Resultados reais autorizados",
  "Confira o rótulo original",
  "Dois por dia",
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
assert.equal(mainHtml.includes("A celulite não precisa"), true);
assert.equal(mainHtml.includes("Fibra da casca da maçã"), true);
assert.equal(mainHtml.includes("Histórias que a pele conta"), true);
assert.equal(mainHtml.includes("Resultados reais autorizados"), true);
assert.equal(mainHtml.includes("pay.yampi.com.br"), false);
assert.equal(mainHtml.includes("example.test"), false);
assert.equal(mainHtml.includes('rel="canonical"'), false);
assert.equal(mainHtml.includes('property="og:url"'), false);
assert.equal(mainHtml.includes('"@type":"Product"'), false);
assert.equal(mainHtml.includes('href="/quiz"'), false);

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
  assert.equal(quizHtml.includes('name="robots" content="noindex, nofollow"'), true);
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
  assert.ok(size <= 225_000, "JS inicial acima de 225 kB: " + String(size));
}
if (mainStyle !== undefined) {
  const size = (await fs.stat(path.join(assetsDirectory, mainStyle))).size;
  assert.ok(size <= 48_000, "CSS inicial acima de 48 kB: " + String(size));
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

  await page.goto("http://127.0.0.1:4180/", { waitUntil: "networkidle" });
  assert.equal(await page.locator(".site").getAttribute("data-regulatory-status"), "pending");
  assert.equal(await page.locator("#ofertas").count(), 0);
  assert.equal(await page.locator('a[href="/quiz"]').count(), 0);
  assert.equal(await page.locator('a[href*="pay.yampi.com.br"]').count(), 0);
  assert.equal(await page.locator('link[rel="canonical"]').count(), 0);
  assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "noindex, nofollow");
  assert.match(await page.locator("h1").innerText(), /A celulite não precisa/);
  assert.equal(
    await page.locator('.campaign-hero__visual[data-media-status="approved"]').count(),
    1,
  );
  const productViews = page.locator("#celuclin .product-story__views img");
  assert.equal(await productViews.count(), 2);
  assert.deepEqual(
    await productViews.evaluateAll((images) => images.map((image) => image.getAttribute("src"))),
    ["/product/celuclin-angle.webp", "/product/celuclin-front-01.webp"],
  );

  await page.locator("#rotulo").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const labelImages = page.locator('img[src="/label/celuclin-label-front.webp"]');
  assert.ok((await labelImages.count()) >= 1, "rótulo aprovado ausente da seção");
  for (const element of await labelImages.elementHandles()) {
    assert.equal(
      await element.evaluate((node) => node.closest("#rotulo") !== null),
      true,
      "rótulo plano apareceu fora da seção de transparência",
    );
  }

  await page.locator("#resultados").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  assert.ok((await page.locator("#resultados .proof-figure img").count()) <= 3);
  assert.equal(await page.getByRole("tab", { name: "Celulite", exact: true }).count(), 1);
  assert.equal(await page.getByRole("tab", { name: "Flacidez", exact: true }).count(), 1);
  assert.equal(await page.getByRole("tab", { name: "Gordura localizada", exact: true }).count(), 1);
  const proofDisclaimer = page.locator(".proof-stories__disclaimer strong");
  assert.equal(await proofDisclaimer.count(), 1);
  assert.equal(
    await proofDisclaimer.innerText(),
    "Resultados reais autorizados. Experiências individuais podem variar.",
  );

  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const requestedText = requested.join("\n");
  for (const publicMediaFolder of ["product", "lifestyle", "brand"]) {
    assert.match(
      requestedText,
      new RegExp("/" + publicMediaFolder + "/", "i"),
      "mídia autorizada não solicitada: " + publicMediaFolder,
    );
  }
  assert.equal(
    requestedText.match(/\/checkout\//i),
    null,
    "mídia comercial bloqueada solicitada pelo runtime",
  );

  for (const quizPath of ["/quiz/", "/quiz/resultado/"]) {
    await page.goto("http://127.0.0.1:4180" + quizPath, { waitUntil: "networkidle" });
    assert.equal(
      await page.getByRole("heading", { name: "O quiz ainda não está publicado." }).count(),
      1,
      "quiz exposto sem gate em " + quizPath,
    );
    assert.equal(await page.locator('input[type="radio"]').count(), 0);
    assert.equal(await page.locator('a[href*="pay.yampi.com.br"]').count(), 0);
    assert.equal(await page.locator('link[rel="canonical"]').count(), 0);
    assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "noindex, nofollow");
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
  "Release gate validado: produto, lifestyle, marca, rótulo e provas autorizadas publicados; checkout, canonical e quiz público permanecem bloqueados.\n",
);
