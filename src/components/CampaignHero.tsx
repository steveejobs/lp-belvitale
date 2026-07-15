import { useRef, type PointerEvent } from "react";
import { homeContent } from "../content/homeContent";
import {
  campaignAssets,
  canRenderCampaignAsset,
  internalMediaPreview,
} from "../data/campaignAssets";
import { quizPublicationApproved } from "../data/quizPublicationConfig";
import { useReducedMotion } from "../hooks/useReducedMotion";

export function CampaignHero() {
  const visualRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const product = campaignAssets.productFrontPrimary;
  const canShowProduct = canRenderCampaignAsset(product);
  const quizAvailable =
    import.meta.env.DEV ||
    import.meta.env.VITE_INTERNAL_QUIZ === "true" ||
    quizPublicationApproved;
  const { hero } = homeContent;

  function moveProduct(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    visualRef.current?.style.setProperty("--pointer-x", `${String(x * 12)}px`);
    visualRef.current?.style.setProperty("--pointer-y", `${String(y * 8)}px`);
  }

  function resetProduct() {
    visualRef.current?.style.setProperty("--pointer-x", "0px");
    visualRef.current?.style.setProperty("--pointer-y", "0px");
  }

  return (
    <section className="campaign-hero" id="inicio" aria-labelledby="hero-title">
      <div className="campaign-hero__word" aria-hidden="true">
        escolha
      </div>
      <div className="campaign-hero__grid section-shell">
        <div className="campaign-hero__copy">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 id="hero-title">
            <span>{hero.titleLead}</span>
            <em>{hero.titleAccent}</em>
          </h1>
          <p className="campaign-hero__lead">{hero.lead}</p>
          <div className="campaign-hero__actions">
            <a className="button button--primary" href="#celuclin">
              {hero.primaryAction}
            </a>
            <a
              className="text-link"
              href={quizAvailable ? "/quiz" : "#composicao"}
            >
              {quizAvailable ? hero.secondaryAction : "Abrir a composição"}
              <span aria-hidden="true">↘</span>
            </a>
          </div>
        </div>

        <div
          className="campaign-hero__visual"
          data-media-status={canShowProduct ? "preview" : "blocked"}
          ref={visualRef}
          onPointerMove={moveProduct}
          onPointerLeave={resetProduct}
        >
          <span className="campaign-hero__band campaign-hero__band--top" aria-hidden="true" />
          <span className="campaign-hero__band campaign-hero__band--bottom" aria-hidden="true" />
          {canShowProduct ? (
            <picture>
              <source
                media="(max-width: 47.99rem)"
                type="image/avif"
                srcSet={product.mobileAvifSrc}
              />
              <source
                media="(max-width: 47.99rem)"
                type="image/webp"
                srcSet={product.mobileSrc}
              />
              <img
                src={product.src}
                width={product.width}
                height={product.height}
                alt={product.alt}
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          ) : (
            <div className="campaign-hero__media-gate" role="img" aria-label="Imagem oficial do produto aguardando validação">
              <strong>CeluClin</strong>
              <span>packshot oficial em validação</span>
            </div>
          )}
          <span className="campaign-hero__category" aria-hidden="true">
            suplemento alimentar
          </span>
        </div>

        <div className="campaign-hero__facts">
          <strong>{hero.meta}</strong>
          <span>{hero.notice}</span>
          {internalMediaPreview ? (
            <small>Mídia de produto restrita a este preview interno.</small>
          ) : null}
        </div>
      </div>
    </section>
  );
}
