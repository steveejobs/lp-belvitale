import { canIssueCommercialReward } from "../campaign/campaign.service";
import type { QuizPromotion, QuizReward } from "../campaign/campaign.types";
import type { IssuedReward } from "./reward.types";

function stableHash(value: string): number {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function selectReward(rewards: readonly QuizReward[], seed: string): QuizReward | null {
  if (rewards.length === 0) return null;
  const weighted = rewards.map((reward) => ({
    reward,
    weight: Math.max(0, reward.probabilityWeight ?? 1),
  }));
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) return null;
  let cursor = stableHash(seed) % total;
  for (const item of weighted) {
    if (cursor < item.weight) return item.reward;
    cursor -= item.weight;
  }
  return weighted[0]?.reward ?? null;
}

export function issueReward(
  campaign: QuizPromotion,
  sessionId: string,
  now = new Date(),
): IssuedReward | null {
  if (!canIssueCommercialReward(campaign, now.getTime())) return null;
  const reward = selectReward(campaign.rewards, campaign.id + ":" + campaign.version + ":" + sessionId);
  if (reward === null) return null;
  return {
    rewardId: reward.id,
    campaignId: campaign.id,
    couponCode: reward.couponCode,
    issuedAt: now.toISOString(),
    expiresAt: campaign.endsAt,
    sessionId,
    eligibleOfferIds: reward.eligibleOffers,
    promotionVersion: campaign.version,
  };
}
