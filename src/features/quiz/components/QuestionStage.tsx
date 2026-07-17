import { useEffect, useRef } from "react";
import type { QuizQuestion } from "../domain/quiz.types";
import { ChoiceCard } from "./ChoiceCard";

interface QuestionStageProps {
  readonly question: QuizQuestion;
  readonly selectedOptionId: string | undefined;
  readonly isConfirming: boolean;
  readonly onSelect: (optionId: string) => void;
  readonly onContinue: () => void;
}

export function QuestionStage({
  question,
  selectedOptionId,
  isConfirming,
  onSelect,
  onContinue,
}: QuestionStageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, [question.id]);
  return (
    <section className="q6-question" data-presentation={question.presentation} aria-labelledby={"q6-" + question.id + "-title"}>
      <header className="q6-question__header">
        <p className="q6-eyebrow"><span /> {question.eyebrow}</p>
        <h1 id={"q6-" + question.id + "-title"} ref={titleRef} tabIndex={-1}>{question.prompt}</h1>
        <p>{question.hint}</p>
      </header>
      <div className="q6-choices" role="group" aria-label="Escolha uma resposta">
        {question.options.map((option) => {
          const selected = selectedOptionId === option.id;
          return (
            <ChoiceCard
              key={option.id}
              option={option}
              presentation={question.presentation}
              selected={selected}
              subdued={isConfirming && !selected}
              onSelect={() => onSelect(option.id)}
            />
          );
        })}
      </div>
      {!question.autoAdvance && selectedOptionId !== undefined ? (
        <button className="q6-primary q6-question__continue" type="button" onClick={onContinue}>Continuar com esta resposta</button>
      ) : null}
    </section>
  );
}
