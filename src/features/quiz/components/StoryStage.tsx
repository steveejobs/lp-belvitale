import { useEffect, useRef } from "react";

export function StoryStage({ onContinue }: { readonly onContinue: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, []);
  return (
    <section className="q6-story" aria-labelledby="q6-story-title">
      <div className="q6-story__image">
        <img src="/lifestyle/routine-01.webp" width="1122" height="1402" alt="Pessoa preparando água durante uma rotina cotidiana" loading="lazy" decoding="async" />
      </div>
      <div className="q6-story__copy">
        <p className="q6-eyebrow"><span /> O ponto não é começar forte</p>
        <h1 id="q6-story-title" ref={titleRef} tabIndex={-1}>É saber o que fazer quando a vida real interrompe o plano.</h1>
        <p>As próximas escolhas separam motivação de retomada — e deixam a confiança falar antes da oferta.</p>
        <button className="q6-primary" type="button" onClick={onContinue}>Ver como eu retomo</button>
      </div>
    </section>
  );
}
