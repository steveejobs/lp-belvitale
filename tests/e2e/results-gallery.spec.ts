import { expect, test } from "@playwright/test";

test("galeria avança visível, pausa no hover e retoma depois da interação", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#resultados-cellulite").scrollIntoViewIfNeeded();
  const gallery = page.locator('.proof-gallery[data-category="cellulite"]');
  const initial = await gallery.getAttribute("data-active-index");

  await expect(gallery).toHaveAttribute("data-autoplay", "true");
  await expect(gallery).not.toHaveAttribute("data-active-index", initial ?? "", { timeout: 6500 });

  await gallery.hover();
  await expect(gallery).toHaveAttribute("data-autoplay", "false");
  const paused = await gallery.getAttribute("data-active-index");
  await page.waitForTimeout(5500);
  await expect(gallery).toHaveAttribute("data-active-index", paused ?? "");

  await page.mouse.move(1, 1);
  await expect(gallery).toHaveAttribute("data-autoplay", "true", {
    timeout: 4500,
  });
});

test("swipe horizontal troca a prova sem bloquear o scroll vertical", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("#resultados-cellulite").scrollIntoViewIfNeeded();
  const gallery = page.locator('.proof-gallery[data-category="cellulite"]');
  const stage = gallery.locator(".proof-gallery__stage");
  const initial = await gallery.getAttribute("data-active-index");
  const box = await stage.boundingBox();
  expect(box).not.toBeNull();
  if (box === null) return;

  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(gallery).not.toHaveAttribute("data-active-index", initial ?? "");
  await expect(stage).toHaveCSS("touch-action", "pan-y");
});

test("reduced motion interrompe completamente o autoplay", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await page.locator("#resultados-cellulite").scrollIntoViewIfNeeded();
  const gallery = page.locator('.proof-gallery[data-category="cellulite"]');
  const initial = await gallery.getAttribute("data-active-index");
  await expect(gallery).toHaveAttribute("data-autoplay", "false");
  await page.waitForTimeout(5500);
  await expect(gallery).toHaveAttribute("data-active-index", initial ?? "");
  await context.close();
});

test("cada categoria mantém no DOM somente atual, anterior e próxima", async ({
  page,
}) => {
  await page.goto("/");
  for (const category of ["cellulite", "laxity", "localized-fat"]) {
    const section = page.locator(`[data-proof-category="${category}"]`);
    await section.scrollIntoViewIfNeeded();
    const gallery = section.locator(".proof-gallery");
    const count = await gallery.locator(".proof-figure img").count();
    expect(count).toBeGreaterThanOrEqual(2);
    expect(count).toBeLessThanOrEqual(3);
    for (const fit of await gallery.locator(".proof-figure img").evaluateAll((images) =>
      images.map((image) => getComputedStyle(image).objectFit),
    )) {
      expect(fit).toBe("contain");
    }
    const framePadding = await gallery.locator('.proof-figure[data-position="current"]').evaluate((figure) => {
      const style = getComputedStyle(figure);
      return [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft]
        .map((value) => Number.parseFloat(value));
    });
    for (const padding of framePadding) {
      expect(padding).toBeGreaterThanOrEqual(4);
    }
  }
});
