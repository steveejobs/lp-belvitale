export const QUIZ_VERSION = "6.0.0" as const;

export const quizStageIds = [
  "opening",
  "name",
  "trigger",
  "concern",
  "insight-one",
  "impact",
  "attempts",
  "story",
  "recovery",
  "proof-preference",
  "proof",
  "insight-two",
  "readiness",
  "continuity",
  "anticipation",
  "result",
  "offer",
] as const;

export type QuizStageId = (typeof quizStageIds)[number];

export const quizQuestionIds = [
  "trigger",
  "concern",
  "impact",
  "attempts",
  "recovery",
  "proof-preference",
  "readiness",
  "continuity",
] as const;

export type QuizQuestionId = (typeof quizQuestionIds)[number];
export type ConcernId = "cellulite" | "firmness" | "contour" | "balanced";
export type OfferId = "one-month" | "three-months" | "seven-months";
export type NarrativeProfileId =
  | "clear-first"
  | "return-ready"
  | "proof-led"
  | "continuity-minded";

export type QuestionPresentation =
  | "scenario"
  | "media"
  | "binary"
  | "sentence"
  | "scale"
  | "comparison";

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
  readonly concern?: ConcernId;
  readonly narrative?: Readonly<Partial<Record<NarrativeDimension, number>>>;
  readonly commercialTag?:
    | "try-first"
    | "months-ready"
    | "stock-ready"
    | "compare-first"
    | "know-first"
    | "moderate-continuity"
    | "fewer-replacements"
    | "long-stock";
}

export interface QuizQuestion {
  readonly id: QuizQuestionId;
  readonly eyebrow: string;
  readonly prompt: string;
  readonly hint: string;
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
    readinessOptionId: string;
    continuityOptionId: string;
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
