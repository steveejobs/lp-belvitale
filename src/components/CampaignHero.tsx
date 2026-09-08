import { recordHomeEvent } from "../analytics/homeEvents";
import { homeContent } from "../content/homeContent";
import { commercialNavigationReady } from "../data/commercialPreview";

export function CampaignHero() {
  const { hero } = homeContent;
  return (
    <section className="campaign-hero" id="inicio" aria-labelledby="hero-title">
      <div className="campaign-hero__grid section-shell">
        <div className="campaign-hero__copy">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 id="hero-title"><span>{hero.titleLead}</span>{" "}<em>{hero.titleAccent}</em></h1>
          <p className="campaign-hero__lead">{hero.lead}</p>
          <p className="campaign-hero__product">Conheça o <strong>CeluClin</strong>, suplemento alimentar da Belvitale para complementar a sua rotina de cuidado.</p>
          <div className="campaign-hero__actions">
            <a className="button button--primary" href="#celuclin" onClick={() => recordHomeEvent("hero_cta_click", { destination: "product" })}>{hero.primaryAction}<span aria-hidden="true">↗</span></a>
            <a className="button button--quiet" href={commercialNavigationReady ? "#ofertas" : "#composicao"} onClick={() => recordHomeEvent("hero_cta_click", { destination: commercialNavigationReady ? "offers" : "formula" })}>{commercialNavigationReady ? hero.secondaryAction : "Ver a composição"}</a>
          </div>
          <p className="campaign-hero__notice">Suplemento alimentar. Não é medicamento.</p>
        </div>
        <figure className="campaign-hero__visual campaign-hero__visual--product">
          <img src="/product/celuclin-home-960.webp" srcSet="/product/celuclin-home-640.webp 640w, /product/celuclin-home-960.webp 960w" sizes="(min-width: 56rem) 46vw, calc(100vw - 2rem)" width="960" height="1440" alt="Apresentação ilustrativa do frasco CeluClin, com tampa magenta e rótulo Belvitale." fetchPriority="high" decoding="async" />
          <figcaption><span>CELUCLIN</span><span>Seu cuidado. Seu momento.</span></figcaption>
        </figure>
      </div>
      <div className="home-assurance section-shell" aria-label="Informações do produto"><span>Com vitamina C e zinco</span><span>Composição para consultar</span><a href="#rotulo">Rótulo completo à vista <span aria-hidden="true">↗</span></a></div>
    </section>
  );
}
