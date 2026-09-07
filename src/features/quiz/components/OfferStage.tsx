import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { quizPromotion } from "../campaign/campaign.config";
import { quizOffers } from "../content/offers";
import type { OfferId, QuizRecommendation } from "../domain/quiz.types";
import { calculatePrice } from "../pricing/pricing.calculate";
import { formatCurrency } from "../pricing/pricing.format";
import { trackQuizEvent } from "../tracking/analytics.events";
import { CheckoutCTA } from "./CheckoutCTA";
import { OfferComparison } from "./OfferComparison";
import { OfferRecommendation } from "./OfferRecommendation";

interface OfferStageProps {
  readonly sessionId: string;
  readonly recommendation: QuizRecommendation;
  readonly selectedOfferId: OfferId;
  readonly onSelectOffer: (offerId: OfferId) => void;
}

export function OfferStage({ sessionId, recommendation, selectedOfferId, onSelectOffer }: OfferStageProps) {
  const offer = quizPromotion.offers[selectedOfferId];
  const price = calculatePrice(offer);
  const recommendationOverride = selectedOfferId !== recommendation.offerId;
  const displayedRecommendation = useMemo<QuizRecommendation>(() => selectedOfferId === recommendation.offerId
    ? recommendation
    : {
        offerId: selectedOfferId,
        disposition: recommendation.disposition,
        reasons: [
          "Você escolheu esta alternativa para comparar duração, quantidade e reposição.",
          `A sugestão de ${quizOffers[recommendation.offerId].title} continua marcada para manter a recomendação transparente.`,
        ],
        commercialInputs: recommendation.commercialInputs,
      }, [recommendation, selectedOfferId]);

  useEffect(() => {
    trackQuizEvent("quiz_offer_recommended", {
      sessionId,
      recommendedOfferId: recommendation.offerId,
      selectedOfferId,
      recommended_offer: recommendation.offerId,
      selected_offer: selectedOfferId,
      recommendation_override: recommendationOverride,
    }, recommendation.offerId);
  }, [recommendation.offerId, recommendationOverride, selectedOfferId, sessionId]);

  const checkout = () => {
    sessionStorage.setItem("belvitale.quiz.checkout-return", new Date().toISOString());
    trackQuizEvent("quiz_checkout_clicked", {
      sessionId,
      recommendedOfferId: recommendation.offerId,
      selectedOfferId,
      recommended_offer: recommendation.offerId,
      selected_offer: selectedOfferId,
      recommendation_override: recommendationOverride,
    });
  };

  const portalTarget = document.querySelector(".quiz-route");

  return (
    <>
      <article
        className="q7-offer"
        data-recommended-offer={recommendation.offerId}
        data-selected-offer={selectedOfferId}
        data-recommendation-override={recommendationOverride}
      >
        <header className="q7-offer__intro">
          <p className="q7-step-label">Nossa sugestão</p>
          <h1>Nossa sugestão para quem busca <em>constância sem complicar a rotina.</em></h1>
        </header>
        <OfferRecommendation offer={offer} recommendation={displayedRecommendation} onCheckout={checkout} />
        <OfferComparison
          campaign={quizPromotion}
          recommendedOfferId={recommendation.offerId}
          selectedOfferId={selectedOfferId}
          onSelect={(offerId) => {
            onSelectOffer(offerId);
            trackQuizEvent("quiz_offer_changed", {
              sessionId,
              recommendedOfferId: recommendation.offerId,
              selectedOfferId: offerId,
              recommended_offer: recommendation.offerId,
              selected_offer: offerId,
              recommendation_override: offerId !== recommendation.offerId,
            });
          }}
        />
      </article>
      {portalTarget === null ? null : createPortal(
        <aside className="q7-mobile-checkout" aria-label="Ação de compra">
          <div><span>{offer.approximateDays} dias</span><strong>{formatCurrency(price.finalPrice)}</strong></div>
          <CheckoutCTA offer={offer} onClick={checkout} className="q7-checkout--sticky" />
        </aside>,
        portalTarget,
      )}
    </>
  );
}
