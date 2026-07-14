const commitments = [
  {
    title: "Clareza",
    description: "Informações apresentadas de forma direta e compreensível.",
  },
  {
    title: "Transparência",
    description: "Composição e embalagem disponíveis para consulta.",
  },
  {
    title: "Responsabilidade",
    description:
      "Sem promessas de resultado garantido ou linguagem de tratamento.",
  },
] as const;

const institutionalLinks = [
  { label: "Ver composição", href: "#composicao" },
  { label: "Consultar rótulo", href: "#rotulo" },
  { label: "Ler dúvidas comuns", href: "#faq" },
] as const;

export function BelvitaleInstitutional() {
  return (
    <section
      className="belvitale-institutional"
      id="belvitale"
      aria-labelledby="belvitale-title"
    >
      <div className="section-shell belvitale-institutional__layout">
        <div className="belvitale-institutional__heading">
          <p className="institutional-eyebrow">Sobre a Belvitale</p>
          <h2 id="belvitale-title">
            Uma marca construída para tornar o autocuidado mais claro.
          </h2>
          <p>
            A Belvitale apresenta o CeluClin com foco em informação acessível,
            transparência de composição e uma comunicação sem promessas
            milagrosas.
          </p>
          <nav
            className="belvitale-institutional__links"
            aria-label="Conheça as informações do CeluClin"
          >
            {institutionalLinks.map((link) => (
              <a href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <ol
          className="brand-commitments"
          aria-label="Compromissos de comunicação da Belvitale"
        >
          {commitments.map((commitment, index) => (
            <li key={commitment.title}>
              <span aria-hidden="true">0{index + 1}</span>
              <div>
                <h3>{commitment.title}</h3>
                <p>{commitment.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
