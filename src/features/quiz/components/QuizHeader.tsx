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
    <header className="q7-header" data-stage={stageId}>
      <div className="q7-header__top">
        <button className="q7-icon-button" type="button" onClick={onBack} disabled={!canGoBack} aria-label="Voltar à etapa anterior">
          <span aria-hidden="true">←</span>
        </button>
        <a className="q7-brand" href={"/quiz" + window.location.search} aria-label="Belvitale">
          <span className="q7-wordmark">Belvitale</span>
        </a>
        <button className="q7-restart" type="button" onClick={onRestart}>Reiniciar</button>
      </div>
      <ProgressIndicator answers={answers} />
    </header>
  );
}
