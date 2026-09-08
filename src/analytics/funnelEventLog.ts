import { funnelContentRevision, funnelEventProperties } from "./funnelAttribution";
import type { QuizTrackedEvent } from "../features/quiz/tracking/analytics.types";

export const funnelEventLogKey = `belvitale.funnel.events.${funnelContentRevision}`;
// Local QA log, bounded and without names or answer values. Not a remote analytics service.
export function recordFunnelDiagnostic(event: QuizTrackedEvent): void {
  if (typeof window === "undefined") return;
  const row = { event: event.event, ...funnelEventProperties(), stageId: event.properties.stageId, occurredAt: event.occurredAt };
  try {
    const previous: unknown = JSON.parse(sessionStorage.getItem(funnelEventLogKey) ?? "[]");
    const rows: unknown[] = Array.isArray(previous) ? previous as unknown[] : [];
    sessionStorage.setItem(funnelEventLogKey, JSON.stringify([...rows.slice(-299), row]));
  } catch { /* telemetry never blocks reading or purchase */ }
}
