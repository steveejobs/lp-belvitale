import type { CSSProperties } from "react";

interface KineticTextProps {
  readonly text: string;
  readonly accentFrom?: number;
}

export function KineticText({ text, accentFrom }: KineticTextProps) {
  return (
    <span className="q7-kinetic-title" aria-hidden="true">
      {text.split(" ").map((word, index) => (
        <span
          className="q7-kinetic-title__word"
          data-accent={accentFrom !== undefined && index >= accentFrom}
          style={{ "--q7-word": index } as CSSProperties}
          key={`${word}-${String(index)}`}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
