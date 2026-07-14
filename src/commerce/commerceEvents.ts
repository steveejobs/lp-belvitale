export type CommerceEvent =
  | "offer_view"
  | "offer_select"
  | "checkout_click";

export interface CommerceEventPayload {
  readonly offerId: string;
  readonly source: "homepage";
}

export interface LocalCommerceEvent {
  readonly event: CommerceEvent;
  readonly payload: CommerceEventPayload;
}

type CommerceEventListener = (event: LocalCommerceEvent) => void;

const listeners = new Set<CommerceEventListener>();

export function subscribeToCommerceEvents(
  listener: CommerceEventListener,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function recordCommerceEvent(
  event: CommerceEvent,
  payload: CommerceEventPayload,
): void {
  const localEvent: LocalCommerceEvent = { event, payload };
  listeners.forEach((listener) => listener(localEvent));

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<LocalCommerceEvent>("belvitale:commerce", {
        detail: localEvent,
      }),
    );
  }
}
