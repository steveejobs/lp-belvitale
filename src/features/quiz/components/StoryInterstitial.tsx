import { useEffect, useRef } from "react";
import { storyInterstitial } from "../content/interstitials";

interface StoryInterstitialProps {
  readonly onContinue: () => void;
}

export function StoryInterstitial({ onContinue }: StoryInterstitialProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <main className="quiz-main quiz-main--story" id="conteudo-quiz">
      <div className="quiz-story">
        <div className="quiz-story__path" aria-hidden="true">
          <span className="quiz-story__start">começo</span>
          <i /><i /><i /><i /><i />
          <span className="quiz-story__return">retorno</span>
        </div>
        <section>
          <p className="quiz-kicker">{storyInterstitial.kicker}</p>
          <h1 ref={titleRef} tabIndex={-1}>{storyInterstitial.title}</h1>
          <p>{storyInterstitial.body}</p>
          <button className="quiz-primary-action" type="button" onClick={onContinue}>
            Ver como eu retomo <span aria-hidden="true">→</span>
          </button>
        </section>
      </div>
    </main>
  );
}
