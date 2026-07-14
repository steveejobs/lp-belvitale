import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
] as const;

function monitorRuntime(page: Page) {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      problems.push(`console: ${message.text()} @ ${message.location().url}`);
    }
  });
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 400) {
      problems.push(`${String(response.status())}: ${response.url()}`);
    }
  });
  return problems;
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

async function touchSwipe(page: Page, distance: number, duration = 120) {
  const scroller = page.locator(".gallery-mobile");
  await scroller.scrollIntoViewIfNeeded();
  const box = await scroller.boundingBox();
  if (box === null) throw new Error("Área de swipe não encontrada.");

  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 1,
  });

  const startX = box.x + box.width * 0.78;
  const y = box.y + box.height * 0.5;
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: startX, y }],
  });

  const steps = 6;
  for (let step = 1; step <= steps; step += 1) {
    await page.waitForTimeout(duration / steps);
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: startX - (distance * step) / steps, y }],
    });
  }

  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await client.detach();
  await page.waitForTimeout(700);
}

for (const viewport of viewports) {
  test(`fundação institucional estável em ${String(viewport.width)} × ${String(viewport.height)}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const problems = monitorRuntime(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Cuidado que começa com informação clara.",
      }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("link", { name: "Conhecer o CeluClin", exact: true })
        .first(),
    ).toBeVisible();
    await expect(
      page.locator(".trust-bar").getByText("60 cápsulas", { exact: true }),
    ).toBeAttached();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Uma rotina simples começa por saber o que você está escolhendo.",
      }),
    ).toBeAttached();
    await expect(page.locator(".institutional-hero img")).toHaveCount(0);
    await expect(page.locator('[data-testid="hero-fallback"]')).toBeAttached();
    await expect(
      page.getByRole("heading", {
        name: "Histórias que merecem ser vistas com contexto",
      }),
    ).toBeAttached();
    await expect(
      page.getByRole("heading", {
        name: "Nada escondido. Leia exatamente o que você está levando.",
      }),
    ).toBeAttached();
    await expectNoHorizontalOverflow(page);
    expect(problems).toEqual([]);
  });
}

for (const viewport of viewports.slice(0, 3)) {
  test(`CTA principal permanece na primeira dobra em ${String(viewport.width)} × ${String(viewport.height)}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");

    const heroCta = page
      .locator(".institutional-hero__actions")
      .getByRole("link", {
        name: "Conhecer o CeluClin",
      });
    const ctaBox = await heroCta.boundingBox();
    const heroBox = await page.locator(".institutional-hero").boundingBox();
    expect(ctaBox).not.toBeNull();
    expect(heroBox).not.toBeNull();
    expect(
      (ctaBox?.y ?? viewport.height) + (ctaBox?.height ?? 0),
    ).toBeLessThanOrEqual(viewport.height);
    expect(heroBox?.height ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(
      viewport.height * 1.5,
    );
  });
}

test("menu mobile contém foco, fecha com Escape e restaura o acionador", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const trigger = page.getByRole("button", { name: "Abrir menu" });
  await trigger.click({ force: true });
  const dialog = page.getByRole("dialog", { name: "Belvitale" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Fechar menu" })).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("hidden");

  await expect
    .poll(() => dialog.evaluate((element) => element.matches(":modal")))
    .toBe(true);
  await page.keyboard.press("Tab");
  await expect
    .poll(() =>
      dialog.evaluate(
        (element) =>
          element === document.activeElement ||
          element.contains(document.activeElement),
      ),
    )
    .toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("");
});

test("header ganha superfície discreta após a rolagem", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const header = page.locator(".site-header");
  await expect(header).toHaveAttribute("data-scrolled", "false");
  await page.evaluate(() => window.scrollTo(0, 80));
  await expect(header).toHaveAttribute("data-scrolled", "true");
});

test("metadados usam apenas Organization e não publicam Product", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle(
    "Belvitale | CeluClin — autocuidado com transparência",
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /suplemento alimentar da Belvitale/,
  );
  const structuredData = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const schemaTypes = structuredData.map(
    (entry) => (JSON.parse(entry) as { "@type"?: unknown })["@type"],
  );
  expect(schemaTypes).toContain("Organization");
  expect(schemaTypes).not.toContain("Product");
});

test("fallback sem JavaScript mantém a fundação legível e não publica packshot", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Cuidado que começa com informação clara.",
    }),
  ).toBeVisible();
  await expect(
    page.locator(".no-js-bar").getByText("60 cápsulas", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Uma rotina simples começa por saber o que você está escolhendo.",
    }),
  ).toBeAttached();
  await expect(
    page.locator('img[src*="product"], img[src*="proof"]'),
  ).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await context.close();
});

