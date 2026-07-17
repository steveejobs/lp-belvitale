import { ProgressIndicator } from "./ProgressIndicator";
import { ArrowIcon } from "../../../components/ui/ArrowIcon";

interface QuizHeaderProps {
  readonly moment: number;
  readonly totalMoments: number;
  readonly answered: number;
  readonly totalQuestions: number;
  readonly canGoBack: boolean;
  readonly onBack: () => void;
  readonly onRestart: () => void;
}

export function QuizHeader({
  moment,
  totalMoments,
  answered,
  totalQuestions,
  canGoBack,
  onBack,
  onRestart,
}: QuizHeaderProps) {
  return (
    <header className="quiz-header">
      <div className="quiz-header__row">
        <div className="quiz-header__leading">
          {canGoBack ? (
            <button className="quiz-icon-button" type="button" onClick={onBack} aria-label="Voltar um momento">
              <ArrowIcon direction="left" />
            </button>
          ) : (
            <span className="quiz-icon-button quiz-icon-button--placeholder" aria-hidden="true" />
          )}
          <a className="quiz-brand" href="/" aria-label="Belvitale — página inicial">
            <img src="/brand/belvitale-wordmark-dark.webp" alt="Belvitale" width="496" height="369" />
          </a>
        </div>
        <span className="quiz-header__product">Descoberta CeluClin</span>
        {answered > 0 ? (
          <button className="quiz-header__restart" type="button" onClick={onRestart}>
            Reiniciar
          </button>
        ) : (
          <span className="quiz-header__restart quiz-header__restart--placeholder" aria-hidden="true">Reiniciar</span>
        )}
      </div>
      <ProgressIndicator
        moment={moment}
        totalMoments={totalMoments}
        answered={answered}
        totalQuestions={totalQuestions}
      />
    </header>
  );
}
