import {
  commercialOffers,
  commercialPublicationReady,
  isValidCheckoutUrl,
  type CommercialOffer,
} from "../data/commercialOffers";
import {
  commercialPreviewReady,
  getCheckoutUrlWithUtms,
} from "../data/commercialPreview";
import { quizPreviewEnabled } from "../data/quizPublicationConfig";
import type { QuizDimensionVector } from "./quizScoring";

export type QuizPlan = "30-days" | "90-days" | "210-days";

interface PlanSignals {
  readonly commitment: number;
  readonly consistency: number;
  readonly planning: number;
  readonly fewerReplacements: number;
  readonly convenience: number;
}

interface QuizPlanDefinition {
  readonly id: QuizPlan;
  readonly offerId: CommercialOffer["id"];
  readonly title: string;
  readonly duration: string;
  readonly cta: string;
  readonly rationale: string;
  readonly secondaryCopy: string;
  readonly center: PlanSignals;
}

export interface QuizPlanCalculation {
  readonly plan: QuizPlan;
  readonly signals: PlanSignals;
  readonly distances: Readonly<Record<QuizPlan, number>>;
}

export interface QuizCommercialRecommendation {
  readonly plan: QuizPlan;
  readonly offer: CommercialOffer;
  readonly disclosure: "Opção sugerida para o seu ritmo";
  readonly title: string;
  readonly duration: string;
  readonly cta: string;
  readonly checkoutUrl: string;
  readonly rationale: string;
  readonly secondaryCopy: string;
}

export const quizPlanOrder = [
  "30-days",
  "90-days",
  "210-days",
] as const satisfies readonly QuizPlan[];

export const quizPlanDefinitions: Readonly<
  Record<QuizPlan, QuizPlanDefinition>
> = {
  "30-days": {
    id: "30-days",
    offerId: "one-month",
    title: "30 dias",
    duration: "1 frasco · aproximadamente 30 dias",
    cta: "Começar com 30 dias",
    rationale:
      "Você sinalizou preferência por conhecer primeiro, assumir um compromisso inicial menor e decidir a continuidade depois.",
    secondaryCopy: "Para experimentar a rotina antes de planejar o próximo período.",
    center: {
      commitment: 22,
      consistency: 28,
      planning: 30,
      fewerReplacements: 14,
      convenience: 40,
    },
  },
  "90-days": {
    id: "90-days",
    offerId: "three-months",
    title: "90 dias",
    duration: "3 frascos · aproximadamente 90 dias",
    cta: "Escolher 90 dias",
    rationale:
      "Seu conjunto combina vontade de organizar alguns meses com flexibilidade e menos decisões de reposição no curto prazo.",
    secondaryCopy: "Para equilibrar planejamento, flexibilidade e menos reposições.",
    center: {
      commitment: 54,
      consistency: 44,
      planning: 56,
      fewerReplacements: 42,
      convenience: 52,
    },
  },
  "210-days": {
    id: "210-days",
    offerId: "seven-months",
    title: "7 meses",
    duration: "7 frascos · aproximadamente 210 dias",
    cta: "Escolher 7 meses",
    rationale:
      "Você mostrou preferência por planejar com antecedência, evitar interrupções de reposição e concentrar a compra em uma decisão.",
    secondaryCopy: "Para deixar um período mais longo encaminhado em uma única escolha.",
    center: {
      commitment: 78,
      consistency: 58,
      planning: 76,
      fewerReplacements: 74,
      convenience: 66,
    },
  },
};

const signalWeights: Readonly<Record<keyof PlanSignals, number>> = {
  commitment: 1.55,
  consistency: 0.65,
  planning: 1,
  fewerReplacements: 1.35,
  convenience: 0.55,
};

function getPlanSignals(vector: QuizDimensionVector): PlanSignals {
  return {
    commitment: vector.commitmentComfort,
    consistency: vector.consistency,
    planning: vector.planning,
    fewerReplacements: vector.replenishmentRelief,
    convenience:
      vector.simplicity * 0.35 +
      vector.planning * 0.2 +
      vector.replenishmentRelief * 0.3 +
      vector.consistency * 0.15,
  };
}

function getPlanDistance(signals: PlanSignals, plan: QuizPlan): number {
  const center = quizPlanDefinitions[plan].center;
  const keys = Object.keys(signalWeights) as readonly (keyof PlanSignals)[];
  const weightTotal = keys.reduce(
    (total, key) => total + signalWeights[key],
    0,
  );
  return Math.sqrt(
    keys.reduce((total, key) => {
      const difference = (signals[key] - center[key]) / 100;
      return total + signalWeights[key] * difference ** 2;
    }, 0) / weightTotal,
  );
}

export function calculateRecommendedPlan(
  vector: QuizDimensionVector,
): QuizPlanCalculation {
  const signals = getPlanSignals(vector);
  const distances = Object.fromEntries(
    quizPlanOrder.map((plan) => [plan, getPlanDistance(signals, plan)]),
  ) as Readonly<Record<QuizPlan, number>>;
  const plan = [...quizPlanOrder].sort(
    (left, right) =>
      distances[left] - distances[right] ||
      quizPlanOrder.indexOf(left) - quizPlanOrder.indexOf(right),
  )[0];

  return { plan: plan ?? "90-days", signals, distances };
}

export function canShowQuizCommerce(): boolean {
  return (
    commercialPublicationReady ||
    (quizPreviewEnabled && commercialPreviewReady)
  );
}

function getConfirmedOffer(plan: QuizPlan): CommercialOffer | null {
  if (!canShowQuizCommerce()) return null;
  const definition = quizPlanDefinitions[plan];
  const offer = commercialOffers.find(
    (candidate) => candidate.id === definition.offerId,
  );
  if (
    offer?.checkoutStatus !== "confirmed" ||
    offer.contentsStatus !== "confirmed" ||
    !isValidCheckoutUrl(offer.checkoutUrl)
  ) {
    return null;
  }
  return offer;
}

export function resolveQuizRecommendation(
  vector: QuizDimensionVector,
  currentSearch = typeof window === "undefined" ? "" : window.location.search,
): QuizCommercialRecommendation | null {
  const calculation = calculateRecommendedPlan(vector);
  const definition = quizPlanDefinitions[calculation.plan];
  const offer = getConfirmedOffer(calculation.plan);
  if (offer === null) return null;

  return {
    plan: calculation.plan,
    offer,
    disclosure: "Opção sugerida para o seu ritmo",
    title: definition.title,
    duration: definition.duration,
    cta: definition.cta,
    checkoutUrl: getCheckoutUrlWithUtms(offer.checkoutUrl, currentSearch),
    rationale: definition.rationale,
    secondaryCopy: definition.secondaryCopy,
  };
}

export function getQuizPlanOptions(
  currentSearch = typeof window === "undefined" ? "" : window.location.search,
): readonly QuizCommercialRecommendation[] {
  return quizPlanOrder.flatMap((plan) => {
    const offer = getConfirmedOffer(plan);
    if (offer === null) return [];
    const definition = quizPlanDefinitions[plan];
    return [
      {
        plan,
        offer,
        disclosure: "Opção sugerida para o seu ritmo" as const,
        title: definition.title,
        duration: definition.duration,
        cta: definition.cta,
        checkoutUrl: getCheckoutUrlWithUtms(offer.checkoutUrl, currentSearch),
        rationale: definition.rationale,
        secondaryCopy: definition.secondaryCopy,
      },
    ];
  });
}

export function isQuizPlan(value: unknown): value is QuizPlan {
  return quizPlanOrder.some((plan) => plan === value);
}
