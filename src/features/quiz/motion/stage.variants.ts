import type { QuizDirection, QuizStagePhase } from "../domain/quiz.types";

export interface StageMotionState {
  readonly phase: QuizStagePhase;
  readonly direction: QuizDirection;
  readonly reducedMotion: boolean;
}

export const stageVariants = {
  enter: { opacity: 1, clip: "revealing" },
  active: { opacity: 1, clip: "open" },
  exit: { opacity: 0, clip: "closing" },
  reducedMotionEnter: { opacity: 1, clip: "open" },
  reducedMotionExit: { opacity: 1, clip: "open" },
} as const;
