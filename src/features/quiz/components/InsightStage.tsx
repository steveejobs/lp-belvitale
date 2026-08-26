import { useEffect, useRef } from "react";

interface InsightStageProps {
  readonly sequence: 1 | 2 | 3;
  readonly eyebrow: string;
  readonly title: string;
  readonly explanation: string;
  readonly cta: string;
  readonly note?: string;
  readonly image?: {
    readonly src: string;
    readonly srcSet?: string;
    readonly alt: string;
    readonly caption: string;
  };
  readonly onContinue: () => void;
}

export function InsightStage({ sequence, eyebrow, title, explanation, cta, note, image, onContinue }: InsightStageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, [sequence]);

  return (
    <section className="q7-insight" data-sequence={sequence} data-has-visual={image !== undefined} aria-labelledby={`q7-insight-${String(sequence)}`}>
      <div className="q7-insight__count" aria-hidden="true">0{sequence}</div>
      <div className="q7-insight__copy">
        <p className="q7-step-label">{eyebrow}</p>
        <h1 id={`q7-insight-${String(sequence)}`} ref={titleRef} tabIndex={-1}>
          {title}
        </h1>
        <p>{explanation}</p>
        {note === undefined ? null : <p className="q7-insight__note">{note}</p>}
      </div>
      {image === undefined ? null : (
        <figure className="q7-insight__visual">
          <img
            src={image.src}
            {...(image.srcSet === undefined ? {} : { srcSet: image.srcSet, sizes: "(min-width: 768px) 38vw, 100vw" })}
            width="1122"
            height="1402"
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
