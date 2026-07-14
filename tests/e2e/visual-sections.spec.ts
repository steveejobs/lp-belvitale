import fs from "node:fs/promises";
import { expect, test } from "@playwright/test";

const requiredViewports = [
  { width: 360, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 430, height: 932 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
] as const;

test("hero comunica tese, categoria, produto editorial e CTA na primeira dobra", async ({
  page,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const hero = page.locator(".institutional-hero");
    await expect(
      hero.getByRole("heading", {
        name: "Vista o que você quiser. Sem negociar com o espelho.",
      }),
    ).toBeVisible();
    await expect(
      hero.getByRole("link", { name: "Conhecer o CeluClin" }),
    ).toBeInViewport();
    await expect(hero.getByText("60 cápsulas · 2 ao dia · 30 dias")).toBeInViewport();
    await expect(hero.locator('img[src="/label/celuclin-label-front-hero.webp"]')).toBeInViewport();
    await expect(hero).toContainText("suplemento alimentar em cápsulas");
  }
});

test("menu mobile contém foco, fecha com Escape e restaura acionador", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Abrir menu" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "belvitale" });
  await expect(dialog).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await expect(page.getByRole("button", { name: "Fechar menu" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("header ganha superfície somente depois da rolagem", async ({ page }) => {
  await page.goto("/");
  const header = page.locator(".site-header");
  await expect(header).toHaveAttribute("data-scrolled", "false");
  await page.evaluate(() => scrollTo(0, 420));
  await expect(header).toHaveAttribute("data-scrolled", "true");
});

test("nenhuma mídia bloqueada é carregada, nem no fim da página", async ({
  page,
}) => {
  const requested: string[] = [];
  page.on("request", (request) => requested.push(request.url()));
  await page.goto("/");
  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  expect(requested.join("\n")).not.toMatch(
    /\/(?:product|proof|lifestyle|brand)\//i,
  );
  const sources = await page.locator("img").evaluateAll((images) =>
    images.map((image) => image.getAttribute("src")),
  );
  expect(sources.filter(Boolean)).toEqual(
    expect.arrayContaining(["/label/celuclin-label-front.webp"]),
  );
  expect(sources.join(" ")).not.toMatch(/product|proof|lifestyle|brand/i);
});

test("imagem ausente mantém mensagem factual e acesso ao PDF", async ({ page }) => {
  await page.route("**/label/celuclin-label-front.webp", (route) =>
    route.abort("failed"),
  );
  await page.goto("/");
  await page.locator("#rotulo").scrollIntoViewIfNeeded();
  await expect(
    page.getByText("A imagem não carregou. O PDF original continua disponível."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Abrir PDF completo/ }),
  ).toHaveAttribute("href", "/label/celuclin-label-complete.pdf");
});

test("todos os viewports exigidos ficam sem overflow horizontal", async ({
  page,
}) => {
  for (const viewport of requiredViewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.locator(".site-footer").scrollIntoViewIfNeeded();
    const size = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(
      size.scroll,
      "overflow em " + String(viewport.width) + "x" + String(viewport.height),
    ).toBeLessThanOrEqual(size.client + 1);
  }
});

test("alvos primários mobile têm pelo menos 44 px e separação útil", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const boxes = await page
    .locator(".institutional-hero__actions a, .site-header__mobile-actions a, .site-header__mobile-actions button")
    .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect()));
  for (const box of boxes) {
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
  }
  const heroActions = boxes.slice(2);
  if (heroActions.length >= 2) {
    const first = heroActions[0];
    const second = heroActions[1];
    if (first !== undefined && second !== undefined) {
      expect(second.left - first.right).toBeGreaterThanOrEqual(8);
    }
  }
});

test("reduced motion preserva layout e remove animação longa", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/");
  const duration = await page
    .locator(".hero-sculpture")
    .evaluate((element) => getComputedStyle(element).animationDuration);
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.001);
  await expect(
    page.getByRole("link", { name: "Conhecer o CeluClin" }),
  ).toBeVisible();
  await context.close();
});

test("HTML e bundle não publicam packshot ou prova restrita", async () => {
  const html = await fs.readFile("index.html", "utf8");
  expect(html).not.toMatch(/\/product\/|\/proof\/|\/lifestyle\/|\/brand\//);
  expect(html).not.toContain("example.test");
  expect(html).toContain("noindex, nofollow");
});

test("console e rede permanecem sem erros durante navegação principal", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.locator("#composicao").scrollIntoViewIfNeeded();
  await page.getByRole("tab", { name: /Vitamina C/ }).click();
  await page.locator("#rotulo").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Ampliar para ler" }).click();
  await page.keyboard.press("Escape");
  expect(errors).toEqual([]);
});
