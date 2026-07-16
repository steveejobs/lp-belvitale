import { useRef, useState, type PointerEvent } from "react";
import { homeContent } from "../content/homeContent";
import { campaignAssets, type CampaignAsset } from "../data/campaignAssets";
import { useReducedMotion } from "../hooks/useReducedMotion";
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
  const mediaRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const product = homeContent.product;
  const activeView =
    productViews.find((view) => view.id === activeId) ?? productViews[0];

  function moveProduct(event: PointerEvent<HTMLElement>) {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    mediaRef.current?.style.setProperty("--story-pointer-x", `${String(x * 7)}px`);
    mediaRef.current?.style.setProperty("--story-pointer-y", `${String(y * 5)}px`);
  }

  function resetProduct() {
    mediaRef.current?.style.setProperty("--story-pointer-x", "0px");
    mediaRef.current?.style.setProperty("--story-pointer-y", "0px");
  }

  return (
    <section className="product-story" id="celuclin" aria-labelledby="product-title">
      <Reveal className="product-story__intro section-shell" effect="slide-left">
        <p className="eyebrow">{product.eyebrow}</p>
        <h2 id="product-title">{product.title}</h2>
        <p>{product.body}</p>
      </Reveal>

      <div className="product-story__experience section-shell">
        <Reveal className="product-story__media" effect="clip" delay={60}>
          <figure
            id="product-view-panel"
            ref={mediaRef}
            data-view={activeView.id}
            onPointerMove={moveProduct}
            onPointerLeave={resetProduct}
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

        <div className="product-story__details">
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
        </div>
      </div>
    </section>
  );
}
