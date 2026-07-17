import type { QuizPromotion } from "../campaign/campaign.types";
import type { IssuedReward } from "./reward.types";

export function validateIssuedReward(
  reward: IssuedReward,
  campaign: QuizPromotion,
  sessionId: string,
  now = Date.now(),
): boolean {
  const configured = campaign.rewards.find((candidate) => candidate.id === reward.rewardId);
  return (
    reward.sessionId === sessionId &&
    reward.campaignId === campaign.id &&
    reward.promotionVersion === campaign.version &&
    configured?.couponCode === reward.couponCode &&
    Date.parse(reward.expiresAt) > now
  );
}
