import { useEffect, type ReactNode } from "react";
import { conceptAssetMap } from "./conceptAssets";

export type ConceptId = "a" | "b" | "c";

interface ConceptLabProps {
  readonly concept: ConceptId;
}

const conceptNames: Record<ConceptId, string> = {
  a: "Corte editorial",
  b: "Caderno de escolha",
  c: "Filme vertical",
};

function useConceptMotion(concept: ConceptId): void {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-concept-root]");
    if (root === null) return;

    const previousTitle = document.title;
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previousRobots = robots?.content;
    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const previousDescription = description?.content;

    document.title = `Belvitale | ${conceptNames[concept]} | Laboratório visual`;
    if (robots !== null) robots.content = "noindex, nofollow";
    if (description !== null) {
      description.content = `Prova visual isolada: ${conceptNames[concept]} para Belvitale e CeluClin.`;
    }

    const revealNodes = root.querySelectorAll<HTMLElement>("[data-reveal]");
    const visibleNodes = new Set<HTMLElement>();
    const activateVisibleNodes = () => {
      const upperLimit = window.innerHeight * 0.92;
      const lowerLimit = window.innerHeight * 0.08;
      for (const node of revealNodes) {
        const rect = node.getBoundingClientRect();
        if (rect.top < upperLimit && rect.bottom > lowerLimit) {
          visibleNodes.add(node);
          node.classList.add("is-visible");
        }
      }
    };

    let frame = 0;
    const updateScroll = () => {
      frame = 0;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      root.style.setProperty("--lab-scroll", progress.toFixed(4));
      root.style.setProperty("--lab-y", `${String(window.scrollY)}px`);
      activateVisibleNodes();
    };
    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(updateScroll);
    };

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const node = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            visibleNodes.add(node);
            node.classList.add("is-visible");
          } else if (!visibleNodes.has(node)) {
            node.classList.remove("is-visible");
          }
        }
      },
      { threshold: 0.01, rootMargin: "-4% 0px -4% 0px" },
    );

    revealNodes.forEach((node) => revealObserver.observe(node));
    activateVisibleNodes();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
      revealObserver.disconnect();
      document.title = previousTitle;
      if (robots !== null && previousRobots !== undefined) {
        robots.content = previousRobots;
      }
      if (description !== null && previousDescription !== undefined) {
        description.content = previousDescription;
      }
    };
  }, [concept]);
}

function Mark({ tone }: { readonly tone: "light" | "dark" }): ReactNode {
  return (
    <img
      className="concept-mark"
      src={
        tone === "light"
          ? conceptAssetMap.brand.wordmarkLight
          : conceptAssetMap.brand.wordmarkDark
      }
      width="512"
      height="128"
      alt="Belvitale"
    />
  );
}

function ProductFacts({ inverted = false }: { readonly inverted?: boolean }): ReactNode {
  return (
    <div className={`concept-facts${inverted ? " concept-facts--inverted" : ""}`}>
      <span>60 cápsulas</span>
      <span>2 ao dia</span>
      <span>30 dias</span>
      <span>Suplemento alimentar</span>
    </div>
  );
}

function PrimaryCta({ href = "#scene-recognition" }: { readonly href?: string }): ReactNode {
  return (
    <a className="concept-cta" href={href}>
      Ver a escolha
      <span aria-hidden="true">↘</span>
    </a>
  );
}

function Disclosure(): ReactNode {
  return (
    <p className="concept-disclosure">
      Resultados reais autorizados. Experiências individuais podem variar.
    </p>
  );
}

