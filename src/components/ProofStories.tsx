import { homeContent } from "../content/homeContent";
import { commercialNavigationReady } from "../data/commercialPreview";
import {
  proofAssets,
  proofAuthorization,
  proofCategories,
} from "../data/proofGallery";
import { ProofCategoryGallery } from "./ProofCategoryGallery";
import { Reveal } from "./ui/Reveal";

export function ProofStories() {
  const { proof } = homeContent;

  return (
    <section className="proof-stories" id="resultados" aria-labelledby="proof-title">
      <Reveal className="proof-stories__heading section-shell" effect="slide-left" stagger>
        <p className="eyebrow">{proof.eyebrow}</p>
        <h2 id="proof-title">
          {proof.titleLead}
          <em>{proof.titleAccent}</em>
        </h2>
        <p>{proof.context}</p>
      </Reveal>

      <div className="proof-series-list section-shell">
        {proofCategories.map((category) => (
          <ProofCategoryGallery
            key={category.id}
            category={category}
            assets={proofAssets.filter((asset) => asset.category === category.id)}
          />
        ))}
      </div>

      <div className="proof-stories__disclaimer section-shell">
        <strong>{proofAuthorization.disclaimer}</strong>
      </div>

      {commercialNavigationReady ? (
        <div className="proof-stories__action section-shell">
          <a className="button button--primary" href="#ofertas">Ver opções do CeluClin</a>
        </div>
      ) : null}
    </section>
  );
}
