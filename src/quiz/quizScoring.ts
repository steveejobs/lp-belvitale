import { quizQuestions } from "../data/quizQuestions";
import {
  quizProfileOrder,
  type QuizProfile,
} from "../data/quizProfiles";

export interface QuizAnswer {
  readonly questionId: string;
  readonly optionId: string;
}

export function calculateQuizProfile(
  answers: readonly QuizAnswer[],
): QuizProfile {
  const scores: Record<QuizProfile, number> = {
    "simple-start": 0,
    "gradual-consistency": 0,
    "conscious-continuity": 0,
  };

  for (const question of quizQuestions) {
    const answer = answers.find((item) => item.questionId === question.id);
    const option = question.options.find(
      (item) => item.id === answer?.optionId,
    );
    if (option === undefined) continue;

    for (const profile of quizProfileOrder) {
      scores[profile] += option.profileWeights[profile];
    }
  }

  const highestScore = Math.max(...quizProfileOrder.map((id) => scores[id]));
  const tiedProfiles = quizProfileOrder.filter(
    (profile) => scores[profile] === highestScore,
  );
  const onlyProfile = tiedProfiles[0];
  if (tiedProfiles.length === 1 && onlyProfile !== undefined) return onlyProfile;

  const lastQuestion = quizQuestions.at(-1);
  const lastAnswer = answers.find(
    (answer) => answer.questionId === lastQuestion?.id,
  );
  const lastOption = lastQuestion?.options.find(
    (option) => option.id === lastAnswer?.optionId,
  );
  if (lastOption !== undefined) {
    return quizProfileOrder.reduce((winner, profile) =>
      lastOption.profileWeights[profile] > lastOption.profileWeights[winner]
        ? profile
        : winner,
    );
  }

  return "simple-start";
}

export function hasCompleteQuizAnswers(
  answers: readonly QuizAnswer[],
): boolean {
  return quizQuestions.every((question) =>
    answers.some(
      (answer) =>
        answer.questionId === question.id &&
        question.options.some((option) => option.id === answer.optionId),
    ),
  );
}
