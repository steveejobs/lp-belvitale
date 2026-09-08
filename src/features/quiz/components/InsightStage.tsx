import { useEffect, useRef } from "react";
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
    <section className="q7-insight q7-insight-editorial" data-format={sequence === 1 ? "recognition" : sequence === 2 ? "explanation" : "decision"} data-sequence={sequence} data-has-visual="true" aria-labelledby={`q7-insight-${String(sequence)}`}>
      <div className="q7-insight__copy">
        <p className="q7-step-label">{eyebrow}</p>
        <h1 id={`q7-insight-${String(sequence)}`} ref={titleRef} tabIndex={-1} aria-label={title}>
          <KineticText text={title} />
        </h1>
        <blockquote className="q7-insight__reflection"><span>Você acabou de dizer</span><p>{reflection}</p></blockquote>
        <p className="q7-insight__explanation">{explanation}</p>
        {sequence === 2 ? <div className="q7-insight-distinction"><strong>Pele <span>≠</span> disciplina</strong><p>Um hábito pode fazer parte do cuidado. A aparência da pele não é uma nota pelo seu esforço.</p><a href="https://www.aad.org/public/cosmetic/fat-removal/cellulite-treatments-what-really-works" target="_blank" rel="noreferrer">Entenda a distinção com a AAD ↗</a></div> : null}
        {sequence === 3 ? <dl className="q7-insight-criteria"><div><dt>Composição</dt><dd>O que você vai consumir.</dd></div><div><dt>Evidência</dt><dd>O que sustenta a expectativa.</dd></div><div><dt>Custo total</dt><dd>O compromisso que cabe hoje.</dd></div></dl> : null}
        <details className="q7-insight__pattern">
          <summary>O que entrou nesta leitura</summary>
          <ol className="q7-insight__signals" aria-label="Respostas que sustentam esta leitura">
            {signals.map((signal) => (
              <li key={signal}>
                <small aria-hidden="true">✓</small><span>{signal}</span>
              </li>
            ))}
          </ol>
        </details>
        {note === undefined ? null : <aside className="q7-insight__note"><span aria-hidden="true">✦</span><p>{note}</p></aside>}
      </div>
      <InsightTestimonial proof={testimonial} />
      <button className="q7-primary q7-insight__cta" type="button" onClick={onContinue}><span>{cta}</span><i aria-hidden="true">→</i></button>
    </section>
  );
}
