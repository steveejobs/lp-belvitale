interface ProgressIndicatorProps {
  readonly moment: number;
  readonly totalMoments: number;
  readonly answered: number;
  readonly totalQuestions: number;
}

export function ProgressIndicator({
  moment,
  totalMoments,
  answered,
  totalQuestions,
}: ProgressIndicatorProps) {
  const percentage = Math.round((moment / totalMoments) * 100);
  return (
    <div className="quiz-progress">
      <div
        className="quiz-progress__track"
        role="progressbar"
        aria-label="Progresso da descoberta"
        aria-valuemin={1}
        aria-valuemax={totalMoments}
        aria-valuenow={moment}
        aria-valuetext={`${String(moment)} de ${String(totalMoments)} momentos; ${String(answered)} de ${String(totalQuestions)} escolhas respondidas`}
      >
        <span className="quiz-progress__fill" style={{ width: `${String(percentage)}%` }} />
        <span className="quiz-progress__capsules" aria-hidden="true">
          {Array.from({ length: totalMoments }, (_, index) => (
            <i key={index} data-filled={index < moment} />
          ))}
        </span>
      </div>
      <span className="quiz-progress__label" aria-live="polite">
        {answered}/{totalQuestions} escolhas
      </span>
    </div>
  );
}
