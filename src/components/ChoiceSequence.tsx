import { homeContent } from "../content/homeContent";
import { campaignAssets } from "../data/campaignAssets";
import { Reveal } from "./ui/Reveal";

export function ChoiceSequence() {
  const { emotional } = homeContent;
  const freedom = campaignAssets.lifestyleFreedom;

  return (
    <section className="choice-sequence" id="liberdade" aria-labelledby="choice-title">
      <Reveal className="choice-sequence__heading section-shell" effect="slide-right" stagger>
        <p className="eyebrow">{emotional.eyebrow}</p>
        <h2 id="choice-title">
          {emotional.titleLead}
          <em>{emotional.titleAccent}</em>
        </h2>
      </Reveal>

      <Reveal className="choice-sequence__composition section-shell" effect="clip" delay={70}>
        <figure className="choice-sequence__media choice-sequence__media--primary">
          <img
            src={freedom.src}
            srcSet="/lifestyle/freedom-01-768.webp 768w, /lifestyle/freedom-01.webp 1122w"
            sizes="(min-width: 56rem) 48vw, calc(100vw - 2rem)"
            width={freedom.width}
            height={freedom.height}
            alt={freedom.alt}
            loading="lazy"
            decoding="async"
          />
          <figcaption>{emotional.caption}</figcaption>
        </figure>

        <div className="choice-sequence__story">
          <ul className="choice-sequence__beats">
            {emotional.beats.map((beat) => (
              <li key={beat.thought}>
                <div>
                  <p>{beat.thought}</p>
                  <small>{beat.release}</small>
                </div>
              </li>
            ))}
          </ul>
          <p className="choice-sequence__aside">
            {emotional.release}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
