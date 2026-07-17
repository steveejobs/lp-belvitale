import { useEffect, useRef } from "react";
import type { QuizQuestion } from "../../data/quizQuestions";
import type { QuizMicroInsight } from "../../quiz/quizInsights";

interface QuizProgressProps {
  readonly step: number;
  readonly total: number;
}

function QuizProgress({ step, total }: QuizProgressProps) {
  return (
    <div className="quiz-rhythm-progress">
      <div
        className="quiz-rhythm-progress__capsule"
        role="progressbar"
        aria-label="Progresso do quiz"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step + 1}
        aria-valuetext={`${String(step + 1)} de ${String(total)}`}
      >
        {Array.from({ length: total }, (_, index) => (
          <span key={index} data-filled={index <= step} aria-hidden="true" />
        ))}
      </div>
      <span aria-hidden="true">
        {step + 1} <i>/</i> {total}
      </span>
    </div>
  );
}

function BackArrow() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M19 12H5m6-6-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function QuizMicroInsightToast({
  insight,
}: {
  readonly insight: QuizMicroInsight | null;
}) {
  return (
    <div
      className="quiz-insight-toast"
      data-visible={insight !== null}
      aria-live="polite"
      aria-atomic="true"
    >
      {insight === null ? null : (
        <div key={insight.id}>
          <span>{insight.label}</span>
          <strong>{insight.text}</strong>
        </div>
      )}
    </div>
  );
}

interface QuizQuestionExperienceProps {
  readonly question: QuizQuestion;
  readonly step: number;
  readonly total: number;
  readonly selectedOptionId: string | null;
  readonly direction: "forward" | "backward";
  readonly onBack: () => void;
  readonly onSelect: (optionId: string) => void;
}

export function QuizQuestionExperience({
  question,
  step,
  total,
  selectedOptionId,
  direction,
  onBack,
  onSelect,
}: QuizQuestionExperienceProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [question.id]);

  return (
    <main className="quiz-main quiz-main--question" id="conteudo-quiz">
      <div
        className="quiz-question-stage"
        data-direction={direction}
        data-presentation={question.presentation}
        key={question.id}
      >
        <div className="quiz-question-stage__rail" aria-hidden="true">
          <span />
        </div>

        <div className="quiz-question-stage__topline">
          <button className="quiz-back" type="button" onClick={onBack}>
            <BackArrow />
            <span>Voltar</span>
          </button>
          <QuizProgress step={step} total={total} />
        </div>

        <section
          className="quiz-question-stage__content"
          aria-labelledby="quiz-question-title"
          aria-describedby="quiz-question-hint"
        >
          <div className="quiz-question-copy">
            <p className="quiz-kicker">{question.eyebrow}</p>
            <h1 id="quiz-question-title" ref={titleRef} tabIndex={-1}>
              {question.title}
            </h1>
            <p id="quiz-question-hint">{question.hint}</p>
          </div>

          <div
            className="quiz-answer-composition"
            role="group"
            aria-label="Escolha uma resposta"
          >
            {question.options.map((option, index) => {
              const selected = selectedOptionId === option.id;
              return (
                <button
                  className="quiz-answer"
                  type="button"
                  key={option.id}
                  data-index={index + 1}
                  data-question-id={question.id}
                  data-option-id={option.id}
                  data-selected={selected}
                  aria-pressed={selected}
                  onClick={() => onSelect(option.id)}
                >
                  <span className="quiz-answer__index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="quiz-answer__copy">
                    <strong>{option.label}</strong>
                    {option.detail === undefined ? null : (
                      <small>{option.detail}</small>
                    )}
                  </span>
                  <span className="quiz-answer__mark" aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <p className="quiz-selection-note">Uma escolha leva você adiante.</p>
        </section>
      </div>
    </main>
  );
}
