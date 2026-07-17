import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { proofAssets, proofCategories } from "../../../data/proofGallery";
import type { deriveProofInsight } from "../content/interstitials";

type ProofInsight = ReturnType<typeof deriveProofInsight>;

interface ProofMomentProps {
  readonly mode: "journey" | "result";
  readonly insight?: ProofInsight;
  readonly onContinue?: () => void;
}

export function ProofMoment({ mode, insight, onContinue }: ProofMomentProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStart = useRef<number | null>(null);
  const active = proofAssets[activeIndex] ?? proofAssets[0];
  const auxiliaries = useMemo(
    () => [1, 2].map((offset) => proofAssets[(activeIndex + offset) % proofAssets.length]).filter((asset) => asset !== undefined),
    [activeIndex],
  );
  if (active === undefined) return null;
  const category = proofCategories.find((candidate) => candidate.id === active.category);

  function go(offset: -1 | 1) {
    setActiveIndex((current) => (current + offset + proofAssets.length) % proofAssets.length);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    pointerStart.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerStart.current === null) return;
    const difference = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(difference) >= 42) go(difference < 0 ? 1 : -1);
  }

  return (
    <section className={`quiz-proof quiz-proof--${mode}`} aria-labelledby={`proof-title-${mode}`}>
      <div className="quiz-proof__intro">
        <p className="quiz-kicker">Arquivo visual autorizado</p>
        <h2 id={`proof-title-${mode}`}>
          {mode === "journey" ? "Confiança também depende do que não é prometido." : "Mídia grande, contexto visível e nenhum salto causal."}
        </h2>
        {insight === undefined ? null : (
          <div className="quiz-proof__insight" aria-live="polite">
            <strong>{insight.title}</strong>
            <p>{insight.body}</p>
            <small>{insight.detail}</small>
          </div>
        )}
      </div>

      <div className="quiz-proof__gallery">
        <div
          className="quiz-proof__stage"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => { pointerStart.current = null; }}
        >
          <figure>
            <img
              key={active.id}
              src={active.src}
              width={active.width}
              height={active.height}
              alt={active.alt}
              style={{ objectPosition: active.objectPosition }}
            />
            <figcaption>
              <span>{category?.label ?? active.category}</span>
              <span>{active.sequenceLabel}</span>
            </figcaption>
          </figure>
          <span className="quiz-proof__counter" aria-live="polite">
            {activeIndex + 1} / {proofAssets.length}
          </span>
        </div>

        <div className="quiz-proof__controls" aria-label="Controles do arquivo visual">
          <button type="button" onClick={() => go(-1)} aria-label="Imagem anterior">←</button>
          <p>Arraste ou use os controles</p>
          <button type="button" onClick={() => go(1)} aria-label="Próxima imagem">→</button>
        </div>

        <div className="quiz-proof__auxiliary" aria-label="Próximos registros">
          {auxiliaries.map((asset) => {
            const index = proofAssets.findIndex((candidate) => candidate.id === asset.id);
            const auxiliaryCategory = proofCategories.find((candidate) => candidate.id === asset.category);
            return (
              <button key={asset.id} type="button" onClick={() => setActiveIndex(index)}>
                <img src={asset.src} width={asset.width} height={asset.height} alt="" />
                <span>{auxiliaryCategory?.label} · {asset.sequenceLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="quiz-proof__limits">
        <strong>O que esta autorização permite afirmar</strong>
        <p>
          As nove imagens foram autorizadas para publicação pela responsável pelo projeto.
          O acervo não documenta, por cliente, contexto, cronologia nem atribuição causal ao CeluClin.
          Por isso, não apresentamos estas imagens como resultado causado pelo produto.
          Experiências individuais podem variar.
        </p>
      </div>
      {onContinue === undefined ? null : (
        <button className="quiz-primary-action" type="button" onClick={onContinue}>
          Continuar com estes limites visíveis <span aria-hidden="true">→</span>
        </button>
      )}
    </section>
  );
}
