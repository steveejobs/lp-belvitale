import { useEffect, useMemo, useState } from "react";
import { quizPromotion } from "../campaign/campaign.config";
import type { NarrativeProfileId, OfferId, QuizRecommendation } from "../domain/quiz.types";
import { calculatePrice } from "../pricing/pricing.calculate";
import { formatCurrency } from "../pricing/pricing.format";
import { trackQuizEvent } from "../tracking/analytics.events";
import { CheckoutCTA } from "./CheckoutCTA";
import { OfferComparison } from "./OfferComparison";
import { OfferRecommendation } from "./OfferRecommendation";
import { RewardReveal } from "./RewardReveal";
import { RewardTease } from "./RewardTease";

interface OfferStageProps {
  readonly sessionId: string;
  readonly profileId: NarrativeProfileId;
  readonly recommendation: QuizRecommendation;
  readonly selectedOfferId: OfferId;
  readonly onSelectOffer: (offerId: OfferId) => void;
}

function rewardKey(sessionId: string): string {
  return "belvitale.quiz.content-reward.v1:" + sessionId;
}

function loadUnlocked(sessionId: string): boolean {
  try { return localStorage.getItem(rewardKey(sessionId)) === "revealed"; } catch { return false; }
}

export function OfferStage({
  sessionId,
  profileId,
  recommendation,
  selectedOfferId,
  onSelectOffer,
}: OfferStageProps) {
  const [unlocked, setUnlocked] = useState(() => loadUnlocked(sessionId));
  const [revealing, setRevealing] = useState(false);
  const offer = quizPromotion.offers[selectedOfferId];
  const price = calculatePrice(offer);
  const displayedRecommendation = useMemo<QuizRecommendation>(() => selectedOfferId === recommendation.offerId
    ? recommendation
    : {
        offerId: selectedOfferId,
        reasons: [
          "Você abriu esta alternativa para comparar duração e reposição.",
          "A opção original continua marcada na comparação para manter a recomendação transparente.",
        ],
        commercialInputs: recommendation.commercialInputs,
      }, [recommendation, selectedOfferId]);

  useEffect(() => {
    trackQuizEvent("quiz_offer_recommended", {
      sessionId,
      profileId,
      recommendedOfferId: recommendation.offerId,
      selectedOfferId,
    }, recommendation.offerId);
  }, [profileId, recommendation.offerId, selectedOfferId, sessionId]);

  const unlock = () => {
    trackQuizEvent("quiz_reward_unlock_clicked", { sessionId, profileId, recommendedOfferId: recommendation.offerId }, "content-reward");
    setRevealing(true);
    try { localStorage.setItem(rewardKey(sessionId), "revealed"); } catch { /* continua em memória */ }
    window.setTimeout(() => {
      setUnlocked(true);
      setRevealing(false);
      trackQuizEvent("quiz_reward_revealed", { sessionId, profileId, recommendedOfferId: recommendation.offerId }, "content-reward");
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 40 : 700);
  };

  const checkout = () => {
    sessionStorage.setItem("belvitale.quiz.checkout-return", new Date().toISOString());
    trackQuizEvent("quiz_checkout_clicked", {
      sessionId,
      profileId,
      recommendedOfferId: recommendation.offerId,
      selectedOfferId,
    });
  };

  return (
    <article className="q6-offer" data-revealing={revealing}>
      {!unlocked ? <RewardTease onUnlock={unlock} /> : (
        <>
          <RewardReveal profileId={profileId} />
          <OfferRecommendation offer={offer} recommendation={displayedRecommendation} onCheckout={checkout} />
          <OfferComparison
            campaign={quizPromotion}
            recommendedOfferId={recommendation.offerId}
            selectedOfferId={selectedOfferId}
            onSelect={(offerId) => {
              onSelectOffer(offerId);
              trackQuizEvent("quiz_offer_changed", {
                sessionId,
                profileId,
                recommendedOfferId: recommendation.offerId,
                selectedOfferId: offerId,
              });
            }}
          />
          <aside className="q6-mobile-checkout" aria-label="Ação de compra">
            <div><span>{offer.approximateDays} dias</span><strong>{formatCurrency(price.finalPrice)}</strong></div>
            <CheckoutCTA offer={offer} onClick={checkout} className="q6-checkout--sticky" />
          </aside>
        </>
      )}
    </article>
  );
}
