import { quizQuestions } from "../content/questions";
import {
  QUIZ_VERSION,
  quizStageIds,
  type OfferId,
  type QuizAnswers,
  type QuizSessionState,
  type QuizStageId,
} from "./quiz.types";

const offerIds: readonly OfferId[] = ["one-month", "three-months", "seven-months"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isStageId(value: unknown): value is QuizStageId {
  return typeof value === "string" && quizStageIds.some((id) => id === value);
}

function parseAnswers(value: unknown): QuizAnswers | null {
  if (!isRecord(value)) return null;
  const parsed: Record<string, string> = {};
  for (const [questionId, optionId] of Object.entries(value)) {
    const question = quizQuestions.find((candidate) => candidate.id === questionId);
    if (
      question === undefined ||
      typeof optionId !== "string" ||
      !question.options.some((option) => option.id === optionId)
    ) {
      return null;
    }
    parsed[question.id] = optionId;
  }
  return parsed;
}

export function parseQuizSession(value: unknown, now = Date.now()): QuizSessionState | null {
  if (!isRecord(value) || value.version !== QUIZ_VERSION) return null;
  const answers = parseAnswers(value.answers);
  if (
    answers === null ||
    typeof value.sessionId !== "string" ||
    value.sessionId.length < 8 ||
    !isStageId(value.stageId) ||
    !Array.isArray(value.visitedStageIds) ||
    !value.visitedStageIds.every(isStageId) ||
    typeof value.firstName !== "string" ||
    value.firstName.length > 24 ||
    typeof value.nameProvided !== "boolean" ||
    !isIsoDate(value.savedAt) ||
    !isIsoDate(value.expiresAt) ||
    Date.parse(value.expiresAt) <= now
  ) {
    return null;
  }

  const selectedOfferId = offerIds.find((id) => id === value.selectedOfferId);
  if (value.selectedOfferId !== undefined && selectedOfferId === undefined) return null;
  if (value.startedAt !== undefined && !isIsoDate(value.startedAt)) return null;
  if (value.completedAt !== undefined && !isIsoDate(value.completedAt)) return null;

  return {
    version: QUIZ_VERSION,
    sessionId: value.sessionId,
    stageId: value.stageId,
    visitedStageIds: value.visitedStageIds,
    answers,
    firstName: value.firstName,
    nameProvided: value.nameProvided,
    ...(selectedOfferId === undefined ? {} : { selectedOfferId }),
    ...(typeof value.startedAt === "string" ? { startedAt: value.startedAt } : {}),
    ...(typeof value.completedAt === "string" ? { completedAt: value.completedAt } : {}),
    savedAt: value.savedAt,
    expiresAt: value.expiresAt,
  };
}
