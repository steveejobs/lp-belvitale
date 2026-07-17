import { quizQuestions } from "../content/questions";
import {
  quizQuestionIds,
  type QuizAnswerMap,
  type QuizQuestionId,
} from "./quiz.types";

export function isQuizQuestionId(value: string): value is QuizQuestionId {
  return quizQuestionIds.some((id) => id === value);
}

export function isValidQuizAnswer(
  questionId: QuizQuestionId,
  optionId: string,
): boolean {
  const question = quizQuestions.find((candidate) => candidate.id === questionId);
  return question?.options.some((option) => option.id === optionId) ?? false;
}

export function sanitizeQuizAnswers(value: unknown): QuizAnswerMap {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [QuizQuestionId, string] =>
        isQuizQuestionId(entry[0]) &&
        typeof entry[1] === "string" &&
        isValidQuizAnswer(entry[0], entry[1]),
    ),
  );
}

export function hasCompleteQuizAnswers(answers: QuizAnswerMap): boolean {
  return quizQuestionIds.every((questionId) => {
    const optionId = answers[questionId];
    return optionId !== undefined && isValidQuizAnswer(questionId, optionId);
  });
}

export interface QuizContentAudit {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export function auditQuizQuestionContent(): QuizContentAudit {
  const errors: string[] = [];
  const optionIds = new Set<string>();
  quizQuestions.forEach((question) => {
    if (question.options.length < 3 || question.options.length > 5) {
      errors.push(`${question.id}: deve ter entre 3 e 5 opções.`);
    }
    question.options.forEach((option) => {
      if (optionIds.has(option.id)) errors.push(`${option.id}: id de opção duplicado.`);
      optionIds.add(option.id);
      const nonZeroImpacts = Object.values(option.impact).filter((value) => value !== 0);
      if (nonZeroImpacts.length < 2) {
        errors.push(`${question.id}/${option.id}: precisa pontuar em duas ou mais dimensões.`);
      }
    });
  });
  return { valid: errors.length === 0, errors };
}
