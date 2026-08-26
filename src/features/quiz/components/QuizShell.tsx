import type { ReactNode } from "react";
import type { QuizDirection, QuizStageId, QuizStagePhase } from "../domain/quiz.types";

interface QuizShellProps {
  readonly stageId: QuizStageId;
  readonly phase: QuizStagePhase;
  readonly direction: QuizDirection;
  readonly reducedMotion: boolean;
  readonly children: ReactNode;
}

export function QuizShell({ stageId, phase, direction, reducedMotion, children }: QuizShellProps) {
  return (
    <main
      id="conteudo-quiz"
      className="q7-stage"
      data-stage={stageId}
      data-phase={phase}
      data-direction={direction}
      data-reduced-motion={reducedMotion}
    >
      <div className="q7-stage__track">{children}</div>
    </main>
  );
}
