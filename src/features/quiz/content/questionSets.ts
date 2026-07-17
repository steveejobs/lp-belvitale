export interface QuestionSetCandidate {
  readonly id: "set-a" | "set-b" | "set-c";
  readonly concept: string;
  readonly prompts: readonly [string, string, string, string, string, string, string, string];
  readonly evaluation: Readonly<Record<
    "specificity" | "naturalness" | "differentiation" | "commercialRelevance" | "emotionalIdentification" | "nonJudgment" | "mobileClarity" | "diversity" | "narrativePotential" | "obviousAnswerRisk" | "manipulationRisk",
    number
  >>;
}

export const questionSetCandidates: readonly QuestionSetCandidate[] = [
  {
    id: "set-a",
    concept: "Espelho e intenção",
    prompts: [
      "Em qual cena você repara primeiro?",
      "Qual aspecto chama sua atenção?",
      "O que esse incômodo muda?",
      "Como seus cuidados anteriores começaram?",
      "O que interrompeu o caminho?",
      "Como você costuma voltar?",
      "Qual prova reduz sua dúvida?",
      "Que compromisso parece possível agora?",
    ],
    evaluation: { specificity: 7, naturalness: 7, differentiation: 7, commercialRelevance: 8, emotionalIdentification: 8, nonJudgment: 9, mobileClarity: 9, diversity: 7, narrativePotential: 8, obviousAnswerRisk: 6, manipulationRisk: 2 },
  },
  {
    id: "set-b",
    concept: "Decisões que pesam",
    prompts: [
      "Quando seu olhar muda de direção?",
      "O que ele encontra?",
      "Qual escolha fica menos espontânea?",
      "O que você já tentou organizar?",
      "Onde a continuidade travou?",
      "O que torna a retomada possível?",
      "Que evidência merece seu tempo?",
      "Que horizonte reduz decisões?",
    ],
    evaluation: { specificity: 8, naturalness: 6, differentiation: 8, commercialRelevance: 8, emotionalIdentification: 8, nonJudgment: 9, mobileClarity: 7, diversity: 8, narrativePotential: 9, obviousAnswerRisk: 5, manipulationRisk: 3 },
  },
  {
    id: "set-c",
    concept: "Cenas reais, escolha simples",
    prompts: [
      "Qual momento faz você pensar em voltar a se cuidar?",
      "Hoje, o que mais chama sua atenção?",
      "Quando isso incomoda, o que muda primeiro?",
      "Qual frase descreve melhor sua história?",
      "Quando a rotina falha, como você retoma?",
      "O que mais ajuda você a confiar?",
      "Qual posição é honesta hoje?",
      "Qual continuidade combina com seu momento?",
    ],
    evaluation: { specificity: 9, naturalness: 9, differentiation: 9, commercialRelevance: 9, emotionalIdentification: 9, nonJudgment: 10, mobileClarity: 10, diversity: 9, narrativePotential: 9, obviousAnswerRisk: 3, manipulationRisk: 1 },
  },
];

export const selectedQuestionSetId = "set-c" as const;
