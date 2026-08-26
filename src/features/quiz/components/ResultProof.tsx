import { proofAssets, proofAuthorization } from "../../../data/proofGallery";

const featuredProof = proofAssets
  .filter((asset) => asset.category === "cellulite" && asset.verificationStatus === "owner-authorized")
  .slice(0, 3);

export function ResultProof() {
  if (featuredProof.length === 0) return null;

  return (
    <section className="q7-result-proof" aria-labelledby="q7-result-proof-title">
      <header className="q7-result-proof__heading">
        <p className="q7-step-label">Experiências autorizadas</p>
        <h2 id="q7-result-proof-title">Registros reais. Sem transformar uma experiência em promessa.</h2>
        <p>Estas imagens foram fornecidas e autorizadas pela marca. Elas não entram no cálculo do seu resultado e não determinam o que acontecerá com você.</p>
      </header>

      <div className="q7-result-proof__rail" aria-label="Registros visuais autorizados sobre celulite">
        {featuredProof.map((asset) => (
          <figure key={asset.id}>
            <div className="q7-result-proof__image">
              <img
                src={asset.src}
                width={asset.width}
                height={asset.height}
                alt={asset.alt}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption><span>Celulite</span>{asset.sequenceLabel}</figcaption>
          </figure>
        ))}
      </div>

      <p className="q7-result-proof__disclaimer">{proofAuthorization.disclaimer}</p>
    </section>
  );
}
