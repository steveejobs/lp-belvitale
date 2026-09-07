import { useEffect, useRef } from "react";
import type { QuizAnswers, QuizRecommendation } from "../domain/quiz.types";
import { KineticText } from "./KineticText";

interface ResultStageProps {
  readonly name: string;
  readonly answers: QuizAnswers;
  readonly recommendation: QuizRecommendation;
  readonly onContinue: () => void;
}

export function ResultStage({ name, onContinue }: ResultStageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, []);

  const title = "O seu maior desafio hoje não parece ser a celulite.";

  return (
    <article className="q7-result" aria-labelledby="q7-result-title">
      <header className="q7-result__hero">
        <p className="q7-step-label">{name.length > 0 ? `Seu resultado, ${name}` : "Seu resultado"}</p>
        <h1 id="q7-result-title" ref={titleRef} tabIndex={-1} aria-label={title}>
          <KineticText text={title} accentFrom={7} />
        </h1>
        <p>Pelas suas respostas, ela acabou se tornando um lembrete constante de que você gostaria de voltar a se cuidar — mas sem transformar isso em mais uma obrigação impossível de manter.</p>
      </header>

      <section className="q7-result__observations" aria-labelledby="q7-observations-title">
        <div>
          <p className="q7-step-label">Sua leitura</p>
          <h2 id="q7-observations-title">O que percebemos</h2>
        </div>
        <ul>
          <li>Você já reconhece o momento em que a insegurança aparece.</li>
          <li>Você não parece estar procurando uma solução milagrosa.</li>
          <li>Você busca algo que caiba na rotina real.</li>
        </ul>
      </section>

      <section className="q7-result__meaning">
        <p className="q7-step-label">O que isso significa</p>
        <h2>Quando o cuidado encontra espaço na rotina, fica muito mais fácil manter a constância.</h2>
        <p>Quando o cuidado depende apenas da motivação, ele costuma durar pouco.</p>
      </section>

      <section className="q7-result__transition">
        <img src="/product/celuclin-angle.webp" width="640" height="853" alt="Frasco CeluClin" loading="lazy" decoding="async" />
        <div>
          <p className="q7-step-label">Próximo passo</p>
          <h2>Pensando exatamente nesse perfil, selecionamos a opção que melhor combina com o que você demonstrou buscar ao longo desta experiência.</h2>
          <button className="q7-primary" type="button" onClick={onContinue}><span>Continuar</span><i aria-hidden="true">→</i></button>
        </div>
      </section>
    </article>
  );
}
