import { quizStageIds, type QuizStageId } from "./quiz.types";

export interface QuizStageDefinition {
  readonly id: QuizStageId;
  readonly kind: "opening" | "name" | "question" | "insight" | "story" | "proof" | "anticipation" | "result" | "offer";
  readonly adds: readonly ("identification" | "understanding" | "surprise" | "proof" | "progress" | "reward" | "decision")[];
}

export const quizStageDefinitions: readonly QuizStageDefinition[] = [
  { id: "opening", kind: "opening", adds: ["identification", "progress"] },
  { id: "name", kind: "name", adds: ["identification"] },
  { id: "trigger", kind: "question", adds: ["identification"] },
  { id: "concern", kind: "question", adds: ["understanding"] },
  { id: "insight-one", kind: "insight", adds: ["surprise", "reward"] },
  { id: "impact", kind: "question", adds: ["understanding"] },
  { id: "attempts", kind: "question", adds: ["identification"] },
  { id: "story", kind: "story", adds: ["progress", "surprise"] },
  { id: "recovery", kind: "question", adds: ["understanding"] },
  { id: "proof-preference", kind: "question", adds: ["decision"] },
  { id: "proof", kind: "proof", adds: ["proof", "reward"] },
  { id: "insight-two", kind: "insight", adds: ["understanding", "reward"] },
  { id: "readiness", kind: "question", adds: ["decision"] },
  { id: "continuity", kind: "question", adds: ["decision"] },
  { id: "anticipation", kind: "anticipation", adds: ["progress", "surprise"] },
  { id: "result", kind: "result", adds: ["understanding", "reward"] },
  { id: "offer", kind: "offer", adds: ["decision", "reward"] },
];

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
