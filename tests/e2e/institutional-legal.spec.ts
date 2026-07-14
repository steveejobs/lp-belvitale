import { expect, test, type Page } from "@playwright/test";
import { faqFacts, publishedFaqFacts } from "../../src/data/faqFacts";
import {
  getTelephoneHref,
  institutionalFacts,
  isConfirmedInstitutionalFact,
} from "../../src/data/institutionalFacts";
import {
  getLegalDocumentByPath,
  getLegalRouteMode,
  getPublicLegalDocuments,
  legalDocuments,
} from "../../src/data/legalDocuments";

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

test("modelo institucional publica somente CNPJ e SAC confirmados", () => {
  expect(isConfirmedInstitutionalFact(institutionalFacts.cnpj)).toBe(true);
  expect(isConfirmedInstitutionalFact(institutionalFacts.phone)).toBe(true);
  expect(getTelephoneHref(institutionalFacts.phone)).toBe("tel:+5563991081785");
  expect(institutionalFacts.whatsapp.status).toBe("pending");
  expect(institutionalFacts.legalName.status).toBe("pending");
  expect(institutionalFacts.manufacturer.status).toBe("blocked");
});

test("modelo do FAQ separa oito respostas publicáveis e três bloqueios", () => {
  expect(publishedFaqFacts).toHaveLength(8);
  expect(faqFacts.filter((fact) => fact.status === "blocked")).toHaveLength(3);
  expect(publishedFaqFacts.every((fact) => fact.status === "confirmed")).toBe(
    true,
  );
});

test("accordion abre, fecha e permite múltiplas respostas", async ({
  page,
}) => {
  await page.goto("/");
  const buttons = page.locator("#faq .faq-item button");
  await expect(buttons).toHaveCount(8);

  const first = buttons.nth(0);
  const second = buttons.nth(1);
  await expect(first).toHaveAttribute("aria-expanded", "false");
  await first.click();
  await expect(first).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#faq-o-que-e-panel")).toHaveAttribute(
    "aria-hidden",
    "false",
  );

  await second.click();
  await expect(first).toHaveAttribute("aria-expanded", "true");
  await expect(second).toHaveAttribute("aria-expanded", "true");

  await first.click();
  await expect(first).toHaveAttribute("aria-expanded", "false");
  await expect(second).toHaveAttribute("aria-expanded", "true");
});

test("accordion funciona com Enter e Espaço", async ({ page }) => {
  await page.goto("/");
  const first = page.getByRole("button", { name: /O que é o CeluClin/ });
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(first).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Space");
  await expect(first).toHaveAttribute("aria-expanded", "false");
});

