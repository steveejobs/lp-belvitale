import { useEffect, useMemo } from "react";
import { quizPromotion } from "../campaign/campaign.config";
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
  const displayedRecommendation = useMemo<QuizRecommendation>(() => selectedOfferId === recommendation.offerId
    ? recommendation
    : {
        offerId: selectedOfferId,
        reasons: [
          "Você escolheu esta alternativa para comparar duração, quantidade e reposição.",
          "A sugestão de 90 dias continua marcada para manter a recomendação transparente.",
        ],
        commercialInputs: recommendation.commercialInputs,
      }, [recommendation, selectedOfferId]);

  useEffect(() => {
    trackQuizEvent("quiz_offer_recommended", {
      sessionId,
      recommendedOfferId: recommendation.offerId,
      selectedOfferId,
    }, recommendation.offerId);
  }, [recommendation.offerId, selectedOfferId, sessionId]);

  const checkout = () => {
    sessionStorage.setItem("belvitale.quiz.checkout-return", new Date().toISOString());
    trackQuizEvent("quiz_checkout_clicked", {
      sessionId,
      recommendedOfferId: recommendation.offerId,
      selectedOfferId,
    });
  };

  return (
    <article className="q7-offer">
      <header className="q7-offer__intro">
        <p className="q7-step-label">Você chegou à decisão</p>
        <h1>Agora escolha por quanto tempo você quer parar de transformar cuidado em <em>“depois eu começo”.</em></h1>
        <p>Seu resultado aponta para continuidade, não intensidade. Por isso, 90 dias aparecem primeiro — mas você pode comparar 1, 3 ou 7 frascos com total transparência.</p>
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
          });
        }}
      />
      <aside className="q7-mobile-checkout" aria-label="Ação de compra">
        <div><span>{offer.approximateDays} dias</span><strong>{formatCurrency(price.finalPrice)}</strong></div>
        <CheckoutCTA offer={offer} onClick={checkout} className="q7-checkout--sticky" />
      </aside>
    </article>
  );
}
