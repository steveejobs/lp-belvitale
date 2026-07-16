import { useRef, type PointerEvent } from "react";
import { homeContent } from "../content/homeContent";
import { campaignAssets } from "../data/campaignAssets";
import { commercialNavigationReady } from "../data/commercialPreview";
import { useReducedMotion } from "../hooks/useReducedMotion";

export function CampaignHero() {
  const visualRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const product = campaignAssets.productFrontPrimary;
  const { hero } = homeContent;
  const title = `${hero.titleLead} ${hero.titleAccent}`;

  function moveProduct(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    visualRef.current?.style.setProperty("--pointer-x", `${String(x * 8)}px`);
    visualRef.current?.style.setProperty("--pointer-y", `${String(y * 6)}px`);
  }

  function resetProduct() {
    visualRef.current?.style.setProperty("--pointer-x", "0px");
    visualRef.current?.style.setProperty("--pointer-y", "0px");
  }

  return (
    <section className="campaign-hero" id="inicio" aria-labelledby="hero-title">
      <div className="campaign-hero__grid section-shell">
        <div className="campaign-hero__copy">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 id="hero-title" aria-label={title}>
            <span aria-hidden="true">{hero.titleLead}</span>
            <em aria-hidden="true">{hero.titleAccent}</em>
          </h1>
          <p className="campaign-hero__lead">{hero.lead}</p>
          <div className="campaign-hero__actions">
            <a
              className="button button--primary"
              href={commercialNavigationReady ? "#ofertas" : "#celuclin"}
            >
              {commercialNavigationReady ? "Escolher meu CeluClin" : hero.primaryAction}
            </a>
            <a
              className="button button--quiet"
              href={commercialNavigationReady ? "#resultados" : "#rotulo"}
            >
              {commercialNavigationReady ? "Ver resultados" : "Ler o rótulo"}
            </a>
          </div>
          <div className="campaign-hero__facts">
            <strong>{hero.meta}</strong>
            <span>{hero.notice}</span>
          </div>
        </div>

        <div
          className="campaign-hero__visual"
          data-media-status="approved"
          ref={visualRef}
          onPointerMove={moveProduct}
          onPointerLeave={resetProduct}
        >
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
          <span className="campaign-hero__category">CeluClin</span>
        </div>
      </div>
    </section>
  );
}