function ConceptA(): ReactNode {
  return (
    <div className="concept-root concept-a" data-concept-root>
      <main id="concept-content">
        <section className="concept-scene concept-a__hero" id="scene-hero" aria-labelledby="concept-a-title">
          <div className="concept-a__grain" aria-hidden="true" />
          <header className="concept-a__masthead">
            <Mark tone="light" />
            <span>Belvitale / CeluClin / A</span>
          </header>
          <div className="concept-a__copy" data-reveal>
            <p className="concept-kicker">Uma escolha que continua sendo sua</p>
            <h1 id="concept-a-title">
              O short entra. <em>A dúvida fica de fora.</em>
            </h1>
            <p className="concept-lede">
              CeluClin entra na rotina sem tomar o lugar das decisões pequenas que fazem o dia ser seu.
            </p>
            <PrimaryCta />
            <ProductFacts inverted />
            <p className="concept-note">Suplemento alimentar. Não é medicamento.</p>
          </div>
          <figure className="concept-a__product" data-reveal>
            <img
              src={conceptAssetMap.product.hand}
              width="1122"
              height="1402"
              alt="Mão segurando o frasco real de CeluClin."
              fetchPriority="high"
            />
            <figcaption>O objeto que acompanha a escolha.</figcaption>
          </figure>
          <span className="concept-a__scene-number" aria-hidden="true">01 / 03</span>
        </section>

        <section className="concept-scene concept-a__recognition" id="scene-recognition" aria-labelledby="concept-a-recognition-title">
          <figure className="concept-a__lifestyle" data-reveal>
            <img
              src={conceptAssetMap.lifestyle.freedom}
              width="1122"
              height="1402"
              alt="Mulher adulta junto à janela, vestindo camisa branca e calça clara."
              loading="lazy"
            />
          </figure>
          <div className="concept-a__recognition-copy" data-reveal>
            <p className="concept-kicker">A cena é sua</p>
            <h2 id="concept-a-recognition-title">
              O short. A foto. O espelho.
            </h2>
            <p>
              Escolher uma roupa simples sem ensaiar a decisão por mais dez minutos.
            </p>
            <div className="concept-a__choice-line" aria-hidden="true">
              <span>vestir</span>
              <span>aparecer</span>
              <span>seguir</span>
            </div>
          </div>
          <span className="concept-a__scene-number" aria-hidden="true">02 / 03</span>
        </section>

        <section className="concept-scene concept-a__results" id="scene-results" aria-labelledby="concept-a-results-title">
          <div className="concept-a__results-head" data-reveal>
            <p className="concept-kicker">Sem legenda sobre a pele</p>
            <h2 id="concept-a-results-title">Olhe. Compare. Decida o que faz sentido para você.</h2>
          </div>
          <figure className="concept-a__proof" data-reveal>
            <img
              src={conceptAssetMap.results.celluliteBack}
              width="1254"
              height="1254"
              alt="Série real autorizada de celulite em duas imagens lado a lado."
              loading="lazy"
            />
          </figure>
          <Disclosure />
          <span className="concept-a__scene-number" aria-hidden="true">03 / 03</span>
        </section>
      </main>
    </div>
  );
}

function ConceptB(): ReactNode {
  return (
    <div className="concept-root concept-b" data-concept-root>
      <main id="concept-content">
        <section className="concept-scene concept-b__hero" id="scene-hero" aria-labelledby="concept-b-title">
          <div className="concept-b__rail" aria-hidden="true">CELUCLIN / 60</div>
          <header className="concept-b__masthead">
            <Mark tone="dark" />
            <span>Prova de direção B</span>
          </header>
          <figure className="concept-b__product" data-reveal>
            <img
              src={conceptAssetMap.product.front}
              width="1122"
              height="1402"
              alt="Frasco real de CeluClin em vista frontal."
              fetchPriority="high"
            />
          </figure>
          <div className="concept-b__hero-copy" data-reveal>
            <p className="concept-kicker">CeluClin / escolha em movimento</p>
            <h1 id="concept-b-title">
              Vista o que você <em>já queria vestir.</em>
            </h1>
            <p className="concept-lede">
              Duas cápsulas por dia, sem transformar a escolha em teste de coragem.
            </p>
            <PrimaryCta />
            <ProductFacts />
            <p className="concept-note">Suplemento alimentar. Não é medicamento.</p>
          </div>
          <span className="concept-b__folio" aria-hidden="true">01 — 03</span>
        </section>

        <section className="concept-scene concept-b__recognition" id="scene-recognition" aria-labelledby="concept-b-recognition-title">
          <div className="concept-b__recognition-frame" data-reveal>
            <figure>
              <img
                src={conceptAssetMap.lifestyle.routine}
                width="1122"
                height="1402"
                alt="Mulher adulta servindo água em um copo na cozinha."
                loading="lazy"
              />
            </figure>
            <span>08:10 / água / duas cápsulas</span>
          </div>
          <div className="concept-b__recognition-copy" data-reveal>
            <p className="concept-kicker">Uma página da vida real</p>
            <h2 id="concept-b-recognition-title">Antes de sair, você escolhe.</h2>
            <p>
              A camisa aberta. A janela. A mão no copo. O dia começa antes da dúvida.
            </p>
            <div className="concept-b__underlines" aria-hidden="true">
              <span>camisa</span>
              <span>short</span>
              <span>foto</span>
            </div>
          </div>
          <span className="concept-b__folio" aria-hidden="true">02 — 03</span>
        </section>

        <section className="concept-scene concept-b__results" id="scene-results" aria-labelledby="concept-b-results-title">
          <div className="concept-b__results-copy" data-reveal>
            <p className="concept-kicker">Um recorte, sem maquiagem</p>
            <h2 id="concept-b-results-title">A prova ocupa espaço para ser vista.</h2>
          </div>
          <figure className="concept-b__proof" data-reveal>
            <img
              src={conceptAssetMap.results.celluliteLegs}
              width="1254"
              height="1254"
              alt="Série real autorizada de celulite nas pernas em duas imagens lado a lado."
              loading="lazy"
            />
            <span className="concept-b__proof-rule" aria-hidden="true" />
          </figure>
          <Disclosure />
          <span className="concept-b__folio" aria-hidden="true">03 — 03</span>
        </section>
      </main>
    </div>
  );
}

