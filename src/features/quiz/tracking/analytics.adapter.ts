import type { QuizTrackedEvent } from "./analytics.types";
import { recordLocalExperimentEvent } from "./experiment.store";
import { recordFunnelDiagnostic } from "../../../analytics/funnelEventLog";

export type AnalyticsAdapter = (event: QuizTrackedEvent) => void;

const adapters = new Set<AnalyticsAdapter>();

export function registerAnalyticsAdapter(adapter: AnalyticsAdapter): () => void {
  adapters.add(adapter);
  return () => adapters.delete(adapter);
}

export function dispatchToAnalyticsAdapters(event: QuizTrackedEvent): void {
  if (typeof window === "undefined") return;
  recordFunnelDiagnostic(event);
  try { recordLocalExperimentEvent(event); } catch { /* storage unavailable */ }
  window.dispatchEvent(new CustomEvent("belvitale:quiz-v7", { detail: event }));
  if (window.__BELVITALE_ANALYTICS_CONSENT__ === true) {
    adapters.forEach((adapter) => { try { adapter(event); } catch { /* analytics cannot interrupt the journey */ } });
  }
}

declare global {
  interface Window {
    __BELVITALE_ANALYTICS_CONSENT__?: boolean;
  }
}
