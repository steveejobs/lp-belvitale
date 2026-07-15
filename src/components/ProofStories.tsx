import { useState } from "react";
import { homeContent } from "../content/homeContent";
import {
  proofAssets,
  proofAuthorization,
  proofCategories,
  type ProofAsset,
  type ProofCategoryId,
} from "../data/proofGallery";

function Arrow({ direction }: { readonly direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <path
        d={direction === "left" ? "M15 5 8 12l7 7" : "m9 5 7 7-7 7"}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ProofFigure({ asset, active }: { readonly asset: ProofAsset; readonly active: boolean }) {
  return (
    <figure className="proof-figure" data-active={active} aria-hidden={!active}>
      {asset.src === null ? null : (
        <img
          src={asset.src}
          width={asset.width}
          height={asset.height}
          alt={active ? asset.alt : ""}
          loading="lazy"
          decoding="async"
        />
      )}
      <figcaption className="sr-only">Imagem autorizada da série selecionada.</figcaption>
    </figure>
  );
}

export function ProofStories() {
  const [activeCategory, setActiveCategory] = useState<ProofCategoryId>("cellulite");
  const [activeByCategory, setActiveByCategory] = useState<Record<ProofCategoryId, number>>({
    cellulite: 0,
    laxity: 0,
    "localized-fat": 0,
  });
  const { proof } = homeContent;

  function selectAsset(category: ProofCategoryId, index: number) {
    const categoryAssets = proofAssets.filter((asset) => asset.category === category);
    const normalized = (index + categoryAssets.length) % categoryAssets.length;
    setActiveByCategory((current) => ({ ...current, [category]: normalized }));
  }

  return (
    <section className="proof-stories" id="resultados" aria-labelledby="proof-title">
      <div className="proof-stories__heading section-shell">
        <p className="eyebrow">{proof.eyebrow}</p>
        <h2 id="proof-title">Resultados organizados para você ver com clareza.</h2>
        <p>{proof.context}</p>
      </div>

      <div className="proof-gallery section-shell">
        <div className="proof-gallery__tabs" role="tablist" aria-label="Soluções apresentadas">
          {proofCategories.map((category) => (
            <button
              key={category.id}
              id={`proof-tab-${category.id}`}
              type="button"
              role="tab"
              aria-selected={activeCategory === category.id}
              aria-controls={`proof-panel-${category.id}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {proofCategories.map((category) => {
          const assets = proofAssets.filter((asset) => asset.category === category.id);
          const activeIndex = activeByCategory[category.id];

          return (
            <section
              className="proof-gallery__panel"
              id={`proof-panel-${category.id}`}
              key={category.id}
              role="tabpanel"
              aria-labelledby={`proof-tab-${category.id}`}
              hidden={activeCategory !== category.id}
            >
              <div className="proof-gallery__stage">
                {assets.map((asset, index) => (
                  <ProofFigure asset={asset} active={index === activeIndex} key={asset.id} />
                ))}

                <div className="proof-gallery__controls">
                  <button
                    type="button"
                    onClick={() => selectAsset(category.id, activeIndex - 1)}
                    aria-label={`Imagem anterior de ${category.label.toLowerCase()}`}
                  >
                    <Arrow direction="left" />
                  </button>
                  <span aria-live="polite">
                    {String(activeIndex + 1).padStart(2, "0")} / {String(assets.length).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => selectAsset(category.id, activeIndex + 1)}
                    aria-label={`Próxima imagem de ${category.label.toLowerCase()}`}
                  >
                    <Arrow direction="right" />
                  </button>
                </div>
              </div>

              <div className="proof-gallery__thumbs" aria-label={`Imagens de ${category.label.toLowerCase()}`}>
                {assets.map((asset, index) => (
                  <button
                    key={asset.id}
                    type="button"
                    aria-pressed={index === activeIndex}
                    aria-label={`Ver imagem ${String(index + 1)} de ${category.label.toLowerCase()}`}
                    onClick={() => selectAsset(category.id, index)}
                  >
                    {asset.src === null ? null : (
                      <img
                        src={asset.src}
                        width={asset.width}
                        height={asset.height}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="proof-stories__disclaimer section-shell">
        <strong>{proofAuthorization.disclaimer}</strong>
        <span>As séries não informam pessoa, período ou duração.</span>
      </div>
    </section>
  );
}
