import { quizQuestionIds, type QuizAnswers } from "../domain/quiz.types";

export function ProgressIndicator({ answers }: { readonly answers: QuizAnswers }) {
  const answered = quizQuestionIds.filter((id) => typeof answers[id] === "string").length;
  const progress = answered / quizQuestionIds.length * 100;
  return (
    <div className="q7-progress">
      <div
        className="q7-progress__rail"
        role="progressbar"
        aria-label="Progresso das perguntas"
        aria-valuemin={0}
        aria-valuemax={quizQuestionIds.length}
        aria-valuenow={answered}
        aria-valuetext={`${String(answered)} de ${String(quizQuestionIds.length)} perguntas`}
      >
        <span style={{ transform: `scaleX(${String(progress / 100)})` }} />
      </div>
      <span aria-hidden="true">{answered}/{quizQuestionIds.length}</span>
    </div>
  );
}
