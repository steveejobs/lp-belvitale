import type { QuizTrackedEvent } from "./analytics.types";

export type AnalyticsAdapter = (event: QuizTrackedEvent) => void;

const adapters = new Set<AnalyticsAdapter>();

export function registerAnalyticsAdapter(adapter: AnalyticsAdapter): () => void {
  adapters.add(adapter);
  return () => adapters.delete(adapter);
}

export function dispatchToAnalyticsAdapters(event: QuizTrackedEvent): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("belvitale:quiz-v7", { detail: event }));
  if (window.__BELVITALE_ANALYTICS_CONSENT__ === true) {
    adapters.forEach((adapter) => adapter(event));
  }
}

declare global {
  interface Window {
    __BELVITALE_ANALYTICS_CONSENT__?: boolean;
  }
}
