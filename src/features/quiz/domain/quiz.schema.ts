import {
  quizSceneIds,
  quizVersion,
  type QuizMachineState,
  type QuizQuestionId,
  type QuizSceneId,
} from "./quiz.types";
import {
  isQuizQuestionId,
  sanitizeQuizAnswers,
} from "./quiz.validation";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsoDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 20 &&
    Number.isFinite(Date.parse(value))
  );
}

function isQuizSceneId(value: unknown): value is QuizSceneId {
  return typeof value === "string" && quizSceneIds.some((scene) => scene === value);
}

function optionalQuestionId(value: unknown): QuizQuestionId | undefined {
  return typeof value === "string" && isQuizQuestionId(value) ? value : undefined;
}

export function parseQuizMachineState(value: unknown): QuizMachineState | null {
  if (
    !isRecord(value) ||
    value.version !== quizVersion ||
    !isQuizSceneId(value.scene) ||
    !isIsoDate(value.updatedAt) ||
    (value.direction !== "forward" && value.direction !== "backward")
  ) {
    return null;
  }
  const startedAt = isIsoDate(value.startedAt) ? value.startedAt : undefined;
  const completedAt = isIsoDate(value.completedAt) ? value.completedAt : undefined;
  const reviewFrom = optionalQuestionId(value.reviewFrom);
  return {
    version: quizVersion,
    scene: value.scene,
    answers: sanitizeQuizAnswers(value.answers),
    direction: value.direction,
    updatedAt: value.updatedAt,
    ...(startedAt === undefined ? {} : { startedAt }),
    ...(completedAt === undefined ? {} : { completedAt }),
    ...(reviewFrom === undefined ? {} : { reviewFrom }),
  };
}
