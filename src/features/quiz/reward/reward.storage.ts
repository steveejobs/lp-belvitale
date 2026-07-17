import type { IssuedReward } from "./reward.types";

export const rewardStorageKey = "belvitale.quiz.reward.v1";

export function loadIssuedReward(storage: Storage = localStorage): IssuedReward | null {
  try {
    const raw = storage.getItem(rewardStorageKey);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as Partial<IssuedReward>;
    return (
      typeof parsed.rewardId === "string" &&
      typeof parsed.campaignId === "string" &&
      typeof parsed.couponCode === "string" &&
      typeof parsed.issuedAt === "string" &&
      typeof parsed.expiresAt === "string" &&
      typeof parsed.sessionId === "string" &&
      Array.isArray(parsed.eligibleOfferIds) &&
      typeof parsed.promotionVersion === "string"
    ) ? parsed as IssuedReward : null;
  } catch {
    return null;
  }
}

export function saveIssuedReward(reward: IssuedReward, storage: Storage = localStorage): void {
  try { storage.setItem(rewardStorageKey, JSON.stringify(reward)); } catch { /* sem fallback externo */ }
}

export function clearIssuedReward(storage: Storage = localStorage): void {
  try { storage.removeItem(rewardStorageKey); } catch { /* storage indisponível */ }
}
