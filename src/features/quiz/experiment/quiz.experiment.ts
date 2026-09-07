export const quizExperimentId = "opening-cta-v1" as const;
export const quizExperimentStorageKey = "belvitale.quiz.experiment.opening-cta-v1";

export type QuizExperimentVariant = "a" | "b";

export interface QuizExperimentAssignment {
  readonly experimentId: typeof quizExperimentId;
  readonly variant: QuizExperimentVariant;
  readonly source: "random" | "stored" | "forced";
}

function forcedVariant(search: string): QuizExperimentVariant | null {
  const value = new URLSearchParams(search).get("ab")?.toLowerCase();
  return value === "a" || value === "b" ? value : null;
}

function storedVariant(storage: Storage): QuizExperimentVariant | null {
  try {
    const value = storage.getItem(quizExperimentStorageKey);
    return value === "a" || value === "b" ? value : null;
  } catch {
    return null;
  }
}

export function getQuizExperimentAssignment(
  search = typeof window === "undefined" ? "" : window.location.search,
  storage = typeof window === "undefined" ? undefined : window.localStorage,
  random = Math.random,
): QuizExperimentAssignment {
  const forced = forcedVariant(search);
  if (forced !== null) return { experimentId: quizExperimentId, variant: forced, source: "forced" };

  if (storage !== undefined) {
    const stored = storedVariant(storage);
    if (stored !== null) return { experimentId: quizExperimentId, variant: stored, source: "stored" };
  }

  const variant: QuizExperimentVariant = random() < 0.5 ? "a" : "b";
  try { storage?.setItem(quizExperimentStorageKey, variant); } catch { /* continua sem persistência */ }
  return { experimentId: quizExperimentId, variant, source: "random" };
}

export function clearQuizExperimentAssignment(storage: Storage = localStorage): void {
  try { storage.removeItem(quizExperimentStorageKey); } catch { /* armazenamento indisponível */ }
}

export const quizExperimentVariants = {
  a: {
    name: "Controle",
    openingCta: "Começar agora",
  },
  b: {
    name: "Benefício",
    openingCta: "Descobrir meu caminho",
  },
} as const satisfies Readonly<Record<QuizExperimentVariant, Readonly<{ name: string; openingCta: string }>>>;
