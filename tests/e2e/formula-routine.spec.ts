import { expect, test, type Page } from "@playwright/test";
import {
  calculateBottleDuration,
  formulaPublicationState,
  getFormulaPublicationState,
  getPublishableIngredients,
  ingredientFacts,
} from "../../src/data/productFacts";

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
    if (message.type() === "error") problems.push(`console: ${message.text()}`);
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

test("cálculo de duração aceita somente uma divisão positiva e exata", () => {
  expect(calculateBottleDuration(60, 2)).toBe(30);
  expect(calculateBottleDuration(60, 0)).toBeNull();
  expect(calculateBottleDuration(60, -2)).toBeNull();
  expect(calculateBottleDuration()).toBeNull();
  expect(calculateBottleDuration(61, 2)).toBeNull();
});

test("modelo central classifica a fórmula auditada como parcial", () => {
  expect(formulaPublicationState).toBe("partial");
  expect(getFormulaPublicationState(ingredientFacts)).toBe("partial");
  expect(getPublishableIngredients(ingredientFacts)).toHaveLength(7);
  expect(
    getPublishableIngredients(ingredientFacts).some(
      (fact) => fact.status !== "confirmed",
    ),
  ).toBe(false);
});

test("cenários confirmado, parcial e bloqueado não criam conteúdo falso", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/?formula-state=confirmed");
  const formula = page.locator("#composicao");
  await expect(formula).toHaveAttribute("data-publication-state", "confirmed");
  await expect(formula.locator(".formula-list__row")).toHaveCount(7);
  await expect(
    formula.getByText(/Algumas informações estão em processo/),
  ).toHaveCount(0);

  await page.goto("/");
  await expect(formula).toHaveAttribute("data-publication-state", "partial");
  await expect(formula.locator(".formula-list__row")).toHaveCount(7);
  await expect(
    formula.getByText(/Algumas informações estão em processo/),
  ).toBeAttached();

  await page.goto("/?formula-state=blocked");
  await expect(formula).toHaveAttribute("data-publication-state", "blocked");
  await expect(formula.locator(".formula-list")).toHaveCount(0);
  await expect(
    formula.getByText(/A composição completa será publicada/),
  ).toBeAttached();
});

test("fato divergente e valores diários ausentes não são renderizados", async ({
  page,
}) => {
  await page.goto("/");
  const formula = page.locator("#composicao");
  await expect(
    formula.getByText("Extrato de cúrcuma", { exact: true }),
  ).toHaveCount(0);
  await expect(
    formula.getByText("Extrato de Rizoma de Cúrcuma (Curcumina)", {
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(formula.getByText(/VD/)).toHaveCount(0);
});

test("rotina publica somente fatos confirmados e o cálculo explícito", async ({
  page,
}) => {
  await page.goto("/");
  const routine = page.locator("#rotina");
  await expect(
    routine.getByText("2 cápsulas ao dia", { exact: true }),
  ).toBeAttached();
  await expect(
    routine.getByText("60 cápsulas", { exact: true }),
  ).toBeAttached();
  await expect(routine.getByText("30 dias", { exact: true })).toBeAttached();
  await expect(
    routine.getByText("Maiores de 19 anos", { exact: true }),
  ).toBeAttached();
  await expect(
    routine.getByText(
      /não deve ser consumido por gestantes, lactantes e crianças/,
    ),
  ).toBeAttached();
  await expect(routine.getByText(/alimentação equilibrada/)).toHaveCount(0);
  await expect(routine.getByText(/uso de medicamentos/)).toHaveCount(0);
});

test("link de rótulo mantém âncora nativa e transfere foco para o título", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const link = page.getByRole("link", { name: "Consultar rótulo original" });
  await link.evaluate((element) => (element as HTMLAnchorElement).focus());
  await expect(link).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#rotulo$/);
  await expect(page.locator("#label-section-title")).toBeFocused();
  await expect(page.locator("#rotulo")).toHaveCount(1);
  await expect(page.locator(".label-modal")).toHaveCount(1);
});

test("ordem institucional mantém galeria de desenvolvimento após o rótulo", async ({
  page,
}) => {
  await page.goto("/");
  const order = await page.evaluate(() => {
    const selectors = [
      "#celuclin",
      "#composicao",
      "#rotina",
      "#rotulo",
      ".proof-gallery",
    ];
    return selectors.map((selector) => {
      const element = document.querySelector(selector);
      return element === null
        ? -1
        : [...document.querySelectorAll("main section")].indexOf(element);
    });
  });
  expect(order).toEqual([...order].sort((a, b) => a - b));
  expect(order.every((position) => position >= 0)).toBe(true);
});

test("fallback sem JavaScript preserva fórmula parcial e rotina factual", async ({
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
      name: "Informação clara antes de qualquer escolha.",
    }),
  ).toBeAttached();
  await expect(
    page.getByText("Fibra da casca da maçã", { exact: true }),
  ).toBeAttached();
  await expect(
    page.getByText("Extrato de cúrcuma", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: "Uma orientação simples, exatamente como informada na embalagem.",
    }),
  ).toBeAttached();
  await expect(
    page.getByText(/A duração de 30 dias resulta do cálculo exato/),
  ).toBeAttached();
  await expectNoHorizontalOverflow(page);
  await context.close();
});

test("reduced motion entrega fórmula e rotina no estado final", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect
    .poll(() =>
      page
        .locator("#composicao .product-detail__layout")
        .evaluate((element) => getComputedStyle(element).animationName),
    )
    .toBe("none");
  await expect
    .poll(() =>
      page
        .locator("#composicao .formula-list__row")
        .first()
        .evaluate((element) => getComputedStyle(element).animationName),
    )
    .toBe("none");
});

test("texto a 200% mantém fórmula e rotina sem overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await page
    .locator("#composicao")
    .evaluate((element) =>
      element.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  await expect(page.locator("#composicao .formula-list__row")).toHaveCount(7);
  await expect(page.locator("#rotina")).toBeAttached();
  await expectNoHorizontalOverflow(page);
});

for (const viewport of viewports) {
  test(`fórmula e rotina estáveis em ${String(viewport.width)} × ${String(viewport.height)}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const problems = monitorRuntime(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("heading", {
        name: "Informação clara antes de qualquer escolha.",
      }),
    ).toBeAttached();
    await expect(
      page.getByRole("heading", {
        name: "Uma orientação simples, exatamente como informada na embalagem.",
      }),
    ).toBeAttached();
    await expect(page.locator("#composicao .formula-list__row")).toHaveCount(7);
    await expectNoHorizontalOverflow(page);
    expect(problems).toEqual([]);
  });
}
