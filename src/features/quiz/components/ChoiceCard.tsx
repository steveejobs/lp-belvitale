import type { QuestionPresentation, QuizOption } from "../domain/quiz.types";

interface ChoiceCardProps {
  readonly option: QuizOption;
  readonly presentation: QuestionPresentation;
  readonly selected: boolean;
  readonly subdued: boolean;
  readonly onSelect: () => void;
}

export function ChoiceCard({ option, presentation, selected, subdued, onSelect }: ChoiceCardProps) {
  return (
    <button
      className="q6-choice"
      type="button"
      data-presentation={presentation}
      data-selected={selected}
      data-subdued={subdued}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className="q6-choice__marker" aria-hidden="true"><i /></span>
      <span className="q6-choice__copy">
        <strong>{option.label}</strong>
        {option.detail === undefined ? null : <small>{option.detail}</small>}
      </span>
      <span className="q6-choice__confirm" aria-hidden="true">{selected ? "✓" : "→"}</span>
    </button>
  );
}
