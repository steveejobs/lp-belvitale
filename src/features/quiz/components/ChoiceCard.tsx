import type { QuestionPresentation, QuizOption } from "../domain/quiz.types";

interface ChoiceCardProps {
  readonly option: QuizOption;
  readonly index: number;
  readonly presentation: QuestionPresentation;
  readonly selected: boolean;
  readonly subdued: boolean;
  readonly onSelect: () => void;
}

export function ChoiceCard({ option, index, presentation, selected, subdued, onSelect }: ChoiceCardProps) {
  return (
    <button
      className="q7-choice"
      type="button"
      data-presentation={presentation}
      data-selected={selected}
      data-subdued={subdued}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className="q7-choice__index" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
      <span className="q7-choice__copy">
        <strong>{option.label}</strong>
        {option.detail === undefined ? null : <small>{option.detail}</small>}
      </span>
      <span className="q7-choice__state" aria-hidden="true">{selected ? "✓" : "→"}</span>
    </button>
  );
}
