import { useEffect, useRef } from "react";
import type { deriveStartInsight } from "../content/interstitials";
import { getMotionFamilyAttribute } from "../motion/quiz.transitions";

type Insight = ReturnType<typeof deriveStartInsight>;

interface InsightRevealProps {
  readonly insight: Insight;
  readonly sequence: "first" | "second";
  readonly onContinue: () => void;
}

export function InsightReveal({ insight, sequence, onContinue }: InsightRevealProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [sequence]);
  return (
    <main
      className="quiz-main quiz-main--insight"
      id="conteudo-quiz"
      data-sequence={sequence}
      data-motion={getMotionFamilyAttribute("insight")}
      aria-live="polite"
    >
      <div className="quiz-insight">
        <div className="quiz-insight__visual" aria-hidden="true">
          <span className="quiz-insight__number">{sequence === "first" ? "01" : "02"}</span>
          <span className="quiz-insight__fill" />
          <i /><i /><i /><i />
        </div>
        <section className="quiz-insight__copy">
          <p className="quiz-kicker">{insight.kicker}</p>
          <h1 ref={titleRef} tabIndex={-1}>{insight.title}</h1>
          <p className="quiz-insight__body">{insight.body}</p>
          <p className="quiz-insight__detail">{insight.detail}</p>
          <button className="quiz-primary-action quiz-primary-action--light" type="button" onClick={onContinue}>
            Continuar <span aria-hidden="true">→</span>
          </button>
        </section>
      </div>
    </main>
  );
}
