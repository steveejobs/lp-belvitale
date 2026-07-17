import type { OfferId } from "../domain/quiz.types";

export interface PromotionOffer {
  readonly id: OfferId;
  readonly checkoutUrl: string;
  readonly regularPrice: number;
  readonly campaignPrice: number;
  readonly installmentCount?: number;
  readonly installmentValue?: number;
  readonly quantity: number;
  readonly approximateDays: number;
  readonly imageSrc: string;
}

export interface QuizReward {
  readonly id: string;
  readonly couponCode: string;
  readonly discountType: "percentage" | "fixed";
  readonly discountValue: number;
  readonly eligibleOffers: readonly OfferId[];
  readonly probabilityWeight?: number;
}

export interface QuizPromotion {
  readonly id: string;
  readonly version: string;
  readonly status: "draft" | "scheduled" | "active" | "expired";
  readonly startsAt: string;
  readonly endsAt: string;
  readonly offers: Readonly<Record<OfferId, PromotionOffer>>;
  readonly rewards: readonly QuizReward[];
}
