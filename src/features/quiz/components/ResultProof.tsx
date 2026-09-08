import { useState, type CSSProperties } from "react";
import { proofAssets, proofAuthorization } from "../../../data/proofGallery";
import { concernLabels, getPersonalizedProof } from "../content/proof";
import type { ConcernId } from "../domain/quiz.types";
import { useQuizScrollReveal } from "../motion/useQuizScrollReveal";

export function ResultProof({ concern }: { readonly concern: ConcernId }) {
  const [expanded, setExpanded] = useState(false);
  const preferredCategory = getPersonalizedProof(concern)[0]?.category ?? "cellulite";
  const featuredProof = proofAssets
    .filter((asset) => asset.category === preferredCategory)
    .filter((asset) => asset.verificationStatus === "owner-authorized");
  const { ref: revealRef, visible } = useQuizScrollReveal<HTMLElement>();
  if (featuredProof.length === 0) return null;

  return (
    <section
      ref={revealRef}
      className="q7-result-proof q7-scroll-reveal"
      data-visible={visible}
      aria-labelledby="q7-result-proof-title"
    >
      <header className="q7-result-proof__heading">
        <p className="q7-step-label">Registros visuais autorizados</p>
        <h2 id="q7-result-proof-title">Veja os registros. Considere também o contexto.</h2>
        <p>Estes registros de {concernLabels[concern].toLocaleLowerCase("pt-BR")} foram enviados e autorizados pela marca. Não recebemos identidade, data, duração ou cronologia para atribuir a cada imagem.</p>
      </header>

      <div className="q7-result-proof__mosaic" data-expanded={expanded} aria-label={`Registros visuais autorizados sobre ${concernLabels[concern].toLocaleLowerCase("pt-BR")}`}>
        {(expanded ? featuredProof : featuredProof.slice(0, 3)).map((asset, index) => (
          <figure key={asset.id} style={{ "--q7-proof-order": index } as CSSProperties}>
            <div className="q7-result-proof__image">
              <img
                src={asset.src}
                width={asset.width}
                height={asset.height}
                alt={asset.alt}
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
                style={{ aspectRatio: asset.aspectRatio, objectFit: asset.fit, objectPosition: asset.objectPosition }}
              />
            </div>
            <figcaption><span>{asset.category === "laxity" ? "Flacidez" : asset.category === "localized-fat" ? "Contorno" : "Celulite"}</span>{asset.sequenceLabel}</figcaption>
          </figure>
        ))}
      </div>

      {featuredProof.length <= 3 ? null : (
        <button className="q7-result-proof__toggle" type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Mostrar apenas os 3 prioritários" : `Ver todos os ${String(featuredProof.length)} registros`}
        </button>
      )}

      <p className="q7-result-proof__disclaimer">{proofAuthorization.disclaimer}</p>
    </section>
  );
}
