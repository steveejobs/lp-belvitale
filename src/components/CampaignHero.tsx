import { recordHomeEvent } from "../analytics/homeEvents";
import { campaignAssets } from "../data/campaignAssets";
import { usePointerMotion } from "../hooks/usePointerMotion";

export function CampaignHero() {
  const pointerMotion = usePointerMotion<HTMLDivElement>({
    propertyX: "--pointer-x",
    propertyY: "--pointer-y",
    maxX: 5,
    maxY: 4,
  });
  const product = campaignAssets.productAngle;
  const title = "Belvitale. Cuidado que começa pela clareza.";

  return (
    <section className="campaign-hero" id="inicio" aria-labelledby="hero-title">
      <div className="campaign-hero__grid section-shell">
        <div className="campaign-hero__copy">
          <p className="eyebrow">Belvitale / cuidado para a vida real</p>
          <h1 id="hero-title" aria-label={title}>
            <span aria-hidden="true">Uma rotina de cuidado</span>
            <em aria-hidden="true">começa pela clareza.</em>
          </h1>
          <p className="campaign-hero__lead">
            Conheça o CeluClin, suplemento alimentar em cápsulas da Belvitale:
            60 cápsulas, uso informado de 2 ao dia e aproximadamente 30 dias por frasco.
          </p>
          <div className="campaign-hero__actions">
            <a
              className="button button--primary"
              href="#celuclin"
              onClick={() => recordHomeEvent("hero_cta_click", { destination: "product" })}
            >
              Conhecer o CeluClin
            </a>
            <a
              className="button button--quiet"
              href="/quiz"
              onClick={() => recordHomeEvent("quiz_cta_click", { location: "hero" })}
            >
              Descobrir pelo quiz
            </a>
          </div>
          <div className="campaign-hero__facts">
            <strong>60 cápsulas · 2 ao dia · aproximadamente 30 dias</strong>
            <span>Suplemento alimentar. Não é medicamento.</span>
          </div>
        </div>

        <div
          className="campaign-hero__visual campaign-hero__visual--product"
          data-media-status="approved"
          {...pointerMotion}
        >
          <span className="campaign-hero__visual-wash" aria-hidden="true" />
          <img
            src={product.src}
            width={product.width}
            height={product.height}
            alt={product.alt}
            fetchPriority="high"
            decoding="async"
          />
          <span className="campaign-hero__category">CeluClin / Belvitale</span>
          <p className="campaign-hero__visual-note">Suplemento alimentar em cápsulas.</p>
        </div>
      </div>
    </section>
  );
}
