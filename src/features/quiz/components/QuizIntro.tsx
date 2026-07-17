import { useEffect, useRef } from "react";

interface QuizIntroProps {
  readonly onStart: () => void;
}

export function QuizIntro({ onStart }: QuizIntroProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <main className="quiz-main quiz-main--intro" id="conteudo-quiz">
      <div className="quiz-intro">
        <section className="quiz-intro__copy">
          <p className="quiz-kicker">Uma descoberta em 14 momentos</p>
          <h1 ref={titleRef} tabIndex={-1}>
            O cuidado que cabe na vida começa pelo que acontece nela.
          </h1>
          <p className="quiz-intro__lead">
            Tem dias em que uma roupa fica no armário. Em outros, a foto acontece sem hesitação.
            Esta conversa visual observa essas cenas — sem avaliar o seu corpo.
          </p>
          <button className="quiz-primary-action" type="button" onClick={onStart}>
            Começar a descoberta <span aria-hidden="true">→</span>
          </button>
          <dl className="quiz-intro__facts">
            <div><dt>Duração</dt><dd>aproximadamente 90–150 s</dd></div>
            <div><dt>Caminho</dt><dd>7 escolhas + 7 momentos narrativos</dd></div>
          </dl>
          <p className="quiz-privacy">
            Ao final, você verá uma leitura de rotina e uma recomendação comercial identificada
            entre 1, 3 ou 7 frascos do CeluClin, com os critérios expostos antes do checkout.
            Não é diagnóstico. As escolhas ficam somente neste dispositivo por até 30 dias.
          </p>
        </section>
        <section className="quiz-intro__visual" aria-label="Frasco CeluClin totalmente visível">
          <div className="quiz-intro__window" aria-hidden="true">
            <span>perceber</span><span>entender</span><span>escolher</span>
          </div>
          <img
            src="/product/celuclin-front-02.webp"
            alt="Frasco do suplemento alimentar CeluClin em vista frontal."
            width="1122"
            height="1402"
            fetchPriority="high"
          />
          <div className="quiz-intro__capsules" aria-hidden="true"><i /><i /><i /></div>
          <p>60 cápsulas · 2 ao dia conforme o rótulo</p>
        </section>
      </div>
    </main>
  );
}
