import { useEffect, useRef } from "react";

export function AnticipationStage({ name, onReveal }: { readonly name: string; readonly onReveal: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, []);
  return (
    <section className="q6-anticipation" aria-labelledby="q6-anticipation-title">
      <div className="q6-anticipation__product">
        <span aria-hidden="true">PERFIL<br />PROVA<br />ESCOLHA</span>
        <img src="/product/celuclin-angle.webp" width="1122" height="1402" alt="Frasco real do suplemento CeluClin em ângulo" loading="eager" decoding="async" />
      </div>
      <div className="q6-anticipation__copy">
        <p className="q6-eyebrow"><span /> Três leituras, sem atalhos</p>
        <h1 id="q6-anticipation-title" ref={titleRef} tabIndex={-1}>
          {name.length > 0 ? name + ", sua leitura está pronta." : "Sua leitura está pronta."}
        </h1>
        <ul>
          <li><span>01</span> Seu perfil vem das escolhas comportamentais.</li>
          <li><span>02</span> A prova muda de ordem conforme seu interesse visual.</li>
          <li><span>03</span> O kit usa somente continuidade e reposição declaradas.</li>
        </ul>
        <button className="q6-primary" type="button" onClick={onReveal}>Revelar meu resultado</button>
      </div>
    </section>
  );
}
