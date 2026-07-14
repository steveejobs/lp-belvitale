import { expect, test } from "@playwright/test";
import {
  institutionalFacts,
  isConfirmedInstitutionalFact,
} from "../../src/data/institutionalFacts";
import {
  faqFacts,
  publishedFaqFacts,
} from "../../src/data/faqFacts";
import {
  getPublicLegalDocuments,
  legalDocuments,
} from "../../src/data/legalDocuments";
import {
  regulatoryFacts,
  regulatoryPublicationReady,
} from "../../src/data/regulatoryFacts";

test("identidade confirmada e gates pendentes permanecem separados", () => {
  expect(isConfirmedInstitutionalFact(institutionalFacts.cnpj)).toBe(true);
  expect(institutionalFacts.cnpj.value).toBe("61.493.515/0001-65");
  expect(isConfirmedInstitutionalFact(institutionalFacts.phone)).toBe(true);
  expect(institutionalFacts.phone.value).toBe("(63) 99108-1785");
  expect(regulatoryFacts.sanitaryStatus).toBe("pending");
  expect(regulatoryPublicationReady).toBe(false);
});

test("FAQ publica oito fatos e mantém assuntos bloqueados fora", () => {
  expect(publishedFaqFacts).toHaveLength(8);
  expect(faqFacts.filter((fact) => fact.status === "blocked")).toHaveLength(3);
  expect(publishedFaqFacts.every((fact) => fact.status === "confirmed")).toBe(true);
});

test("FAQ abre múltiplas respostas e fecha por teclado", async ({ page }) => {
  await page.goto("/");
  const faq = page.locator("#faq");
  await faq.scrollIntoViewIfNeeded();
  const buttons = faq.getByRole("button");
  await expect(buttons).toHaveCount(8);
  await buttons.nth(0).click();
  await buttons.nth(1).focus();
  await page.keyboard.press("Enter");
  await expect(buttons.nth(0)).toHaveAttribute("aria-expanded", "true");
  await expect(buttons.nth(1)).toHaveAttribute("aria-expanded", "true");
  await buttons.nth(0).focus();
  await page.keyboard.press("Space");
  await expect(buttons.nth(0)).toHaveAttribute("aria-expanded", "false");
});

test("hash abre a resposta correta e mantém foco", async ({ page }) => {
  const item = publishedFaqFacts.at(2);
  expect(item).toBeDefined();
  if (item === undefined) return;
  await page.goto("/#" + item.id);
  const trigger = page.locator("#" + item.id + "-trigger");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(trigger).toBeFocused();
});

test("rodapé mostra SAC e CNPJ sem chamar telefone de WhatsApp", async ({
  page,
}) => {
  await page.goto("/");
  const footer = page.locator(".site-footer");
  await expect(footer).toContainText("61.493.515/0001-65");
  await expect(footer).toContainText("(63) 99108-1785");
  await expect(footer.getByRole("link", { name: "(63) 99108-1785" })).toHaveAttribute(
    "href",
    "tel:+5563991081785",
  );
  await expect(footer).not.toContainText(/WhatsApp/i);
});

test("documentos draft ficam fora da navegação pública", async ({ page }) => {
  expect(legalDocuments.every((document) => document.status !== "approved")).toBe(true);
  expect(getPublicLegalDocuments()).toHaveLength(0);
  await page.goto("/");
  await expect(
    page.locator('.site-footer a[href^="/legal/"]'),
  ).toHaveCount(0);
});

test("home reduz culpa e encerra com liberdade sem inventar história", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Celulite não é uma medida de peso, disciplina ou cuidado.",
    }),
  ).toBeVisible();
  await expect(page.locator(".education-section")).toContainText(
    "não se resume a uma causa simples",
  );
  await expect(
    page.getByRole("heading", {
      name: /Sua pele não precisa ser perfeita/,
    }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText(
    /fundada em|especialistas|anos de mercado|milhares de clientes/i,
  );
});

test("SEO permanece bloqueado sem domínio e status sanitário reais", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:url"]')).toHaveCount(0);
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  expect(schemas).toHaveLength(1);
  const organizationSchema = schemas.at(0);
  expect(organizationSchema).toBeDefined();
  if (organizationSchema === undefined) return;
  expect(JSON.parse(organizationSchema)).toMatchObject({
    "@type": "Organization",
    name: "Belvitale",
  });
  expect(organizationSchema).not.toContain("Product");
});

test("copy pública não contém claims, urgência ou termos comerciais bloqueados", async ({
  page,
}) => {
  await page.goto("/");
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(
    /cura|elimina(?:r)? a celulite|queima gordura|gordura presa|drenagem|toxinas|inflamação|resultado garantido|aprovado pela Anvisa|últimas unidades|mais vendido/i,
  );
  expect(text).not.toMatch(/frete grátis|garantia de \d+ dias|R\$\s*\d/i);
});

test("FAQ e rodapé permanecem legíveis a 200%", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  const size = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(size.scroll).toBeLessThanOrEqual(size.client + 1);
  await expect(page.locator(".site-footer")).toBeVisible();
});
