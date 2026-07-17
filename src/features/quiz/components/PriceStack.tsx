import { calculatePrice } from "../pricing/pricing.calculate";
import { formatCurrency, formatPercentage } from "../pricing/pricing.format";
import type { PromotionOffer, QuizReward } from "../campaign/campaign.types";

export function PriceStack({ offer, reward = null }: { readonly offer: PromotionOffer; readonly reward?: QuizReward | null }) {
  const price = calculatePrice(offer, reward);
  return (
    <section className="q6-price" aria-labelledby="q6-price-title">
      <p id="q6-price-title">Preço verificado no checkout oficial</p>
      <div className="q6-price__reference"><span>Referência exibida</span><s>{formatCurrency(price.regularPrice)}</s></div>
      <div className="q6-price__current"><span>Preço atual</span><strong>{formatCurrency(price.campaignPrice)}</strong></div>
      {price.rewardDiscount > 0 ? (
        <div className="q6-price__reward"><span>Benefício desbloqueado</span><strong>− {formatCurrency(price.rewardDiscount)}</strong></div>
      ) : null}
      <div className="q6-price__final"><span>Preço final</span><strong>{formatCurrency(price.finalPrice)}</strong></div>
      <p className="q6-price__saving">Diferença de {formatCurrency(price.savingsValue)} ({formatPercentage(price.savingsPercentage)}) em relação ao valor de referência do checkout.</p>
      <small>Fotografia auditada em 17/07/2026. O valor válido é sempre o confirmado no checkout antes da compra.</small>
    </section>
  );
}
