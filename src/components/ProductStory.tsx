import { useState, type KeyboardEvent } from "react";
import { homeContent } from "../content/homeContent";
import { campaignAssets, type CampaignAsset } from "../data/campaignAssets";

interface ProductScene {
  readonly asset: CampaignAsset;
  readonly label: string;
  readonly note: string;
  readonly fit: "contain" | "cover";
  readonly objectPosition: string;
}

const productScenes: readonly ProductScene[] = [
  {
    asset: campaignAssets.productFrontPrimary,
    label: "Frasco frontal",
    note: "O CeluClin por inteiro, com produto, tampa e rótulo no mesmo enquadramento.",
    fit: "contain",
    objectPosition: "center center",
  },
  {
    asset: campaignAssets.productFrontClose,
    label: "Rótulo em detalhe",
    note: "A identidade do CeluClin em enquadramento aproximado.",
    fit: "contain",
    objectPosition: "center center",
  },
  {
    asset: campaignAssets.productAngle,
    label: "Vista em ângulo",
    note: "Tampa pink, rótulo magenta e cápsulas à vista.",
    fit: "contain",
    objectPosition: "center center",
  },
  {
    asset: campaignAssets.productInHand,
    label: "Escala real",
    note: "O frasco na mão, com proporção e presença claras.",
    fit: "contain",
    objectPosition: "center center",
  },
  {
    asset: campaignAssets.capsules,
    label: "Cápsulas",
    note: "A apresentação visual das cápsulas que compõem a rotina.",
    fit: "cover",
    objectPosition: "center center",
  },
  {
    asset: campaignAssets.lifestyleHero,
    label: "Em cena",
    note: "O produto em uma composição clara, sem competir com a informação.",
    fit: "contain",
    objectPosition: "center center",
  },
];

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

export function ProductStory() {
  const [activeIndex, setActiveIndex] = useState(0);
  const product = homeContent.product;
  const activeScene = productScenes[activeIndex] ?? productScenes[0];

  function select(index: number) {
    setActiveIndex((index + productScenes.length) % productScenes.length);
  }

  function moveWithKeyboard(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    select(index + (event.key === "ArrowRight" ? 1 : -1));
  }

  return (
    <section className="product-story" id="celuclin" aria-labelledby="product-title">
      <div className="product-story__intro section-shell">
        <div>
          <p className="eyebrow">{product.eyebrow}</p>
          <h2 id="product-title">CeluClin, visto por inteiro.</h2>
        </div>
        <p>{product.body}</p>
      </div>

      <div className="product-story__gallery section-shell">
        <div className="product-story__media" aria-live="polite">
          {productScenes.map((scene, index) => (
            <img
              key={scene.asset.id}
              src={scene.asset.src}
              width={scene.asset.width}
              height={scene.asset.height}
              alt={index === activeIndex ? scene.asset.alt : ""}
              aria-hidden={index !== activeIndex}
              data-active={index === activeIndex}
              loading="lazy"
              decoding="async"
              style={{
                objectFit: scene.fit,
                objectPosition: scene.objectPosition,
              }}
            />
          ))}
          <div className="product-story__counter" aria-hidden="true">
            {String(activeIndex + 1).padStart(2, "0")} / {String(productScenes.length).padStart(2, "0")}
          </div>
          <div className="product-story__arrows">
            <button type="button" onClick={() => select(activeIndex - 1)} aria-label="Imagem anterior do produto">
              <Arrow direction="left" />
            </button>
            <button type="button" onClick={() => select(activeIndex + 1)} aria-label="Próxima imagem do produto">
              <Arrow direction="right" />
            </button>
          </div>
        </div>

        <div className="product-story__details">
          <div className="product-story__scene-copy" key={activeScene?.asset.id}>
            <span>Detalhe {String(activeIndex + 1).padStart(2, "0")}</span>
            <h3>{activeScene?.label}</h3>
            <p>{activeScene?.note}</p>
          </div>

          <div className="product-story__thumbs" role="tablist" aria-label="Imagens do CeluClin">
            {productScenes.map((scene, index) => (
              <button
                key={scene.asset.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Ver ${scene.label.toLowerCase()}`}
                onClick={() => select(index)}
                onKeyDown={(event) => moveWithKeyboard(event, index)}
              >
                <img
                  src={scene.asset.src}
                  width={scene.asset.width}
                  height={scene.asset.height}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
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
        <div className="product-story__fact-note">
          <dd>Suplemento alimentar</dd>
          <dt>Não é medicamento.</dt>
        </div>
      </dl>
    </section>
  );
}
