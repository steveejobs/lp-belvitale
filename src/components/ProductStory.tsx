import { useRef, type CSSProperties, type PointerEvent } from "react";
import { homeContent } from "../content/homeContent";
import { campaignAssets, type CampaignAsset } from "../data/campaignAssets";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { Reveal } from "./ui/Reveal";

interface ProductView {
  readonly asset: CampaignAsset;
  readonly label: string;
  readonly note: string;
}

const productViews: readonly ProductView[] = [
  {
    asset: campaignAssets.productAngle,
    label: "Vista em ângulo",
    note: "Tampa pink, frasco e rótulo no enquadramento original.",
  },
  {
    asset: campaignAssets.productFrontClose,
    label: "Vista frontal",
    note: "O CeluClin de frente, sem substituir o produto pela arte plana do rótulo.",
  },
];

export function ProductStory() {
  const showcaseRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const product = homeContent.product;

  function moveShowcase(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    showcaseRef.current?.style.setProperty("--story-pointer-x", `${String(x * 8)}px`);
    showcaseRef.current?.style.setProperty("--story-pointer-y", `${String(y * 6)}px`);
  }

  function resetShowcase() {
    showcaseRef.current?.style.setProperty("--story-pointer-x", "0px");
    showcaseRef.current?.style.setProperty("--story-pointer-y", "0px");
  }

  return (
    <section className="product-story" id="celuclin" aria-labelledby="product-title">
      <Reveal className="product-story__intro section-shell" effect="slide-left">
        <div>
          <p className="eyebrow">{product.eyebrow}</p>
          <h2 id="product-title">CeluClin, visto por inteiro.</h2>
        </div>
        <p>{product.body}</p>
      </Reveal>

      <Reveal className="product-story__showcase section-shell" effect="clip" delay={80}>
        <div
          className="product-story__views"
          ref={showcaseRef}
          onPointerMove={moveShowcase}
          onPointerLeave={resetShowcase}
        >
          {productViews.map((view, index) => (
            <figure
              className="product-story__view"
              key={view.asset.id}
              style={{ "--story-direction": index === 0 ? 1 : -1 } as CSSProperties}
            >
              <div className="product-story__image-frame">
                <img
                  src={view.asset.src}
                  width={view.asset.width}
                  height={view.asset.height}
                  alt={view.asset.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption>
                <strong>{view.label}</strong>
                <span>{view.note}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <aside className="product-story__note" aria-label="Apresentação do produto">
          <p className="eyebrow">Duas vistas reais</p>
          <h3>O produto aparece antes de qualquer promessa.</h3>
          <p>
            As imagens têm papéis próprios: o hero apresenta o frasco principal; aqui,
            ângulo e detalhe frontal deixam forma, tampa e identidade fáceis de observar.
          </p>
        </aside>
      </Reveal>

      <dl className="product-story__facts section-shell">
        {product.facts.map((fact) => (
          <div key={fact.value}>
            <dd>{fact.value}</dd>
            <dt>{fact.label}</dt>
          </div>
        ))}
        <div className="product-story__fact-note">
          <dd>Suplemento alimentar</dd>
          <dt>Não é medicamento.</dt>
        </div>
      </dl>
    </section>
  );
}
