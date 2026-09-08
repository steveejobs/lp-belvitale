export type HomeEvent =
  | "home_view"
  | "hero_cta_click"
  | "product_view"
  | "quiz_cta_click"
  | "product_cta_click"
  | "proof_interaction"
  | "faq_open"
  | "checkout_start";

export interface HomeEventPayload {
  readonly location?: string;
  readonly destination?: string;
  readonly productView?: string;
  readonly proofCategory?: string;
  readonly offerId?: string;
  readonly path?: string;
}

export interface LocalHomeEvent {
  readonly event: HomeEvent;
  readonly payload: HomeEventPayload & {
    readonly source: "homepage";
    readonly deviceClass: "mobile" | "desktop";
    readonly utm: Readonly<Partial<Record<"source" | "medium" | "campaign" | "content" | "term", string>>>;
  };
  readonly occurredAt: string;
}

const emitted = new Set<string>();

function safeAttributionValue(value: string | null): value is string {
  return value !== null && value.length > 0 && value.length <= 100 && /^[a-zA-Z0-9._~-]+$/.test(value);
}

function getAttribution(): LocalHomeEvent["payload"]["utm"] {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const entries = [
    ["source", params.get("utm_source")],
    ["medium", params.get("utm_medium")],
    ["campaign", params.get("utm_campaign")],
    ["content", params.get("utm_content")],
    ["term", params.get("utm_term")],
  ] as const;
  return Object.fromEntries(
    entries.filter((entry): entry is readonly [typeof entry[0], string] => safeAttributionValue(entry[1])),
  );
}

export function recordHomeEvent(
  event: HomeEvent,
  payload: HomeEventPayload = {},
  dedupeKey?: string,
): void {
  if (dedupeKey !== undefined) {
    const key = `${event}:${dedupeKey}`;
    if (emitted.has(key)) return;
    emitted.add(key);
  }

  if (typeof window === "undefined") return;
  const localEvent: LocalHomeEvent = {
    event,
    payload: {
      ...payload,
      source: "homepage",
      deviceClass: window.matchMedia("(max-width: 47.99rem)").matches ? "mobile" : "desktop",
      utm: getAttribution(),
    },
    occurredAt: new Date().toISOString(),
  };
  window.dispatchEvent(new CustomEvent<LocalHomeEvent>("belvitale:home", { detail: localEvent }));
}

export function resetHomeEventDedupeForTests(): void {
  emitted.clear();
}
