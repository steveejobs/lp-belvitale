export const QUIZ_VERSION = "7.0.0" as const;

export const quizStageIds = [
  "opening",
  "name",
  "perception",
  "first-thought",
  "situation-weight",
  "insight-one",
  "reaction",
  "avoidance",
  "deepest-impact",
  "restart-trigger",
  "insight-two",
  "history",
  "dropoff",
  "decision-weight",
  "future-scene",
  "future-goal",
  "insight-three",
  "result",
  "offer",
] as const;

export type QuizStageId = (typeof quizStageIds)[number];

export const quizQuestionIds = [
  "perception",
  "first-thought",
  "situation-weight",
  "reaction",
  "avoidance",
  "deepest-impact",
  "restart-trigger",
  "history",
  "dropoff",
  "decision-weight",
  "future-scene",
  "future-goal",
] as const;

export type QuizQuestionId = (typeof quizQuestionIds)[number];
export type ConcernId = "cellulite" | "firmness" | "contour" | "balanced";
export type OfferId = "one-month" | "three-months" | "seven-months";
export type NarrativeProfileId =
  | "clear-first"
  | "return-ready"
  | "proof-led"
  | "continuity-minded";

export type QuestionPresentation = "scenario" | "sentence" | "compact" | "media";

export type NarrativeDimension =
  | "actionBias"
  | "clarityNeed"
  | "recoveryCapacity"
  | "structurePreference"
  | "proofNeed";

export interface QuizOption {
  readonly id: string;
  readonly label: string;
  readonly detail?: string;
  readonly shortLabel?: string;
  readonly narrative?: Readonly<Partial<Record<NarrativeDimension, number>>>;
}

export interface QuizQuestion {
  readonly id: QuizQuestionId;
  readonly block: "Identificação" | "Rotina" | "Histórico" | "Futuro";
  readonly eyebrow: string;
  readonly prompt: string;
  readonly hint?: string;
  readonly presentation: QuestionPresentation;
  readonly autoAdvance: boolean;
  readonly options: readonly QuizOption[];
}

export type QuizAnswers = Readonly<Partial<Record<QuizQuestionId, string>>>;

export interface QuizProfileResult {
  readonly id: NarrativeProfileId;
  readonly confidence: "clear" | "blended";
  readonly distances: Readonly<Record<NarrativeProfileId, number>>;
  readonly dimensions: Readonly<Record<NarrativeDimension, number>>;
}

export interface QuizRecommendation {
  readonly offerId: OfferId;
  readonly reasons: readonly string[];
  readonly commercialInputs: Readonly<{
    historyOptionId: string;
    decisionWeightOptionId: string;
    futureGoalOptionId: string;
  }>;
}

export interface QuizSessionState {
  readonly version: typeof QUIZ_VERSION;
  readonly sessionId: string;
  readonly stageId: QuizStageId;
  readonly visitedStageIds: readonly QuizStageId[];
  readonly answers: QuizAnswers;
  readonly firstName: string;
  readonly nameProvided: boolean;
  readonly selectedOfferId?: OfferId;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly savedAt: string;
  readonly expiresAt: string;
}

export type QuizDirection = "forward" | "backward";
export type QuizStagePhase = "enter" | "active" | "exit";

export type QuizAction =
  | { readonly type: "START"; readonly now: string }
  | { readonly type: "SET_NAME"; readonly value: string; readonly provided: boolean }
  | { readonly type: "ANSWER"; readonly questionId: QuizQuestionId; readonly optionId: string }
  | { readonly type: "GO_TO"; readonly stageId: QuizStageId }
  | { readonly type: "SELECT_OFFER"; readonly offerId: OfferId }
  | { readonly type: "COMPLETE"; readonly now: string }
  | { readonly type: "SYNC"; readonly state: QuizSessionState }
  | { readonly type: "RESTART"; readonly state: QuizSessionState };
