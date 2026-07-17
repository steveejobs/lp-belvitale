import type { QuizAction, QuizSessionState } from "../domain/quiz.types";
import { isAnswerAllowed, sanitizeFirstName } from "../domain/quiz.validation";

export function quizReducer(state: QuizSessionState, action: QuizAction): QuizSessionState {
  switch (action.type) {
    case "START":
      return { ...state, stageId: "name", startedAt: action.now, visitedStageIds: ["opening", "name"] };
    case "SET_NAME": {
      const firstName = action.provided ? sanitizeFirstName(action.value) : "";
      return { ...state, firstName, nameProvided: firstName.length > 0 && action.provided };
    }
    case "ANSWER":
      if (!isAnswerAllowed(action.questionId, action.optionId)) return state;
      return { ...state, answers: { ...state.answers, [action.questionId]: action.optionId } };
    case "GO_TO":
      return {
        ...state,
        stageId: action.stageId,
        visitedStageIds: state.visitedStageIds.includes(action.stageId)
          ? state.visitedStageIds
          : [...state.visitedStageIds, action.stageId],
      };
    case "SELECT_OFFER":
      return { ...state, selectedOfferId: action.offerId };
    case "COMPLETE":
      return { ...state, stageId: "result", completedAt: action.now };
    case "SYNC":
      return action.state;
    case "RESTART":
      return action.state;
  }
}
