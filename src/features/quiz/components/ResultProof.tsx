import { proofAuthorization } from "../../../data/proofGallery";
import { concernLabels, getPersonalizedProof } from "../content/proof";
import type { ConcernId } from "../domain/quiz.types";

export function ResultProof({ concern }: { readonly concern: ConcernId }) {
  const featuredProof = getPersonalizedProof(concern)
    .filter((asset) => asset.verificationStatus === "owner-authorized")
    .slice(0, 3);
  if (featuredProof.length === 0) return null;

  return (
    <section className="q7-result-proof" aria-labelledby="q7-result-proof-title">
      <header className="q7-result-proof__heading">
        <p className="q7-step-label">Provas relacionadas ao que você marcou</p>
        <h2 id="q7-result-proof-title">Registros de {concernLabels[concern].toLocaleLowerCase("pt-BR")}. Reais, autorizados e sem prometer que toda história será igual.</h2>
        <p>Você disse o que mais incomoda; por isso mostramos primeiro a categoria mais próxima da sua resposta. As imagens não entram no cálculo do resultado e experiências individuais variam.</p>
      </header>

      <div className="q7-result-proof__rail" aria-label={`Registros visuais autorizados sobre ${concernLabels[concern].toLocaleLowerCase("pt-BR")}`}>
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
            <figcaption><span>{asset.category === "laxity" ? "Flacidez" : asset.category === "localized-fat" ? "Contorno" : "Celulite"}</span>{asset.sequenceLabel}</figcaption>
          </figure>
        ))}
      </div>

      <p className="q7-result-proof__disclaimer">{proofAuthorization.disclaimer}</p>
    </section>
  );
}
