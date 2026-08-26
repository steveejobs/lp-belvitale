import { quizQuestionMap, quizQuestions } from "../content/questions";
import type { QuizAnswers, QuizQuestion, QuizQuestionId } from "./quiz.types";

export function sanitizeFirstName(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[^\p{L}\p{M}' -]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")[0]
    ?.slice(0, 24) ?? "";
}

export function isAnswerAllowed(questionId: QuizQuestionId, optionId: string): boolean {
  return quizQuestionMap[questionId].options.some((option) => option.id === optionId);
}

export function hasCompleteQuizAnswers(answers: QuizAnswers): boolean {
  return quizQuestions.every((question) => {
    const answer = answers[question.id];
    return typeof answer === "string" && isAnswerAllowed(question.id, answer);
  });
}

export function auditQuizQuestionContent(): Readonly<{
  valid: boolean;
  questionCount: number;
  duplicatedPrompts: readonly string[];
  genericRoutinePrompts: readonly string[];
}> {
  const questionCount: number = [...(quizQuestions as readonly QuizQuestion[])].length;
  const normalized = quizQuestions.map((question) => question.prompt.toLocaleLowerCase("pt-BR"));
  const duplicatedPrompts = normalized.filter((prompt, index) => normalized.indexOf(prompt) !== index);
  const genericRoutinePrompts = quizQuestions
    .filter((question) => /produtividade|meta diária|lista de tarefas/i.test(question.prompt))
    .map((question) => question.id);
  return {
    valid: questionCount === 12 && duplicatedPrompts.length === 0 && genericRoutinePrompts.length === 0,
    questionCount,
    duplicatedPrompts,
    genericRoutinePrompts,
  };
}
