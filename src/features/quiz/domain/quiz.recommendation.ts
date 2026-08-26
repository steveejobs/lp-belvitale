import type { QuizAnswers, QuizRecommendation } from "./quiz.types";

/**
 * A consultoria não incluiu perguntas comerciais suficientes para justificar
 * estoque curto ou prolongado. A recomendação permanece honesta: 90 dias é a
 * sugestão editorial para constância; 30 e 210 dias seguem disponíveis para
 * comparação, sem inferir eficácia a partir do corpo.
 */
export function calculateRecommendedPlan(answers: QuizAnswers): QuizRecommendation | null {
  const historyOptionId = answers.history;
  const decisionWeightOptionId = answers["decision-weight"];
  const futureGoalOptionId = answers["future-goal"];
  if (
    typeof historyOptionId !== "string" ||
    typeof decisionWeightOptionId !== "string" ||
    typeof futureGoalOptionId !== "string"
  ) return null;

  return {
    offerId: "three-months",
    reasons: [
      "Você mostrou que busca constância sem transformar o cuidado em mais uma tarefa complicada.",
      "Três frascos organizam aproximadamente 90 dias e reduzem a necessidade de recomeçar a decisão no próximo mês.",
    ],
    commercialInputs: { historyOptionId, decisionWeightOptionId, futureGoalOptionId },
  };
}

export function isConcernIndependentFromRecommendation(baseline: QuizAnswers): boolean {
  return calculateRecommendedPlan(baseline)?.offerId === "three-months";
}
