import { useEffect, useRef } from "react";
import { getQuizExperimentAssignment, quizExperimentVariants } from "../experiment/quiz.experiment";
import { KineticText } from "./KineticText";

export function QuizIntro({ onStart }: { readonly onStart: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const experiment = getQuizExperimentAssignment();
  useEffect(() => { titleRef.current?.focus(); }, []);

  const title = "Descubra por que cuidar de você parece sempre recomeçar do zero.";

  return (
    <section className="q7-opening" aria-labelledby="q7-opening-title">
      <div className="q7-opening__copy">
        <p className="q7-kicker">Experiência Belvitale</p>
        <h1 id="q7-opening-title" ref={titleRef} tabIndex={-1} aria-label={title}>
          <KineticText text={title} accentFrom={6} />
        </h1>
        <p className="q7-opening__lead">
          Em poucos minutos, entenda o que interrompe sua constância e descubra um caminho possível para voltar a se vestir, se olhar e se cuidar com mais confiança — sem pressão por perfeição.
        </p>
        <button className="q7-primary" type="button" onClick={onStart} data-ab-variant={experiment.variant}>
          <span>{quizExperimentVariants[experiment.variant].openingCta}</span><i aria-hidden="true">→</i>
        </button>
        <ul className="q7-opening__microproof" aria-label="Sobre esta experiência">
          <li><strong>3 min</strong><span>para responder</span></li>
          <li><strong>12 escolhas</strong><span>sem certo ou errado</span></li>
          <li><strong>Seu ritmo</strong><span>sem promessa milagrosa</span></li>
        </ul>
      </div>

      <figure className="q7-opening__visual">
        <img
          src="/lifestyle/quiz-hero-confidence.jpg"
          sizes="(max-width: 47.99rem) calc(100vw - 2rem), 32vw"
          width="864"
          height="1821"
          alt="Mulher escolhendo um vestido diante do guarda-roupa em um momento de confiança e autocuidado"
          fetchPriority="high"
        />
        <figcaption><span>O desejo não é ser perfeita.</span><strong>É voltar a escolher sem se esconder.</strong></figcaption>
        <span className="q7-opening__stamp">
          <img src="/brand/belvitale-monogram-light.webp" width="560" height="560" alt="" />
        </span>
      </figure>
    </section>
  );
}
