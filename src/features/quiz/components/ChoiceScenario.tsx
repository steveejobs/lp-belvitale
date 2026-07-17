import type { QuizOption } from "../domain/quiz.types";
import { ChoiceCard } from "./ChoiceCard";

interface ChoiceScenarioProps {
  readonly options: readonly QuizOption[];
  readonly selectedId: string | undefined;
  readonly onSelect: (optionId: string) => void;
}

export function ChoiceScenario({ options, selectedId, onSelect }: ChoiceScenarioProps) {
  return (
    <div className="quiz-choices quiz-choices--scenario">
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
