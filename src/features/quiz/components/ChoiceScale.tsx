import type { QuizOption } from "../domain/quiz.types";
import { ChoiceCard } from "./ChoiceCard";

interface ChoiceScaleProps {
  readonly options: readonly QuizOption[];
  readonly selectedId: string | undefined;
  readonly onSelect: (optionId: string) => void;
}

export function ChoiceScale({ options, selectedId, onSelect }: ChoiceScaleProps) {
  return (
    <div className="quiz-choices quiz-choices--scale">
      <div className="quiz-scale-line" aria-hidden="true" />
      {options.map((option, index) => (
        <ChoiceCard
          key={option.id}
          option={option}
          index={index}
          selected={option.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
