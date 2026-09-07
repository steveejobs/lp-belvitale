import { calculatePrice } from "../pricing/pricing.calculate";
import { formatCurrency } from "../pricing/pricing.format";
import type { PromotionOffer, QuizReward } from "../campaign/campaign.types";

export function PriceStack({ offer, reward = null }: { readonly offer: PromotionOffer; readonly reward?: QuizReward | null }) {
  const price = calculatePrice(offer, reward);
  return (
    <section className="q7-price" aria-labelledby="q7-price-title">
      <p id="q7-price-title">Preço atual verificado no checkout oficial</p>
      {price.rewardDiscount > 0 ? (
        <div className="q7-price__reward"><span>Benefício desbloqueado</span><strong>− {formatCurrency(price.rewardDiscount)}</strong></div>
      ) : null}
      <div className="q7-price__final"><span>Preço de hoje</span><strong>{formatCurrency(price.finalPrice)}</strong></div>
      <p className="q7-price__saving">Equivale a {formatCurrency(price.finalPrice / offer.quantity)} por frasco nesta opção.</p>
      <small>Preço encontrado em navegador limpo em 07/09/2026. O valor válido é sempre o confirmado no checkout antes da compra.</small>
    </section>
  );
}
