import type { OfferId, QuizAnswers, QuizRecommendation } from "./quiz.types";
import { getQuizOption } from "../content/questions";

export function calculateRecommendedPlan(answers: QuizAnswers): QuizRecommendation | null {
  const readinessOptionId = answers.readiness;
  const continuityOptionId = answers.continuity;
  if (typeof readinessOptionId !== "string" || typeof continuityOptionId !== "string") return null;

  const readiness = getQuizOption("readiness", readinessOptionId)?.commercialTag;
  const continuity = getQuizOption("continuity", continuityOptionId)?.commercialTag;
  if (readiness === undefined || continuity === undefined) return null;

  let offerId: OfferId = "three-months";
  if (
    (readiness === "try-first" && continuity !== "long-stock") ||
    (readiness === "compare-first" && continuity === "know-first")
  ) {
    offerId = "one-month";
  } else if (
    (readiness === "stock-ready" && (continuity === "fewer-replacements" || continuity === "long-stock")) ||
    (readiness === "months-ready" && continuity === "long-stock")
  ) {
    offerId = "seven-months";
  }

  const reasons: Readonly<Record<OfferId, readonly string[]>> = {
    "one-month": [
      "Você declarou preferência por conhecer antes de organizar continuidade.",
      "Um compromisso inicial menor combina com a posição que você escolheu hoje.",
    ],
    "three-months": [
      "Você indicou preferência por continuidade moderada e menos reposições.",
      "Três frascos organizam aproximadamente 90 dias sem planejar um estoque tão longo.",
    ],
    "seven-months": [
      "Você declarou preferência por estoque prolongado e poucas reposições.",
      "Sete frascos concentram a compra em uma decisão, sem afirmar maior eficácia.",
    ],
  };

  return {
    offerId,
    reasons: reasons[offerId],
    commercialInputs: { readinessOptionId, continuityOptionId },
  };
}

export function isConcernIndependentFromRecommendation(
  baseline: QuizAnswers,
): boolean {
  const plans = ["cellulite", "firmness", "contour", "balanced"].map((concern) =>
    calculateRecommendedPlan({ ...baseline, concern })?.offerId,
  );
  return plans.every((plan) => plan === plans[0]);
}
