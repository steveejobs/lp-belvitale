import { commercialSignalMap } from "../content/questions";
import type {
  CommercialSignals,
  QuizAnswerMap,
  QuizPlanId,
  QuizRecommendation,
} from "./quiz.types";
import { isValidQuizAnswer } from "./quiz.validation";

export function deriveCommercialSignals(
  answers: QuizAnswerMap,
): CommercialSignals | null {
  const planningAnswer = answers["planning-horizon"];
  const commitmentAnswer = answers["honest-commitment"];
  if (
    planningAnswer === undefined ||
    commitmentAnswer === undefined ||
    !isValidQuizAnswer("planning-horizon", planningAnswer) ||
    !isValidQuizAnswer("honest-commitment", commitmentAnswer)
  ) {
    return null;
  }
  const planning = commercialSignalMap[planningAnswer];
  const commitment = commercialSignalMap[commitmentAnswer];
  if (
    planning?.planningPreference === undefined ||
    planning.replacementPreference === undefined ||
    planning.continuityPreference === undefined ||
    commitment?.declaredCommitment === undefined ||
    commitment.purchaseReadiness === undefined
  ) {
    return null;
  }
  return {
    declaredCommitment: commitment.declaredCommitment,
    continuityPreference: planning.continuityPreference,
    planningPreference: planning.planningPreference,
    replacementPreference: planning.replacementPreference,
    purchaseReadiness: commitment.purchaseReadiness,
  };
}

function planningReason(signals: CommercialSignals): string {
  if (signals.planningPreference === "long") return "você prefere planejar um horizonte mais longo";
  if (signals.planningPreference === "medium") return "você prefere organizar os próximos meses";
  if (signals.planningPreference === "flexible") return "você quer continuidade sem planejar tão longe";
  return "você prefere dar um passo antes de planejar a continuidade";
}

function recommendPlan(signals: CommercialSignals): QuizPlanId {
  if (
    signals.declaredCommitment === "explore" ||
    signals.declaredCommitment === "undecided"
  ) {
    return "30-days";
  }
  if (signals.declaredCommitment === "moderate") return "90-days";
  return signals.planningPreference === "short" ? "90-days" : "210-days";
}

function buildReasons(
  plan: QuizPlanId,
  signals: CommercialSignals,
): readonly [string, string, string] {
  if (plan === "30-days" && signals.declaredCommitment === "undecided") {
    return [
      "você ainda está entendendo a proposta",
      "você não quer decidir uma compra agora",
      "você não declarou compromisso de continuidade",
    ];
  }
  if (plan === "30-days") {
    return [
      "você quer conhecer antes de organizar continuidade",
      "você declarou conforto com um compromisso inicial baixo",
      planningReason(signals),
    ];
  }
  if (plan === "90-days" && signals.declaredCommitment === "long") {
    return [
      "você declarou conforto com um compromisso mais longo",
      "você também prefere dar um passo antes de planejar longe",
      "um horizonte moderado respeita essas duas respostas",
    ];
  }
  if (plan === "90-days") {
    return [
      "você declarou preferência por continuidade moderada",
      planningReason(signals),
      signals.replacementPreference === "fewer"
        ? "você quer reduzir decisões de reposição"
        : "você prefere uma continuidade flexível",
    ];
  }
  return [
    "você declarou explicitamente um compromisso de longo prazo",
    "você prefere um estoque prolongado",
    "você quer minimizar decisões de reposição",
  ];
}

export function calculateRecommendedPlan(
  answers: QuizAnswerMap,
): QuizRecommendation | null {
  const signals = deriveCommercialSignals(answers);
  if (signals === null) return null;
  const plan = recommendPlan(signals);
  return {
    plan,
    signals,
    reasons: buildReasons(plan, signals),
    conditional: signals.purchaseReadiness === "not-ready",
  };
}
