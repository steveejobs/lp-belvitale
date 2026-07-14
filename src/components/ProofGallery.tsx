const storyRequirements = [
  "relato autorizado",
  "contexto preservado",
  "imagem com direitos confirmados",
] as const;

export function ProofGallery() {
  if (!import.meta.env.DEV) return null;

  return (
    <section
      className="proof-direction"
      aria-labelledby="proof-direction-title"
      data-publication-ready="false"
    >
      <div className="section-shell proof-direction__layout">
        <div>
          <p className="eyebrow eyebrow--light">Histórias, quando forem reais</p>
          <h2 id="proof-direction-title">
            Prova não é decoração.
            <em>É uma pessoa com contexto.</em>
          </h2>
        </div>

        <div className="proof-direction__body">
          <p>
            Esta é apenas a direção editorial interna. Nenhum depoimento,
            resultado ou imagem de cliente será exibido antes da autorização.
          </p>
          <ul aria-label="Requisitos para publicar uma história">
            {storyRequirements.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>
          <p className="proof-direction__status" role="status">
            Gate ativo · acervo não carregado
          </p>
        </div>
      </div>
    </section>
  );
}