function ConceptC(): ReactNode {
  return (
    <div className="concept-root concept-c" data-concept-root>
      <main id="concept-content">
        <section className="concept-scene concept-c__hero" id="scene-hero" aria-labelledby="concept-c-title">
          <figure className="concept-c__hero-media" data-reveal>
            <img
              src={conceptAssetMap.product.angle}
              width="1122"
              height="1402"
              alt="Frasco real de CeluClin em ângulo, iluminado sobre fundo ameixa."
              fetchPriority="high"
            />
          </figure>
          <div className="concept-c__topline">
            <Mark tone="light" />
            <span>Prova de direção C / Belvitale</span>
          </div>
          <div className="concept-c__hero-copy" data-reveal>
            <p className="concept-kicker">Uma escolha por vez</p>
            <h1 id="concept-c-title">Não repense o que você já escolheu.</h1>
            <p className="concept-lede">CeluClin acompanha a cena. A decisão continua sendo sua.</p>
            <PrimaryCta />
            <ProductFacts inverted />
            <p className="concept-note">Suplemento alimentar. Não é medicamento.</p>
          </div>
          <div className="concept-c__scrollcue" aria-hidden="true"><span /> role para baixo</div>
        </section>

        <section className="concept-scene concept-c__recognition" id="scene-recognition" aria-labelledby="concept-c-recognition-title">
          <figure className="concept-c__recognition-media" data-reveal>
            <img
              src={conceptAssetMap.lifestyle.freedom}
              width="1122"
              height="1402"
              alt="Mulher adulta olhando pela janela em uma cena de luz natural."
              loading="lazy"
            />
          </figure>
          <div className="concept-c__recognition-copy" data-reveal>
            <p className="concept-kicker">O corpo não pede explicação</p>
            <h2 id="concept-c-recognition-title">Você veste. Você aparece. Você vai.</h2>
            <p>Uma camisa branca, uma foto sem ensaio, um espelho que não vira reunião.</p>
            <div className="concept-c__line-list">
              <span data-reveal>veste</span>
              <span data-reveal>aparece</span>
              <span data-reveal>vai</span>
            </div>
          </div>
          <span className="concept-c__scene-label" aria-hidden="true">02 / escolha</span>
        </section>

        <section className="concept-scene concept-c__results" id="scene-results" aria-labelledby="concept-c-results-title">
          <figure className="concept-c__results-media" data-reveal>
            <img
              src={conceptAssetMap.results.celluliteHips}
              width="1254"
              height="1254"
              alt="Série real autorizada de celulite nos glúteos em duas imagens lado a lado."
              loading="lazy"
            />
          </figure>
          <div className="concept-c__results-copy" data-reveal>
            <p className="concept-kicker">Sem filtro. Sem contexto inventado.</p>
            <h2 id="concept-c-results-title">A imagem fala no próprio tamanho.</h2>
            <Disclosure />
          </div>
          <span className="concept-c__scene-label" aria-hidden="true">03 / resultados</span>
        </section>
      </main>
    </div>
  );
}

export function ConceptLab({ concept }: ConceptLabProps): ReactNode {
  useConceptMotion(concept);

  if (concept === "a") return <ConceptA />;
  if (concept === "b") return <ConceptB />;
  return <ConceptC />;
}
