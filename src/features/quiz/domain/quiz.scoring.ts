import { quizProfileOrder, quizProfiles } from "../content/profiles";
import { quizQuestions } from "../content/questions";
import type {
  NarrativeDimension,
  NarrativeProfileId,
  QuizAnswers,
  QuizProfileResult,
  QuizQuestion,
} from "./quiz.types";
import { hasCompleteQuizAnswers } from "./quiz.validation";

const dimensions: readonly NarrativeDimension[] = [
  "actionBias",
  "clarityNeed",
  "recoveryCapacity",
  "structurePreference",
  "proofNeed",
];

const narrativeQuestionIds = [
  "first-thought",
  "deepest-impact",
  "history",
  "dropoff",
  "decision-weight",
  "future-goal",
] as const;

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function calculateDimensionVector(
  answers: QuizAnswers,
): Readonly<Record<NarrativeDimension, number>> {
  return Object.fromEntries(dimensions.map((dimension) => {
    let selectedTotal = 0;
    let minimumTotal = 0;
    let maximumTotal = 0;
    for (const questionId of narrativeQuestionIds) {
      const question: QuizQuestion | undefined = quizQuestions.find((candidate) => candidate.id === questionId);
      if (question === undefined) continue;
      const values = question.options.map((option) => option.narrative?.[dimension] ?? 0);
      const selected = question.options.find((option) => option.id === answers[questionId]);
      selectedTotal += selected?.narrative?.[dimension] ?? 0;
      minimumTotal += Math.min(...values);
      maximumTotal += Math.max(...values);
    }
    const normalized = maximumTotal === minimumTotal
      ? 50
      : ((selectedTotal - minimumTotal) / (maximumTotal - minimumTotal)) * 100;
    return [dimension, Math.round(clamp(normalized) * 10) / 10];
  })) as Readonly<Record<NarrativeDimension, number>>;
}

function distance(
  vector: Readonly<Record<NarrativeDimension, number>>,
  profileId: NarrativeProfileId,
): number {
  const center = quizProfiles[profileId].center;
  const total = dimensions.reduce((sum, dimension) => {
    const difference = (vector[dimension] - center[dimension]) / 100;
    return sum + difference ** 2;
  }, 0);
  return Math.sqrt(total / dimensions.length);
}

export function calculateQuizResult(answers: QuizAnswers): QuizProfileResult | null {
  if (!hasCompleteQuizAnswers(answers)) return null;
  const vector = calculateDimensionVector(answers);
  const distances = Object.fromEntries(
    quizProfileOrder.map((profileId) => [profileId, distance(vector, profileId)]),
  ) as Readonly<Record<NarrativeProfileId, number>>;
  const ranking = [...quizProfileOrder].sort((left, right) =>
    distances[left] - distances[right] || quizProfileOrder.indexOf(left) - quizProfileOrder.indexOf(right),
  );
  const first = ranking[0] ?? "clear-first";
  const second = ranking[1] ?? first;
  return {
    id: first,
    confidence: distances[second] - distances[first] >= 0.08 ? "clear" : "blended",
    distances,
    dimensions: vector,
  };
}
