import { useRef, useState, type UIEvent } from "react";
import { homeContent } from "../content/homeContent";
import {
  proofAssets,
  proofAuthorization,
  type ProofAsset,
} from "../data/proofGallery";

function ProofFigure({ asset }: { readonly asset: ProofAsset }) {
  return (
    <figure className="proof-figure">
      {asset.src === null ? null : (
        <img
          src={asset.src}
          width={asset.width}
          height={asset.height}
          alt={asset.alt}
          loading="lazy"
          decoding="async"
        />
      )}
      <figcaption>
        <span>{asset.sequenceLabel}</span>
        <small>Enquadramento preservado · ordem não inferida</small>
      </figcaption>
    </figure>
  );
}

export function ProofStories() {
  const railRef = useRef<HTMLDivElement>(null);
  const [celluliteIndex, setCelluliteIndex] = useState(0);
  const { proof } = homeContent;
  const cellulite = proofAssets.filter((asset) => asset.category === "cellulite");
  const laxity = proofAssets.filter((asset) => asset.category === "laxity");
  const localizedFat = proofAssets.filter((asset) => asset.category === "localized-fat");

  function updateRail(event: UIEvent<HTMLDivElement>) {
    const rail = event.currentTarget;
    const first = rail.querySelector<HTMLElement>(".proof-figure");
    if (first === null) return;
    const step = first.offsetWidth + 16;
    setCelluliteIndex(Math.max(0, Math.min(cellulite.length - 1, Math.round(rail.scrollLeft / step))));
  }

  function moveRail(direction: -1 | 1) {
    const rail = railRef.current;
    if (rail === null) return;
    const first = rail.querySelector<HTMLElement>(".proof-figure");
    if (first === null) return;
    rail.scrollBy({ left: direction * (first.offsetWidth + 16), behavior: "smooth" });
  }

  return (
    <section className="proof-stories" id="resultados" aria-labelledby="proof-title">
      <div className="proof-stories__heading section-shell">
        <p className="eyebrow eyebrow--light">{proof.eyebrow}</p>
        <h2 id="proof-title">
          <span>{proof.titleLead}</span>
          <em>{proof.titleAccent}</em>
        </h2>
        <p>{proof.context}</p>
      </div>

      <section className="proof-chapter proof-chapter--cellulite" aria-labelledby="proof-cellulite-title">
        <div className="proof-chapter__title section-shell">
          <p>Capítulo 01</p>
          <h3 id="proof-cellulite-title">Celulite</h3>
          <div className="proof-rail__controls">
            <button type="button" onClick={() => moveRail(-1)} aria-label="Registro anterior de celulite">←</button>
            <span aria-live="polite">{celluliteIndex + 1} / {cellulite.length}</span>
            <button type="button" onClick={() => moveRail(1)} aria-label="Próximo registro de celulite">→</button>
          </div>
        </div>
        <div className="proof-rail" ref={railRef} onScroll={updateRail} tabIndex={0} aria-label="Série autorizada de celulite">
          {cellulite.map((asset) => <ProofFigure asset={asset} key={asset.id} />)}
        </div>
      </section>

      <section className="proof-chapter proof-chapter--laxity" aria-labelledby="proof-laxity-title">
        <div className="proof-chapter__title section-shell">
          <p>Capítulo 02</p>
          <h3 id="proof-laxity-title">Flacidez</h3>
        </div>
        <div className="proof-diptych section-shell">
          {laxity.map((asset) => <ProofFigure asset={asset} key={asset.id} />)}
        </div>
      </section>

      <section className="proof-chapter proof-chapter--localized" aria-labelledby="proof-localized-title">
        <div className="proof-chapter__title section-shell">
          <p>Capítulo 03</p>
          <h3 id="proof-localized-title">Gordura localizada</h3>
        </div>
        <div className="proof-triptych">
          {localizedFat.map((asset) => <ProofFigure asset={asset} key={asset.id} />)}
        </div>
      </section>

      <div className="proof-stories__disclaimer section-shell">
        <strong>{proofAuthorization.disclaimer}</strong>
        <span>As séries não informam pessoa, período ou duração.</span>
      </div>
    </section>
  );
}
