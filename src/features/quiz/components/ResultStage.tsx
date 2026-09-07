import { useEffect, useRef } from "react";
import type { QuizAnswers, QuizRecommendation } from "../domain/quiz.types";
import { calculateQuizResult } from "../domain/quiz.scoring";
import { deriveRecognitions, quizProfiles } from "../content/profiles";
import { KineticText } from "./KineticText";
import { getConcernFromQuizAnswers } from "../content/insights";
import { DesireMosaic } from "./DesireMosaic";
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

  const result = calculateQuizResult(answers);
  const profile = quizProfiles[result?.id ?? "clear-first"];
  const recognitions = deriveRecognitions(answers);
  const title = `${profile.title}.`;
  const commitment = recommendation.offerId === "one-month"
    ? "começar com um compromisso menor"
    : "reduzir as decisões de reposição pelos próximos meses";

  return (
    <article className="q7-result" aria-labelledby="q7-result-title">
      <header className="q7-result__hero">
        <p className="q7-step-label">{name.length > 0 ? `Sua leitura, ${name}` : "Sua leitura personalizada"}</p>
        <h1 id="q7-result-title" ref={titleRef} tabIndex={-1} aria-label={title}>
          <KineticText text={title} accentFrom={1} />
        </h1>
        <p>{profile.recognition}</p>
      </header>

      <section className="q7-result__observations" aria-labelledby="q7-observations-title">
        <div>
          <p className="q7-step-label">As respostas que sustentam esta leitura</p>
          <h2 id="q7-observations-title">Isso veio do que você marcou</h2>
        </div>
        <ul>
          {recognitions.map((recognition) => <li key={recognition}>{recognition}</li>)}
        </ul>
      </section>

      <section className="q7-result__meaning">
        <p className="q7-step-label">O que pode interromper seu caminho</p>
        <h2>{profile.friction}</h2>
        <p>{profile.orientation}</p>
      </section>

      <DesireMosaic />
      <ResultProof concern={getConcernFromQuizAnswers(answers)} />

      <section className="q7-result__transition">
        <img src="/product/celuclin-angle.webp" width="640" height="853" alt="Frasco CeluClin" loading="lazy" decoding="async" />
        <div>
          <p className="q7-step-label">Da leitura para uma escolha</p>
          <h2>Seu resultado não vira promessa. Vira um próximo passo que você controla.</h2>
          <p>Compare a opção pensada para {commitment} com a alternativa disponível, usando os mesmos critérios.</p>
          <button className="q7-primary" type="button" onClick={onContinue}><span>Comparar 30 e 90 dias</span><i aria-hidden="true">→</i></button>
        </div>
      </section>
    </article>
  );
}
