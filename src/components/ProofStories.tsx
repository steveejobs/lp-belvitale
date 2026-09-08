import { Reveal } from "./ui/Reveal";
export function ProofStories() {
  return (
    <section className="home-evidence" id="resultados" aria-labelledby="proof-title">
      <Reveal className="section-shell home-evidence__layout" effect="slide-left">
        <div><p className="eyebrow">O que você pode conferir</p><h2 id="proof-title">Confiança se constrói<br /><em>com informação de verdade.</em></h2></div>
        <div className="home-evidence__facts">
          <article><h3>Composição aberta.</h3><p>Ingredientes, quantidades por porção e avisos disponíveis para você decidir com clareza.</p><a href="#rotulo">Conferir o rótulo original ↗</a></article>
          <article><h3>Nutrição com um papel definido.</h3><p>A vitamina C auxilia na formação do colágeno. O zinco auxilia na proteção dos danos causados pelos radicais livres. São funções dos nutrientes, sem promessa de transformação da pele.</p></article>
          <article><h3>Cuidado no seu ritmo.</h3><p>Uma única fórmula em diferentes quantidades. Escolha o kit que combina com o seu planejamento e consulte um profissional para avaliar suas necessidades.</p></article>
        </div>
      </Reveal>
    </section>
  );
}
