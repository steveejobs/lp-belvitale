import { useEffect, useRef } from "react";

export function QuizIntro({ onStart }: { readonly onStart: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, []);

  return (
    <section className="q7-opening" aria-labelledby="q7-opening-title">
      <div className="q7-opening__copy">
        <p className="q7-kicker">Uma conversa sobre a sua rotina</p>
        <h1 id="q7-opening-title" ref={titleRef} tabIndex={-1}>
          Descubra por que cuidar de você parece sempre <em>recomeçar do zero.</em>
        </h1>
        <p className="q7-opening__lead">
          Em poucos minutos, vamos entender como a celulite passou a influenciar pequenas decisões do seu dia a dia e mostrar qual caminho faz mais sentido para retomar uma rotina sem pressão.
        </p>
        <button className="q7-primary" type="button" onClick={onStart}>
          Começar agora <span aria-hidden="true">→</span>
        </button>
        <ul className="q7-opening__trust" aria-label="Informações sobre a experiência">
          <li><strong>2 min</strong><span>para responder</span></li>
          <li><strong>12</strong><span>perguntas simples</span></li>
          <li><strong>Sem</strong><span>julgamentos</span></li>
        </ul>
      </div>

      <figure className="q7-opening__visual">
        <img
          src="/lifestyle/freedom-01-768.webp"
          srcSet="/lifestyle/freedom-01-768.webp 768w, /lifestyle/freedom-01.webp 1122w"
          sizes="(max-width: 47.99rem) calc(100vw - 2rem), 32vw"
          width="768"
          height="960"
          alt="Mulher em um ambiente claro durante um momento cotidiano"
          fetchPriority="high"
        />
        <figcaption><span>Uma pausa para</span><strong>olhar sua rotina com menos cobrança.</strong></figcaption>
      </figure>
    </section>
  );
}
