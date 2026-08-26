import { useEffect, useRef } from "react";
import { getQuizOption } from "../content/questions";
import type { QuizAnswers, QuizRecommendation } from "../domain/quiz.types";
import { ResultProof } from "./ResultProof";

interface ResultStageProps {
  readonly name: string;
  readonly answers: QuizAnswers;
  readonly recommendation: QuizRecommendation;
  readonly onContinue: () => void;
}

export function ResultStage({ name, answers, recommendation, onContinue }: ResultStageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, []);

  const recognition = [
    typeof answers.perception === "string" ? getQuizOption("perception", answers.perception)?.label : null,
    typeof answers["decision-weight"] === "string" ? getQuizOption("decision-weight", answers["decision-weight"])?.label : null,
    typeof answers["future-goal"] === "string" ? getQuizOption("future-goal", answers["future-goal"])?.label : null,
  ].filter((value): value is string => typeof value === "string");

  return (
    <article className="q7-result" aria-labelledby="q7-result-title">
      <header className="q7-result__hero">
        <p className="q7-step-label">{name.length > 0 ? `Seu resultado, ${name}` : "Seu resultado"}</p>
        <h1 id="q7-result-title" ref={titleRef} tabIndex={-1}>
          O seu maior desafio hoje <em>não parece ser a celulite.</em>
        </h1>
        <p>Pelas suas respostas, ela acabou se tornando um lembrete constante de que você gostaria de voltar a se cuidar - mas sem transformar isso em mais uma obrigação impossível de manter.</p>
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

      <aside className="q7-result__echo" aria-label="Respostas que sustentam o resultado">
        <p>Esse resultado veio do que você acabou de contar:</p>
        <ol>{recognition.map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}</ol>
      </aside>

      <section className="q7-result__meaning">
        <p className="q7-step-label">O que isso significa</p>
        <p>Quando o cuidado depende apenas da motivação, ele costuma durar pouco. Quando esse cuidado encontra espaço na rotina, fica muito mais fácil manter a constância.</p>
      </section>

      <ResultProof />

      <section className="q7-result__transition">
        <img src="/product/celuclin-hand.webp" width="1122" height="1402" alt="Mão segurando o frasco de CeluClin" loading="lazy" decoding="async" />
        <div>
          <p className="q7-step-label">Próximo passo</p>
          <h2>Pensando exatamente nesse perfil, selecionamos a opção que melhor combina com o que você demonstrou buscar ao longo desta experiência.</h2>
          <p>{recommendation.reasons[0]}</p>
          <button className="q7-primary" type="button" onClick={onContinue}>Ver minha sugestão <span aria-hidden="true">→</span></button>
        </div>
      </section>
    </article>
  );
}
