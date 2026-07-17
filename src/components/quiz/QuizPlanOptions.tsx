import { useEffect, useRef } from "react";
import type { QuizProfile } from "../../data/quizProfiles";
import { recordQuizEvent } from "../../quiz/quizEvents";
import type {
  QuizCommercialRecommendation,
  QuizPlan,
} from "../../quiz/quizRecommendation";

const planVisuals: Readonly<
  Record<QuizPlan, { readonly src: string; readonly width: number; readonly height: number }>
> = {
  "30-days": { src: "/offers/celuclin-one.webp", width: 800, height: 700 },
  "90-days": { src: "/offers/celuclin-three.webp", width: 1000, height: 700 },
  "210-days": { src: "/offers/celuclin-seven.webp", width: 1200, height: 760 },
};

interface QuizPlanOptionsProps {
  readonly options: readonly QuizCommercialRecommendation[];
  readonly recommendedPlan: QuizPlan;
  readonly profile: QuizProfile;
}

export function QuizPlanOptions({
  options,
  recommendedPlan,
  profile,
}: QuizPlanOptionsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const recorded = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (section === null || recorded.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || recorded.current) return;
        recorded.current = true;
        recordQuizEvent("quiz_all_options_view", {
          result_profile: profile,
          recommended_plan: recommendedPlan,
        });
        observer.disconnect();
      },
      { threshold: 0.25 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [profile, recommendedPlan]);

  if (options.length === 0) return null;

  return (
    <section
      className="quiz-all-plans"
      aria-labelledby="quiz-all-plans-title"
      ref={sectionRef}
    >
      <div className="quiz-all-plans__heading">
        <p className="quiz-kicker">As três opções continuam abertas</p>
        <h2 id="quiz-all-plans-title">Compare pelo que é conveniente agora.</h2>
        <p>
          Uma duração maior não significa resultado melhor. A diferença aqui é
          compromisso inicial, planejamento e frequência de reposição.
        </p>
      </div>
      <div className="quiz-plan-list">
        {options.map((option) => {
          const visual = planVisuals[option.plan];
          const isRecommended = option.plan === recommendedPlan;
          return (
            <article className="quiz-plan-row" key={option.plan} data-recommended={isRecommended}>
              <div className="quiz-plan-row__visual">
                <img
                  src={visual.src}
                  width={visual.width}
                  height={visual.height}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="quiz-plan-row__copy">
                <p>{isRecommended ? "Opção sugerida acima" : "Outra opção disponível"}</p>
                <h3>{option.title}</h3>
                <span>{option.duration}</span>
                <small>{option.secondaryCopy}</small>
                <a
                  className="quiz-plan-link"
                  href={option.checkoutUrl}
                  onClick={() =>
                    recordQuizEvent("quiz_checkout_click", {
                      result_profile: profile,
                      recommended_plan: option.plan,
                    })
                  }
                >
                  {option.cta}
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
