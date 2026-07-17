import { proofAssets } from "../../data/proofGallery";

const featuredProof = proofAssets
  .filter((asset) => asset.category === "cellulite")
  .slice(0, 2);

export function QuizResultProof() {
  if (featuredProof.length === 0) return null;

  return (
    <section className="quiz-proof" aria-labelledby="quiz-proof-title">
      <div className="quiz-proof__heading">
        <p className="quiz-kicker">Experiências da marca</p>
        <h2 id="quiz-proof-title">Registros reais, fora do cálculo do quiz.</h2>
        <p>
          Experiências reais autorizadas. Resultados individuais podem variar.
          As imagens não foram usadas para calcular seu perfil e não indicam o
          que acontecerá com você.
        </p>
      </div>
      <div className="quiz-proof__images">
        {featuredProof.map((asset) => (
          <figure key={asset.id}>
            <img
              src={asset.src}
              width={asset.width}
              height={asset.height}
              alt={asset.alt}
              loading="lazy"
              decoding="async"
            />
          </figure>
        ))}
      </div>
      <a className="quiz-inline-link" href="/#resultados">
        Ver todas as experiências autorizadas
      </a>
    </section>
  );
}
