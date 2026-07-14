import { expect, test, type Page } from "@playwright/test";
import {
  getApprovedQuizOfferId,
  getQuizAccessMode,
  quizOfferMappings,
  resolveQuizPublicationStatus,
} from "../../src/data/quizPublication";
import { quizQuestions } from "../../src/data/quizQuestions";
import { quizProfiles, type QuizProfile } from "../../src/data/quizProfiles";
import {
  calculateQuizProfile,
  type QuizAnswer,
} from "../../src/quiz/quizScoring";
import {
  clearQuizState,
  createInitialQuizState,
  inspectQuizStoredState,
  loadQuizState,
  parseQuizState,
  quizStorageMaxAgeMs,
  quizStorageKey,
  quizStorageVersion,
  saveQuizState,
} from "../../src/quiz/quizStorage";
import {
  recordQuizEvent,
  subscribeToQuizEvents,
  type LocalQuizEvent,
  type QuizEventPayload,
} from "../../src/quiz/quizEvents";

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
] as const;

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

function answersForProfile(profile: QuizProfile): readonly QuizAnswer[] {
  return quizQuestions.map((question) => {
    const option = question.options.find(
      (candidate) => candidate.profileWeights[profile] === 2,
    );
    if (option === undefined) throw new Error("Opção de perfil ausente.");
    return { questionId: question.id, optionId: option.id };
  });
}

async function startQuiz(page: Page) {
  await page.goto("/quiz");
  await page.getByRole("button", { name: "Começar o quiz" }).click();
}

