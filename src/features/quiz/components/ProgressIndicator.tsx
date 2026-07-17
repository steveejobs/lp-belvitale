import { quizQuestionIds, type QuizAnswers } from "../domain/quiz.types";

export function ProgressIndicator({ answers }: { readonly answers: QuizAnswers }) {
  const answered = quizQuestionIds.filter((id) => typeof answers[id] === "string").length;
  return (
    <div className="q6-progress">
      <div
        className="q6-progress__rail"
        role="progressbar"
        aria-label="Progresso das escolhas"
        aria-valuemin={0}
        aria-valuemax={quizQuestionIds.length}
        aria-valuenow={answered}
        aria-valuetext={String(answered) + " de 8 escolhas"}
      >
        {quizQuestionIds.map((id, index) => (
          <span key={id} data-filled={index < answered} aria-hidden="true" />
        ))}
      </div>
      <span aria-hidden="true">{answered}/8</span>
    </div>
  );
}
