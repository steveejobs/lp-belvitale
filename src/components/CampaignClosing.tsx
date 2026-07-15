import { homeContent } from "../content/homeContent";
import {
  campaignAssets,
  canRenderCampaignAsset,
} from "../data/campaignAssets";
import { quizPublicationApproved } from "../data/quizPublicationConfig";

export function CampaignClosing() {
  const { closing } = homeContent;
  const media = campaignAssets.lifestyleFreedom;
  const canShowMedia = canRenderCampaignAsset(media);
  const quizAvailable =
    import.meta.env.DEV ||
    import.meta.env.VITE_INTERNAL_QUIZ === "true" ||
    quizPublicationApproved;

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
        <a className="button button--light" href={quizAvailable ? "/quiz" : "#composicao"}>
          {quizAvailable ? closing.action : "Conhecer a composição"}
        </a>
      </div>
    </section>
  );
}
