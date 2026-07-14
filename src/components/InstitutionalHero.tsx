import { homeContent } from "../content/homeContent";
import { institutionalAssets, isApprovedAsset } from "../data/siteAssets";

function LabelSculpture() {
  const label = institutionalAssets.labelArtwork;

  return (
    <div className="hero-sculpture" aria-hidden="true">
      <span className="hero-sculpture__band hero-sculpture__band--one" />
      <span className="hero-sculpture__band hero-sculpture__band--two" />
      <span className="hero-sculpture__transparency" />
      {isApprovedAsset(label) ? (
        <div className="hero-sculpture__label">
          <img
            src="/label/celuclin-label-front-hero.webp"
            width={label.width}
            height={label.height}
            alt=""
            fetchPriority="high"
            decoding="sync"
          />
        </div>
      ) : null}
      <span className="hero-sculpture__word">escolha</span>
    </div>
  );
}

export function InstitutionalHero() {
  const { hero } = homeContent;

  return (
    <section
      className="institutional-hero"
      id="inicio"
      aria-labelledby="hero-title"
    >
      <div className="institutional-hero__grid section-shell">
        <div className="institutional-hero__copy">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 id="hero-title">
            <span>{hero.titleLead}</span>
            <em>
              {hero.titleAccent.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </em>
          </h1>
          <p className="institutional-hero__lead">{hero.lead}</p>
          <div className="institutional-hero__actions">
            <a className="button button--primary" href="#celuclin">
              {hero.primaryAction}
            </a>
            <a className="text-link" href="#composicao">
              {hero.secondaryAction}
              <span aria-hidden="true">↘</span>
            </a>
          </div>
        </div>

        <div className="institutional-hero__visual">
          <LabelSculpture />
          {import.meta.env.DEV ? (
            <p className="asset-gate-note">
              Direção de produto · packshot oficial pendente
            </p>
          ) : null}
        </div>

        <div className="institutional-hero__facts">
          <strong>{hero.meta}</strong>
          <span>{hero.notice}</span>
        </div>
      </div>
    </section>
  );
}
