import { expect, test, type Page } from "@playwright/test";
import {
  calculateInstallmentTotal,
  calculatePricePerBottle,
  calculateVerifiedSavings,
  canPublishCommercialSection,
  canPublishOffer,
  commercialOffers,
  commercialPublicationDependencies,
  commercialPublicationReady,
  isValidCheckoutUrl,
  type CommercialOffer,
} from "../../src/data/commercialOffers";
import {
  recordCommerceEvent,
  subscribeToCommerceEvents,
  type LocalCommerceEvent,
} from "../../src/commerce/commerceEvents";

const confirmedOffer: CommercialOffer = {
  id: "one-month",
  title: "1 mês",
  bottles: 1,
  approximateDurationMonths: 1,
  totalCapsules: 60,
  checkoutUrl: "https://belvitale.pay.yampi.com.br/r/PWJOI4I112",
  checkoutStatus: "confirmed",
  contentsStatus: "confirmed",
  price: {
    cash: 120,
    installments: 3,
    installmentValue: 40,
    hasInterest: false,
    status: "confirmed",
  },
  image: {
    src: "/internal-approved-kit.webp",
    width: 1600,
    height: 1600,
    rightsConfirmed: true,
    resolutionApproved: true,
    status: "confirmed",
  },
  publicationStatus: "confirmed",
};

const readyOffers: readonly CommercialOffer[] = [
  confirmedOffer,
  {
    ...confirmedOffer,
    id: "three-months",
    title: "3 meses",
    bottles: 3,
    approximateDurationMonths: 3,
    totalCapsules: 180,
    checkoutUrl: "https://belvitale.pay.yampi.com.br/r/1E8NNCGJW9",
    price: {
      cash: 300,
      installments: 3,
      installmentValue: 100,
      hasInterest: false,
      status: "confirmed",
    },
  },
  {
    ...confirmedOffer,
    id: "seven-months",
    title: "7 meses",
    bottles: 5,
    additionalBottles: 2,
    approximateDurationMonths: 7,
    totalCapsules: 420,
    checkoutUrl: "https://belvitale.pay.yampi.com.br/r/41CHX4MGPX",
    price: {
      cash: 560,
      installments: 4,
      installmentValue: 140,
      hasInterest: false,
      status: "confirmed",
    },
  },
] as const;

async function installReadyFixture(page: Page) {
  await page.addInitScript((offers) => {
    const fixtureWindow = window as Window & {
      __BELVITALE_COMMERCIAL_FIXTURE__?: unknown;
      __BELVITALE_COMMERCE_EVENTS__?: unknown[];
    };
    fixtureWindow.__BELVITALE_COMMERCIAL_FIXTURE__ = {
      name: "commercial-ready",
      offers,
      dependencies: {
        refundPolicyStatus: "approved",
        institutionalIdentificationStatus: "confirmed",
      },
    };
    fixtureWindow.__BELVITALE_COMMERCE_EVENTS__ = [];
    addEventListener("belvitale:commerce", (event) => {
      fixtureWindow.__BELVITALE_COMMERCE_EVENTS__?.push(
        (event as CustomEvent).detail,
      );
    });
    addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (
          target instanceof Element &&
          target.closest('a[href*="belvitale.pay.yampi.com.br"]') !== null
        ) {
          event.preventDefault();
        }
      },
      true,
    );
  }, readyOffers);
}

test("gate comercial exige todos os dados e continua fechado no estado real", () => {
  expect(canPublishOffer(confirmedOffer)).toBe(true);
  expect(
    canPublishCommercialSection(readyOffers, {
      refundPolicyStatus: "approved",
      institutionalIdentificationStatus: "confirmed",
    }),
  ).toBe(true);
  expect(commercialPublicationReady).toBe(false);
  expect(
    canPublishCommercialSection(
      commercialOffers,
      commercialPublicationDependencies,
    ),
  ).toBe(false);
  expect(
    canPublishOffer({
      ...confirmedOffer,
      checkoutUrl: "https://belvitale.pay.yampi.com.br/r/PWJOI4I112?utm=x",
    }),
  ).toBe(false);
});

test("checkouts exatos e cálculos não aceitam aproximações", () => {
  expect(commercialOffers.map((offer) => offer.checkoutUrl)).toEqual([
    "https://belvitale.pay.yampi.com.br/r/PWJOI4I112",
    "https://belvitale.pay.yampi.com.br/r/1E8NNCGJW9",
    "https://belvitale.pay.yampi.com.br/r/41CHX4MGPX",
  ]);
  expect(commercialOffers.every((offer) => isValidCheckoutUrl(offer.checkoutUrl))).toBe(true);
  expect(calculatePricePerBottle(560, 7)).toBe(80);
  expect(calculatePricePerBottle(100, 3)).toBeNull();
  expect(calculateInstallmentTotal(4, 140)).toBe(560);
  expect(calculateVerifiedSavings(700, 560)).toBe(140);
});

