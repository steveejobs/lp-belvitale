import { useEffect, useRef, useState } from "react";
import { recordHomeEvent } from "../analytics/homeEvents";
import { homeContent } from "../content/homeContent";
import { campaignAssets, type CampaignAsset } from "../data/campaignAssets";
import { commercialNavigationReady } from "../data/commercialPreview";
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
    asset: { ...campaignAssets.productAngle, src: "/product/celuclin-home-960.webp", width: 960, height: 1440, alt: "Apresentação ilustrativa do frasco CeluClin." },
    label: "O produto",
    note: "Apresentação ilustrativa. Confira as informações no rótulo original.",
    responsiveSrc: "/product/celuclin-home-640.webp",
  },
  {
    id: "front",
    asset: { ...campaignAssets.productFrontClose, src: "/label/celuclin-label-front.webp", width: 1310, height: 621, alt: "Arte original do rótulo CeluClin, com composição, tabela e avisos." },
    label: "Rótulo original",
    note: "Arte original da embalagem, disponível para ampliar na seção de rótulo.",
    responsiveSrc: "/label/celuclin-label-front.webp",
  },
] as const satisfies readonly ProductView[];

export function ProductStory() {
  const sectionRef = useRef<HTMLElement>(null);
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

  useEffect(() => {
    const section = sectionRef.current;
    if (section === null) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      recordHomeEvent("product_view", { productView: activeView.id }, `product-${activeView.id}`);
      observer.disconnect();
    }, { threshold: 0.2 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [activeView.id]);

  return (
    <section ref={sectionRef} className="product-story" id="celuclin" aria-labelledby="product-title">
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
              srcSet={activeView.id === "angle" ? `${activeView.responsiveSrc} 640w, ${activeView.asset.src} 960w` : undefined}
              sizes="(min-width: 56rem) 40vw, calc(100vw - 2rem)"
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
          <div className="product-story__switch" role="group" aria-label="Visualização do produto">
            {productViews.map((view) => (
              <button
                key={view.id}
                type="button"
                aria-pressed={activeView.id === view.id}
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
            <span>*Duração conforme o uso de 2 cápsulas ao dia informado no rótulo. Não é prazo de resultado.</span>
          </p>

          <div className="product-story__actions">
            <a
              className="button button--primary"
              href={commercialNavigationReady ? "#ofertas" : "#rotulo"}
              onClick={() => recordHomeEvent("product_cta_click", { destination: commercialNavigationReady ? "offers" : "label" })}
            >
              {commercialNavigationReady ? "Escolher meu kit" : "Ler o rótulo"}
            </a>
            <a
              className="button button--quiet"
              href="#composicao"
            >
              Entender a fórmula
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
