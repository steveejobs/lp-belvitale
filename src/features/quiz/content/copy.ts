import type { QuizStageId } from "../domain/quiz.types";

export const stagePurpose: Readonly<Record<QuizStageId, string>> = {
  opening: "Descoberta",
  name: "Personalização",
  perception: "Identificação",
  "first-thought": "Identificação",
  "situation-weight": "Identificação",
  "insight-one": "Primeira leitura",
  reaction: "Rotina",
  avoidance: "Rotina",
  "deepest-impact": "Rotina",
  "restart-trigger": "Rotina",
  "insight-two": "Segunda leitura",
  history: "Histórico",
  dropoff: "Histórico",
  "decision-weight": "Histórico",
  "future-scene": "Futuro",
  "future-goal": "Futuro",
  "insight-three": "Síntese",
  result: "Seu resultado",
  offer: "Escolha simples",
};

export const legalProofNote = "Experiências reais autorizadas. Resultados individuais podem variar. As imagens não determinam sua recomendação.";
