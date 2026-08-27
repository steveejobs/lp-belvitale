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
    <section className="q7-comparison" aria-labelledby="q7-comparison-title">
      <header>
        <p className="q7-step-label">A decisão continua sendo sua</p>
        <h2 id="q7-comparison-title">1, 3 ou 7 frascos: escolha o compromisso que você consegue sustentar.</h2>
      </header>
      <div className="q7-comparison__rail">
        {quizOfferOrder.map((offerId) => {
          const offer = campaign.offers[offerId];
          const copy = quizOffers[offerId];
          const price = calculatePrice(offer);
          return (
            <button
              type="button"
              className="q7-comparison__card"
              key={offerId}
              data-selected={selectedOfferId === offerId}
              data-recommended={recommendedOfferId === offerId}
              aria-pressed={selectedOfferId === offerId}
              onClick={() => onSelect(offerId)}
            >
              <span>{recommendedOfferId === offerId ? "Recomendada" : copy.badge}</span>
              <img
                src={offer.imageSrc}
                width={offer.imageWidth}
                height={offer.imageHeight}
                alt=""
                loading="eager"
                decoding="sync"
              />
              <strong>{copy.title}</strong>
              <small>{offerId === "seven-months" ? "5 + 2 frascos" : `${String(offer.quantity)} ${offer.quantity === 1 ? "frasco" : "frascos"}`} · ≈ {offer.approximateDays} dias</small>
              <p>{copy.replenishment}</p>
              <b>{formatCurrency(price.finalPrice)}</b>
            </button>
          );
        })}
      </div>
    </section>
  );
}
