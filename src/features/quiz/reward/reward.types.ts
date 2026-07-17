import type { OfferId } from "../domain/quiz.types";

export interface IssuedReward {
  readonly rewardId: string;
  readonly campaignId: string;
  readonly couponCode: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly sessionId: string;
  readonly eligibleOfferIds: readonly OfferId[];
  readonly promotionVersion: string;
}
