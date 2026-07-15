import { homeContent } from "../content/homeContent";
import {
  campaignAssets,
  canRenderCampaignAsset,
} from "../data/campaignAssets";

export function ChoiceSequence() {
  const { emotional } = homeContent;
  const lifestyle = campaignAssets.lifestyleFreedom;
  const canShowLifestyle = canRenderCampaignAsset(lifestyle);

  return (
    <section className="choice-sequence" id="liberdade" aria-labelledby="choice-title">
      <div className="choice-sequence__media" data-media-status={canShowLifestyle ? "preview" : "blocked"}>
        {canShowLifestyle ? (
          <img
            src={lifestyle.src}
            width={lifestyle.width}
            height={lifestyle.height}
            alt={lifestyle.alt}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="choice-sequence__media-fallback" aria-hidden="true" />
        )}
        <p>{emotional.title}</p>
      </div>

      <div className="choice-sequence__story">
        <div className="choice-sequence__intro section-shell">
          <p className="eyebrow eyebrow--light">{emotional.eyebrow}</p>
          <h2 id="choice-title">
            Não é sobre esconder.
            <em>É sobre voltar a escolher.</em>
          </h2>
        </div>
        <ol className="choice-sequence__beats">
          {emotional.beats.map((beat) => (
            <li key={beat.number}>
              <span>{beat.number}</span>
              <div>
                <p>{beat.thought}</p>
                <small>{beat.release}</small>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
