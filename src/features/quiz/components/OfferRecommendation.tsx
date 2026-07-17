import { type CSSProperties, useEffect, useRef } from "react";
import { commercialTransparency, quizOffers } from "../content/offers";
import type {
  QuizPlanId,
  QuizRecommendation,
} from "../domain/quiz.types";
import { getMotionFamilyAttribute } from "../motion/quiz.transitions";
import { CheckoutCTA } from "./CheckoutCTA";
import { OfferComparison } from "./OfferComparison";

interface OfferRecommendationProps {
  readonly recommendation: QuizRecommendation;
  readonly selectedPlan: QuizPlanId;
  readonly onSelectPlan: (plan: QuizPlanId) => void;
  readonly onCheckout: () => void;
  readonly onBackToResult: () => void;
}

export function OfferRecommendation({
  recommendation,
  selectedPlan,
  onSelectPlan,
  onCheckout,
  onBackToResult,
}: OfferRecommendationProps) {
  const offer = quizOffers[selectedPlan];
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [selectedPlan]);
  return (
    <main
      className="quiz-main quiz-main--offer"
      id="conteudo-quiz"
      data-motion={getMotionFamilyAttribute("offer")}
    >
      <article className="quiz-offer">
        <header className="quiz-offer__hero">
          <div className="quiz-offer__visual" data-bottles={offer.bottles}>
            <div className="quiz-offer__halo" aria-hidden="true" />
            <div className="quiz-offer__bottles">
              {Array.from({ length: offer.bottles }, (_, index) => (
                <img
                  key={`${offer.id}-${String(index)}`}
                  src="/offers/celuclin-one.webp"
                  alt={index === 0 ? offer.imageAlt : ""}
                  width="800"
                  height="700"
                  style={{ "--bottle-index": index } as CSSProperties}
                />
              ))}
            </div>
            <span>{offer.title}</span>
          </div>
          <div className="quiz-offer__copy">
            <p className="quiz-kicker">
              {selectedPlan === recommendation.plan ? "Sua recomendação comercial" : "Opção escolhida para comparar"}
            </p>
            <h1 ref={titleRef} tabIndex={-1}>{offer.title} · {offer.durationLabel}</h1>
            <p className="quiz-offer__why">
              {selectedPlan === recommendation.plan
                ? `Recomendamos esta opção porque ${recommendation.reasons[0]}, ${recommendation.reasons[1]} e ${recommendation.reasons[2]}.`
                : "Você escolheu comparar uma opção diferente da recomendação. A decisão continua sendo sua e os critérios originais permanecem visíveis."}
            </p>
            <dl className="quiz-offer__facts">
              <div><dt>Conteúdo</dt><dd>{offer.bottles} {offer.bottles === 1 ? "frasco" : "frascos"} · {offer.totalCapsules} cápsulas</dd></div>
              <div><dt>Uso do rótulo</dt><dd>2 cápsulas ao dia</dd></div>
              <div><dt>Reposição</dt><dd>{offer.bestFor}</dd></div>
              {offer.additionalBottles > 0 ? <div><dt>Composição da oferta</dt><dd>5 frascos + 2 frascos adicionais</dd></div> : null}
            </dl>
            <div className="quiz-price-block">
              <strong>Preço consultado no checkout</strong>
              <p>{commercialTransparency.price}</p>
            </div>
            <CheckoutCTA offer={offer} onClick={onCheckout} />
          </div>
        </header>

        <div className="quiz-offer__transparency">
          <p>{commercialTransparency.product}</p>
          <p>{commercialTransparency.duration}</p>
        </div>

        <OfferComparison
          selected={selectedPlan}
          recommended={recommendation.plan}
          onSelect={onSelectPlan}
        />

        <button className="quiz-text-action" type="button" onClick={onBackToResult}>← Voltar ao resultado e revisar respostas</button>
      </article>
    </main>
  );
}
