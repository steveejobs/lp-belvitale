import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  type CSSProperties,
} from "react";
import { campaignAssets, canRenderCampaignAsset } from "../../data/campaignAssets";
import {
  quizConfidenceCopy,
  quizProfiles,
} from "../../data/quizProfiles";
import { usageFact, warningFacts } from "../../data/productFacts";
import { recordQuizEvent } from "../../quiz/quizEvents";
import {
  calculateRecommendedPlan,
  getQuizPlanOptions,
  resolveQuizRecommendation,
  type QuizPlan,
} from "../../quiz/quizRecommendation";
import type { QuizCalculation } from "../../quiz/quizScoring";

const QuizResultProof = lazy(() =>
  import("./QuizResultProof").then((module) => ({
    default: module.QuizResultProof,
  })),
);
const QuizPlanOptions = lazy(() =>
  import("./QuizPlanOptions").then((module) => ({
    default: module.QuizPlanOptions,
  })),
);

const dimensionLabels = [
  ["startEase", "começo"],
  ["recovery", "retomada"],
  ["simplicity", "simplicidade"],
  ["consistency", "constância"],
  ["planning", "planejamento"],
  ["replenishmentRelief", "reposição"],
  ["autonomy", "autonomia"],
  ["commitmentComfort", "compromisso"],
] as const;

const planVisuals: Readonly<Record<QuizPlan, string>> = {
  "30-days": "/offers/celuclin-one.webp",
  "90-days": "/offers/celuclin-three.webp",
  "210-days": "/offers/celuclin-seven.webp",
};

interface ScoreStyle extends CSSProperties {
  "--quiz-score": string;
}

function ResultAssembly({ calculation }: { readonly calculation: QuizCalculation }) {
  return (
    <div className="quiz-result-assembly" aria-hidden="true">
      {dimensionLabels.map(([dimension, label]) => (
        <span
          key={dimension}
          style={{
            "--quiz-score": String(
              Math.max(18, calculation.dimensions[dimension]) / 100,
            ),
          } as ScoreStyle}
        >
          <i />
          <small>{label}</small>
        </span>
      ))}
    </div>
  );
}

interface QuizResultExperienceProps {
  readonly calculation: QuizCalculation;
  readonly onRestart: () => void;
}

