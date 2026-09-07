import type { PromotionOffer } from "../campaign/campaign.types";
import { quizOffers } from "../content/offers";
import type { QuizRecommendation } from "../domain/quiz.types";
import { PriceStack } from "./PriceStack";
import { CheckoutCTA } from "./CheckoutCTA";
import { usageFact, warningFacts } from "../../../data/productFacts";

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
        <img src={offer.imageSrc} width={offer.imageWidth} height={offer.imageHeight} alt={"Kit de CeluClin com " + String(offer.quantity) + (offer.quantity === 1 ? " frasco" : " frascos")} />
      </div>
      <div className="q7-offer-main__copy">
        <p className="q7-step-label">Seu caminho selecionado</p>
        <h2 id="q7-offer-main-title">{content.title} · {offer.quantity} {offer.quantity === 1 ? "frasco" : "frascos"}</h2>
        <p>{content.summary}</p>
        <dl className="q7-offer-facts" aria-label="Conteúdo e duração aproximada da opção">
          <div><dt>{offer.quantity}</dt><dd>{offer.quantity === 1 ? "frasco" : "frascos"}</dd></div>
          <div><dt>{offer.quantity * 60}</dt><dd>cápsulas</dd></div>
          <div><dt>≈ {offer.approximateDays}</dt><dd>dias*</dd></div>
        </dl>
        <small className="q7-offer-facts__note">*Considerando 2 cápsulas ao dia, conforme o rótulo.</small>
        <section className="q7-offer-trust" aria-labelledby="q7-offer-trust-title">
          <p className="q7-step-label">Antes de decidir</p>
          <h3 id="q7-offer-trust-title">O que você está comprando — e quais são os limites.</h3>
          <ul>
            <li>Suplemento alimentar em cápsulas; não é medicamento.</li>
            <li>{String(usageFact.totalCapsules)} cápsulas por frasco e uso informado de {String(usageFact.capsulesPerDay)} cápsulas ao dia.</li>
            <li>Para adultos a partir de 19 anos.</li>
            <li>{warningFacts.find((warning) => warning.id === "pregnancy-and-children")?.text}</li>
          </ul>
          <a href="/label/celuclin-label-complete.pdf" target="_blank" rel="noreferrer">Abrir rótulo completo</a>
        </section>
        <div className="q7-offer-main__reasoning">
          <strong>Por que isso conversa com o seu resultado</strong>
          <ul>{recommendation.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        </div>
        <PriceStack offer={offer} />
        <CheckoutCTA offer={offer} onClick={onCheckout} />
      </div>
    </section>
  );
}
