import { useEffect, useRef, useState, type TouchEvent } from "react";
import { concernLabels, getPersonalizedProof } from "../content/proof";
import { legalProofNote } from "../content/copy";
import type { ConcernId } from "../domain/quiz.types";

const categoryLabels = {
  cellulite: "Celulite",
  laxity: "Firmeza",
  "localized-fat": "Contorno",
} as const;

interface ProofStageProps {
  readonly concern: ConcernId;
  readonly compact?: boolean;
  readonly onContinue?: () => void;
}

export function ProofStage({ concern, compact = false, onContinue }: ProofStageProps) {
  const images = getPersonalizedProof(concern);
  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const current = images[index] ?? images[0];

  useEffect(() => { if (!compact) titleRef.current?.focus(); }, [compact]);
  if (current === undefined) return null;

  const move = (delta: number) => setIndex((value) => (value + delta + images.length) % images.length);
  const onTouchEnd = (event: TouchEvent) => {
    if (touchStart.current === null) return;
    const distance = event.changedTouches[0]?.clientX ?? touchStart.current;
    const delta = distance - touchStart.current;
    touchStart.current = null;
    if (Math.abs(delta) >= 42) move(delta < 0 ? 1 : -1);
  };

  return (
    <section className="q6-proof" data-compact={compact} aria-labelledby={compact ? "q6-result-proof-title" : "q6-proof-title"}>
      <header>
        <p className="q6-eyebrow"><span /> {compact ? "Prova relevante" : "Arquivo visual autorizado"}</p>
        {compact ? (
          <h2 id="q6-result-proof-title">Uma prova alinhada ao que chamou sua atenção.</h2>
        ) : (
          <h1 id="q6-proof-title" ref={titleRef} tabIndex={-1}>{concernLabels[concern]} vem primeiro nesta galeria.</h1>
        )}
        <p>{legalProofNote}</p>
      </header>
      <div
        className="q6-proof__viewer"
        onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
        onTouchEnd={onTouchEnd}
      >
        <figure key={current.id}>
          <img
            src={current.src}
            width={current.width}
            height={current.height}
            alt={current.alt}
            loading={compact ? "lazy" : index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        </figure>
        <span className="q6-proof__category">{categoryLabels[current.category]}</span>
        {!compact ? (
          <div className="q6-proof__controls">
            <button type="button" onClick={() => move(-1)} aria-label="Imagem anterior">←</button>
            <strong aria-live="polite">{index + 1} / {images.length}</strong>
            <button type="button" onClick={() => move(1)} aria-label="Próxima imagem">→</button>
          </div>
        ) : null}
      </div>
      <details>
        <summary>Contexto e limites destas imagens</summary>
        <p>Os arquivos foram fornecidos pela marca e autorizados para exibição. Não há metadados suficientes para atribuir causalidade, cronologia ou resultado esperado. O quiz não usa a aparência retratada para definir oferta.</p>
      </details>
      {onContinue === undefined ? null : (
        <button className="q6-primary" type="button" onClick={onContinue}>Continuar com este contexto</button>
      )}
    </section>
  );
}
