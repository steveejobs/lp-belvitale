export const quizVersion = "4.0.0" as const;

export const quizDimensionIds = [
  "dailyImpact",
  "routineFriction",
  "startStyle",
  "recoveryCapacity",
  "planningHorizon",
  "proofPreference",
  "replacementTolerance",
  "commitmentComfort",
  "purchaseReadiness",
  "continuityPreference",
] as const;

export type QuizDimensionId = (typeof quizDimensionIds)[number];
export type QuizDimensionVector = Readonly<Record<QuizDimensionId, number>>;

export const quizQuestionIds = [
  "appearance-moment",
  "way-of-starting",
  "routine-friction",
  "after-a-missed-day",
  "trust-language",
  "planning-horizon",
  "honest-commitment",
] as const;

export type QuizQuestionId = (typeof quizQuestionIds)[number];
export type QuizPresentation = "scenario" | "cards" | "scale";

export interface QuizOption {
  readonly id: string;
  readonly label: string;
  readonly detail?: string;
  readonly impact: Partial<QuizDimensionVector>;
}

export interface QuizQuestion {
  readonly id: QuizQuestionId;
  readonly eyebrow: string;
  readonly prompt: string;
  readonly context: string;
  readonly presentation: QuizPresentation;
  readonly options: readonly QuizOption[];
  readonly commercial: boolean;
}

export type QuizAnswerMap = Readonly<Partial<Record<QuizQuestionId, string>>>;

export const quizProfileIds = [
  "fresta-no-dia",
  "fio-que-volta",
  "ancora-leve",
  "olhar-de-lupa",
] as const;

export type QuizProfileId = (typeof quizProfileIds)[number];

export interface QuizProfileContent {
  readonly id: QuizProfileId;
  readonly name: string;
  readonly recognition: string;
  readonly starts: string;
  readonly interruptionRisk: string;
  readonly maintenance: string;
  readonly sevenDayRitual: readonly string[];
  readonly proofHelp: string;
  readonly center: Readonly<
    Pick<
      QuizDimensionVector,
      | "dailyImpact"
      | "routineFriction"
      | "startStyle"
      | "recoveryCapacity"
      | "proofPreference"
    >
  >;
}

export const quizPlanIds = ["30-days", "90-days", "210-days"] as const;
export type QuizPlanId = (typeof quizPlanIds)[number];

export type DeclaredCommitment = "explore" | "moderate" | "long" | "undecided";
export type ContinuityPreference = "first-step" | "steady" | "extended" | "open";
export type PlanningPreference = "short" | "medium" | "long" | "flexible";
export type ReplacementPreference = "as-needed" | "fewer" | "fewest" | "neutral";
export type PurchaseReadiness = "trial-ready" | "ready" | "long-ready" | "not-ready";

export interface CommercialSignals {
  readonly declaredCommitment: DeclaredCommitment;
  readonly continuityPreference: ContinuityPreference;
  readonly planningPreference: PlanningPreference;
  readonly replacementPreference: ReplacementPreference;
  readonly purchaseReadiness: PurchaseReadiness;
}

export interface QuizRecommendation {
  readonly plan: QuizPlanId;
  readonly signals: CommercialSignals;
  readonly reasons: readonly [string, string, string];
  readonly conditional: boolean;
}

export interface QuizCalculation {
  readonly profile: QuizProfileId;
  readonly dimensions: QuizDimensionVector;
  readonly distances: Readonly<Record<QuizProfileId, number>>;
}

export interface QuizOfferContent {
  readonly id: QuizPlanId;
  readonly title: string;
  readonly durationLabel: string;
  readonly bottles: number;
  readonly paidBottles: number;
  readonly additionalBottles: number;
  readonly totalCapsules: number;
  readonly checkoutUrl: string;
  readonly imageAlt: string;
  readonly bestFor: string;
  readonly priceStatus: "blocked";
  readonly checkoutStatus: "verified";
}

export const quizSceneIds = [
  "intro",
  "appearance-moment",
  "way-of-starting",
  "insight-start",
  "routine-friction",
  "story-bridge",
  "after-a-missed-day",
  "trust-language",
  "proof-and-insight",
  "planning-horizon",
  "honest-commitment",
  "anticipation",
  "result",
  "offer",
] as const;

export type QuizSceneId = (typeof quizSceneIds)[number];

export interface QuizMachineState {
  readonly version: typeof quizVersion;
  readonly scene: QuizSceneId;
  readonly answers: QuizAnswerMap;
  readonly direction: "forward" | "backward";
  readonly startedAt?: string;
  readonly updatedAt: string;
  readonly completedAt?: string;
  readonly reviewFrom?: QuizQuestionId;
}
