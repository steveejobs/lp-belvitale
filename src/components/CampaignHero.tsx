import { homeContent } from "../content/homeContent";
import { campaignAssets } from "../data/campaignAssets";
import { commercialNavigationReady } from "../data/commercialPreview";
import { usePointerMotion } from "../hooks/usePointerMotion";

export function CampaignHero() {
  const pointerMotion = usePointerMotion<HTMLDivElement>({
    propertyX: "--pointer-x",
    propertyY: "--pointer-y",
    maxX: 8,
    maxY: 6,
  });
  const product = campaignAssets.productFrontPrimary;
  const { hero } = homeContent;
  const title = `${hero.titleLead} ${hero.titleAccent}`;

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
          {...pointerMotion}
        >
          <picture>
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
