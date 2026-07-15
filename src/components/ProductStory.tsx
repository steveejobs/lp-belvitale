import { useEffect, useRef, useState } from "react";
import { homeContent } from "../content/homeContent";
import {
  campaignAssets,
  canRenderCampaignAsset,
  type CampaignAsset,
} from "../data/campaignAssets";

const productMedia: readonly CampaignAsset[] = [
  campaignAssets.productFrontClose,
  campaignAssets.productAngle,
  campaignAssets.productInHand,
];

export function ProductStory() {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const product = homeContent.product;
  const hasMedia = productMedia.some(canRenderCampaignAsset);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible === undefined) return;
        const index = Number((visible.target as HTMLElement).dataset.stageIndex);
        if (Number.isInteger(index)) setActiveIndex(index);
      },
      { rootMargin: "-35% 0px -35%", threshold: [0, 0.5, 1] },
    );
    stepRefs.current.forEach((element) => {
      if (element !== null) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section className="product-story" id="celuclin" aria-labelledby="product-title">
      <div className="product-story__stage">
        <div className="product-story__media" data-has-media={hasMedia}>
          {hasMedia ? (
            productMedia.map((asset, index) =>
              canRenderCampaignAsset(asset) ? (
                <img
                  key={asset.id}
                  src={asset.src}
                  width={asset.width}
                  height={asset.height}
                  alt={index === activeIndex ? asset.alt : ""}
                  aria-hidden={index !== activeIndex}
                  data-active={index === activeIndex}
                  loading="lazy"
                  decoding="async"
                />
              ) : null,
            )
          ) : (
            <div className="product-story__media-gate">
              <span>60</span>
              <strong>CeluClin</strong>
              <small>imagem oficial em validação</small>
            </div>
          )}
          <span className="product-story__glass" aria-hidden="true" />
          <p aria-live="polite">
            Cena {activeIndex + 1} de {productMedia.length}
          </p>
        </div>

        <div className="product-story__content section-shell">
          <div className="product-story__heading">
            <p className="eyebrow eyebrow--light">{product.eyebrow}</p>
            <h2 id="product-title">{product.title}</h2>
            <p>{product.body}</p>
          </div>

          <div className="product-story__steps" aria-label="Cenas do produto">
            {product.stages.map((stage, index) => (
              <button
                key={stage.id}
                type="button"
                ref={(element) => {
                  stepRefs.current[index] = element;
                }}
                data-stage-index={index}
                data-active={index === activeIndex}
                aria-pressed={index === activeIndex}
                onClick={() => setActiveIndex(index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{stage.kicker}</strong>
                <small>{stage.copy}</small>
              </button>
            ))}
          </div>
        </div>
      </div>

      <dl className="product-story__facts section-shell">
        {product.facts.map((fact) => (
          <div key={fact.value}>
            <dd>{fact.value}</dd>
            <dt>{fact.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
