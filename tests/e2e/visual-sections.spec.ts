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

test("hero entrega tese, categoria, produto e ação na primeira dobra", async ({
  page,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const hero = page.locator(".campaign-hero");
    await expect(
      hero.getByRole("heading", {
        name: "A celulite não precisa decidir o que você veste.",
      }),
    ).toBeVisible();
    await expect(
      hero.getByRole("link", { name: "Escolher meu CeluClin" }),
    ).toBeInViewport();
    await expect(hero.getByText("60 cápsulas · 2 ao dia · 30 dias")).toBeInViewport();
    await expect(hero.locator('img[src="/product/celuclin-front-02.webp"]')).toBeInViewport();
    await expect(hero).toContainText("suplemento alimentar em cápsulas");
    await expect(hero).toContainText("Não é medicamento");
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

test("assets reais cumprem funções distintas e o rótulo só aparece na transparência", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#resultados").scrollIntoViewIfNeeded();
  await expect(page.locator("#resultados .proof-figure img")).toHaveCount(3);
  await expect(page.locator('#resultados img[src^="/proof/cellulite/"]')).toHaveCount(3);
  await page.getByRole("tab", { name: "Flacidez" }).click();
  await expect(page.locator("#resultados .proof-figure img")).toHaveCount(2);
  await expect(page.locator('#resultados img[src^="/proof/laxity/"]')).toHaveCount(2);
  await page.getByRole("tab", { name: "Gordura localizada" }).click();
  await expect(page.locator("#resultados .proof-figure img")).toHaveCount(3);
  await expect(page.locator('#resultados img[src^="/proof/localized-fat/"]')).toHaveCount(3);
  await page.locator(".site-footer").scrollIntoViewIfNeeded();

  const sources = await page.locator("img").evaluateAll((images) =>
    [...new Set(images.map((image) => image.getAttribute("src")).filter(Boolean))],
  );
  expect(sources).toEqual(
    expect.arrayContaining([
      "/product/celuclin-front-02.webp",
      "/product/celuclin-front-01.webp",
      "/product/celuclin-angle.webp",
      "/product/celuclin-hand.webp",
      "/product/celuclin-capsules.webp",
      "/lifestyle/freedom-01.webp",
      "/lifestyle/routine-01.webp",
      "/proof/localized-fat/localized-fat-01.webp",
      "/label/celuclin-label-front.webp",
    ]),
  );

  const labelLocations = await page
    .locator('img[src="/label/celuclin-label-front.webp"]')
    .evaluateAll((images) => images.map((image) => image.closest("#rotulo") !== null));
  expect(labelLocations.length).toBeGreaterThan(0);
  expect(labelLocations.every(Boolean)).toBe(true);
  await expect(page.locator('.campaign-hero img[src*="/label/"]')).toHaveCount(0);
  await expect(page.locator('#composicao img[src*="/label/"]')).toHaveCount(0);
});

test("imagem de rótulo ausente mantém mensagem factual e acesso ao PDF", async ({ page }) => {
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
  const actions = page.locator(
    ".campaign-hero__actions a, .site-header__mobile-actions button",
  );
  const boxes = await actions.evaluateAll((elements) =>
    elements
      .map((element) => element.getBoundingClientRect())
      .filter((box) => box.width > 0 && box.height > 0),
  );
  for (const box of boxes) {
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
  }

  const heroBoxes = await page.locator(".campaign-hero__actions a").evaluateAll(
    (elements) => elements.map((element) => element.getBoundingClientRect()),
  );
  const first = heroBoxes[0];
  const second = heroBoxes[1];
  if (first !== undefined && second !== undefined) {
    const sameRow = Math.abs(first.top - second.top) < 4;
    const gap = sameRow ? second.left - first.right : second.top - first.bottom;
    expect(gap).toBeGreaterThanOrEqual(8);
  }
});

test("reduced motion preserva a campanha e reduz transições a um frame", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/");
  const duration = await page
    .locator(".campaign-hero__visual > picture > img")
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.001);
  await expect(
    page.getByRole("link", { name: "Escolher meu CeluClin" }),
  ).toBeVisible();
  await context.close();
});

test("HTML inicial não depende de mídia restrita e preserva conteúdo crítico", async () => {
  const html = await fs.readFile("index.html", "utf8");
  expect(html).not.toMatch(/\/product\/|\/proof\/|\/lifestyle\/|\/brand\//);
  expect(html).not.toContain("celuclin-label-front-hero");
  expect(html).not.toContain("example.test");
  expect(html).toContain("A celulite não precisa");
  expect(html).toContain("Histórias que a pele conta");
  expect(html).toContain("noindex, nofollow");
});

test("console e rede permanecem sem erros durante a narrativa principal", async ({
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
  await page.locator("#resultados").scrollIntoViewIfNeeded();
  await page.locator("#rotulo").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Ampliar rótulo" }).click();
  await page.keyboard.press("Escape");
  expect(errors).toEqual([]);
});
