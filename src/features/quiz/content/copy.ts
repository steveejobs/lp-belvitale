import type { QuizStageId } from "../domain/quiz.types";

export const stagePurpose: Readonly<Record<QuizStageId, string>> = {
  opening: "Descoberta",
  name: "Personalização",
  trigger: "Identificação",
  concern: "Foco visual",
  "insight-one": "Primeira leitura",
  impact: "Impacto cotidiano",
  attempts: "Histórico real",
  story: "Mudança de ritmo",
  recovery: "Retomada",
  "proof-preference": "Confiança",
  proof: "Prova relevante",
  "insight-two": "Segunda leitura",
  readiness: "Prontidão",
  continuity: "Continuidade",
  anticipation: "Síntese",
  result: "Seu resultado",
  offer: "Escolha simples",
};

export const legalProofNote = "Experiências reais autorizadas. Resultados individuais podem variar. As imagens não determinam sua recomendação.";
