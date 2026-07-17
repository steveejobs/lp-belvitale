import type { PromotionOffer, QuizReward } from "../campaign/campaign.types";
import type { PriceCalculation } from "./pricing.types";

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculatePrice(
  offer: PromotionOffer,
  reward: QuizReward | null = null,
): PriceCalculation {
  const rewardEligible = reward?.eligibleOffers.includes(offer.id) ?? false;
  const rawReward = reward === null || !rewardEligible
    ? 0
    : reward.discountType === "percentage"
      ? offer.campaignPrice * reward.discountValue / 100
      : reward.discountValue;
  const rewardDiscount = money(Math.min(offer.campaignPrice, Math.max(0, rawReward)));
  const finalPrice = money(offer.campaignPrice - rewardDiscount);
  const savingsValue = money(Math.max(0, offer.regularPrice - finalPrice));
  const savingsPercentage = offer.regularPrice <= 0
    ? 0
    : money(savingsValue / offer.regularPrice * 100);
  return {
    offerId: offer.id,
    regularPrice: money(offer.regularPrice),
    campaignPrice: money(offer.campaignPrice),
    rewardDiscount,
    finalPrice,
    savingsValue,
    savingsPercentage,
  };
}
