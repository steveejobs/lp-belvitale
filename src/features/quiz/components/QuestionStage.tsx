import { useEffect, useRef } from "react";
import type { QuizQuestion } from "../domain/quiz.types";
import { ChoiceCard } from "./ChoiceCard";

interface QuestionStageProps {
  readonly question: QuizQuestion;
  readonly selectedOptionId?: string | undefined;
  readonly isConfirming: boolean;
  readonly onSelect: (optionId: string) => void;
  readonly onContinue: () => void;
}

export function QuestionStage({ question, selectedOptionId, isConfirming, onSelect, onContinue }: QuestionStageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, [question.id]);

  return (
    <section className="q7-question" data-presentation={question.presentation} aria-labelledby={`q7-question-${question.id}`}>
      <header className="q7-question__header">
        <div className="q7-question__meta">
          <p>{question.block}</p>
          <span>{question.eyebrow}</span>
        </div>
        <h1 id={`q7-question-${question.id}`} ref={titleRef} tabIndex={-1}>{question.prompt}</h1>
        {question.hint === undefined ? null : <p className="q7-question__hint">{question.hint}</p>}
      </header>
      <div className="q7-choices" role="group" aria-label="Opções de resposta">
        {question.options.map((option, index) => {
          const selected = option.id === selectedOptionId;
          return (
            <ChoiceCard
              key={option.id}
              option={option}
              index={index}
              presentation={question.presentation}
              selected={selected}
              subdued={isConfirming && !selected}
              onSelect={() => onSelect(option.id)}
            />
          );
        })}
      </div>
      {!question.autoAdvance && selectedOptionId !== undefined ? (
        <button className="q7-primary q7-question__continue" type="button" onClick={onContinue}>Continuar</button>
      ) : null}
      <p className="q7-question__footnote">Não existe resposta certa. Escolha a que mais se aproxima de você.</p>
    </section>
  );
}
