import { useEffect, useRef } from "react";

export function QuizIntro({ onStart }: { readonly onStart: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, []);

  return (
    <section className="q7-opening" aria-labelledby="q7-opening-title">
      <div className="q7-opening__copy">
        <p className="q7-kicker">Um espelho mais honesto — sem crueldade</p>
        <h1 id="q7-opening-title" ref={titleRef} tabIndex={-1}>
          Quanto da sua vida ainda é decidido pela <em>celulite ou flacidez?</em>
        </h1>
        <p className="q7-opening__lead">
          A roupa trocada. A foto apagada. O biquíni que fica na gaveta. Em 2 minutos, você vai enxergar o padrão por trás dessas escolhas — e o tipo de cuidado que pode caber na sua vida real.
        </p>
        <button className="q7-primary" type="button" onClick={onStart}>
          Quero entender o que está por trás <span aria-hidden="true">→</span>
        </button>
        <ul className="q7-opening__trust" aria-label="Informações sobre a experiência">
          <li><strong>2 min</strong><span>para responder</span></li>
          <li><strong>12</strong><span>perguntas que conectam</span></li>
          <li><strong>Sem</strong><span>culpa ou promessa vazia</span></li>
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
        <figcaption><span>Você não precisa amar tudo hoje.</span><strong>Precisa apenas parar de se abandonar por causa disso.</strong></figcaption>
      </figure>
    </section>
  );
}
