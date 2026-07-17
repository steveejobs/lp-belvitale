import { useEffect, useRef, useState } from "react";
import type { QuizDirection, QuizStageId, QuizStagePhase } from "../domain/quiz.types";
import { quizMotion } from "./motion.tokens";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useQuizSceneTransition(stageId: QuizStageId, direction: QuizDirection) {
  const [displayedStageId, setDisplayedStageId] = useState(stageId);
  const [phase, setPhase] = useState<QuizStagePhase>("enter");
  const previous = useRef(stageId);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setPhase("active"));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (stageId === previous.current) return;
    const reduced = prefersReducedMotion();
    setPhase("exit");
    const exitTimer = window.setTimeout(() => {
      previous.current = stageId;
      setDisplayedStageId(stageId);
      setPhase("enter");
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase("active")));
    }, reduced ? 20 : quizMotion.exitMs);
    return () => window.clearTimeout(exitTimer);
  }, [stageId]);

  return {
    displayedStageId,
    phase,
    direction,
    reducedMotion: prefersReducedMotion(),
  } as const;
}