async function completeQuiz(page: Page, optionIndex = 0) {
  for (let step = 0; step < quizQuestions.length; step += 1) {
    await page.getByRole("radio").nth(optionIndex).check();
    await page
      .getByRole("button", {
        name: step === quizQuestions.length - 1 ? "Ver meu perfil" : "Continuar",
      })
      .click();
  }
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

test("dados centralizam seis perguntas, dezoito opções e pesos auditáveis", () => {
  expect(quizQuestions).toHaveLength(6);
  expect(quizQuestions.flatMap((question) => question.options)).toHaveLength(18);
  for (const question of quizQuestions) {
    expect(question.options).toHaveLength(3);
    for (const option of question.options) {
      const weights = Object.values(option.profileWeights);
      expect(weights.filter((weight) => weight === 2)).toHaveLength(1);
      expect(weights.filter((weight) => weight === 0)).toHaveLength(2);
    }
  }
});

test("pontuação calcula os três perfis sem oferta comercial", () => {
  expect(calculateQuizProfile(answersForProfile("simple-start"))).toBe(
    "simple-start",
  );
  expect(calculateQuizProfile(answersForProfile("gradual-consistency"))).toBe(
    "gradual-consistency",
  );
  expect(calculateQuizProfile(answersForProfile("conscious-continuity"))).toBe(
    "conscious-continuity",
  );
  expect(Object.keys(quizProfiles)).toHaveLength(3);
  expect(quizOfferMappings.every((mapping) => mapping.status === "pending")).toBe(
    true,
  );
  expect(getApprovedQuizOfferId("simple-start")).toBeNull();
});

test("empate é resolvido pela resposta da sexta pergunta", () => {
  const profiles: readonly QuizProfile[] = [
    "simple-start",
    "gradual-consistency",
    "conscious-continuity",
    "simple-start",
    "gradual-consistency",
    "conscious-continuity",
  ];
  const answers = quizQuestions.map((question, index) => {
    const profile = profiles[index];
    const option = question.options.find(
      (candidate) =>
        profile !== undefined && candidate.profileWeights[profile] === 2,
    );
    if (option === undefined) throw new Error("Opção de empate ausente.");
    return { questionId: question.id, optionId: option.id };
  });
  expect(calculateQuizProfile(answers)).toBe("conscious-continuity");
});

test("status central exige o valor literal approved", () => {
  expect(resolveQuizPublicationStatus("approved", false)).toBe("approved");
  expect(resolveQuizPublicationStatus("true", false)).toBe("blocked");
  expect(resolveQuizPublicationStatus("1", false)).toBe("blocked");
  expect(resolveQuizPublicationStatus(undefined, false)).toBe("blocked");
  expect(resolveQuizPublicationStatus(undefined, true)).toBe("development");
  expect(getQuizAccessMode("approved", false, false)).toBe("interactive");
  expect(getQuizAccessMode("blocked", false, false)).toBe("unavailable");
  expect(getQuizAccessMode("blocked", false, true)).toBe("interactive");
});

test("storage sanitiza campos e persiste somente estado permitido", () => {
  const storage = new MemoryStorage();
  const now = new Date("2026-07-14T15:00:00.000Z");
  const answer = answersForProfile("simple-start")[0];
  if (answer === undefined) throw new Error("Resposta ausente.");
  saveQuizState({ answers: [answer], currentStep: 1 }, storage, now);
  const raw = storage.getItem(quizStorageKey);
  expect(raw).not.toBeNull();
  const persisted: unknown = JSON.parse(raw ?? "{}");
  if (typeof persisted !== "object" || persisted === null) {
    throw new Error("Estado persistido inválido.");
  }
  expect(Object.keys(persisted)).toEqual([
    "version",
    "savedAt",
    "answers",
    "currentStep",
  ]);
  expect(persisted).toMatchObject({
    version: quizStorageVersion,
    savedAt: now.toISOString(),
  });
  expect(loadQuizState(storage, now)).toEqual({
    answers: [answer],
    currentStep: 1,
  });
  clearQuizState(storage);
  expect(loadQuizState(storage)).toEqual(createInitialQuizState());

  const contaminated = JSON.stringify({
    answers: [answer, { questionId: "medical", optionId: "free-text" }],
    currentStep: 1,
    email: "visitante@example.com",
    phone: "000000000",
    note: "texto livre",
  });
  expect(parseQuizState(contaminated)).toEqual(createInitialQuizState());
});

test("storage expirado há mais de 30 dias é removido automaticamente", () => {
  const storage = new MemoryStorage();
  const savedAt = new Date("2026-06-01T12:00:00.000Z");
  saveQuizState(createInitialQuizState(), storage, savedAt);
  const afterExpiration = new Date(
    savedAt.getTime() + quizStorageMaxAgeMs + 1,
  );
  expect(inspectQuizStoredState(storage.getItem(quizStorageKey), afterExpiration).status).toBe(
    "expired",
  );
  expect(loadQuizState(storage, afterExpiration)).toEqual(createInitialQuizState());
  expect(storage.getItem(quizStorageKey)).toBeNull();
});

test("storage corrompido ou com campo pessoal é descartado", () => {
  const storage = new MemoryStorage();
  storage.setItem(
    quizStorageKey,
    JSON.stringify({
      version: quizStorageVersion,
      savedAt: new Date().toISOString(),
      answers: [],
      currentStep: -1,
      email: "visitante@example.com",
    }),
  );
  expect(loadQuizState(storage)).toEqual(createInitialQuizState());
  expect(storage.getItem(quizStorageKey)).toBeNull();

  storage.setItem(quizStorageKey, "{json-corrompido");
  expect(loadQuizState(storage)).toEqual(createInitialQuizState());
  expect(storage.getItem(quizStorageKey)).toBeNull();
});

test("formato legado é migrado com segurança sem trocar a chave", () => {
  const storage = new MemoryStorage();
  const answer = answersForProfile("gradual-consistency")[0];
  if (answer === undefined) throw new Error("Resposta legada ausente.");
  storage.setItem(
    quizStorageKey,
    JSON.stringify({ answers: [answer], currentStep: 1 }),
  );
  const now = new Date("2026-07-14T16:00:00.000Z");
  expect(loadQuizState(storage, now)).toEqual({
    answers: [answer],
    currentStep: 1,
  });
  const migrated = JSON.parse(storage.getItem(quizStorageKey) ?? "{}") as {
    version?: unknown;
    savedAt?: unknown;
  };
  expect(migrated.version).toBe(quizStorageVersion);
  expect(migrated.savedAt).toBe(now.toISOString());
});

test("tela inicial apresenta escopo, duração e privacidade", async ({ page }) => {
  await page.goto("/quiz");
  await expect(page).toHaveURL(/\/quiz\/?$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Qual tipo de rotina combina com o seu momento?",
    }),
  ).toBeVisible();
  await expect(page.getByText("Leva cerca de 1 minuto.")).toBeVisible();
  await expect(page.getByText(/não solicita dados pessoais/)).toBeVisible();
  await expect(page.locator(".site-header, .site-footer")).toHaveCount(0);
});

test("seleção, avanço e progresso mostram uma pergunta por etapa", async ({
  page,
}) => {
  await startQuiz(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    quizQuestions[0]?.title ?? "",
  );
  await expect(page.getByRole("radio")).toHaveCount(3);
  await expect(page.locator("fieldset")).toHaveCount(1);
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "1",
  );
  await page.getByRole("radio").nth(1).check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    quizQuestions[1]?.title ?? "",
  );
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "2",
  );
  await expect(page.getByRole("radio")).toHaveCount(3);
});

test("erro é associado ao grupo quando nenhuma resposta foi escolhida", async ({
  page,
}) => {
  await startQuiz(page);
  await page.getByRole("button", { name: "Continuar" }).click();
  const error = page.getByText("Escolha uma resposta para continuar.");
  await expect(error).toBeVisible();
  await expect(page.locator("fieldset")).toHaveAttribute(
    "aria-describedby",
    "quiz-error-routine-approach",
  );
  await expect(page.locator("fieldset")).toHaveAttribute("aria-invalid", "true");
});

