import { useState } from "react";
import { homeContent } from "../content/homeContent";
import { campaignAssets, type CampaignAsset } from "../data/campaignAssets";
import { usePointerMotion } from "../hooks/usePointerMotion";
import { Reveal } from "./ui/Reveal";

interface ProductView {
  readonly id: "angle" | "front";
  readonly asset: CampaignAsset;
  readonly label: string;
  readonly note: string;
  readonly responsiveSrc: string;
}

const productViews = [
  {
    id: "angle",
    asset: campaignAssets.productAngle,
    label: "Em ângulo",
    note: "Tampa pink, frasco vinho e cápsulas visíveis na base.",
    responsiveSrc: "/product/celuclin-angle-768.webp",
  },
  {
    id: "front",
    asset: campaignAssets.productFrontClose,
    label: "De frente",
    note: "Nome, categoria e quantidade fáceis de observar.",
    responsiveSrc: "/product/celuclin-front-01-768.webp",
  },
] as const satisfies readonly ProductView[];

export function ProductStory() {
  const [activeId, setActiveId] = useState<ProductView["id"]>("angle");
  const pointerMotion = usePointerMotion<HTMLElement>({
    propertyX: "--story-pointer-x",
    propertyY: "--story-pointer-y",
    maxX: 7,
    maxY: 5,
  });
  const product = homeContent.product;
  const activeView =
    productViews.find((view) => view.id === activeId) ?? productViews[0];

  return (
    <section className="product-story" id="celuclin" aria-labelledby="product-title">
      <Reveal className="product-story__intro section-shell" effect="slide-left" stagger>
        <p className="eyebrow">{product.eyebrow}</p>
        <h2 id="product-title">{product.title}</h2>
        <p>{product.body}</p>
      </Reveal>

      <div className="product-story__experience section-shell">
        <Reveal className="product-story__media" effect="clip" delay={60}>
          <figure
            id="product-view-panel"
            {...pointerMotion}
            data-view={activeView.id}
          >
            <img
              key={activeView.id}
              src={activeView.asset.src}
              srcSet={`${activeView.responsiveSrc} 768w, ${activeView.asset.src} 1122w`}
              sizes="(min-width: 56rem) 52vw, calc(100vw - 2rem)"
              width={activeView.asset.width}
              height={activeView.asset.height}
              alt={activeView.asset.alt}
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <strong>{activeView.label}</strong>
              <span>{activeView.note}</span>
            </figcaption>
          </figure>
        </Reveal>

        <Reveal className="product-story__details" effect="slide-right" delay={100}>
          <div className="product-story__switch" role="tablist" aria-label="Ângulos do produto">
            {productViews.map((view) => (
              <button
                key={view.id}
                type="button"
                role="tab"
                aria-selected={activeView.id === view.id}
                aria-controls="product-view-panel"
                onClick={() => setActiveId(view.id)}
              >
                {view.label}
              </button>
            ))}
          </div>

          <dl className="product-story__facts">
            {product.facts.map((fact) => (
              <div key={fact.value}>
                <dd>{fact.value}</dd>
                <dt>{fact.label}</dt>
              </div>
            ))}
          </dl>

          <p className="product-story__category">
            <strong>Suplemento alimentar em cápsulas.</strong>
            <span>Não é medicamento.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
