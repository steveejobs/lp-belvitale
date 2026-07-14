const pillars = [
  {
    title: "Transparência",
    description:
      "Composição e informações do rótulo disponíveis para consulta.",
  },
  {
    title: "Simplicidade",
    description:
      "Uma proposta pensada para ser compreendida sem linguagem complicada.",
  },
  {
    title: "Consciência",
    description: "Sem promessas milagrosas ou resultados garantidos.",
  },
] as const;

export function CeluClinIntro() {
  return (
    <section
      className="celuclin-intro"
      id="celuclin"
      aria-labelledby="celuclin-title"
    >
      <div className="section-shell">
        <div className="celuclin-intro__heading">
          <p className="institutional-eyebrow">O que é o CeluClin</p>
          <h2 id="celuclin-title">
            Uma rotina simples começa por saber o que você está escolhendo.
          </h2>
          <p>
            CeluClin é um suplemento alimentar em cápsulas da Belvitale. A
            proposta é oferecer uma experiência de autocuidado acompanhada de
            informações claras sobre composição, uso e embalagem.
          </p>
        </div>

        <ol
          className="celuclin-pillars"
          aria-label="Princípios da proposta CeluClin"
        >
          {pillars.map((pillar, index) => (
            <li key={pillar.title}>
              <span aria-hidden="true">0{index + 1}</span>
              <div>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="celuclin-guidance" id="duvidas">
          <p>
            Quer conferir os detalhes da embalagem? O rótulo original está
            disponível para consulta.
          </p>
          <a href="#rotulo">Consultar o rótulo</a>
        </div>
      </div>
    </section>
  );
}