test("voltar permite alterar resposta e devolve foco ao título", async ({
  page,
}) => {
  await startQuiz(page);
  await page.getByRole("radio").nth(0).check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Voltar" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await expect(page.getByRole("radio").nth(0)).toBeChecked();
  await page.getByRole("radio").nth(2).check();
  await expect(page.getByRole("radio").nth(2)).toBeChecked();
});

test("refresh e retorno retomam etapa e resposta no dispositivo", async ({
  page,
}) => {
  await startQuiz(page);
  await page.getByRole("radio").nth(1).check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.reload();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "2",
  );
  await page.getByRole("button", { name: "Voltar" }).click();
  await expect(page.getByRole("radio").nth(1)).toBeChecked();
});

test("fluxo completo cria resultado retomável sem resposta na URL", async ({
  page,
}) => {
  await startQuiz(page);
  await completeQuiz(page, 0);
  await expect(page).toHaveURL(/\/quiz\/resultado$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Seu perfil é Começo simples." }),
  ).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(3);
  expect(new URL(page.url()).search).toBe("");
  expect(new URL(page.url()).hash).toBe("");
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: "Seu perfil é Começo simples." }),
  ).toBeVisible();
});

test("resultado inválido não inventa perfil e limpa o storage", async ({ page }) => {
  await page.goto("/quiz");
  await page.evaluate((key) => {
    localStorage.setItem(key, "{estado-corrompido");
  }, quizStorageKey);
  await page.goto("/quiz/resultado");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Este resultado não está disponível.",
    }),
  ).toBeVisible();
  await expect(page.getByText(/Nenhum resultado é criado/)).toBeVisible();
  await expect(page.getByText(/Seu perfil é/)).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, follow",
  );
  expect(
    await page.evaluate((key) => localStorage.getItem(key), quizStorageKey),
  ).toBeNull();
  await page.getByRole("button", { name: "Começar o quiz" }).click();
  await expect(page).toHaveURL(/\/quiz$/);
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "1",
  );
});

test("resultado não exibe oferta e aponta somente para composição", async ({
  page,
}) => {
  await startQuiz(page);
  await completeQuiz(page, 1);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Seu perfil é Constância gradual.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver composição" })).toHaveAttribute(
    "href",
    "/#composicao",
  );
  await expect(page.locator('a[href*="pay.yampi"], [class*="commercial"]')).toHaveCount(
    0,
  );
  await expect(page.getByText(/preço|pote|checkout|comprar/i)).toHaveCount(0);
});

test("recomeçar limpa conclusão, volta ao início e restaura foco", async ({
  page,
}) => {
  await startQuiz(page);
  await completeQuiz(page, 2);
  await page.getByRole("button", { name: "Recomeçar quiz" }).click();
  await expect(page).toHaveURL(/\/quiz$/);
  const title = page.getByRole("heading", {
    level: 1,
    name: "Qual tipo de rotina combina com o seu momento?",
  });
  await expect(title).toBeVisible();
  await expect(title).toBeFocused();
  const stored = await page.evaluate((key) => localStorage.getItem(key), quizStorageKey);
  expect(stored).toBeNull();
});

test("teclado seleciona resposta e mantém foco navegável", async ({ page }) => {
  await startQuiz(page);
  const firstRadio = page.getByRole("radio").first();
  await firstRadio.focus();
  await page.keyboard.press("Space");
  await expect(firstRadio).toBeChecked();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Continuar" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "2",
  );
});

test("eventos permanecem locais e nunca incluem respostas individuais", async ({
  page,
}) => {
  await page.goto("/quiz");
  const requests: string[] = [];
  const commerceEvents: unknown[] = [];
  const quizEvents: unknown[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET") requests.push(request.url());
  });
  await page.evaluate(() => {
    const events = globalThis as typeof globalThis & {
      __commerceEvents?: unknown[];
      __quizEvents?: unknown[];
    };
    events.__commerceEvents = [];
    events.__quizEvents = [];
    globalThis.addEventListener("belvitale:commerce", (event) => {
      events.__commerceEvents?.push((event as CustomEvent).detail);
    });
    globalThis.addEventListener("belvitale:quiz", (event) => {
      events.__quizEvents?.push((event as CustomEvent).detail);
    });
  });
  await page.getByRole("button", { name: "Começar o quiz" }).click();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Continuar" }).click();
  const captured = await page.evaluate(() => {
    const events = globalThis as typeof globalThis & {
      __commerceEvents?: unknown[];
      __quizEvents?: unknown[];
    };
    return {
      commerce: events.__commerceEvents ?? [],
      quiz: events.__quizEvents ?? [],
    };
  });
  commerceEvents.push(...captured.commerce);
  quizEvents.push(...captured.quiz);
  expect(requests).toEqual([]);
  expect(commerceEvents).toEqual([]);
  expect(quizEvents).toEqual([
    { event: "quiz_start", payload: { source: "quiz" } },
    {
      event: "quiz_step_complete",
      payload: { source: "quiz", step: 1 },
    },
  ]);
  expect(JSON.stringify(quizEvents)).not.toMatch(/question|option|answer/i);
});

