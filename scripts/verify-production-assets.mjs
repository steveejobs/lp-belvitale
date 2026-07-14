import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";
import { preview } from "vite";

const root = process.cwd();
const dist = path.join(root, "dist");
const publicationApproved =
  process.env.VITE_QUIZ_PUBLICATION_STATUS === "approved";
const canonicalValue = process.env.VITE_CANONICAL_URL;
let canonicalQuizUrl = null;

if (publicationApproved) {
  assert.equal(
    typeof canonicalValue,
    "string",
    "canonical ausente no verificador do build aprovado",
  );
  canonicalQuizUrl = new globalThis.URL("/quiz", canonicalValue).toString();
}

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
  path.join(dist, "label", "celuclin-label-complete.pdf"),
]) {
  assert.equal(await exists(requiredFile), true, `arquivo ausente: ${requiredFile}`);
}

const sitemapPath = path.join(dist, "sitemap.xml");
assert.equal(
  await exists(sitemapPath),
  publicationApproved,
  publicationApproved
    ? "sitemap ausente no build aprovado"
    : "sitemap criado sem aprovação do quiz",
);
if (publicationApproved) {
  const sitemap = await fs.readFile(sitemapPath, "utf8");
  assert.equal(sitemap.includes(`<loc>${canonicalQuizUrl}</loc>`), true);
  assert.equal(
    sitemap.includes("/quiz/resultado"),
    false,
    "resultado individual incluído no sitemap",
  );
}

for (const folder of ["proof", "product", "lifestyle", "brand"]) {
  assert.equal(
    await exists(path.join(dist, folder)),
    false,
    `mídia não verificada publicada em dist/${folder}`,
  );
}

const assetsDirectory = path.join(dist, "assets");
const bundledFiles = await fs.readdir(assetsDirectory);
const bundleText = (
  await Promise.all(
    bundledFiles
      .filter((file) => /\.(?:js|css)$/.test(file))
      .map((file) => fs.readFile(path.join(assetsDirectory, file), "utf8")),
  )
).join("\n");

for (const forbiddenReference of [
  "/proof/",
  "/product/",
  "Histórias que merecem ser vistas com contexto",
  "checkout-assets",
  "FAQPage",
]) {
  assert.equal(
    bundleText.includes(forbiddenReference),
    false,
    `referência bloqueada presente no bundle: ${forbiddenReference}`,
  );
}

for (const requiredCopy of [
  "Cuidado que começa com informação clara.",
  "Informação clara antes de qualquer escolha.",
  "Uma orientação simples, exatamente como informada na embalagem.",
  "Dúvidas comuns, respostas sem rodeios.",
  "Uma marca construída para tornar o autocuidado mais claro.",
  "61.493.515/0001-65",
  "(63) 99108-1785",
]) {
  assert.equal(
    bundleText.includes(requiredCopy),
    true,
    `conteúdo institucional ausente do bundle: ${requiredCopy}`,
  );
}

const productionHtml = await fs.readFile(path.join(dist, "index.html"), "utf8");
assert.equal(
  productionHtml.includes("pay.yampi.com.br"),
  false,
  "checkout exposto no HTML de produção",
);
assert.equal(
  productionHtml.includes('"@type":"Product"'),
  false,
  "schema Product publicado",
);
for (const legalPath of [
  "/politica-de-privacidade",
  "/termos-de-uso",
  "/trocas-e-reembolso",
]) {
  assert.equal(
    productionHtml.includes(`href="${legalPath}"`),
    false,
    `documento legal draft vinculado publicamente: ${legalPath}`,
  );
}

for (const [quizHtmlPath, isResult] of [
  [path.join(dist, "quiz", "index.html"), false],
  [path.join(dist, "quiz", "resultado", "index.html"), true],
]) {
  const quizHtml = await fs.readFile(quizHtmlPath, "utf8");
  const expectedRobots = publicationApproved
    ? isResult
      ? "noindex, follow"
      : "index, follow"
    : "noindex, nofollow";

  assert.equal(
    quizHtml.includes(`name="robots" content="${expectedRobots}"`),
    true,
    `robots incorreto em ${quizHtmlPath}`,
  );
  assert.equal(
    quizHtml.includes('rel="canonical"'),
    publicationApproved,
    `canonical incompatível com o status em ${quizHtmlPath}`,
  );
  if (publicationApproved) {
    assert.equal(
      quizHtml.includes(`href="${canonicalQuizUrl}"`),
      true,
      `canonical incorreto em ${quizHtmlPath}`,
    );
  }
  assert.equal(
    quizHtml.includes("application/ld+json"),
    false,
    `schema publicado no quiz: ${quizHtmlPath}`,
  );
  assert.equal(
    quizHtml.includes("pay.yampi.com.br"),
    false,
    `checkout publicado no quiz: ${quizHtmlPath}`,
  );
  assert.equal(
    /R\$\s*\d|preço\s*(?:total|por)/i.test(quizHtml),
    false,
    `preço publicado no quiz: ${quizHtmlPath}`,
  );
}