test("hash abre a pergunta correspondente e mantém foco visível", async ({
  page,
}) => {
  await page.goto("/#faq-duracao");
  const trigger = page.locator("#faq-duracao-trigger");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(trigger).toBeFocused();
  await expect(page).toHaveURL(/#faq-duracao$/);
});

test("respostas factuais e atalhos para composição e rótulo estão presentes", async ({
  page,
}) => {
  await page.goto("/");
  const faq = page.locator("#faq");
  await expect(
    faq.getByText("O frasco contém 60 cápsulas.", { exact: true }),
  ).toBeAttached();
  await expect(
    faq.getByText(
      "Considerando o consumo informado de 2 cápsulas ao dia, um frasco com 60 cápsulas corresponde a 30 dias de uso.",
      { exact: true },
    ),
  ).toBeAttached();
  await expect(
    faq.getByText(/adultos a partir de 19 anos/, { exact: false }),
  ).toBeAttached();
  await expect(faq.locator('a[href="#composicao"]')).toHaveCount(1);
  await expect(faq.locator('a[href="#rotulo"]')).toHaveCount(1);
});

test("perguntas bloqueadas e assuntos comerciais não aparecem no FAQ", async ({
  page,
}) => {
  await page.goto("/");
  const faq = page.locator("#faq");
  for (const blockedQuestion of [
    "O produto garante resultados?",
    "Como devo conservar?",
    "A cúrcuma faz parte da fórmula?",
  ]) {
    await expect(faq.getByText(blockedQuestion, { exact: true })).toHaveCount(
      0,
    );
  }
  await expect(faq.getByText(/preço|frete|garantia|Anvisa/i)).toHaveCount(0);
});

test("seção da Belvitale não inventa história e integra conteúdo existente", async ({
  page,
}) => {
  await page.goto("/");
  const brand = page.locator("#belvitale");
  await expect(
    brand.getByRole("heading", {
      level: 2,
      name: "Uma marca construída para tornar o autocuidado mais claro.",
    }),
  ).toBeAttached();
  await expect(brand.getByRole("heading", { name: "Clareza" })).toBeAttached();
  await expect(
    brand.getByRole("heading", { name: "Transparência" }),
  ).toBeAttached();
  await expect(
    brand.getByRole("heading", { name: "Responsabilidade" }),
  ).toBeAttached();
  await expect(brand.locator('a[href="#composicao"]')).toHaveCount(1);
  await expect(brand.locator('a[href="#rotulo"]')).toHaveCount(1);
  await expect(brand.locator('a[href="#faq"]')).toHaveCount(1);
  await expect(
    brand.getByText(/fundada|fundadora|laboratório|clientes|certificada/i),
  ).toHaveCount(0);
});

test("rodapé mostra CNPJ e SAC, mas não expõe pendências ou links legais", async ({
  page,
}) => {
  await page.goto("/");
  const footer = page.locator(".site-footer");
  await expect(footer.getByText("61.493.515/0001-65")).toBeAttached();
  await expect(
    footer.getByRole("link", { name: "(63) 99108-1785" }),
  ).toHaveAttribute("href", "tel:+5563991081785");
  await expect(footer.getByRole("link", { name: "Dúvidas" })).toHaveAttribute(
    "href",
    "#faq",
  );
  await expect(footer.locator('a[href^="/politica-"]')).toHaveCount(0);
  await expect(footer.locator('a[href="/termos-de-uso"]')).toHaveCount(0);
  await expect(footer.locator('a[href="/trocas-e-reembolso"]')).toHaveCount(0);
  await expect(
    footer.getByText(
      /em breve|a definir|WhatsApp|fabricante|responsável técnica/i,
    ),
  ).toHaveCount(0);
});

test("documentos legais permanecem draft, fora da navegação pública", () => {
  expect(legalDocuments).toHaveLength(3);
  expect(legalDocuments.every((document) => document.status === "draft")).toBe(
    true,
  );
  expect(getPublicLegalDocuments()).toHaveLength(0);
  for (const document of legalDocuments) {
    expect(getLegalDocumentByPath(document.path)?.id).toBe(document.id);
    expect(getLegalRouteMode(document, true)).toBe("internal-draft");
    expect(getLegalRouteMode(document, false)).toBe("unavailable");
  }
});

for (const legalDocument of legalDocuments) {
  test(`${legalDocument.title} tem título único, estado interno e noindex`, async ({
    page,
  }) => {
    await page.goto(legalDocument.path);
    await expect(
      page.getByRole("heading", { level: 1, name: legalDocument.title }),
    ).toHaveCount(1);
    await expect(page.locator("main[data-legal-status='draft']")).toHaveCount(
      1,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
    await expect(page).toHaveTitle(`${legalDocument.title} | Belvitale`);
    await expect(page.getByText(/Visualização interna/)).toBeVisible();
    await expect(page.locator("main section")).toHaveCount(0);
  });
}

test("homepage não adiciona schemas ou recursos comerciais proibidos", async ({
  page,
}) => {
  await page.goto("/");
  const structuredData = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  expect(structuredData.join(" ")).not.toContain('"@type":"FAQPage"');
  expect(structuredData.join(" ")).not.toContain('"@type":"Product"');
  await expect(page.locator('img[src*="yampi"]')).toHaveCount(0);
  await expect(page.locator('a[href*="pay.yampi"]')).toHaveCount(0);
});

test("fallback sem JavaScript preserva FAQ, marca, contato e bloqueios legais", async ({
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
      level: 2,
      name: "Dúvidas comuns, respostas sem rodeios.",
    }),
  ).toBeAttached();
  await expect(page.locator("#faq-conteudo p")).toHaveText(
    "O frasco contém 60 cápsulas.",
  );
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Uma marca construída para tornar o autocuidado mais claro.",
    }),
  ).toBeAttached();
  await expect(page.locator(".no-js-footer")).toContainText(
    "61.493.515/0001-65",
  );
  await expect(page.locator('a[href="/politica-de-privacidade"]')).toHaveCount(
    0,
  );
  await expectNoHorizontalOverflow(page);
  await context.close();
});

test("reduced motion remove transições não essenciais do FAQ", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const durations = await page
    .locator(".faq-panel")
    .first()
    .evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        transitionDuration: style.transitionDuration,
        animationName: style.animationName,
      };
    });
  expect(durations.transitionDuration).toBe("0s");
  expect(durations.animationName).toBe("none");
  await page.getByRole("button", { name: /O que é o CeluClin/ }).click();
  await expect(page.locator("#faq-o-que-e-panel")).toHaveAttribute(
    "aria-hidden",
    "false",
  );
});

test("texto a 200% mantém FAQ, marca e rodapé acessíveis", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  await page.locator("#faq").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /Onde vejo a composição/ }).click();
  await expect(page.locator("#faq-composicao-panel")).toHaveAttribute(
    "aria-hidden",
    "false",
  );
  await expectNoHorizontalOverflow(page);
  await expect(page.locator("#belvitale")).toBeAttached();
  await expect(page.locator(".site-footer")).toBeAttached();
});

for (const viewport of viewports) {
  test(`FAQ institucional e rodapé estáveis em ${String(viewport.width)} × ${String(viewport.height)}`, async ({
    page,
  }) => {
    const runtimeProblems = monitorRuntime(page);
    await page.setViewportSize(viewport);
    await page.goto("/");

    const faq = page.locator("#faq");
    await faq.scrollIntoViewIfNeeded();
    await expect(faq).toBeVisible();
    await page.getByRole("button", { name: /CeluClin é medicamento/ }).click();
    await expect(page.locator("#faq-medicamento-panel")).toHaveAttribute(
      "aria-hidden",
      "false",
    );

    await page.locator("#belvitale").scrollIntoViewIfNeeded();
    await expect(page.locator("#belvitale")).toBeVisible();
    await page.locator(".site-footer").scrollIntoViewIfNeeded();
    await expect(page.locator(".site-footer")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expect(runtimeProblems).toEqual([]);
  });
}

test("novas áreas não contêm claims fisiológicos proibidos", async ({
  page,
}) => {
  await page.goto("/");
  const text = await page
    .locator("#faq, #belvitale, .site-footer")
    .allTextContents();
  const combinedText = text.join(" ").toLocaleLowerCase("pt-BR");
  for (const forbiddenClaim of [
    "elimina celulite",
    "queima gordura",
    "reduz gordura localizada",
    "reduz medidas",
    "faz drenagem",
    "melhora circulação",
    "combate inflamação",
    "acelera metabolismo",
    "desintoxica",
  ]) {
    expect(combinedText).not.toContain(forbiddenClaim);
  }
});
