import {
  getQuizQuestion,
  quizDimensionIds,
  type QuizAnswer,
  type QuizDimension,
  type QuizQuestion,
} from "../data/quizQuestions";
import {
  quizProfileOrder,
  quizProfiles,
  type QuizConfidence,
  type QuizProfile,
} from "../data/quizProfiles";
import { getQuizQuestionPath } from "./quizAdaptive";

export type { QuizAnswer } from "../data/quizQuestions";

export type QuizDimensionVector = Readonly<Record<QuizDimension, number>>;

export interface QuizProfileDistance {
  readonly profile: QuizProfile;
  readonly distance: number;
  readonly secondaryDistance: number;
  readonly maximumDifference: number;
}

export interface QuizCalculation {
  readonly profile: QuizProfile;
  readonly confidence: QuizConfidence;
  readonly dimensions: QuizDimensionVector;
  readonly ranking: readonly QuizProfileDistance[];
}

const dimensionWeights: Readonly<Record<QuizDimension, number>> = {
  startEase: 1,
  recovery: 1.2,
  simplicity: 1,
  consistency: 1.15,
  planning: 1,
  replenishmentRelief: 0.85,
  autonomy: 0.7,
  commitmentComfort: 0.7,
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

function getAnsweredQuestions(
  answers: readonly QuizAnswer[],
): readonly QuizQuestion[] {
  const path = getQuizQuestionPath(answers);
  return path.filter((question) =>
    answers.some((answer) => answer.questionId === question.id),
  );
}

export function calculateQuizDimensions(
  answers: readonly QuizAnswer[],
): QuizDimensionVector {
  const questions = getAnsweredQuestions(answers);
  const dimensions = Object.fromEntries(
    quizDimensionIds.map((dimension) => {
      let score = 0;
      let minimum = 0;
      let maximum = 0;

      for (const question of questions) {
        const values = question.options.map(
          (option) => option.impact[dimension] ?? 0,
        );
        const answer = answers.find(
          (candidate) => candidate.questionId === question.id,
        );
        const selected = question.options.find(
          (option) => option.id === answer?.optionId,
        );
        if (selected === undefined) continue;

        score += selected.impact[dimension] ?? 0;
        minimum += Math.min(...values);
        maximum += Math.max(...values);
      }

      const normalized =
        maximum === minimum
          ? 50
          : ((score - minimum) / (maximum - minimum)) * 100;
      return [dimension, Math.round(clamp(normalized, 0, 100) * 10) / 10];
    }),
  );

  return dimensions as QuizDimensionVector;
}

function getProfileDistance(
  vector: QuizDimensionVector,
  profile: QuizProfile,
): QuizProfileDistance {
  const center = quizProfiles[profile].center;
  const weightedDifferences = quizDimensionIds.map((dimension) => {
    const difference = Math.abs(vector[dimension] - center[dimension]) / 100;
    return {
      difference,
      weight: dimensionWeights[dimension],
    };
  });
  const weightTotal = weightedDifferences.reduce(
    (total, item) => total + item.weight,
    0,
  );
  const distance = Math.sqrt(
    weightedDifferences.reduce(
      (total, item) => total + item.weight * item.difference ** 2,
      0,
    ) / weightTotal,
  );
  const secondaryDistance =
    weightedDifferences.reduce(
      (total, item) => total + item.weight * item.difference,
      0,
    ) / weightTotal;
  const maximumDifference = Math.max(
    ...weightedDifferences.map((item) => item.difference),
  );

  return { profile, distance, secondaryDistance, maximumDifference };
}

function compareDistances(
  left: QuizProfileDistance,
  right: QuizProfileDistance,
): number {
  const epsilon = 1e-9;
  if (Math.abs(left.distance - right.distance) > epsilon) {
    return left.distance - right.distance;
  }
  if (Math.abs(left.secondaryDistance - right.secondaryDistance) > epsilon) {
    return left.secondaryDistance - right.secondaryDistance;
  }
  if (Math.abs(left.maximumDifference - right.maximumDifference) > epsilon) {
    return left.maximumDifference - right.maximumDifference;
  }
  return quizProfileOrder.indexOf(left.profile) - quizProfileOrder.indexOf(right.profile);
}

function calculateConfidence(
  ranking: readonly QuizProfileDistance[],
): QuizConfidence {
  const first = ranking[0];
  const second = ranking[1];
  if (first === undefined || second === undefined) return "subtle";

  const separation =
    second.distance === 0
      ? 0
      : (second.distance - first.distance) / second.distance;
  if (separation >= 0.22) return "clear";
  if (separation >= 0.09) return "blended";
  return "subtle";
}

export function calculateQuizResult(
  answers: readonly QuizAnswer[],
): QuizCalculation {
  const dimensions = calculateQuizDimensions(answers);
  const ranking = quizProfileOrder
    .map((profile) => getProfileDistance(dimensions, profile))
    .sort(compareDistances);
  const profile = ranking[0]?.profile ?? quizProfileOrder[0];

  return {
    profile,
    confidence: calculateConfidence(ranking),
    dimensions,
    ranking,
  };
}

export function calculateQuizProfile(
  answers: readonly QuizAnswer[],
): QuizProfile {
  return calculateQuizResult(answers).profile;
}

export function hasCompleteQuizAnswers(
  answers: readonly QuizAnswer[],
): boolean {
  const path = getQuizQuestionPath(answers);
  if (answers.length !== path.length) return false;

  return path.every((question) => {
    const answer = answers.find(
      (candidate) => candidate.questionId === question.id,
    );
    return question.options.some((option) => option.id === answer?.optionId);
  });
}

export function isAnswerValidForCurrentPath(
  answers: readonly QuizAnswer[],
): boolean {
  const pathIds = new Set(getQuizQuestionPath(answers).map((question) => question.id));
  return answers.every((answer) => {
    const question = getQuizQuestion(answer.questionId);
    return (
      question !== null &&
      pathIds.has(answer.questionId) &&
      question.options.some((option) => option.id === answer.optionId)
    );
  });
}
