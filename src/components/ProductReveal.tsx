import { homeContent } from "../content/homeContent";
import { institutionalAssets, isApprovedAsset } from "../data/siteAssets";

export function ProductReveal() {
  const { product } = homeContent;
  const label = institutionalAssets.labelArtwork;

  return (
    <section
      className="product-reveal"
      id="celuclin"
      aria-labelledby="product-reveal-title"
    >
      <div className="product-reveal__media">
        <div className="product-reveal__glass" aria-hidden="true" />
        {isApprovedAsset(label) ? (
          <img
            src="/label/celuclin-label-front-hero.webp"
            width={label.width}
            height={label.height}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : null}
        <span aria-hidden="true">CeluClin</span>
      </div>

      <div className="section-shell product-reveal__layout">
        <div className="product-reveal__copy">
          <p className="eyebrow eyebrow--light">{product.eyebrow}</p>
          <h2 id="product-reveal-title">{product.title}</h2>
          <p>{product.body}</p>
          <a className="text-link text-link--light" href="#rotulo">
            {product.labelAction}
            <span aria-hidden="true">↘</span>
          </a>
        </div>

        <dl className="product-reveal__facts">
          {product.facts.map((fact) => (
            <div key={fact.value}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
