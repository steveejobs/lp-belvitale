import { quizPromotion } from "../campaign/campaign.config";
import type { QuizAnalyticsEvent, QuizAnalyticsProperties, QuizTrackedEvent } from "./analytics.types";
import { dispatchToAnalyticsAdapters } from "./analytics.adapter";

const emitted = new Set<string>();

function safeAttributionValue(value: string | null): value is string {
  if (value === null || value.length === 0 || value.length > 100) return false;
  // UTM e identificador tecnico, nao campo livre. Rejeitar sinais comuns de
  // e-mail, telefone e markup reduz o risco de PII acidental no analytics.
  return /^[a-zA-Z0-9._~-]+$/.test(value) && !/\d{7,}/.test(value);
}

function attribution(): NonNullable<QuizAnalyticsProperties["utm"]> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const entries = [
    ["source", params.get("utm_source")],
    ["medium", params.get("utm_medium")],
    ["campaign", params.get("utm_campaign")],
    ["content", params.get("utm_content")],
    ["term", params.get("utm_term")],
  ] as const;
  return Object.fromEntries(entries.filter((entry): entry is readonly [typeof entry[0], string] =>
    safeAttributionValue(entry[1]),
  ));
}

export function trackQuizEvent(
  event: QuizAnalyticsEvent,
  properties: Omit<QuizAnalyticsProperties, "campaignId" | "experimentVariant" | "deviceClass" | "utm">,
  dedupeKey?: string,
): QuizTrackedEvent | null {
  const key = dedupeKey === undefined ? null : event + ":" + properties.sessionId + ":" + dedupeKey;
  if (key !== null && emitted.has(key)) return null;
  if (key !== null) emitted.add(key);
  const tracked: QuizTrackedEvent = {
    event,
    properties: {
      ...properties,
      campaignId: quizPromotion.id,
      experimentVariant: "consultoria-conversa-v7",
      deviceClass: typeof window !== "undefined" && window.matchMedia("(max-width: 47.99rem)").matches ? "mobile" : "desktop",
      utm: attribution(),
    },
    occurredAt: new Date().toISOString(),
  };
  dispatchToAnalyticsAdapters(tracked);
  return tracked;
}

export function resetAnalyticsDedupeForTests(): void {
  emitted.clear();
}