export function QuizResultExperience({
  calculation,
  onRestart,
}: QuizResultExperienceProps) {
  const profile = quizProfiles[calculation.profile];
  const titleRef = useRef<HTMLHeadingElement>(null);
  const recommendationRef = useRef<HTMLElement>(null);
  const recommendationViewed = useRef(false);
  const resultViewed = useRef(false);
  const planCalculation = calculateRecommendedPlan(calculation.dimensions);
  const recommendation = resolveQuizRecommendation(calculation.dimensions);
  const allOptions = getQuizPlanOptions();
  const product = campaignAssets.productAngle;
  const canShowProduct = canRenderCampaignAsset(product);

  useEffect(() => {
    const frame = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [calculation.profile]);

  useEffect(() => {
    if (resultViewed.current) return;
    resultViewed.current = true;
    recordQuizEvent("quiz_result_view", {
      result_profile: calculation.profile,
      recommended_plan: planCalculation.plan,
    });
  }, [calculation.profile, planCalculation.plan]);

  useEffect(() => {
    const section = recommendationRef.current;
    if (section === null || recommendationViewed.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          !entries.some((entry) => entry.isIntersecting) ||
          recommendationViewed.current
        ) {
          return;
        }
        recommendationViewed.current = true;
        recordQuizEvent("quiz_recommendation_view", {
          result_profile: calculation.profile,
          recommended_plan: planCalculation.plan,
        });
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [calculation.profile, planCalculation.plan]);

  return (
    <main className="quiz-main quiz-main--result" id="conteudo-quiz">
      <article className="quiz-result">
        <header className="quiz-result-hero">
          <div className="quiz-result-hero__band" aria-hidden="true" />
          <div className="quiz-result-shell quiz-result-hero__inner">
            <div className="quiz-result-hero__copy">
              <p className="quiz-kicker">Seu ritmo de autocuidado</p>
              <h1 ref={titleRef} tabIndex={-1}>{profile.title}</h1>
              <strong>{profile.recognition}</strong>
              <p>{quizConfidenceCopy[calculation.confidence]}</p>
              <span>Leitura de rotina · não é diagnóstico</span>
            </div>
            <ResultAssembly calculation={calculation} />
          </div>
        </header>

        <div className="quiz-result-shell quiz-result-body">
          <section className="quiz-reading" aria-labelledby="quiz-reading-title">
            <div className="quiz-reading__intro">
              <p className="quiz-kicker">Antes de qualquer produto</p>
              <h2 id="quiz-reading-title">O que seu conjunto de escolhas mostrou.</h2>
              <p>{profile.description}</p>
            </div>
            <ol className="quiz-reading__traits">
              {profile.characteristics.map((characteristic, index) => (
                <li key={characteristic}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{characteristic}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="quiz-guidance" aria-labelledby="quiz-guidance-title">
            <div className="quiz-guidance__attention">
              <p className="quiz-kicker">Ponto de atenção</p>
              <h2 id="quiz-guidance-title">{profile.attentionTitle}</h2>
              <p>{profile.attention}</p>
              <strong>{profile.orientation}</strong>
            </div>
            <div className="quiz-guidance__ritual">
              <span aria-hidden="true">7 dias</span>
              <p className="quiz-kicker">Sugestão de ritual</p>
              <h3>{profile.ritualTitle}</h3>
              <p>{profile.ritual}</p>
            </div>
          </section>

          <section className="quiz-product-bridge" aria-labelledby="quiz-product-title">
            <div className="quiz-product-bridge__media" data-media-status={canShowProduct ? "ready" : "blocked"}>
              <div aria-hidden="true" />
              {canShowProduct ? (
                <img
                  src={product.src}
                  width={product.width}
                  height={product.height}
                  alt={product.alt}
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
            </div>
            <div className="quiz-product-bridge__copy">
              <p className="quiz-kicker">Uma possibilidade, não uma conclusão</p>
              <h2 id="quiz-product-title">Onde o CeluClin entra nesta conversa.</h2>
              <p>
                O quiz descreve como você organiza uma rotina. Ele não indica
                necessidade, eficácia individual ou qual resultado você terá.
              </p>
              <p>
                CeluClin é um suplemento alimentar em cápsulas, com sugestão de
                uso informada de {usageFact.capsulesPerDay} cápsulas ao dia.
                Cada frasco contém {usageFact.totalCapsules} cápsulas e corresponde
                a aproximadamente {usageFact.durationDays} dias de uso.
              </p>
              <ul className="quiz-product-facts" aria-label="Informações confirmadas do CeluClin">
                <li><strong>60</strong><span>cápsulas</span></li>
                <li><strong>2</strong><span>ao dia</span></li>
                <li><strong>≈ 30</strong><span>dias por frasco</span></li>
              </ul>
              <details className="quiz-product-details">
                <summary>Modo de uso e advertências</summary>
                <div>
                  <p>Sugestão de uso no rótulo: {usageFact.suggestedUse}.</p>
                  {warningFacts.map((warning) => <p key={warning.id}>{warning.text}</p>)}
                </div>
              </details>
              <nav className="quiz-product-links" aria-label="Informações do CeluClin">
                <a
                  href="/#composicao"
                  onClick={() => recordQuizEvent("quiz_formula_click", {
                    result_profile: calculation.profile,
                    recommended_plan: planCalculation.plan,
                  })}
                >
                  Ver composição
                </a>
                <a
                  href="/#rotulo"
                  onClick={() => recordQuizEvent("quiz_label_click", {
                    result_profile: calculation.profile,
                    recommended_plan: planCalculation.plan,
                  })}
                >
                  Ler o rótulo
                </a>
                <a href="/#belvitale">Informações da marca</a>
              </nav>
            </div>
          </section>

          <Suspense fallback={<div className="quiz-lazy-placeholder quiz-lazy-placeholder--proof" aria-hidden="true" />}>
            <QuizResultProof />
          </Suspense>

          {recommendation === null ? null : (
            <section
              className="quiz-recommendation"
              aria-labelledby="quiz-recommendation-title"
              ref={recommendationRef}
            >
              <div className="quiz-recommendation__visual">
                <img
                  src={planVisuals[recommendation.plan]}
                  width={recommendation.plan === "30-days" ? 800 : recommendation.plan === "90-days" ? 1000 : 1200}
                  height={recommendation.plan === "210-days" ? 760 : 700}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="quiz-recommendation__copy">
                <p className="quiz-kicker">{recommendation.disclosure}</p>
                <h2 id="quiz-recommendation-title">{recommendation.title}</h2>
                <p>{recommendation.rationale}</p>
                <span>{recommendation.duration}</span>
                <a
                  className="quiz-primary-action"
                  href={recommendation.checkoutUrl}
                  onClick={() => recordQuizEvent("quiz_checkout_click", {
                    result_profile: calculation.profile,
                    recommended_plan: recommendation.plan,
                  })}
                >
                  {recommendation.cta}
                </a>
                <small>
                  A sugestão considera somente conveniência, compromisso inicial,
                  constância, planejamento e reposição.
                </small>
              </div>
            </section>
          )}

          <Suspense fallback={<div className="quiz-lazy-placeholder quiz-lazy-placeholder--plans" aria-hidden="true" />}>
            <QuizPlanOptions
              options={allOptions}
              recommendedPlan={planCalculation.plan}
              profile={calculation.profile}
            />
          </Suspense>

          <footer className="quiz-result-footer">
            <div>
              <strong>Uma leitura, não um rótulo.</strong>
              <p>
                Este resultado fala de preferências de rotina. Não avalia corpo,
                saúde ou necessidade de produto.
              </p>
            </div>
            <button type="button" onClick={onRestart}>Refazer o quiz</button>
          </footer>
        </div>
      </article>
    </main>
  );
}
