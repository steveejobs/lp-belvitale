import { expect, test, type Page } from "@playwright/test";
import {
  getQuizAccessMode,
  quizOfferMappings,
  resolveQuizPublicationStatus,
} from "../../src/data/quizPublication";
import { quizQuestions } from "../../src/data/quizQuestions";
import { quizProfiles } from "../../src/data/quizProfiles";
import {
  calculateQuizProfile,
  hasCompleteQuizAnswers,
  type QuizAnswer,
} from "../../src/quiz/quizScoring";
import { resolveQuizRecommendation } from "../../src/quiz/quizRecommendation";
import {
  inspectQuizStoredState,
  quizStorageKey,
  quizStorageMaxAgeMs,
  quizStorageVersion,
  saveQuizState,
} from "../../src/quiz/quizStorage";

const answersByProfile = {
  "simple-start": [
    "begin-small",
    "perfect-start",
    "make-it-smaller",
    "direct-to-essential",
    "light-enough-to-return",
  ],
  "gradual-consistency": [
    "begin-with-time",
    "one-day-break",
    "resume-without-compensating",
    "show-next-days",
    "return-without-failure",
  ],
  "conscious-continuity": [
    "begin-inside-routine",
    "replacement-late",
    "reorganize-week",
    "support-planning",
    "organized-through-change",
  ],
} as const;

function toAnswers(optionIds: readonly string[]): QuizAnswer[] {
  return quizQuestions.map((question, index) => {
    const optionId = optionIds[index];
    if (optionId === undefined) {
      throw new Error("Resposta ausente para " + question.id);
    }
    return { questionId: question.id, optionId };
  });
}

async function startQuiz(page: Page) {
  await page.goto("/quiz");
  const button = page.getByRole("button", { name: "Começar", exact: true });
  await expect(button).toBeVisible();
  await button.click();
}

async function selectOption(page: Page, optionId: string) {
  await page
    .locator('input[value="' + optionId + '"]')
    .locator("..")
    .click();
}

async function completeQuiz(
  page: Page,
  optionIds: readonly string[] = answersByProfile["simple-start"],
) {
  await startQuiz(page);
  for (const [index, optionId] of optionIds.entries()) {
    await selectOption(page, optionId);
    await page
      .getByRole("button", {
        name: index === optionIds.length - 1 ? "Ver meu ritmo" : "Continuar",
      })
      .click();
  }
}

test("quiz tem cinco ângulos, dezesseis opções e quatro composições", () => {
  expect(quizQuestions).toHaveLength(5);
  expect(quizQuestions.flatMap((question) => question.options)).toHaveLength(16);
  expect(new Set(quizQuestions.map((question) => question.presentation))).toEqual(
    new Set(["cards", "scale", "split", "sentence"]),
  );
  expect(new Set(quizQuestions.map((question) => question.id)).size).toBe(5);
  for (const question of quizQuestions) {
    expect(question.options.length).toBeGreaterThanOrEqual(3);
    expect(question.title).not.toMatch(/por quanto tempo|quantos potes/i);
  }
});

test("scoring entrega três perfis sem mapear posição a estoque", () => {
  for (const [profile, optionIds] of Object.entries(answersByProfile)) {
    const answers = toAnswers(optionIds);
    expect(hasCompleteQuizAnswers(answers)).toBe(true);
    expect(calculateQuizProfile(answers)).toBe(profile);
  }
  const strongestByQuestion = quizQuestions.map((question) =>
    question.options.map((option) => {
      const entries = Object.entries(option.profileWeights);
      const first = entries.at(0);
      if (first === undefined) return "";
      return entries.reduce((winner, current) =>
        current[1] > winner[1] ? current : winner,
      )[0];
    }),
  );
  expect(strongestByQuestion[1]).not.toEqual(strongestByQuestion[0]);
  expect(quizOfferMappings.every((mapping) => mapping.status === "pending")).toBe(true);
  expect(resolveQuizRecommendation("simple-start")).toBeNull();
});

test("publicação exige literal aprovado, mas acesso interno continua possível", () => {
  expect(resolveQuizPublicationStatus("approved", false)).toBe("approved");
  expect(resolveQuizPublicationStatus("Approved", false)).toBe("blocked");
  expect(resolveQuizPublicationStatus(undefined, true)).toBe("development");
  expect(getQuizAccessMode("blocked", false, false)).toBe("unavailable");
  expect(getQuizAccessMode("blocked", false, true)).toBe("interactive");
});

