export type QuizExperimentVariant = "rhythm-curiosity-v3" | "rhythm-routine-v3";

export interface QuizExperimentConfig {
  readonly id: QuizExperimentVariant;
  readonly opening: "curiosity" | "routine";
  readonly interactionCount: 6;
  readonly firstCheckpointAfter: 2 | 3;
  readonly resultOrder: "utility-before-proof" | "proof-before-product";
  readonly ctaMode: "specific-duration" | "generic-plan";
}

const experimentRegistry: Readonly<
  Record<QuizExperimentVariant, QuizExperimentConfig>
> = {
  "rhythm-curiosity-v3": {
    id: "rhythm-curiosity-v3",
    opening: "curiosity",
    interactionCount: 6,
    firstCheckpointAfter: 2,
    resultOrder: "utility-before-proof",
    ctaMode: "specific-duration",
  },
  "rhythm-routine-v3": {
    id: "rhythm-routine-v3",
    opening: "routine",
    interactionCount: 6,
    firstCheckpointAfter: 3,
    resultOrder: "utility-before-proof",
    ctaMode: "specific-duration",
  },
};

const defaultVariant: QuizExperimentVariant = "rhythm-curiosity-v3";
export const quizExperimentSessionKey = "belvitale:quiz:experiment:v1";

function isQuizExperimentVariant(
  value: unknown,
): value is QuizExperimentVariant {
  return value === "rhythm-curiosity-v3" || value === "rhythm-routine-v3";
}

function getSessionStorage(): Storage | null {
  try {
    return typeof sessionStorage === "undefined" ? null : sessionStorage;
  } catch {
    return null;
  }
}

export function getStableQuizExperiment(
  storage: Storage | null = getSessionStorage(),
  assignedVariant: string | undefined = import.meta.env
    .VITE_QUIZ_EXPERIMENT_VARIANT,
): QuizExperimentConfig {
  try {
    const stored = storage?.getItem(quizExperimentSessionKey);
    if (isQuizExperimentVariant(stored)) return experimentRegistry[stored];
  } catch {
    // A experiência continua com a variante padrão sem armazenamento.
  }

  const variant = isQuizExperimentVariant(assignedVariant)
    ? assignedVariant
    : defaultVariant;
  try {
    storage?.setItem(quizExperimentSessionKey, variant);
  } catch {
    // A atribuição continua estável durante o carregamento atual.
  }
  return experimentRegistry[variant];
}

export const quizExperimentCandidates = {
  opening: ["curiosity", "routine"],
  interactionCount: [6, 7],
  checkpointAfter: [2, 3],
  resultOrder: ["utility-before-proof", "proof-before-product"],
  ctaMode: ["specific-duration", "generic-plan"],
} as const;
