import type { QuizOption } from "../domain/quiz.types";
import { ArrowIcon } from "../../../components/ui/ArrowIcon";
import { CheckIcon } from "../../../components/ui/CheckIcon";
import { usePointerMotion } from "../../../hooks/usePointerMotion";
import { getMotionFamilyAttribute } from "../motion/quiz.transitions";

interface ChoiceCardProps {
  readonly option: QuizOption;
  readonly selected: boolean;
  readonly index: number;
  readonly onSelect: (optionId: string) => void;
}

export function ChoiceCard({ option, selected, index, onSelect }: ChoiceCardProps) {
  const pointerMotion = usePointerMotion<HTMLButtonElement>({
    propertyX: "--choice-pointer-x",
    propertyY: "--choice-pointer-y",
    output: "position",
  });

  return (
    <button
      className="quiz-choice"
      type="button"
      aria-pressed={selected}
      data-selected={selected}
      data-motion={getMotionFamilyAttribute("choice")}
      onClick={() => onSelect(option.id)}
      {...pointerMotion}
    >
      <span className="quiz-choice__index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="quiz-choice__copy">
        <strong>{option.label}</strong>
        {option.detail === undefined ? null : <small>{option.detail}</small>}
      </span>
      <span className="quiz-choice__state" aria-hidden="true">
        {selected ? <CheckIcon /> : <ArrowIcon direction="right" />}
      </span>
    </button>
  );
}
