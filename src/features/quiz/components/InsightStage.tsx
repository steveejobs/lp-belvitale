import { useEffect, useRef, type CSSProperties } from "react";
import type { InsightTestimonialProof } from "../content/insights";
import { InsightTestimonial } from "./InsightTestimonial";
import { KineticText } from "./KineticText";

interface InsightStageProps {
  readonly sequence: 1 | 2 | 3;
  readonly eyebrow: string;
  readonly title: string;
  readonly explanation: string;
  readonly cta: string;
  readonly note?: string;
  readonly reflection: string;
  readonly signals: readonly string[];
  readonly testimonial: InsightTestimonialProof;
  readonly onContinue: () => void;
}

export function InsightStage({ sequence, eyebrow, title, explanation, cta, note, reflection, signals, testimonial, onContinue }: InsightStageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, [sequence]);

  return (
    <section className="q7-insight" data-sequence={sequence} data-has-visual="true" aria-labelledby={`q7-insight-${String(sequence)}`}>
      <div className="q7-insight__count" aria-hidden="true">
        <span><i /><i /><i /></span><b>Leitura em movimento</b>
      </div>
      <div className="q7-insight__copy">
        <p className="q7-step-label">{eyebrow}</p>
        <h1 id={`q7-insight-${String(sequence)}`} ref={titleRef} tabIndex={-1} aria-label={title}>
          <KineticText text={title} />
        </h1>
        <blockquote className="q7-insight__reflection"><span>Você acabou de dizer</span><p>{reflection}</p></blockquote>
        <p className="q7-insight__explanation">{explanation}</p>
        <div className="q7-insight__pattern">
          <div><span>O que você acabou de mostrar</span><b>respostas conectadas</b></div>
          <ol className="q7-insight__signals" aria-label="Respostas que sustentam esta leitura">
            {signals.map((signal, index) => (
              <li key={`${signal}-${String(index)}`} style={{ "--q7-signal": index } as CSSProperties}>
                <small aria-hidden="true">✓</small><span>{signal}</span>
              </li>
            ))}
          </ol>
        </div>
        {note === undefined ? null : <aside className="q7-insight__note"><span aria-hidden="true">✦</span><p>{note}</p></aside>}
      </div>
      <InsightTestimonial proof={testimonial} />
      <button className="q7-primary q7-insight__cta" type="button" onClick={onContinue}><span>{cta}</span><i aria-hidden="true">→</i></button>
    </section>
  );
}
