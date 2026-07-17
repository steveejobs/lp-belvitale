import type { ReactNode } from "react";
import type { QuizMachineState } from "../domain/quiz.types";
import { getQuizMotionStyle } from "../motion/quiz.transitions";
import { QuizHeader } from "./QuizHeader";

interface QuizShellProps {
  readonly state: QuizMachineState;
  readonly moment: number;
  readonly answered: number;
  readonly canGoBack: boolean;
  readonly onBack: () => void;
  readonly onRestart: () => void;
  readonly children: ReactNode;
}

export function QuizShell({
  state,
  moment,
  answered,
  canGoBack,
  onBack,
  onRestart,
  children,
}: QuizShellProps) {
  return (
    <div
      className="quiz-route"
      data-scene={state.scene}
      data-direction={state.direction}
      style={getQuizMotionStyle()}
    >
      <a className="quiz-skip-link" href="#conteudo-quiz">Ir para o conteúdo</a>
      <QuizHeader
        moment={moment}
        totalMoments={14}
        answered={answered}
        totalQuestions={7}
        canGoBack={canGoBack}
        onBack={onBack}
        onRestart={onRestart}
      />
      {children}
    </div>
  );
}
