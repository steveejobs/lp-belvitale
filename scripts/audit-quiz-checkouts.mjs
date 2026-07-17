/* global document, Image, window */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { URL } from "node:url";
import { chromium } from "@playwright/test";

const checkouts = [
  {
    plan: "30-days",
    url: "https://belvitale.pay.yampi.com.br/r/PWJOI4I112",
    productPattern: /CeluClin\s+1\s+M[eê]s\s*\(1\s+pote\)/i,
    quantityPattern: /1\s+pote|1\s+m[eê]s/i,
  },
  {
    plan: "90-days",
    url: "https://belvitale.pay.yampi.com.br/r/1E8NNCGJW9",
    productPattern: /CeluClin\s+3\s+Meses\s*\(3\s+potes\)/i,
    quantityPattern: /3\s+potes|3\s+meses/i,
  },
  {
    plan: "210-days",
    url: "https://belvitale.pay.yampi.com.br/r/41CHX4MGPX",
    productPattern: /CeluClin\s+7\s+Meses\s*\(5\s*\+\s*2\s+gr[aá]tis\)/i,
    quantityPattern: /5\s*\+\s*2\s+gr[aá]tis|7\s+meses/i,
  },
];

const money = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

function unescapeUrl(value) {
  return value?.replaceAll("\\/", "/").replace(/^\/\//, "https://") ?? null;
}

function extractEmbeddedCommerce(html) {
  const productMatch = html.match(
    /"price_sale":"([0-9.]+)"[\s\S]{0,420}?"price":"([0-9.]+)"[\s\S]{0,260}?"name":"(CeluClin[^"]+)"/i,
  );
  const imageMatch = html.match(
    /"small":"([^"]+)"[\s\S]{0,220}?"thumb":"([^"]+)"[\s\S]{0,220}?"medium":"([^"]+)"/i,
  );
  return {
    productName: productMatch?.[3]?.replaceAll("\\u00ea", "ê").replaceAll("\\u00e1", "á") ?? null,
    comparativePrice: money(productMatch?.[1] ?? ""),
    currentPrice: money(productMatch?.[2] ?? ""),
    images: {
      small: unescapeUrl(imageMatch?.[1]),
      thumb: unescapeUrl(imageMatch?.[2]),
      medium: unescapeUrl(imageMatch?.[3]),
    },
  };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const checkout of checkouts) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      locale: "pt-BR",
      serviceWorkers: "block",
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    const network = [];
    page.on("response", (response) => {
      const url = response.url();
      if (/yampi|celuclin|checkout|installment|payment/i.test(url)) {
        network.push({ url, status: response.status(), type: response.request().resourceType() });
      }
    });

    const response = await page.goto(checkout.url, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await page.getByText(/CeluClin/i).first().waitFor({ state: "attached", timeout: 15_000 }).catch(() => undefined);
    await page.waitForTimeout(4_000);

    const html = await page.content();
    const embedded = extractEmbeddedCommerce(html);
    const pageState = await page.evaluate(() => {
      const bodyText = document.body.innerText.replace(/\s+/g, " ").trim();
      const priceTexts = [...document.querySelectorAll("body *")]
        .filter((element) => {
          const marker = `${element.className || ""} ${element.getAttribute("data-testid") || ""}`;
          return /price|total|installment|parcel/i.test(marker) && element.children.length <= 2;
        })
        .map((element) => element.textContent?.replace(/\s+/g, " ").trim() || "")
        .filter((value) => value.length > 0 && value.length < 180);
      const installmentTexts = bodyText.match(/\b\d{1,2}\s*x\s*(?:de\s*)?R\$\s*[\d.]+,\d{2}/gi) ?? [];
      const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => script.textContent?.trim() || "");
      return {
        title: document.title,
        bodyText,
        emptyCartMessage: /carrinho\s+(?:est[aá]\s+)?vazio/i.test(bodyText),
        priceTexts: [...new Set(priceTexts)],
        installmentTexts: [...new Set(installmentTexts)],
        meta: {
          canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
          ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content") ?? null,
          ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? null,
          ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute("content") ?? null,
        },
        jsonLd,
        images: [...document.images].map((image) => ({
          alt: image.alt,
          src: image.src,
          currentSrc: image.currentSrc,
          srcset: image.srcset,
          sizes: image.sizes,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          renderedWidth: Math.round(image.getBoundingClientRect().width),
          renderedHeight: Math.round(image.getBoundingClientRect().height),
        })),
      };
    });
    const embeddedImageDimensions = await page.evaluate(async (sources) => {
      const entries = Object.entries(sources).filter((entry) => typeof entry[1] === "string");
      return Object.fromEntries(await Promise.all(entries.map(async ([name, src]) => {
        const result = await new Promise((resolve) => {
          const image = new Image();
          const timer = window.setTimeout(() => resolve({ src, width: 0, height: 0, loaded: false }), 8_000);
          image.onload = () => {
            window.clearTimeout(timer);
            resolve({ src, width: image.naturalWidth, height: image.naturalHeight, loaded: true });
          };
          image.onerror = () => {
            window.clearTimeout(timer);
            resolve({ src, width: 0, height: 0, loaded: false });
          };
          image.src = src;
        });
        return [name, result];
      })));
    }, embedded.images);

    await page.screenshot({
      path: path.join(process.cwd(), ".tmp", `checkout-${checkout.plan}.png`),
      fullPage: false,
    });

    const productImages = pageState.images.filter((image) => /celuclin/i.test(`${image.alt} ${image.src} ${image.currentSrc}`));
    const cookiesAfterLoad = await context.cookies();
    results.push({
      plan: checkout.plan,
      expectedUrl: checkout.url,
      finalUrl: page.url(),
      httpStatus: response?.status() ?? null,
      title: pageState.title,
      cleanContext: true,
      cookiesCreatedByCheckout: cookiesAfterLoad.map((cookie) => cookie.name).sort(),
      productCorrect: checkout.productPattern.test(`${embedded.productName ?? ""} ${pageState.bodyText}`),
      quantityCorrect: checkout.quantityPattern.test(`${embedded.productName ?? ""} ${pageState.bodyText}`),
      cartEmpty: pageState.emptyCartMessage,
      fivePlusTwoVisible: /5\s*\+\s*2\s+gr[aá]tis/i.test(`${embedded.productName ?? ""} ${pageState.bodyText}`),
      commercialData: {
        source: "Estado inicial oficial incorporado ao HTML do checkout Yampi",
        productName: embedded.productName,
        comparativePrice: embedded.comparativePrice,
        currentPrice: embedded.currentPrice,
        installmentTexts: pageState.installmentTexts,
        installmentVerified: pageState.installmentTexts.length > 0,
        visiblePriceTexts: pageState.priceTexts,
      },
      metadata: pageState.meta,
      jsonLd: pageState.jsonLd,
      productImages,
      embeddedImageSources: embedded.images,
      embeddedImageDimensions,
      imageOrigins: unique(productImages.map((image) => {
        try { return new URL(image.currentSrc || image.src).origin; } catch { return null; }
      })),
      network: network.slice(0, 200),
      reachable: response !== null && response.status() >= 200 && response.status() < 400,
      checkoutReady: response !== null && response.status() >= 200 && response.status() < 400 &&
        !pageState.emptyCartMessage && checkout.productPattern.test(`${embedded.productName ?? ""} ${pageState.bodyText}`) &&
        checkout.quantityPattern.test(`${embedded.productName ?? ""} ${pageState.bodyText}`),
      pricePublicationReady: embedded.comparativePrice !== null && embedded.currentPrice !== null &&
        embedded.currentPrice < embedded.comparativePrice && pageState.installmentTexts.length > 0,
    });
    await context.close();
  }
} finally {
  await browser.close();
}

const report = {
  auditedAt: new Date().toISOString(),
  browser: "Playwright Chromium, headless, contexto novo por URL, sem compra ou preenchimento",
  scope: "Open Graph, JSON-LD, estado inicial, CDN/srcset, rede, produto, quantidade, carrinho e dados comerciais visíveis.",
  results,
};
const outputDirectory = path.join(process.cwd(), "artifacts", "quiz-v4");
await fs.mkdir(outputDirectory, { recursive: true });
await fs.writeFile(
  path.join(outputDirectory, "checkout-audit.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
