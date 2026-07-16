import { homeContent } from "../content/homeContent";
import {
  campaignAssets,
  canRenderCampaignAsset,
} from "../data/campaignAssets";
import { commercialNavigationReady } from "../data/commercialPreview";

export function CampaignClosing() {
  const { closing } = homeContent;
  const media = campaignAssets.lifestyleHero;
  const canShowMedia = canRenderCampaignAsset(media);

  return (
    <section className="campaign-closing" id="belvitale" aria-labelledby="closing-title">
      {canShowMedia ? (
        <img src={media.src} width={media.width} height={media.height} alt="" loading="lazy" decoding="async" />
      ) : null}
      <div className="campaign-closing__veil" aria-hidden="true" />
      <div className="campaign-closing__content section-shell">
        <p className="eyebrow eyebrow--light">{closing.eyebrow}</p>
        <h2 id="closing-title">
          <span>{closing.titleLead}</span>
          <em>{closing.titleAccent}</em>
        </h2>
        <p>{closing.body}</p>
        <a
          className="button button--light"
          href={commercialNavigationReady ? "#ofertas" : "#rotulo"}
        >
          {commercialNavigationReady ? "Ver opções do CeluClin" : "Ler o rótulo completo"}
        </a>
      </div>
    </section>
  );
}
