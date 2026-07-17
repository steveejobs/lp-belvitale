import type { QuizAnswers, QuizStageId } from "../domain/quiz.types";
import { ProgressIndicator } from "./ProgressIndicator";

interface QuizHeaderProps {
  readonly stageId: QuizStageId;
  readonly answers: QuizAnswers;
  readonly canGoBack: boolean;
  readonly onBack: () => void;
  readonly onRestart: () => void;
}

export function QuizHeader({ stageId, answers, canGoBack, onBack, onRestart }: QuizHeaderProps) {
  return (
    <header className="q6-header" data-stage={stageId}>
      <div className="q6-header__top">
        <button className="q6-icon-button" type="button" onClick={onBack} disabled={!canGoBack} aria-label="Voltar à etapa anterior">
          <span aria-hidden="true">←</span>
        </button>
        <a className="q6-brand" href="/quiz">BELVITALE <strong>CELUCLIN</strong></a>
        <button className="q6-restart" type="button" onClick={onRestart}>Reiniciar</button>
      </div>
      <ProgressIndicator answers={answers} />
    </header>
  );
}
