import { useEffect, useRef } from "react";
import { quizProfiles } from "../content/profiles";
import type {
  QuizAnswerMap,
  QuizCalculation,
  QuizQuestionId,
  QuizRecommendation,
} from "../domain/quiz.types";
import { ProofMoment } from "./ProofMoment";
import { ResultReasoning } from "./ResultReasoning";

interface ResultRevealProps {
  readonly answers: QuizAnswerMap;
  readonly calculation: QuizCalculation;
  readonly recommendation: QuizRecommendation;
  readonly onReview: (questionId: QuizQuestionId) => void;
  readonly onShowOffer: () => void;
}

export function ResultReveal({
  answers,
  calculation,
  recommendation,
  onReview,
  onShowOffer,
}: ResultRevealProps) {
  const profile = quizProfiles[calculation.profile];
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [profile.id]);
  const impactSentence = calculation.dimensions.dailyImpact >= 60
    ? "A aparência atravessou uma escolha cotidiana recente; isso personaliza a linguagem, nunca a duração sugerida."
    : "Você indicou que a percepção da aparência nem sempre comanda suas escolhas; isso personaliza a linguagem, nunca a duração sugerida.";

  return (
    <main className="quiz-main quiz-main--result" id="conteudo-quiz">
      <article className="quiz-result">
        <header className="quiz-result__hero">
          <div className="quiz-result__index" aria-hidden="true"><span>seu</span><strong>ritmo</strong></div>
          <div>
            <p className="quiz-kicker">Sua leitura de rotina</p>
            <h1 ref={titleRef} tabIndex={-1}>{profile.name}</h1>
            <p className="quiz-result__recognition">{profile.recognition}</p>
            <p className="quiz-result__impact">{impactSentence}</p>
          </div>
        </header>

        <section className="quiz-result__portrait" aria-label="Como este perfil se movimenta">
          <article><span>Como você começa</span><p>{profile.starts}</p></article>
          <article><span>Risco de interrupção</span><p>{profile.interruptionRisk}</p></article>
          <article><span>Modo mais realista de manter</span><p>{profile.maintenance}</p></article>
          <article><span>Prova que mais ajuda</span><p>{profile.proofHelp}</p></article>
        </section>

        <section className="quiz-ritual" aria-labelledby="ritual-title">
          <div>
            <p className="quiz-kicker">Um gesto por dia</p>
            <h2 id="ritual-title">Seu pequeno ritual de sete dias</h2>
            <p>Não é protocolo terapêutico nem promessa de resultado. É uma forma curta de testar uma estrutura de rotina.</p>
          </div>
          <ol>
            {profile.sevenDayRitual.map((step, index) => (
              <li key={step}><span>dia {index + 1}</span><p>{step}</p></li>
            ))}
          </ol>
        </section>

        <ResultReasoning
          answers={answers}
          recommendation={recommendation}
          onReview={onReview}
        />

        <ProofMoment mode="result" />

        <section className="quiz-result__next">
          <div>
            <p className="quiz-kicker">A venda começa aqui, sem disfarce</p>
            <h2>Veja a recomendação comercial e compare as três opções.</h2>
            <p>
              A próxima tela mostra quantidade, estoque aproximado, critérios e link do checkout.
              Nenhuma duração será apresentada como necessária ou mais eficaz.
            </p>
          </div>
          <button className="quiz-primary-action quiz-primary-action--light" type="button" onClick={onShowOffer}>
            Ver recomendação e opções <span aria-hidden="true">→</span>
          </button>
        </section>

        <p className="quiz-result__disclaimer">
          Esta experiência organiza preferências declaradas de rotina e compra. Não é diagnóstico,
          avaliação corporal, indicação terapêutica nem garantia de resultado.
        </p>
      </article>
    </main>
  );
}
