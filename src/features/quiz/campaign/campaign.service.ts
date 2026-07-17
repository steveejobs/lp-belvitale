import type { QuizPromotion } from "./campaign.types";

export function getCampaignState(
  campaign: QuizPromotion,
  now = Date.now(),
): QuizPromotion["status"] {
  if (campaign.status === "draft") return "draft";
  if (now < Date.parse(campaign.startsAt)) return "scheduled";
  if (now >= Date.parse(campaign.endsAt)) return "expired";
  return campaign.status === "expired" ? "expired" : "active";
}

export function canIssueCommercialReward(campaign: QuizPromotion, now = Date.now()): boolean {
  return getCampaignState(campaign, now) === "active" && campaign.rewards.length > 0;
}
