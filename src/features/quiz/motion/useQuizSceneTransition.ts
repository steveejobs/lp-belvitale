import { useCallback } from "react";
import { flushSync } from "react-dom";

type QuizTransitionDirection = "forward" | "backward";

interface NativeViewTransition {
  readonly finished: Promise<void>;
}

interface TransitionDocument {
  startViewTransition?: (
    update: () => void | Promise<void>,
  ) => NativeViewTransition;
}

export function useQuizSceneTransition(reducedMotion: boolean) {
  return useCallback((direction: QuizTransitionDirection, update: () => void) => {
    const transitionDocument = document as unknown as TransitionDocument;
    const root = document.documentElement;
    root.dataset.quizDirection = direction;

    if (reducedMotion || transitionDocument.startViewTransition === undefined) {
      update();
      delete root.dataset.quizDirection;
      return;
    }

    const transition = transitionDocument.startViewTransition(() => {
      flushSync(update);
    });

    void transition.finished.finally(() => {
      delete root.dataset.quizDirection;
    });
  }, [reducedMotion]);
}
