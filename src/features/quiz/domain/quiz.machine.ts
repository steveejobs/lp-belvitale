import { quizStageIds, type QuizStageId } from "./quiz.types";

export interface QuizStageDefinition {
  readonly id: QuizStageId;
  readonly kind: "opening" | "name" | "question" | "insight" | "result" | "offer";
}

export const quizStageDefinitions: readonly QuizStageDefinition[] = quizStageIds.map((id) => ({
  id,
  kind: id === "opening" || id === "name" || id === "result" || id === "offer"
    ? id
    : id.startsWith("insight-")
      ? "insight"
      : "question",
}));

export function getNextStage(stageId: QuizStageId): QuizStageId {
  const index = quizStageIds.indexOf(stageId);
  return quizStageIds[Math.min(index + 1, quizStageIds.length - 1)] ?? "opening";
}

export function getPreviousStage(stageId: QuizStageId): QuizStageId {
  const index = quizStageIds.indexOf(stageId);
  return quizStageIds[Math.max(0, index - 1)] ?? "opening";
}

export function getStageNumber(stageId: QuizStageId): number {
  return quizStageIds.indexOf(stageId) + 1;
}
