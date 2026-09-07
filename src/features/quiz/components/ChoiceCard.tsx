import type { CSSProperties, PointerEvent } from "react";
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
  const locatePulse = (event: PointerEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--q7-tap-x", `${String(event.clientX - bounds.left)}px`);
    event.currentTarget.style.setProperty("--q7-tap-y", `${String(event.clientY - bounds.top)}px`);
  };

  return (
    <button
      className="q7-choice"
      type="button"
      data-presentation={presentation}
      data-selected={selected}
      data-subdued={subdued}
      aria-pressed={selected}
      style={{ "--q7-choice": index } as CSSProperties}
      onPointerDown={locatePulse}
      onClick={onSelect}
    >
      <span className="q7-choice__pulse" aria-hidden="true" />
      <span className="q7-choice__index" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
      <span className="q7-choice__copy">
        <strong>{option.label}</strong>
        {option.detail === undefined ? null : <small>{option.detail}</small>}
      </span>
      <span className="q7-choice__state" aria-hidden="true">
        <i>{selected ? "✓" : "→"}</i>
        {selected ? <b><span /><span /><span /><span /></b> : null}
      </span>
    </button>
  );
}