test("metadados aprovados indexam somente a entrada do quiz", async ({
  page,
}) => {
  await page.goto("/quiz");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "index, follow",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://example.test/quiz",
  );
  for (const property of [
    "og:title",
    "og:description",
    "og:type",
    "og:url",
  ]) {
    await expect(page.locator(`meta[property="${property}"]`)).toHaveCount(1);
  }
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  await expect(page).toHaveTitle("Quiz de rotina | Belvitale");

  await page.goto("/quiz/resultado");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, follow",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://example.test/quiz",
  );
  await page.goto("/");
  await expect(page.locator('a[href="/quiz"]')).toHaveCount(1);
});

test("CTA aprovado leva da homepage ao quiz sem entrar no hero", async ({
  page,
}) => {
  await page.goto("/");
  const ctaSection = page.locator(".home-quiz-cta");
  await expect(ctaSection).toBeVisible();
  await expect(
    ctaSection.getByRole("heading", {
      level: 2,
      name: "Entenda qual tipo de rotina combina com seu momento",
    }),
  ).toBeVisible();
  await expect(page.locator(".institutional-hero a[href='/quiz']")).toHaveCount(0);
  await ctaSection.getByRole("link", { name: "Fazer o quiz" }).click();
  await expect(page).toHaveURL(/\/quiz\/?$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Qual tipo de rotina combina com o seu momento?",
    }),
  ).toBeVisible();
});

test("camada local remove campos não permitidos do payload", () => {
  const events: LocalQuizEvent[] = [];
  const unsubscribe = subscribeToQuizEvents((event) => events.push(event));
  const contaminatedPayload = {
    source: "quiz",
    step: 2,
    questionId: "routine-approach",
    optionId: "routine-approach-a",
    email: "visitante@example.com",
  } as unknown as QuizEventPayload;
  recordQuizEvent("quiz_step_complete", contaminatedPayload);
  unsubscribe();
  expect(events).toEqual([
    {
      event: "quiz_step_complete",
      payload: { source: "quiz", step: 2 },
    },
  ]);
});

test("fallback sem JavaScript explica a limitação e oferece composição", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/quiz/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Qual tipo de rotina combina com o seu momento?",
    }),
  ).toBeVisible();
  await expect(page.getByText(/experiência interativa exige JavaScript/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver composição do CeluClin" })).toHaveAttribute(
    "href",
    "/#composicao",
  );
  await context.close();
});

test("reduced motion remove deslocamento e preserva o progresso", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await startQuiz(page);
  const animation = await page
    .locator(".quiz-step")
    .evaluate((element) => getComputedStyle(element).animationName);
  const transition = await page
    .locator(".quiz-progress span")
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(animation).toBe("none");
  expect(transition).toBe("0s");
  await expect(page.getByRole("progressbar")).toBeVisible();
});

for (const viewport of viewports) {
  test(`quiz permanece estável em ${String(viewport.width)}x${String(viewport.height)}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") problems.push(message.text());
    });
    page.on("pageerror", (error) => problems.push(error.message));
    await startQuiz(page);
    await expectNoHorizontalOverflow(page);
    await expect(page.getByRole("radio")).toHaveCount(3);
    expect(problems).toEqual([]);
  });
}

test("texto a 200% mantém início, pergunta e controles sem overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/quiz");
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  await expectNoHorizontalOverflow(page);
  await page.getByRole("button", { name: "Começar o quiz" }).click();
  await expectNoHorizontalOverflow(page);
  await expect(page.getByRole("radio")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "Continuar" })).toBeVisible();
});

test("perguntas e telas não contêm dados sensíveis ou claims proibidos", async ({
  page,
}) => {
  await page.goto("/quiz");
  const sourceText = JSON.stringify({ quizQuestions, quizProfiles });
  expect(sourceText).not.toMatch(
    /peso|medidas corporais|doença|medicamento|gestação|grau de celulite|tratamento ideal|protocolo perfeito|resultado personalizado|elimine|combata|reduza|transforme|em quantos dias/i,
  );
  await expect(
    page.locator('input[type="text"], input[type="email"], input[type="tel"], textarea'),
  ).toHaveCount(0);
  await expect(page.getByText(/WhatsApp|diagnóstico gratuito|seu corpo precisa/i)).toHaveCount(
    0,
  );
});