const previewServer = await preview({
  preview: { host: "127.0.0.1", port: 4180, strictPort: true },
});
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const runtimeProblems = [];
  page.on("console", (message) => {
    if (message.type() === "error") runtimeProblems.push(message.text());
  });
  page.on("pageerror", (error) => runtimeProblems.push(error.message));

  await page.goto("http://127.0.0.1:4180", { waitUntil: "networkidle" });
  assert.equal(await page.locator("#kits").count(), 0, "kits incompletos publicados");
  assert.equal(
    await page.locator('a[href*="pay.yampi.com.br"]').count(),
    0,
    "CTA Yampi publicado",
  );
  assert.equal(
    await page.locator('img[src*="yampi"]').count(),
    0,
    "miniatura Yampi publicada",
  );
  assert.equal(
    await page.locator('a[href="/quiz"]').count(),
    publicationApproved ? 1 : 0,
    "CTA da homepage incompatível com o status",
  );

  for (const quizPath of ["/quiz/", "/quiz/resultado/"]) {
    await page.goto(`http://127.0.0.1:4180${quizPath}`, {
      waitUntil: "networkidle",
    });

    if (publicationApproved) {
      assert.equal(
        await page.locator(".quiz-unavailable:not(.quiz-invalid-result)").count(),
        0,
        `quiz aprovado indisponível: ${quizPath}`,
      );
      const expectedState = quizPath.includes("resultado")
        ? ".quiz-invalid-result"
        : ".quiz-start";
      assert.equal(
        await page.locator(expectedState).count(),
        1,
        `estado público incorreto: ${quizPath}`,
      );
    } else {
      assert.equal(
        await page.locator(".quiz-unavailable:not(.quiz-invalid-result)").count(),
        1,
        `quiz exposto sem aprovação: ${quizPath}`,
      );
      assert.equal(
        await page.locator('input[type="radio"]').count(),
        0,
        `perguntas expostas sem aprovação: ${quizPath}`,
      );
    }

    assert.equal(
      await page.locator('a[href*="pay.yampi.com.br"]').count(),
      0,
      `checkout exposto no quiz: ${quizPath}`,
    );
    const expectedRobots = publicationApproved
      ? quizPath.includes("resultado")
        ? "noindex, follow"
        : "index, follow"
      : "noindex, nofollow";
    assert.equal(
      await page.locator('meta[name="robots"]').getAttribute("content"),
      expectedRobots,
      `robots incorreto no runtime: ${quizPath}`,
    );
    assert.equal(
      await page.locator('link[rel="canonical"]').count(),
      publicationApproved ? 1 : 0,
      `canonical incompatível no runtime: ${quizPath}`,
    );
    assert.equal(
      /R\$\s*\d|preço\s*(?:total|por)/i.test(await page.locator("body").innerText()),
      false,
      `preço exposto no runtime: ${quizPath}`,
    );
  }

  if (publicationApproved) {
    const nonGetRequests = [];
    page.on("request", (request) => {
      if (request.method() !== "GET") nonGetRequests.push(request.url());
    });
    await page.goto("http://127.0.0.1:4180/quiz/", {
      waitUntil: "networkidle",
    });
    await page.getByRole("button", { name: "Começar o quiz" }).click();
    await page.getByRole("radio").first().check();
    await page.getByRole("button", { name: "Continuar" }).click();
    assert.deepEqual(nonGetRequests, [], "respostas enviadas pela rede");

    const storedDocument = await page.evaluate(() => {
      const value = globalThis.localStorage.getItem("belvitale:quiz:v1");
      return value === null ? null : JSON.parse(value);
    });
    assert.notEqual(storedDocument, null, "estado local do quiz ausente");
    assert.equal(
      /name|nome|email|phone|telefone|whatsapp|address|endereço|ip|health|medical/i.test(
        JSON.stringify(storedDocument),
      ),
      false,
      "campo pessoal ou de saúde adicionado ao storage",
    );
  }

  assert.deepEqual(runtimeProblems, [], "erros no runtime de produção");
} finally {
  await browser.close();
  await new Promise((resolve, reject) => {
    previewServer.httpServer.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

process.stdout.write(
  `Produção validada: quiz ${publicationApproved ? "aprovado" : "bloqueado"}, sem checkout, preço ou envio de respostas.\n`,
);
