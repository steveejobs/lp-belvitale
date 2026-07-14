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

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
] as const;

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
    src: "/__fixtures__/approved-kit.webp",
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
    image: {
      ...confirmedOffer.image,
      src: "/__fixtures__/approved-kit-3.webp",
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
    image: {
      ...confirmedOffer.image,
      src: "/__fixtures__/approved-kit-7.webp",
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
    window.addEventListener("belvitale:commerce", (event) => {
      fixtureWindow.__BELVITALE_COMMERCE_EVENTS__?.push(
        (event as CustomEvent).detail,
      );
    });
    window.addEventListener(
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

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(
    dimensions.clientWidth + 1,
  );
}

test("gate publica somente uma oferta integralmente confirmada", () => {
  expect(canPublishOffer(confirmedOffer)).toBe(true);
  expect(
    canPublishCommercialSection(readyOffers, {
      refundPolicyStatus: "approved",
      institutionalIdentificationStatus: "confirmed",
    }),
  ).toBe(true);
});

test("gate bloqueia pendência, preço ausente, imagem, direito e checkout inválido", () => {
  expect(
    canPublishOffer({ ...confirmedOffer, publicationStatus: "pending" }),
  ).toBe(false);
  expect(
    canPublishOffer({ ...confirmedOffer, price: { status: "confirmed" } }),
  ).toBe(false);
  expect(
    canPublishOffer({
      ...confirmedOffer,
      image: { ...confirmedOffer.image, status: "blocked" },
    }),
  ).toBe(false);
  expect(
    canPublishOffer({
      ...confirmedOffer,
      image: { ...confirmedOffer.image, rightsConfirmed: false },
    }),
  ).toBe(false);
  expect(
    canPublishOffer({
      ...confirmedOffer,
      checkoutUrl: "https://example.com/r/PWJOI4I112",
    }),
  ).toBe(false);
  expect(isValidCheckoutUrl(`${confirmedOffer.checkoutUrl}?utm=test`)).toBe(
    false,
  );
});

test("política jurídica draft e identificação incompleta bloqueiam a seção", () => {
  expect(
    canPublishCommercialSection(readyOffers, {
      refundPolicyStatus: "draft",
      institutionalIdentificationStatus: "confirmed",
    }),
  ).toBe(false);
  expect(
    canPublishCommercialSection(readyOffers, {
      refundPolicyStatus: "approved",
      institutionalIdentificationStatus: "pending",
    }),
  ).toBe(false);
  expect(commercialPublicationDependencies.refundPolicyStatus).toBe("draft");
  expect(commercialPublicationReady).toBe(false);
  expect(commercialOffers.every((offer) => !canPublishOffer(offer))).toBe(true);
});

test("cálculos comerciais retornam apenas valores exatos e válidos", () => {
  expect(calculatePricePerBottle(300, 3)).toBe(100);
  expect(calculatePricePerBottle(19.99, 1)).toBe(19.99);
  expect(calculatePricePerBottle(10, 3)).toBeNull();
  expect(calculatePricePerBottle(undefined, 3)).toBeNull();
  expect(calculatePricePerBottle(300, 0)).toBeNull();
  expect(calculateInstallmentTotal(3, 100)).toBe(300);
  expect(calculateInstallmentTotal(3, 19.99)).toBe(59.97);
  expect(calculateInstallmentTotal(0, 100)).toBeNull();
  expect(calculateInstallmentTotal(3, undefined)).toBeNull();
  expect(calculateVerifiedSavings(420, 300)).toBe(120);
  expect(calculateVerifiedSavings(300, 420)).toBeNull();
  expect(calculateVerifiedSavings(undefined, 300)).toBeNull();
});

test("camada de eventos permanece local e sem dados pessoais", () => {
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
  expect(JSON.stringify(events)).not.toMatch(/email|phone|ip|health|cookie/i);
});

test("estado real de desenvolvimento mostra bloqueio sem preço, CTA ou imagem", async ({
  page,
}) => {
  await page.goto("/");
  const section = page.locator("#kits");
  await expect(section).toHaveAttribute("data-publication-ready", "false");
  await expect(
    section.getByText("Oferta bloqueada — dados comerciais pendentes"),
  ).toBeVisible();
  await expect(section.locator(".commercial-offer")).toHaveCount(3);
  await expect(section.getByText("Preço total")).toHaveCount(0);
  await expect(section.locator('a[href*="pay.yampi"]')).toHaveCount(0);
  await expect(section.locator("img")).toHaveCount(0);
});

test("fixture isolada compara as três opções e preserva URLs exatas", async ({
  page,
}) => {
  await installReadyFixture(page);
  await page.goto("/");
  const section = page.locator("#kits");
  await expect(section).toHaveAttribute("data-ready-fixture", "true");
  await expect(
    section.getByText("Fixture de desenvolvimento — dados fictícios"),
  ).toBeVisible();
  await expect(section.locator(".commercial-offer")).toHaveCount(3);
  await expect(section.getByText("5 potes + 2 adicionais")).toBeVisible();
  await expect(section.getByText("R$ 560,00")).toBeVisible();
  await expect(section.getByText("R$ 80,00 por pote")).toBeVisible();

  const links = section.locator(".commercial-offer__cta");
  await expect(links).toHaveCount(3);
  for (let index = 0; index < readyOffers.length; index += 1) {
    await expect(links.nth(index)).toHaveAttribute(
      "href",
      readyOffers[index]?.checkoutUrl ?? "",
    );
    await expect(links.nth(index)).not.toHaveAttribute("target", "_blank");
  }
  await expect(section.locator("img")).toHaveCount(0);
});

test("CTA funciona por teclado e registra seleção e saída localmente", async ({
  page,
}) => {
  await installReadyFixture(page);
  await page.goto("/");
  const cta = page.getByRole("link", { name: "Escolher 1 mês" });
  await cta.focus();
  await expect(cta).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.locator('.commercial-offer[data-offer-id="one-month"]'),
  ).toHaveAttribute("data-selected", "true");

  const events = await page.evaluate(() => {
    const fixtureWindow = window as Window & {
      __BELVITALE_COMMERCE_EVENTS__?: LocalCommerceEvent[];
    };
    return fixtureWindow.__BELVITALE_COMMERCE_EVENTS__ ?? [];
  });
  expect(events).toEqual(
    expect.arrayContaining([
      {
        event: "offer_select",
        payload: { offerId: "one-month", source: "homepage" },
      },
      {
        event: "checkout_click",
        payload: { offerId: "one-month", source: "homepage" },
      },
    ]),
  );
});

test("reduced motion remove transições comerciais não essenciais", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const transition = await page
    .locator(".commercial-offer")
    .first()
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  const animation = await page
    .locator(".commercial-section__layout")
    .evaluate((element) => getComputedStyle(element).animationName);
  expect(transition).toBe("0s");
  expect(animation).toBe("none");
});

for (const viewport of viewports) {
  test(`seção comercial permanece legível e sem overflow em ${String(viewport.width)}x${String(viewport.height)}`, async ({
    page,
  }) => {
    await installReadyFixture(page);
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.locator("#kits").scrollIntoViewIfNeeded();
    await expectNoHorizontalOverflow(page);
    await expect(page.locator("#kits .commercial-offer")).toHaveCount(3);
  });
}

test("texto a 200% não cria overflow nem esconde os CTAs", async ({ page }) => {
  await installReadyFixture(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  await page.locator("#kits").scrollIntoViewIfNeeded();
  await expectNoHorizontalOverflow(page);
  await expect(
    page.getByRole("link", { name: "Escolher 7 meses" }),
  ).toBeVisible();
});

test("copy comercial não contém claims, urgência ou falsa preferência", async ({
  page,
}) => {
  await page.goto("/");
  const text = await page.locator("#kits").innerText();
  expect(text).not.toMatch(
    /resultado|tratamento|protocolo|transforma|celulite|gordura|mais vendid|recomendad|estoque|últimas unidades|grátis/i,
  );
});