test("eventos comerciais permanecem locais e sem PII", () => {
  const events: LocalCommerceEvent[] = [];
  const unsubscribe = subscribeToCommerceEvents((event) => events.push(event));
  recordCommerceEvent("checkout_click", {
    offerId: "one-month",
    source: "homepage",
  });
  unsubscribe();
  expect(events).toEqual([
    {
      event: "checkout_click",
      payload: { offerId: "one-month", source: "homepage" },
    },
  ]);
  expect(JSON.stringify(events)).not.toMatch(/email|phone|answer/i);
});

test("preview validado exibe as três opções sem linguagem interna ou preço inventado", async ({
  page,
}) => {
  await page.goto("/");
  const section = page.locator("#ofertas");
  await expect(section).toHaveAttribute("data-preview-ready", "true");
  await expect(section.locator("[data-offer-id]")).toHaveCount(3);
  await expect(section.locator('a[href*="belvitale.pay.yampi.com.br"]')).toHaveCount(3);
  await expect(section.locator('[data-offer-id="three-months"]')).toHaveAttribute(
    "data-featured",
    "true",
  );
  await expect(section.getByText("Mais vendido", { exact: true })).toHaveCount(0);
  await expect(section).not.toContainText(/gate|fixture|validação|direção interna/i);
  await expect(section).not.toContainText(/R\$|parcelas|economia|desconto/i);
});

test("fixture de integração preserva os três links exatos", async ({
  page,
}) => {
  await installReadyFixture(page);
  await page.goto("/");
  const section = page.locator("#ofertas");
  await expect(section).toHaveAttribute("data-preview-ready", "true");
  const links = section.locator('a[href*="belvitale.pay.yampi.com.br"]');
  await expect(links).toHaveCount(3);
  await expect(links.nth(0)).toHaveAttribute(
    "href",
    "https://belvitale.pay.yampi.com.br/r/PWJOI4I112",
  );
  await expect(links.nth(1)).toHaveAttribute(
    "href",
    "https://belvitale.pay.yampi.com.br/r/1E8NNCGJW9",
  );
  await expect(links.nth(2)).toHaveAttribute(
    "href",
    "https://belvitale.pay.yampi.com.br/r/41CHX4MGPX",
  );
  await expect(section).not.toContainText(/fixture|valor fictício/i);
});

test("CTA da oferta funciona por teclado e registra somente IDs", async ({
  page,
}) => {
  await installReadyFixture(page);
  await page.goto("/");
  const firstOffer = page.locator('#ofertas [data-offer-id="one-month"]');
  const cta = firstOffer.locator(".offer-card__cta");
  await cta.focus();
  await page.keyboard.press("Enter");
  const events = await page.evaluate(
    () =>
      (window as Window & { __BELVITALE_COMMERCE_EVENTS__?: unknown[] })
        .__BELVITALE_COMMERCE_EVENTS__,
  );
  expect(events).toEqual(
    expect.arrayContaining([
      {
        event: "checkout_click",
        payload: { offerId: "one-month", source: "homepage" },
      },
    ]),
  );
  expect(JSON.stringify(events)).not.toMatch(/email|phone|answer/i);
});

test("comércio mantém alvos e não cria overflow a 200%", async ({ page }) => {
  await installReadyFixture(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await page.locator("#ofertas").scrollIntoViewIfNeeded();
  const dimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  for (const box of await page.locator("#ofertas a").evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect()),
  )) {
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});

test("CTAs preservam somente UTMs permitidas", async ({ page }) => {
  await page.goto(
    "/?utm_source=instagram&utm_medium=social&utm_campaign=julho&utm_content=video&utm_term=celuclin&fbclid=remover&foo=bar",
  );
  await page.locator("#ofertas").scrollIntoViewIfNeeded();
  const checkoutLinks = page.locator("#ofertas .offer-card__cta");
  await expect(checkoutLinks).toHaveCount(3);
  const hrefs = await checkoutLinks.evaluateAll((links) =>
    links.map((link) => (link as HTMLAnchorElement).href),
  );
  expect(hrefs).toHaveLength(3);
  for (const href of hrefs) {
    const url = new URL(href);
    expect(url.searchParams.get("utm_source")).toBe("instagram");
    expect(url.searchParams.get("utm_medium")).toBe("social");
    expect(url.searchParams.get("utm_campaign")).toBe("julho");
    expect(url.searchParams.get("utm_content")).toBe("video");
    expect(url.searchParams.get("utm_term")).toBe("celuclin");
    expect(url.searchParams.has("fbclid")).toBe(false);
    expect(url.searchParams.has("foo")).toBe(false);
  }
});

test("CTA fixo mobile surge após o hero e some ao chegar nas ofertas", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const sticky = page.locator(".mobile-offer-cta");
  await expect(sticky).toHaveAttribute("data-visible", "false");
  const heroEnd = await page.locator(".campaign-hero").evaluate(
    (element) => element.getBoundingClientRect().bottom + window.scrollY,
  );
  await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), heroEnd + 120);
  await expect(sticky).toHaveAttribute("data-visible", "true");
  const box = await sticky.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(48);
  await page.locator("#ofertas").scrollIntoViewIfNeeded();
  await expect(sticky).toHaveAttribute("data-visible", "false");
});
