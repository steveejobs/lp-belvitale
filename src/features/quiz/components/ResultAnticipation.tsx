import { useEffect, useRef } from "react";
import { anticipationContent } from "../content/interstitials";
import { getMotionFamilyAttribute } from "../motion/quiz.transitions";

interface ResultAnticipationProps {
  readonly onReveal: () => void;
}

export function ResultAnticipation({ onReveal }: ResultAnticipationProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <main
      className="quiz-main quiz-main--anticipation"
      id="conteudo-quiz"
      data-motion={getMotionFamilyAttribute("anticipation")}
    >
      <div className="quiz-anticipation">
        <div className="quiz-anticipation__bottle" aria-hidden="true">
          <div className="quiz-anticipation__cap" />
          <div className="quiz-anticipation__glass">
            {Array.from({ length: 8 }, (_, index) => <i key={index} />)}
            <span />
          </div>
        </div>
        <section>
          <p className="quiz-kicker">{anticipationContent.kicker}</p>
          <h1 ref={titleRef} tabIndex={-1}>{anticipationContent.title}</h1>
          <ol>
            {anticipationContent.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <button className="quiz-primary-action quiz-primary-action--light" type="button" onClick={onReveal}>
            Revelar meu resultado <span aria-hidden="true">→</span>
          </button>
        </section>
      </div>
    </main>
  );
}
