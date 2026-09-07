import type { QuizAnswers, QuizRecommendation } from "./quiz.types";

const historyReasons: Readonly<Record<string, string>> = {
  "start-stop": "Você contou que costuma começar animada e parar depois; reduzir novas decisões pode ajudar a proteger a continuidade.",
  research: "Você prefere pesquisar antes de comprar, então a recomendação precisa ser simples de conferir e proporcional ao seu nível de segurança.",
  disappointed: "Como você já investiu em produtos que não atenderam às expectativas, os critérios e limites precisam continuar visíveis.",
  "still-looking": "Você ainda procura algo que faça sentido, sem transformar curiosidade em uma promessa maior do que existe.",
};

const futureReasons: Readonly<Record<string, string>> = {
  trust: "Você disse que quer voltar a confiar em si; a escolha precisa respeitar seu ritmo, não pressioná-la.",
  "lasting-routine": "Você quer uma rotina que consiga manter; três frascos evitam reabrir a decisão no próximo mês.",
  "simple-care": "Você procura cuidado sem complicação; 90 dias organizam a reposição com menos decisões no caminho.",
  "stop-restarting": "Você quer parar de recomeçar; 90 dias oferecem uma janela de continuidade sem prometer resultado físico em prazo fixo.",
};

/**
 * Regra editorial, não diagnóstica: 90 dias é o caminho central. Um sinal
 * explícito de recomeço + continuidade + planejamento marca a pessoa como
 * pronta para uma futura opção estendida, mas não muda a oferta enquanto o
 * único kit longo cadastrado não for comercialmente defensável. Aparência,
 * intensidade física e preocupação corporal nunca decidem duração.
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

  const disposition = historyOptionId === "start-stop" &&
    (futureGoalOptionId === "lasting-routine" || futureGoalOptionId === "stop-restarting") &&
    decisionWeightOptionId === "a-path"
    ? "extended-ready"
    : "standard";

  return {
    offerId: "three-months",
    disposition,
    reasons: [
      futureReasons[futureGoalOptionId] ?? "Você indicou que deseja construir uma rotina possível.",
      disposition === "extended-ready"
        ? "Suas respostas mostram disposição para planejar por mais tempo; hoje mantemos 90 dias porque é a maior opção comercialmente defensável disponível."
        : historyReasons[historyOptionId] ?? "Três frascos reduzem a necessidade de uma nova decisão no próximo mês.",
    ],
    commercialInputs: { historyOptionId, decisionWeightOptionId, futureGoalOptionId },
  };
}

export function isConcernIndependentFromRecommendation(baseline: QuizAnswers): boolean {
  return calculateRecommendedPlan(baseline) !== null;
}
