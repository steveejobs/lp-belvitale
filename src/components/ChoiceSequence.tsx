import { homeContent } from "../content/homeContent";
import { campaignAssets } from "../data/campaignAssets";

export function ChoiceSequence() {
  const { emotional } = homeContent;
  const freedom = campaignAssets.lifestyleFreedom;
  const routine = campaignAssets.lifestyleRoutine;

  return (
    <section className="choice-sequence" id="liberdade" aria-labelledby="choice-title">
      <div className="choice-sequence__heading section-shell">
        <p className="eyebrow">{emotional.eyebrow}</p>
        <h2 id="choice-title">
          Não é sobre esconder.
          <em>É sobre voltar a escolher.</em>
        </h2>
      </div>

      <div className="choice-sequence__composition section-shell">
        <figure className="choice-sequence__media choice-sequence__media--primary">
          <img
            src={freedom.src}
            width={freedom.width}
            height={freedom.height}
            alt={freedom.alt}
            loading="lazy"
            decoding="async"
          />
          <figcaption>{emotional.title}</figcaption>
        </figure>

        <div className="choice-sequence__story">
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

          <figure className="choice-sequence__media choice-sequence__media--secondary">
            <img
              src={routine.src}
              width={routine.width}
              height={routine.height}
              alt={routine.alt}
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
