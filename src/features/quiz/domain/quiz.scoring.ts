import { quizProfiles, quizProfileOrder } from "../content/profiles";
import { quizQuestions } from "../content/questions";
import {
  quizDimensionIds,
  type QuizAnswerMap,
  type QuizCalculation,
  type QuizDimensionId,
  type QuizDimensionVector,
  type QuizProfileId,
} from "./quiz.types";
import { hasCompleteQuizAnswers } from "./quiz.validation";

const emptyVector = (): Record<QuizDimensionId, number> =>
  Object.fromEntries(quizDimensionIds.map((id) => [id, 0])) as Record<
    QuizDimensionId,
    number
  >;

const dimensionRanges = Object.fromEntries(
  quizDimensionIds.map((dimension) => {
    const minimum = quizQuestions.reduce(
      (total, question) =>
        total + Math.min(...question.options.map((option) => option.impact[dimension] ?? 0)),
      0,
    );
    const maximum = quizQuestions.reduce(
      (total, question) =>
        total + Math.max(...question.options.map((option) => option.impact[dimension] ?? 0)),
      0,
    );
    return [dimension, { minimum, maximum }];
  }),
) as Readonly<Record<QuizDimensionId, { readonly minimum: number; readonly maximum: number }>>;

export function calculateDimensionVector(answers: QuizAnswerMap): QuizDimensionVector {
  const raw = emptyVector();
  quizQuestions.forEach((question) => {
    const answer = answers[question.id];
    const option = question.options.find((candidate) => candidate.id === answer);
    if (option === undefined) return;
    quizDimensionIds.forEach((dimension) => {
      raw[dimension] += option.impact[dimension] ?? 0;
    });
  });
  return Object.fromEntries(
    quizDimensionIds.map((dimension) => {
      const range = dimensionRanges[dimension];
      const span = range.maximum - range.minimum;
      const normalized = span === 0 ? 50 : ((raw[dimension] - range.minimum) / span) * 100;
      return [dimension, Math.round(Math.max(0, Math.min(100, normalized)) * 10) / 10];
    }),
  ) as unknown as QuizDimensionVector;
}

const profileDimensions = [
  "dailyImpact",
  "routineFriction",
  "startStyle",
  "recoveryCapacity",
  "proofPreference",
] as const;

function distanceToProfile(
  dimensions: QuizDimensionVector,
  profileId: QuizProfileId,
): number {
  const center = quizProfiles[profileId].center;
  const squared = profileDimensions.reduce((total, dimension) => {
    const difference = dimensions[dimension] - center[dimension];
    return total + difference * difference;
  }, 0);
  return Math.sqrt(squared / profileDimensions.length);
}

export function calculateQuizResult(answers: QuizAnswerMap): QuizCalculation | null {
  if (!hasCompleteQuizAnswers(answers)) return null;
  const dimensions = calculateDimensionVector(answers);
  const distances = Object.fromEntries(
    quizProfileOrder.map((profile) => [
      profile,
      Math.round(distanceToProfile(dimensions, profile) * 100) / 100,
    ]),
  ) as Readonly<Record<QuizProfileId, number>>;
  const profile = [...quizProfileOrder].sort((left, right) => {
    const difference = distances[left] - distances[right];
    return difference === 0
      ? quizProfileOrder.indexOf(left) - quizProfileOrder.indexOf(right)
      : difference;
  })[0];
  return profile === undefined ? null : { profile, dimensions, distances };
}

export function getDimensionRanges() {
  return dimensionRanges;
}
