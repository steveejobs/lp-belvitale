import type { QuizPromotion } from "../campaign/campaign.types";
import { quizOffers, quizOfferOrder } from "../content/offers";
import type { OfferId } from "../domain/quiz.types";
import { calculatePrice } from "../pricing/pricing.calculate";
import { formatCurrency } from "../pricing/pricing.format";

interface OfferComparisonProps {
  readonly campaign: QuizPromotion;
  readonly recommendedOfferId: OfferId;
  readonly selectedOfferId: OfferId;
  readonly onSelect: (offerId: OfferId) => void;
}

export function OfferComparison({ campaign, recommendedOfferId, selectedOfferId, onSelect }: OfferComparisonProps) {
  return (
    <section className="q6-comparison" aria-labelledby="q6-comparison-title">
      <header>
        <p className="q6-eyebrow"><span /> As alternativas continuam abertas</p>
        <h2 id="q6-comparison-title">Compare duração, reposição e preço.</h2>
      </header>
      <div className="q6-comparison__rail">
        {quizOfferOrder.map((offerId) => {
          const offer = campaign.offers[offerId];
          const copy = quizOffers[offerId];
          const price = calculatePrice(offer);
          return (
            <button
              type="button"
              className="q6-comparison__card"
              key={offerId}
              data-selected={selectedOfferId === offerId}
              data-recommended={recommendedOfferId === offerId}
              aria-pressed={selectedOfferId === offerId}
              onClick={() => onSelect(offerId)}
            >
              <span>{recommendedOfferId === offerId ? "Recomendada" : copy.badge}</span>
              <img src={offer.imageSrc} alt="" loading="eager" decoding="async" />
              <strong>{copy.title}</strong>
              <small>{offer.quantity} {offer.quantity === 1 ? "frasco" : "frascos"} · ≈ {offer.approximateDays} dias</small>
              <p>{copy.replenishment}</p>
              <b>{formatCurrency(price.finalPrice)}</b>
            </button>
          );
        })}
      </div>
    </section>
  );
}
