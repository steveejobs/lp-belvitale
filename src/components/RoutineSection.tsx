import { homeContent } from "../content/homeContent";
import {
  campaignAssets,
  canRenderCampaignAsset,
} from "../data/campaignAssets";
import {
  professionalGuidance,
  usageFact,
  warningFacts,
} from "../data/productFacts";

export function RoutineSection() {
  const warnings = warningFacts.filter((warning) => warning.status === "confirmed");
  const { routine } = homeContent;
  const lifestyle = campaignAssets.lifestyleRoutine;
  const hand = campaignAssets.productInHand;
  const hasExactDuration =
    usageFact.durationDays !== null &&
    usageFact.durationDays !== undefined &&
    usageFact.totalCapsules !== undefined &&
    usageFact.capsulesPerDay !== undefined;

  return (
    <section className="routine-section" id="rotina" aria-labelledby="routine-title">
      <div className="routine-section__media">
        {canRenderCampaignAsset(lifestyle) ? (
          <img
            className="routine-section__lifestyle"
            src={lifestyle.src}
            width={lifestyle.width}
            height={lifestyle.height}
            alt={lifestyle.alt}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="routine-section__media-fallback" aria-hidden="true" />
        )}
        {canRenderCampaignAsset(hand) ? (
          <img
            className="routine-section__hand"
            src={hand.src}
            width={hand.width}
            height={hand.height}
            alt={hand.alt}
            loading="lazy"
            decoding="async"
          />
        ) : null}
      </div>

      <div className="section-shell routine-section__layout">
        <div className="routine-section__heading">
          <p className="eyebrow">{routine.eyebrow}</p>
          <h2 id="routine-title">
            <span>{routine.titleLead}</span>
            <em>{routine.titleAccent}</em>
          </h2>
          <p>{routine.body}</p>
        </div>

        {hasExactDuration ? (
          <div className="routine-equation" aria-label="Cálculo da duração: 60 cápsulas divididas por 2 ao dia equivalem a 30 dias">
            <div><strong>{usageFact.totalCapsules}</strong><span>no frasco</span></div>
            <b aria-hidden="true">÷</b>
            <div><strong>{usageFact.capsulesPerDay}</strong><span>por dia</span></div>
            <b aria-hidden="true">=</b>
            <div><strong>{usageFact.durationDays}</strong><span>dias</span></div>
          </div>
        ) : null}

        <aside className="routine-guidance" aria-labelledby="guidance-title">
          <h3 id="guidance-title">Antes de incluir na rotina</h3>
          <div>
            <p>{usageFact.audience}.</p>
            {warnings.map((warning) => <p key={warning.id}>{warning.text}</p>)}
            <p>{professionalGuidance}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
