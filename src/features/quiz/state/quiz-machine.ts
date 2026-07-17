import {
  quizSceneIds,
  quizVersion,
  type QuizAnswerMap,
  type QuizMachineState,
  type QuizQuestionId,
  type QuizSceneId,
} from "../domain/quiz.types";
import {
  hasCompleteQuizAnswers,
  isValidQuizAnswer,
} from "../domain/quiz.validation";

export type QuizMachineAction =
  | { readonly type: "START"; readonly now: string }
  | {
      readonly type: "ANSWER";
      readonly questionId: QuizQuestionId;
      readonly optionId: string;
      readonly now: string;
    }
  | { readonly type: "NEXT"; readonly now: string }
  | { readonly type: "BACK"; readonly now: string }
  | {
      readonly type: "REVIEW";
      readonly questionId: QuizQuestionId;
      readonly now: string;
    }
  | { readonly type: "SHOW_OFFER"; readonly now: string }
  | { readonly type: "RESTART"; readonly now: string };

export function createInitialQuizState(now = new Date().toISOString()): QuizMachineState {
  return {
    version: quizVersion,
    scene: "intro",
    answers: {},
    direction: "forward",
    updatedAt: now,
  };
}

function sceneIndex(scene: QuizSceneId): number {
  return quizSceneIds.indexOf(scene);
}

function canLeaveQuestion(state: QuizMachineState): boolean {
  const scene = state.scene;
  if (
    scene !== "appearance-moment" &&
    scene !== "way-of-starting" &&
    scene !== "routine-friction" &&
    scene !== "after-a-missed-day" &&
    scene !== "trust-language" &&
    scene !== "planning-horizon" &&
    scene !== "honest-commitment"
  ) {
    return true;
  }
  const answer = state.answers[scene];
  return answer !== undefined && isValidQuizAnswer(scene, answer);
}

function move(
  state: QuizMachineState,
  offset: -1 | 1,
  now: string,
): QuizMachineState {
  if (offset === 1 && !canLeaveQuestion(state)) return state;
  const nextIndex = Math.max(
    0,
    Math.min(quizSceneIds.length - 1, sceneIndex(state.scene) + offset),
  );
  const nextScene = quizSceneIds[nextIndex];
  if (nextScene === undefined) return state;
  if (
    (nextScene === "result" || nextScene === "offer") &&
    !hasCompleteQuizAnswers(state.answers)
  ) {
    return state;
  }
  return {
    ...state,
    scene: nextScene,
    direction: offset === 1 ? "forward" : "backward",
    updatedAt: now,
    ...(nextScene === "result" && state.completedAt === undefined
      ? { completedAt: now }
      : {}),
  };
}

export function quizMachineReducer(
  state: QuizMachineState,
  action: QuizMachineAction,
): QuizMachineState {
  switch (action.type) {
    case "START":
      return {
        ...state,
        scene: "appearance-moment",
        direction: "forward",
        startedAt: state.startedAt ?? action.now,
        updatedAt: action.now,
      };
    case "ANSWER":
      if (!isValidQuizAnswer(action.questionId, action.optionId)) return state;
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.questionId]: action.optionId,
        } satisfies QuizAnswerMap,
        updatedAt: action.now,
      };
    case "NEXT":
      return move(state, 1, action.now);
    case "BACK":
      return move(state, -1, action.now);
    case "REVIEW":
      return {
        ...state,
        scene: action.questionId,
        reviewFrom: action.questionId,
        direction: "backward",
        updatedAt: action.now,
      };
    case "SHOW_OFFER":
      return hasCompleteQuizAnswers(state.answers)
        ? {
            ...state,
            scene: "offer",
            direction: "forward",
            updatedAt: action.now,
          }
        : state;
    case "RESTART":
      return createInitialQuizState(action.now);
  }
}

export function getAnsweredCount(answers: QuizAnswerMap): number {
  return Object.keys(answers).length;
}
