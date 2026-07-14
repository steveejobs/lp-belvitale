import fs from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  calculateBottleDuration,
  formulaPublicationState,
  getPublishableIngredients,
  ingredientFacts,
  usageFact,
} from "../../src/data/productFacts";

test("duração e fórmula usam somente fatos confirmados", () => {
  expect(calculateBottleDuration(60, 2)).toBe(30);
  expect(calculateBottleDuration(61, 2)).toBeNull();
  expect(calculateBottleDuration(60, 0)).toBeNull();
  expect(formulaPublicationState).toBe("partial");
  expect(getPublishableIngredients(ingredientFacts)).toHaveLength(7);
  expect(
    getPublishableIngredients(ingredientFacts).some(
      (ingredient) => ingredient.id === "turmeric",
    ),
  ).toBe(false);
  expect(usageFact).toMatchObject({
    totalCapsules: 60,
    capsulesPerDay: 2,
    durationDays: 30,
  });
});

test("fórmula é uma exploração por toque e teclado, não sete cards", async ({
  page,
}) => {
  await page.goto("/");
  const formula = page.locator("#composicao");
  await formula.scrollIntoViewIfNeeded();
  const tabs = formula.getByRole("tab");
  await expect(tabs).toHaveCount(7);
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await tabs.nth(3).click();
  await expect(tabs.nth(3)).toHaveAttribute("aria-selected", "true");
  await expect(formula.getByRole("tabpanel")).toContainText("Vitamina C");
  await tabs.nth(3).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(4)).toHaveAttribute("aria-selected", "true");
  await expect(formula.getByRole("tabpanel")).toContainText("11 mg");
});

test("conflito de cúrcuma e benefícios não são publicados", async ({ page }) => {
  await page.goto("/");
  const formula = page.locator("#composicao");
  await expect(formula).toHaveAttribute("data-publication-state", "partial");
  await expect(formula).toContainText(/Um item permanece fora/);
  await expect(formula).not.toContainText("Extrato de cúrcuma");
  await expect(formula).not.toContainText("Curcumina");
  await expect(formula).not.toContainText(/imun|colágeno|antioxidante|benefício/i);
});

test("estado bloqueado não cria ingrediente de fallback", async ({ page }) => {
  await page.goto("/?formula-state=blocked");
  const formula = page.locator("#composicao");
  await expect(formula).toHaveAttribute("data-publication-state", "blocked");
  await expect(formula.getByRole("tab")).toHaveCount(0);
  await expect(formula.getByText(/validação documental/)).toBeVisible();
  await expect(formula.getByRole("link", { name: /rótulo original/ })).toBeVisible();
});

test("rotina apresenta 60 dividido por 2 igual a 30 e avisos confirmados", async ({
  page,
}) => {
  await page.goto("/");
  const routine = page.locator("#rotina");
  await expect(routine.getByRole("heading", { name: /Duas cápsulas/ })).toBeVisible();
  const equation = routine.locator(".routine-equation");
  await expect(equation).toContainText("60");
  await expect(equation).toContainText("2");
  await expect(equation).toContainText("30");
  await expect(routine).toContainText("Maiores de 19 anos");
  await expect(routine).toContainText("não deve ser consumido por gestantes");
  await expect(routine).toContainText("não é medicamento");
  await expect(routine).not.toContainText(/horário|jejum|drenagem|toxina/i);
});

test("rótulo abre, fecha com Escape e devolve foco", async ({ page }) => {
  await page.goto("/");
  await page.locator("#rotulo").scrollIntoViewIfNeeded();
  const trigger = page.getByRole("button", { name: "Ampliar para ler" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: /Rótulo original ampliado/ });
  await expect(dialog).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("âncora da fórmula leva ao rótulo e transfere foco ao título", async ({
  page,
}) => {
  await page.goto("/");
  const link = page
    .locator("#composicao")
    .getByRole("link", { name: "Consultar o rótulo original" });
  await link.click();
  await expect(page).toHaveURL(/#rotulo$/);
  await expect(page.locator("#label-section-title")).toBeFocused();
});

test("HTML inicial contém os fatos críticos sem oferta ou claim", async () => {
  const html = await fs.readFile("index.html", "utf8");
  expect(html).toContain("Vista o que você quiser.");
  expect(html).toContain("Fibra da casca da maçã");
  expect(html).toContain("60 cápsulas · 2 ao dia · 30 dias");
  expect(html).toContain("noindex, nofollow");
  expect(html).not.toMatch(/R\$|checkout|Yampi|cura|elimina/i);
});

test("fórmula e rotina não criam overflow em mobile e texto ampliado", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await page.locator("#rotina").scrollIntoViewIfNeeded();
  const size = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(size.scroll).toBeLessThanOrEqual(size.client + 1);
});