test("primeira dobra não desloca após a montagem", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const cta = page.locator(".institutional-hero__actions");
  const before = await cta.evaluate(
    (element) => (element as HTMLElement).offsetTop,
  );
  await page.waitForTimeout(700);
  const after = await cta.evaluate(
    (element) => (element as HTMLElement).offsetTop,
  );
  expect(Math.abs(before - after)).toBeLessThanOrEqual(1);
});

test("filtros, setas e teclado preservam as séries", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const counter = page.locator(".gallery-counter");
  await expect(counter).toContainText("1 / 4");
  await page.getByRole("button", { name: "Próxima imagem" }).click();
  await expect(counter).toContainText("2 / 4");

  const scroller = page.locator(".gallery-mobile");
  await scroller.focus();
  await page.keyboard.press("ArrowRight");
  await expect(counter).toContainText("3 / 4");
  await page.keyboard.press("ArrowLeft");
  await expect(counter).toContainText("2 / 4");

  await page
    .getByRole("button", { name: "Flacidez", exact: true })
    .evaluate((button) => (button as HTMLButtonElement).click());
  await expect(counter).toContainText("1 / 2");
  await page
    .getByRole("button", { name: "Gordura localizada", exact: true })
    .evaluate((button) => (button as HTMLButtonElement).click());
  await expect(counter).toContainText("1 / 3");
});

test("swipe curto cancela e swipe longo avança sem travar o eixo vertical", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const counter = page.locator(".gallery-counter");

  await touchSwipe(page, 28, 360);
  await expect(counter).toContainText("1 / 4");

  await touchSwipe(page, 230, 90);
  await expect(counter).toContainText("2 / 4");
  await expectNoHorizontalOverflow(page);
});

test("modal fecha com Escape, bloqueia scroll e devolve foco", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const section = page.locator("#rotulo");
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveAttribute("data-revealed", "true");

  const trigger = page.getByRole("button", { name: "Ampliar rótulo" });
  await trigger.click();
  const dialog = page.getByRole("dialog", {
    name: "Rótulo completo do CeluClin",
  });
  await expect(dialog).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Fechar rótulo ampliado" }),
  ).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("hidden");

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("");
});

test("reduced motion remove deslocamento e mantém controles", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect
    .poll(() =>
      page
        .locator(".institutional-hero__copy")
        .evaluate((element) => getComputedStyle(element).animationName),
    )
    .toBe("none");

  const activeMedia = page.locator(
    '.gallery-mobile__slide[data-active="true"] .gallery-media',
  );
  await expect
    .poll(() =>
      activeMedia.evaluate((element) => getComputedStyle(element).transform),
    )
    .toBe("none");
  await page.getByRole("button", { name: "Próxima imagem" }).click();
  await expect(page.locator(".gallery-counter")).toContainText("2 / 4");

  const label = page.locator("#rotulo");
  await label.scrollIntoViewIfNeeded();
  await expect(label).toHaveAttribute("data-revealed", "true");
  await expect
    .poll(() =>
      page
        .locator(".label-artwork")
        .evaluate((element) => getComputedStyle(element).animationName),
    )
    .toBe("none");
});

test("estados ausente, erro e categoria vazia são factuais", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileGallery = page.locator(".gallery-mobile");
  await page.goto("/?asset-state=missing");
  await expect(
    mobileGallery.getByText("Imagem ausente no acervo."),
  ).toBeVisible();

  await page.goto("/?asset-state=error");
  await mobileGallery.scrollIntoViewIfNeeded();
  await expect(
    mobileGallery.getByText("Não foi possível carregar esta imagem."),
  ).toBeVisible();

  await page.goto("/?asset-state=empty");
  await expect(
    page.getByText("Nenhuma imagem disponível nesta categoria."),
  ).toBeVisible();
});

test("rede lenta mantém espaço reservado até a imagem carregar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/*.webp", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fallback();
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const mobileGallery = page.locator(".gallery-mobile");
  await mobileGallery.evaluate((element) =>
    element.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await expect(
    mobileGallery.getByText("Carregando imagem…").first(),
  ).toBeVisible();
  await expect(
    mobileGallery.getByText("Imagem carregada.").first(),
  ).toBeAttached();
});

test("zoom de texto a 200% mantém controles e evita overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Cuidado que começa com informação clara.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir menu" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
