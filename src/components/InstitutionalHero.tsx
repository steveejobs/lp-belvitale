import { institutionalAssets, isApprovedAsset } from "../data/siteAssets";

function AbstractProductStage() {
  return (
    <div className="hero-art" aria-hidden="true" data-testid="hero-fallback">
      <span className="hero-art__rail hero-art__rail--top" />
      <span className="hero-art__rail hero-art__rail--bottom" />
      <div className="hero-art__seal">
        <span>Belvitale</span>
        <strong>CeluClin</strong>
        <small>suplemento alimentar</small>
      </div>
      <span className="hero-art__orbit" />
    </div>
  );
}

export function InstitutionalHero() {
  const productAsset = institutionalAssets.productPackshot;

  return (
    <section
      className="institutional-hero"
      id="inicio"
      aria-labelledby="hero-title"
    >
      <div className="institutional-hero__inner section-shell">
        <div className="institutional-hero__copy">
          <p className="institutional-eyebrow">
            Belvitale <span aria-hidden="true">·</span> autocuidado com
            transparência
          </p>
          <h1 id="hero-title">Cuidado que começa com informação clara.</h1>
          <p className="institutional-hero__lead">
            CeluClin é um suplemento alimentar pensado para fazer parte de uma
            rotina de autocuidado simples, consciente e possível de manter.
          </p>
          <div className="institutional-hero__actions">
            <a
              className="institutional-button institutional-button--primary"
              href="#celuclin"
            >
              Conhecer o CeluClin
            </a>
            <a
              className="institutional-button institutional-button--secondary"
              href="#composicao"
            >
              Ver composição
            </a>
          </div>
          <p className="institutional-hero__notice">
            Suplemento alimentar. Experiências e resultados podem variar.
          </p>
        </div>

        <div className="institutional-hero__visual">
          {isApprovedAsset(productAsset) ? (
            <img
              src={productAsset.src}
              width={productAsset.width}
              height={productAsset.height}
              alt={productAsset.alt}
              sizes="(min-width: 56rem) 42vw, 100vw"
            />
          ) : (
            <AbstractProductStage />
          )}
        </div>
      </div>
    </section>
  );
}
