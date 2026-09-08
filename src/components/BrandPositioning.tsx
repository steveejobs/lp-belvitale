import { Reveal } from "./ui/Reveal";

const principles = [
  {
    number: "01",
    title: "Clareza antes da promessa",
    body: "Rótulo, composição e uso informado ficam à vista para você decidir com mais contexto.",
  },
  {
    number: "02",
    title: "Rotina antes do ritual",
    body: "O CeluClin entra em uma rotina possível: duas cápsulas ao dia, conforme a embalagem.",
  },
  {
    number: "03",
    title: "Você antes do padrão",
    body: "Cuidado pode acompanhar o seu momento sem transformar a sua pele em inimiga.",
  },
] as const;

export function BrandPositioning() {
  return (
    <section className="brand-positioning" id="marca" aria-labelledby="brand-positioning-title">
      <Reveal className="section-shell brand-positioning__intro" effect="slide-left" stagger>
        <p className="eyebrow">O jeito Belvitale de cuidar</p>
        <h2 id="brand-positioning-title">
          Uma marca para escolhas de beleza mais claras.
        </h2>
        <p>
          Belvitale aproxima produto, informação e rotina — com espaço para você observar,
          perguntar e escolher no seu tempo.
        </p>
      </Reveal>

      <Reveal className="section-shell brand-positioning__principles" effect="clip" delay={70} stagger>
        {principles.map((principle) => (
          <article key={principle.number}>
            <span aria-hidden="true">{principle.number}</span>
            <h3>{principle.title}</h3>
            <p>{principle.body}</p>
          </article>
        ))}
      </Reveal>
    </section>
  );
}
