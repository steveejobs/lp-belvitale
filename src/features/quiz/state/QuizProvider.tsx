import { useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { clearIssuedReward } from "../reward/reward.storage";
import { QuizContext, type QuizContextValue } from "./quiz.context";
import { quizReducer } from "./quiz.reducer";
import { clearQuizSession, createQuizSession, loadQuizSession, quizStorageKey, saveQuizSession } from "./quiz.storage";

export function QuizProvider({ children }: { readonly children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, undefined, () => loadQuizSession());
  const skipNextSave = useRef(false);

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveQuizSession(state);
  }, [state]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== quizStorageKey || event.newValue === null) return;
      try {
        const next = loadQuizSession();
        if (next.savedAt !== state.savedAt || next.stageId !== state.stageId) {
          // A mudanca veio de outra aba. Nao a grave novamente, evitando um
          // ping-pong infinito de eventos storage entre contextos abertos.
          skipNextSave.current = true;
          dispatch({ type: "SYNC", state: next });
        }
      } catch { /* documento inválido é tratado pelo loader */ }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [state.savedAt, state.stageId]);

  const value = useMemo<QuizContextValue>(() => ({
    state,
    dispatch,
    restart: () => {
      clearQuizSession();
      clearIssuedReward();
      dispatch({ type: "RESTART", state: createQuizSession() });
      window.history.replaceState({}, "", "/quiz");
    },
  }), [state]);

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}
