import { browserStorage, clearStableAssignment, resolveStableAssignment } from "./stableAssignment";
export const quizExperimentId = "opening-cta-v1" as const;
export const quizExperimentStorageKey = "belvitale.quiz.experiment.opening-cta-v1";

export type QuizExperimentVariant = "a" | "b";

export interface QuizExperimentAssignment {
  readonly experimentId: typeof quizExperimentId;
  readonly variant: QuizExperimentVariant;
  readonly source: "random" | "stored" | "forced";
}

export function getQuizExperimentAssignment(
  search = typeof window === "undefined" ? "" : window.location.search,
  storage = browserStorage(),
  random = Math.random,
): QuizExperimentAssignment {
  return { experimentId: quizExperimentId, ...resolveStableAssignment(quizExperimentStorageKey, search, storage, random) };
}

export function clearQuizExperimentAssignment(storage = browserStorage()): void {
  clearStableAssignment(quizExperimentStorageKey, storage);
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
