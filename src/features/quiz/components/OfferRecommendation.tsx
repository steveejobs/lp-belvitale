import type { PromotionOffer } from "../campaign/campaign.types";
import { quizOffers } from "../content/offers";
import type { QuizRecommendation } from "../domain/quiz.types";
import { PriceStack } from "./PriceStack";
import { CheckoutCTA } from "./CheckoutCTA";

interface OfferRecommendationProps {
  readonly offer: PromotionOffer;
  readonly recommendation: QuizRecommendation;
  readonly onCheckout: () => void;
}

export function OfferRecommendation({ offer, recommendation, onCheckout }: OfferRecommendationProps) {
  const content = quizOffers[offer.id];
  return (
    <section className="q7-offer-main" aria-labelledby="q7-offer-main-title">
      <div className="q7-offer-main__media">
        <span>{content.badge}</span>
        <img src={offer.imageSrc} width={offer.id === "seven-months" ? 1200 : offer.id === "three-months" ? 1000 : 800} height={offer.id === "seven-months" ? 760 : 700} alt={"Kit real de CeluClin com " + String(offer.quantity) + (offer.quantity === 1 ? " frasco" : " frascos")} />
      </div>
      <div className="q7-offer-main__copy">
        <p className="q7-step-label">Opção selecionada</p>
        <h2 id="q7-offer-main-title">{content.title} · {offer.quantity} {offer.quantity === 1 ? "frasco" : "frascos"}</h2>
        <p>{content.summary}</p>
        <dl className="q7-offer-facts" aria-label="Conteúdo e duração aproximada da opção">
          <div><dt>{offer.quantity}</dt><dd>{offer.quantity === 1 ? "frasco" : "frascos"}</dd></div>
          <div><dt>{offer.quantity * 60}</dt><dd>cápsulas</dd></div>
          <div><dt>≈ {offer.approximateDays}</dt><dd>dias*</dd></div>
        </dl>
        <small className="q7-offer-facts__note">*Considerando 2 cápsulas ao dia, conforme o rótulo.</small>
        <ul>{recommendation.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        <PriceStack offer={offer} />
        <CheckoutCTA offer={offer} onClick={onCheckout} />
      </div>
    </section>
  );
}
