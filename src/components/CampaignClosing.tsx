import { homeContent } from "../content/homeContent";
import {
  campaignAssets,
  canRenderCampaignAsset,
} from "../data/campaignAssets";
import { commercialNavigationReady } from "../data/commercialPreview";
import { Reveal } from "./ui/Reveal";

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
      <Reveal className="campaign-closing__content section-shell" effect="slide-right" stagger>
        <p className="eyebrow eyebrow--light">{closing.eyebrow}</p>
        <h2 id="closing-title">
          <span>{closing.titleLead}</span>
          <em>{closing.titleAccent}</em>
        </h2>
        <p>{closing.body}</p>
        {commercialNavigationReady ? (
          <a className="button button--light" href="#ofertas">
            {closing.action}
          </a>
        ) : null}
      </Reveal>
    </section>
  );
}
