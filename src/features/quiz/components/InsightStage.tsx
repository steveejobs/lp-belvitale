import { useEffect, useRef } from "react";

interface InsightStageProps {
  readonly sequence: 1 | 2 | 3;
  readonly eyebrow: string;
  readonly title: string;
  readonly explanation: string;
  readonly cta: string;
  readonly note?: string;
  readonly signals: readonly string[];
  readonly image?: {
    readonly src: string;
    readonly alt: string;
    readonly caption: string;
    readonly width: number;
    readonly height: number;
  };
  readonly onContinue: () => void;
}

export function InsightStage({ sequence, eyebrow, title, explanation, cta, note, signals, image, onContinue }: InsightStageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, [sequence]);
  const signalLabels = sequence === 1
    ? ["O que aparece", "O pensamento automático", "Onde isso pesa"]
    : sequence === 2
      ? ["Sua reação", "O gatilho do ciclo"]
      : ["O que deixar", "O que construir", "O que recuperar"];

  return (
    <section className="q7-insight" data-sequence={sequence} data-has-visual={image !== undefined} aria-labelledby={`q7-insight-${String(sequence)}`}>
      <div className="q7-insight__count" aria-hidden="true">0{sequence}</div>
      <div className="q7-insight__copy">
        <p className="q7-step-label">{eyebrow}</p>
        <h1 id={`q7-insight-${String(sequence)}`} ref={titleRef} tabIndex={-1}>
          {title}
        </h1>
        <p>{explanation}</p>
        <div className="q7-insight__pattern">
          <div><span>Seu padrão, em uma linha</span><b>{signals.length}/{signals.length} sinais conectados</b></div>
          <ol className="q7-insight__signals" aria-label="Respostas que sustentam esta leitura">
            {signals.map((signal, index) => (
              <li key={signal}><small>{signalLabels[index]}</small><span>{signal}</span></li>
            ))}
          </ol>
        </div>
        {note === undefined ? null : <aside className="q7-insight__note"><span aria-hidden="true">↳</span><p><b>A virada possível</b>{note}</p></aside>}
      </div>
      {image === undefined ? null : (
        <figure className="q7-insight__visual">
          <img
            src={image.src}
            width={image.width}
            height={image.height}
            alt={image.alt}
            loading="lazy"
            decoding="async"
          />
          <figcaption>{image.caption}</figcaption>
        </figure>
      )}
      <button className="q7-primary q7-insight__cta" type="button" onClick={onContinue}>{cta} <span aria-hidden="true">→</span></button>
    </section>
  );
}
