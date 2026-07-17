import { createContext, useContext } from "react";
import type { QuizAction, QuizSessionState } from "../domain/quiz.types";

export interface QuizContextValue {
  readonly state: QuizSessionState;
  readonly dispatch: (action: QuizAction) => void;
  readonly restart: () => void;
}

export const QuizContext = createContext<QuizContextValue | null>(null);

export function useQuiz(): QuizContextValue {
  const context = useContext(QuizContext);
  if (context === null) throw new Error("useQuiz deve ser usado dentro de QuizProvider.");
  return context;
}
