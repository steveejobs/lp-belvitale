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
          Em poucos minutos, vamos entender como a celulite passou a influenciar pequenas decisões do seu dia a dia e mostrar qual caminho faz mais sentido para retomar uma rotina sem pressão.
        </p>
        <button className="q7-primary" type="button" onClick={onStart} data-ab-variant={experiment.variant}>
          <span>{quizExperimentVariants[experiment.variant].openingCta}</span><i aria-hidden="true">→</i>
        </button>
      </div>

      <div className="q7-opening__visual" aria-hidden="true">
        <span className="q7-opening__orbit"><i /><i /><i /></span>
        <img
          src="/lifestyle/freedom-01-768.webp"
          srcSet="/lifestyle/freedom-01-768.webp 768w, /lifestyle/freedom-01.webp 1122w"
          sizes="(max-width: 47.99rem) calc(100vw - 2rem), 32vw"
          width="768"
          height="960"
          alt="Mulher em um ambiente claro durante um momento cotidiano"
          fetchPriority="high"
        />
        <span className="q7-opening__stamp">
          <img src="/brand/belvitale-monogram-black-transparent.png" width="1005" height="1005" alt="" />
        </span>
      </div>
    </section>
  );
}
