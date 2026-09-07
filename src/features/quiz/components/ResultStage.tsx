import { useEffect, useRef } from "react";
import { concernCopy, getConcernFromQuizAnswers } from "../content/insights";
import { getQuizOption } from "../content/questions";
import type { QuizAnswers, QuizRecommendation } from "../domain/quiz.types";
import { ResultProof } from "./ResultProof";
import { TestimonialsGallery } from "./TestimonialsGallery";

interface ResultStageProps {
  readonly name: string;
  readonly answers: QuizAnswers;
  readonly recommendation: QuizRecommendation;
  readonly onContinue: () => void;
}

export function ResultStage({ name, answers, recommendation, onContinue }: ResultStageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, []);

  const concern = getConcernFromQuizAnswers(answers);
  const concernText = concernCopy[concern];
  const reaction = typeof answers.reaction === "string" ? getQuizOption("reaction", answers.reaction)?.label : null;
  const impact = typeof answers["deepest-impact"] === "string" ? getQuizOption("deepest-impact", answers["deepest-impact"])?.label : null;
  const interruption = typeof answers.dropoff === "string" ? getQuizOption("dropoff", answers.dropoff)?.label : null;
  const future = typeof answers["future-scene"] === "string" ? getQuizOption("future-scene", answers["future-scene"])?.label : null;

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
          Não é só {concernText.short}. É o espaço que isso começou a <em>ocupar na sua vida.</em>
        </h1>
        <p>Suas respostas mostram que o espelho virou um gatilho para escolhas que deveriam ser suas: o que vestir, como aparecer e quanto confiar em si. Você não está procurando um corpo perfeito. Está procurando parar de perder liberdade para esse incômodo.</p>
      </header>

      <section className="q7-result__observations" aria-labelledby="q7-observations-title">
        <div>
          <p className="q7-step-label">Sua leitura</p>
          <h2 id="q7-observations-title">O que percebemos</h2>
        </div>
        <ul>
          <li>{reaction ?? "Você reconhece o que faz quando a insegurança aparece."}</li>
          <li>{impact ?? "Você conseguiu nomear a ferida que existe por trás da aparência."}</li>
          <li>{future ?? "Você quer recuperar leveza e presença no próprio corpo."}</li>
        </ul>
      </section>

      <aside className="q7-result__echo" aria-label="Respostas que sustentam o resultado">
        <p>Esse resultado veio do que você acabou de contar:</p>
        <ol>{recognition.map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}</ol>
      </aside>

      <section className="q7-result__meaning">
        <p className="q7-step-label">A virada que o seu resultado pede</p>
        <h2>Parar de usar a frustração como combustível.</h2>
        <p>{interruption ?? "Sua rotina já mostrou que intensidade não sustenta continuidade."} Você não precisa esperar outra foto, outra roupa ou outro dia ruim para voltar a se escolher. Precisa de um gesto claro, simples e repetível — inclusive quando a semana não coopera.</p>
      </section>

      <TestimonialsGallery />

      <ResultProof concern={concern} />

      <section className="q7-result__transition">
        <img src="/lifestyle/celuclin-self-care.webp" width="720" height="783" alt="Mulher em um momento de autocuidado com o frasco de CeluClin" loading="lazy" decoding="async" />
        <div>
          <p className="q7-step-label">Da consciência para uma escolha possível</p>
          <h2>Você já entendeu o padrão. Agora veja uma opção pensada para não obrigar você a decidir tudo de novo no próximo mês.</h2>
          <p>{recommendation.reasons[0]}</p>
          <button className="q7-primary" type="button" onClick={onContinue}>Quero ver o próximo passo <span aria-hidden="true">→</span></button>
        </div>
      </section>
    </article>
  );
}
