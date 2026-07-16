import { homeContent } from "../content/homeContent";
import { campaignAssets } from "../data/campaignAssets";
import { Reveal } from "./ui/Reveal";

export function ChoiceSequence() {
  const { emotional } = homeContent;
  const freedom = campaignAssets.lifestyleFreedom;

  return (
    <section className="choice-sequence" id="liberdade" aria-labelledby="choice-title">
      <Reveal className="choice-sequence__heading section-shell" effect="slide-right">
        <p className="eyebrow">{emotional.eyebrow}</p>
        <h2 id="choice-title">
          Não é sobre esconder.
          <em>É sobre voltar a escolher.</em>
        </h2>
      </Reveal>

      <Reveal className="choice-sequence__composition section-shell" effect="clip" delay={70}>
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
            Vestir um short, aparecer em uma foto ou olhar no espelho podem voltar a ser
            escolhas simples.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
