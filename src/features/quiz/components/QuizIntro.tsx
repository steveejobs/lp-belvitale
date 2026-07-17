import { useEffect, useRef } from "react";

export function QuizIntro({ onStart }: { readonly onStart: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, []);
  return (
    <section className="q6-opening" aria-labelledby="q6-opening-title">
      <div className="q6-opening__copy">
        <p className="q6-eyebrow"><span /> Uma descoberta em 17 momentos</p>
        <h1 id="q6-opening-title" ref={titleRef} tabIndex={-1}>O que incomoda aparece em cenas. Vamos encontrar a sua.</h1>
        <p>Oito escolhas diretas, prova visual relevante e uma recomendação explicada — sem avaliar seu corpo.</p>
        <button className="q6-primary" type="button" onClick={onStart}>Começar a descoberta <span aria-hidden="true">→</span></button>
        <dl className="q6-opening__facts">
          <div><dt>Duração</dt><dd>90–150 segundos</dd></div>
          <div><dt>Privacidade</dt><dd>Nome opcional</dd></div>
        </dl>
      </div>
      <div className="q6-opening__visual" aria-label="Frasco real do suplemento CeluClin">
        <span className="q6-opening__word" aria-hidden="true">VER<br />ENTENDER<br />ESCOLHER</span>
        <img
          src="/product/celuclin-front-01-768.webp"
          srcSet="/product/celuclin-front-01-768.webp 768w, /product/celuclin-front-01.webp 1122w"
          sizes="(max-width: 47.99rem) 42vw, 31vw"
          width="768"
          height="960"
          alt="Frasco real do suplemento alimentar CeluClin"
          fetchPriority="high"
        />
        <small>60 cápsulas · 2 ao dia conforme o rótulo</small>
      </div>
    </section>
  );
}
