export type PromotionTimerState = "normal" | "under-hour" | "under-five-minutes" | "under-minute" | "expired";

export interface PromotionTime {
  readonly secondsRemaining: number;
  readonly state: PromotionTimerState;
}

export function calculatePromotionTime(expiresAt: string, serverNow: number): PromotionTime {
  const secondsRemaining = Math.max(0, Math.ceil((Date.parse(expiresAt) - serverNow) / 1000));
  const state: PromotionTimerState =
    secondsRemaining === 0 ? "expired"
    : secondsRemaining < 60 ? "under-minute"
    : secondsRemaining < 300 ? "under-five-minutes"
    : secondsRemaining < 3600 ? "under-hour"
    : "normal";
  return { secondsRemaining, state };
}
