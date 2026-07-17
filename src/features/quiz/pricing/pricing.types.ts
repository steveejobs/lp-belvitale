import type { OfferId } from "../domain/quiz.types";

export interface PriceCalculation {
  readonly offerId: OfferId;
  readonly regularPrice: number;
  readonly campaignPrice: number;
  readonly rewardDiscount: number;
  readonly finalPrice: number;
  readonly savingsValue: number;
  readonly savingsPercentage: number;
}
