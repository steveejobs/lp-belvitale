import { useEffect, useRef } from "react";
import type { QuizAnswers, QuizRecommendation } from "../domain/quiz.types";
import { calculateQuizResult } from "../domain/quiz.scoring";
import { deriveRecognitions, quizProfiles } from "../content/profiles";
import { KineticText } from "./KineticText";
import { getConcernFromQuizAnswers } from "../content/insights";
import { DesireMosaic } from "./DesireMosaic";
import { ResultProof } from "./ResultProof";
import { ProductDecision } from "./ProductDecision";

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

      <DesireMosaic scene={answers["future-scene"]} />
      <ResultProof concern={getConcernFromQuizAnswers(answers)} />

      <ProductDecision audience="normal" />

      <section className="q7-result__transition">
        <figure className="q7-product-portrait"><img src="/product/celuclin-angle-768.webp" width="768" height="960" alt="Apresentação ilustrativa do frasco CeluClin sobre fundo ameixa" loading="lazy" decoding="async" /><figcaption>Apresentação ilustrativa da embalagem. Consulte o rótulo completo acima.</figcaption></figure>
        <div>
          <p className="q7-step-label">CeluClin · suplemento alimentar</p>
          <h2>Agora, escolha o que cabe na sua rotina.</h2>
          <p>Se fizer sentido para você, compare quantidades e preço total. A opção de 90 dias permite {commitment}; a de 30 dias exige um compromisso inicial menor.</p>
          <button className="q7-primary" type="button" onClick={onContinue}><span>Comparar opções e preços</span><i aria-hidden="true">→</i></button>
          <small className="q7-next-step">Você verá as opções de compra antes de ir ao checkout.</small>
        </div>
      </section>
    </article>
  );
}
