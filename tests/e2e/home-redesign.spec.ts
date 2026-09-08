import { expect, test } from "@playwright/test";

test("home une os públicos e preserva a atribuição até o checkout", async ({ page }) => {
  await page.addInitScript(() => {
    const fixtureWindow = window as Window & { __BELVITALE_COMMERCIAL_FIXTURE__?: unknown };
    fixtureWindow.__BELVITALE_COMMERCIAL_FIXTURE__ = {
      name: "commercial-ready",
      dependencies: { refundPolicyStatus: "approved", institutionalIdentificationStatus: "confirmed" },
      offers: [
        { id: "one-month", bottles: 1, cash: 89.9, token: "PWJOI4I112" },
        { id: "three-months", bottles: 3, cash: 169.9, token: "1E8NNCGJW9" },
        { id: "seven-months", bottles: 7, cash: 597, token: "41CHX4MGPX" },
      ].map(({ id, bottles, cash, token }) => ({
        id, bottles, title: id, approximateDurationMonths: bottles, totalCapsules: bottles * 60,
        checkoutUrl: `https://belvitale.pay.yampi.com.br/r/${token}`,
        checkoutStatus: "confirmed", contentsStatus: "confirmed", publicationStatus: "confirmed",
        price: { cash, installments: 1, installmentValue: cash, hasInterest: false, status: "confirmed" },
        image: { src: "/product/celuclin-home-960.webp", width: 960, height: 1440, rightsConfirmed: true, resolutionApproved: true, status: "confirmed" },
      })),
    };
  });
  await page.goto("/?utm_source=home_review&utm_campaign=validation");
  await expect(page.locator("h1")).toHaveText("Mais à vontade na sua pele.");
  await expect(page.locator(".home-moments")).toContainText("Isso já fazia parte da minha vida.");
  await expect(page.locator(".home-moments")).toContainText("Percebi mais depois de emagrecer.");
  const featured = page.locator('.offer-card[data-featured="true"]');
  await expect(featured).toHaveAttribute("data-offer-id", "three-months");
  await expect(featured.locator(".offer-card__price")).toContainText("169,90");
  await expect(featured.locator(".offer-card__saving")).toContainText("99,80");
  await page.locator("#faq button").first().click();
  await page.locator("#faq button").first().click();
  expect(new URL(page.url()).searchParams.get("utm_source")).toBe("home_review");
  const href = await featured.locator("a").getAttribute("href");
  expect(href).not.toBeNull();
  const checkout = new URL(href ?? "");
  expect(checkout.pathname).toBe("/r/1E8NNCGJW9");
  expect(checkout.searchParams.get("utm_source")).toBe("home_review");
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://www.belvitale.com.br/");
});

test("menu e rótulo devolvem o foco no celular", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Abrir menu", exact: true });
  await menu.click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(menu).toBeFocused();
  const label = page.getByRole("button", { name: "Ampliar rótulo", exact: true });
  await label.click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(label).toBeFocused();
});