test("storage preserva chave, expiração e apenas campos permitidos", () => {
  expect(quizStorageKey).toBe("belvitale:quiz:v1");
  expect(quizStorageVersion).toBe(2);
  expect(quizStorageMaxAgeMs).toBe(30 * 24 * 60 * 60 * 1000);
  const answers = toAnswers(answersByProfile["simple-start"]);
  const values = new Map<string, string>();
  saveQuizState(
    { answers, currentStep: 2 },
    {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
    new Date("2026-07-14T12:00:00.000Z"),
  );
  const persisted = values.get(quizStorageKey);
  expect(persisted).toBeDefined();
  if (persisted === undefined) return;
  expect(JSON.parse(persisted)).toEqual({
    version: 2,
    savedAt: "2026-07-14T12:00:00.000Z",
    answers,
    currentStep: 2,
  });
  expect(persisted).not.toMatch(/email|phone|name/i);
});

test("storage vencido, adulterado ou com PII é descartado", () => {
  const now = new Date("2026-07-14T12:00:00.000Z");
  const old = new Date(now.getTime() - quizStorageMaxAgeMs - 1).toISOString();
  const validAnswer = toAnswers(answersByProfile["simple-start"]).at(0);
  expect(validAnswer).toBeDefined();
  if (validAnswer === undefined) return;
  expect(
    inspectQuizStoredState(
      JSON.stringify({
        version: 2,
        savedAt: old,
        answers: [validAnswer],
        currentStep: 0,
      }),
      now,
    ).status,
  ).toBe("expired");
  expect(
    inspectQuizStoredState(
      JSON.stringify({
        version: 2,
        savedAt: now.toISOString(),
        answers: [validAnswer],
        currentStep: 0,
        email: "pessoa@dominio.invalid",
      }),
      now,
    ).status,
  ).toBe("invalid");
  expect(inspectQuizStoredState("{", now).status).toBe("invalid");
});

test("início comunica duração, privacidade e ausência de diagnóstico", async ({
  page,
}) => {
  await page.goto("/quiz");
  await expect(
    page.getByRole("heading", { name: "Seu cuidado cabe na vida real?" }),
  ).toBeVisible();
  await expect(page.getByText(/Menos de 2 minutos/)).toBeVisible();
  await expect(page.getByText(/Sem diagnóstico, sem dados pessoais/)).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
});

test("pergunta mostra progresso orgânico, feedback e erro associado", async ({
  page,
}) => {
  await startQuiz(page);
  const progress = page.getByRole("progressbar", { name: "Progresso do quiz" });
  await expect(progress).toHaveAttribute("aria-valuenow", "1");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("alert")).toContainText("Escolha uma resposta");
  await selectOption(page, "begin-small");
  await expect(page.locator(".quiz-feedback")).toContainText(
    "Pouca fricção antes de criar estrutura",
  );
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(progress).toHaveAttribute("aria-valuenow", "2");
});

test("voltar e refresh preservam etapa e resposta localmente", async ({ page }) => {
  await startQuiz(page);
  await selectOption(page, "begin-with-time");
  await page.getByRole("button", { name: "Continuar" }).click();
  await selectOption(page, "week-changes");
  await page.reload();
  await expect(page.locator('input[value="week-changes"]')).toBeChecked();
  await page.getByRole("button", { name: "Voltar" }).click();
  await expect(page.locator('input[value="begin-with-time"]')).toBeChecked();
  await expect(page.locator("#quiz-question-title")).toBeFocused();
});

test("fluxo completo cria revelação retomável e não coloca respostas na URL", async ({
  page,
}) => {
  await completeQuiz(page);
  await expect(page).toHaveURL(/\/quiz\/resultado$/);
  await expect(
    page.getByRole("heading", { name: quizProfiles["simple-start"].title }),
  ).toBeVisible();
  await expect(page.getByText("Um ritual possível")).toBeVisible();
  await expect(page.getByText(/não é diagnóstico/i)).toBeVisible();
  await expect(
    page.locator('a[href*="belvitale.pay.yampi.com.br"]'),
  ).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Ver opção de 30 dias" }),
  ).toHaveAttribute("href", /PWJOI4I112/);
  await expect(
    page.getByRole("link", { name: "Abrir a composição" }),
  ).toHaveAttribute("href", "/#composicao");
  expect(page.url()).not.toContain("answer");
  const stored = await page.evaluate((key) => localStorage.getItem(key), quizStorageKey);
  expect(stored).not.toBeNull();
  expect(stored).not.toMatch(/email|phone|name/i);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: quizProfiles["simple-start"].title }),
  ).toBeVisible();
});

test("resultado direto inválido não inventa perfil", async ({ page }) => {
  await page.goto("/quiz/resultado");
  await expect(
    page.getByRole("heading", { name: /Seu ritmo precisa das cinco escolhas/ }),
  ).toBeVisible();
  for (const profile of Object.values(quizProfiles)) {
    await expect(
      page.getByRole("heading", { name: profile.title }),
    ).toHaveCount(0);
  }
  await page.getByRole("button", { name: "Começar o quiz" }).click();
  await expect(page).toHaveURL(/\/quiz$/);
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
});

test("teclado seleciona opção e controles têm alvos confortáveis", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startQuiz(page);
  const input = page.locator('input[value="begin-small"]');
  await input.focus();
  await page.keyboard.press("Space");
  await expect(input).toBeChecked();
  const controls = page.locator(".quiz-option, .quiz-button, .quiz-back");
  for (const rect of await controls.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect()),
  )) {
    expect(rect.height).toBeGreaterThanOrEqual(44);
  }
});

test("eventos nunca expõem respostas individuais", async ({ page }) => {
  await page.addInitScript(() => {
    const target = window as Window & { __QUIZ_EVENTS__?: unknown[] };
    target.__QUIZ_EVENTS__ = [];
    addEventListener("belvitale:quiz", (event) => {
      target.__QUIZ_EVENTS__?.push((event as CustomEvent).detail);
    });
  });
  await startQuiz(page);
  await selectOption(page, "begin-small");
  await page.getByRole("button", { name: "Continuar" }).click();
  const events = await page.evaluate(
    () => (window as Window & { __QUIZ_EVENTS__?: unknown[] }).__QUIZ_EVENTS__,
  );
  expect(JSON.stringify(events)).not.toMatch(
    /begin-small|questionId|optionId|email|phone/i,
  );
});

test("quiz continua operável a 200% sem overflow de página", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startQuiz(page);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  const size = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(size.scroll).toBeLessThanOrEqual(size.client + 1);
  await expect(page.getByRole("button", { name: "Continuar" })).toBeVisible();
});
