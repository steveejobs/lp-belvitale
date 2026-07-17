import type { OfferId } from "../domain/quiz.types";

const allowedUtmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

function safeValue(value: string | null): string | null {
  if (value === null) return null;
  const trimmed = value.trim().slice(0, 100);
  return /^[\p{L}\p{N}._~\-/ ]+$/u.test(trimmed) ? trimmed : null;
}

export function buildCheckoutUrl(
  baseUrl: string,
  currentSearch: string,
  metadata: Readonly<{ campaignId: string; rewardId?: string; offerId: OfferId }>,
): string {
  const url = new URL(baseUrl);
  const source = new URLSearchParams(currentSearch);
  for (const key of allowedUtmKeys) {
    const value = safeValue(source.get(key));
    if (value !== null) url.searchParams.set(key, value);
  }
  url.searchParams.set("campaignId", metadata.campaignId);
  url.searchParams.set("offerId", metadata.offerId);
  if (metadata.rewardId !== undefined) url.searchParams.set("rewardId", metadata.rewardId);
  return url.toString();
}
