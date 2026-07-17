import {
  adaptiveQuizQuestions,
  getQuizQuestion,
  quizCommonClosingQuestions,
  quizCommonOpeningQuestions,
  quizDimensionIds,
  type QuizAnswer,
  type QuizDimension,
  type QuizQuestion,
} from "../data/quizQuestions";

export type QuizAdaptiveBranch =
  | "adaptive-return"
  | "adaptive-supply"
  | "adaptive-simple"
  | "adaptive-real-life";

interface EvidenceGroup {
  readonly id: QuizAdaptiveBranch;
  readonly dimensions: readonly QuizDimension[];
}

const evidenceGroups: readonly EvidenceGroup[] = [
  { id: "adaptive-return", dimensions: ["recovery"] },
  {
    id: "adaptive-supply",
    dimensions: [
      "planning",
      "replenishmentRelief",
      "commitmentComfort",
    ],
  },
  { id: "adaptive-simple", dimensions: ["simplicity"] },
  {
    id: "adaptive-real-life",
    dimensions: ["startEase", "consistency", "autonomy"],
  },
] as const;

function getOpeningOptions(answers: readonly QuizAnswer[]) {
  return quizCommonOpeningQuestions.flatMap((question) => {
    const answer = answers.find((candidate) => candidate.questionId === question.id);
    const selected = question.options.find(
      (candidate) => candidate.id === answer?.optionId,
    );
    return selected === undefined ? [] : [selected];
  });
}

function getDimensionUncertainty(
  answers: readonly QuizAnswer[],
  dimension: QuizDimension,
): number {
  const values = getOpeningOptions(answers).map(
    (selected) => selected.impact[dimension] ?? 0,
  );
  const evidence = values.filter((value) => value !== 0);
  if (evidence.length === 0) return 1;

  const coverage = evidence.length / quizCommonOpeningQuestions.length;
  const absoluteTotal = evidence.reduce((total, value) => total + Math.abs(value), 0);
  const signedTotal = evidence.reduce((total, value) => total + value, 0);
  const contradiction =
    absoluteTotal === 0 ? 1 : 1 - Math.abs(signedTotal) / absoluteTotal;
  const strength = Math.min(
    1,
    absoluteTotal / (quizCommonOpeningQuestions.length * 2),
  );

  return (1 - coverage) * 0.5 + contradiction * 0.35 + (1 - strength) * 0.15;
}

function getGroupUncertainty(
  answers: readonly QuizAnswer[],
  group: EvidenceGroup,
): number {
  return (
    group.dimensions.reduce(
      (total, dimension) => total + getDimensionUncertainty(answers, dimension),
      0,
    ) / group.dimensions.length
  );
}

export function selectAdaptiveQuestionId(
  answers: readonly QuizAnswer[],
): QuizAdaptiveBranch {
  const rankedGroups = evidenceGroups
    .map((group) => ({
      id: group.id,
      uncertainty: getGroupUncertainty(answers, group),
    }))
    .sort(
      (left, right) =>
        right.uncertainty - left.uncertainty ||
        left.id.localeCompare(right.id),
    );

  return rankedGroups[0]?.id ?? "adaptive-real-life";
}

export function getQuizQuestionPath(
  answers: readonly QuizAnswer[],
): readonly QuizQuestion[] {
  const adaptiveId = selectAdaptiveQuestionId(answers);
  const adaptive = adaptiveQuizQuestions.find(
    (question) => question.id === adaptiveId,
  );
  if (adaptive === undefined) {
    throw new Error("Pergunta adaptativa do quiz não encontrada.");
  }

  return [
    ...quizCommonOpeningQuestions,
    adaptive,
    ...quizCommonClosingQuestions,
  ];
}

export function sanitizeAnswersForPath(
  answers: readonly QuizAnswer[],
): readonly QuizAnswer[] {
  const path = getQuizQuestionPath(answers);
  const allowedIds = new Set(path.map((question) => question.id));

  return path.flatMap((question) => {
    if (!allowedIds.has(question.id)) return [];
    const answer = answers.find(
      (candidate) => candidate.questionId === question.id,
    );
    if (answer === undefined) return [];
    const currentQuestion = getQuizQuestion(answer.questionId);
    return currentQuestion?.options.some(
      (candidate) => candidate.id === answer.optionId,
    )
      ? [answer]
      : [];
  });
}

export function getAdaptiveCoverage(): Readonly<Record<QuizAdaptiveBranch, readonly QuizDimension[]>> {
  return Object.fromEntries(
    evidenceGroups.map((group) => [group.id, group.dimensions]),
  ) as Readonly<Record<QuizAdaptiveBranch, readonly QuizDimension[]>>;
}

export function getUnmeasuredDimensions(
  answers: readonly QuizAnswer[],
): readonly QuizDimension[] {
  const selectedOptions = getOpeningOptions(answers);
  return quizDimensionIds.filter((dimension) =>
    selectedOptions.every((selected) => (selected.impact[dimension] ?? 0) === 0),
  );
}
