import { useEffect, useRef } from "react";
import { quizOffers } from "../content/offers";
import { deriveRecognitions, quizProfiles } from "../content/profiles";
import type { ConcernId, QuizAnswers, QuizProfileResult, QuizRecommendation } from "../domain/quiz.types";
import { ProofStage } from "./ProofStage";
import { ResultReasoning } from "./ResultReasoning";

interface ResultStageProps {
  readonly name: string;
  readonly answers: QuizAnswers;
  readonly concern: ConcernId;
  readonly result: QuizProfileResult;
  readonly recommendation: QuizRecommendation;
  readonly onContinue: () => void;
}

export function ResultStage({ name, answers, concern, result, recommendation, onContinue }: ResultStageProps) {
  const profile = quizProfiles[result.id];
  const offer = quizOffers[recommendation.offerId];
  const recognitions = deriveRecognitions(answers);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, [result.id]);

  return (
    <article className="q6-result" aria-labelledby="q6-result-title">
      <header className="q6-result__hero">
        <p className="q6-eyebrow"><span /> Sua leitura de decisão</p>
        <span className="q6-result__index" aria-hidden="true">01</span>
        <h1 id="q6-result-title" ref={titleRef} tabIndex={-1}>{profile.title}</h1>
        <p>{name.length > 0 ? name + ", " : ""}{profile.recognition.charAt(0).toLocaleLowerCase("pt-BR") + profile.recognition.slice(1)}</p>
        <small>Perfil comportamental · não é diagnóstico</small>
      </header>

      <section className="q6-result__recognitions" aria-labelledby="q6-recognitions-title">
        <p className="q6-eyebrow"><span /> Três respostas sustentam isso</p>
        <h2 id="q6-recognitions-title">O que foi percebido.</h2>
        <ol>
          {recognitions.map((recognition, index) => (
            <li key={recognition}><span>{String(index + 1).padStart(2, "0")}</span><p>{recognition}</p></li>
          ))}
        </ol>
      </section>

      <section className="q6-result__guidance">
        <div>
          <p className="q6-eyebrow"><span /> Principal fricção</p>
          <h2>{profile.friction}</h2>
        </div>
        <blockquote>{profile.orientation}</blockquote>
      </section>

      <ProofStage concern={concern} compact />
      <ResultReasoning recommendation={recommendation} />

      <section className="q6-result__recommendation" aria-labelledby="q6-result-offer-title">
        <div>
          <p className="q6-eyebrow"><span /> Recomendação</p>
          <h2 id="q6-result-offer-title">{offer.title} · {offer.badge}</h2>
          <p>{offer.summary}</p>
        </div>
        <img
          src={recommendation.offerId === "one-month" ? "/offers/celuclin-one.webp" : recommendation.offerId === "three-months" ? "/offers/celuclin-three.webp" : "/offers/celuclin-seven.webp"}
          width={recommendation.offerId === "seven-months" ? 1200 : recommendation.offerId === "three-months" ? 1000 : 800}
          height={recommendation.offerId === "seven-months" ? 760 : 700}
          alt={recommendation.offerId === "one-month" ? "Kit real com um frasco de CeluClin" : recommendation.offerId === "three-months" ? "Kit real com três frascos de CeluClin" : "Kit real com sete frascos de CeluClin"}
          loading="eager"
          decoding="async"
        />
        <button className="q6-primary" type="button" onClick={onContinue}>Ver preço, benefício e opções</button>
      </section>
    </article>
  );
}
