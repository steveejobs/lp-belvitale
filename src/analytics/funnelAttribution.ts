export type FunnelId = "NORMAL" | "MOUNJARO";
export const funnelContentRevision = "2026-09-review-1";
export interface FunnelAttribution {
  readonly funnel: FunnelId;
  readonly variant: "a" | "b";
  readonly experimentId: string;
  readonly mode: "qa" | "randomized" | "control";
  readonly sessionId: string;
  readonly revision: string;
  readonly expiresAt: number;
  readonly utm: Readonly<Record<string, string>>;
}
const activeKey = "belvitale.funnel.active.v1";
const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
let memory: FunnelAttribution | null = null;
let ingestedUrl = "";
const safe = (value: string | null): value is string => value !== null && value.length <= 100 && /^[a-zA-Z0-9._~-]+$/.test(value);

function valid(value: unknown): value is FunnelAttribution {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<FunnelAttribution>;
  return (item.funnel === "NORMAL" || item.funnel === "MOUNJARO") && (item.variant === "a" || item.variant === "b") &&
    ["qa", "randomized", "control"].includes(item.mode ?? "") && safe(item.sessionId ?? null) && safe(item.experimentId ?? null) &&
    safe(item.revision ?? null) && typeof item.expiresAt === "number" && item.expiresAt > Date.now() &&
    typeof item.utm === "object" && (item.utm as unknown) !== null && !Array.isArray(item.utm);
}

export function readFunnelAttribution(): FunnelAttribution | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  // Explicit route context wins over another tab's last visited funnel.
  const signature = window.location.pathname + window.location.search;
  if (params.has("bv_funnel") && signature !== ingestedUrl && !/^\/quiz(?:-monj)?(?:\/|$)/.test(window.location.pathname)) {
    ingestedUrl = signature;
    const candidate = {
      funnel: params.get("bv_funnel"), variant: params.get("bv_variant"), experimentId: params.get("bv_experiment"),
      mode: params.get("bv_mode"), sessionId: params.get("bv_session"), revision: params.get("bv_revision"),
      expiresAt: Number(params.get("bv_expires")), utm: Object.fromEntries(utmKeys.flatMap(k => { const value = params.get(k); return safe(value) ? [[k, value]] : []; })),
    };
    if (valid(candidate)) { memory = candidate; try { sessionStorage.setItem(activeKey, JSON.stringify(candidate)); } catch { /* memory fallback */ } return candidate; }
  }
  try { const value: unknown = JSON.parse(sessionStorage.getItem(activeKey) ?? "null"); if (valid(value)) return value; } catch { /* memory fallback */ }
  return valid(memory) ? memory : null;
}

export function rememberFunnelAttribution(input: Omit<FunnelAttribution, "revision" | "expiresAt" | "utm">): FunnelAttribution {
  const previous = readFunnelAttribution();
  const params = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
  const utm = Object.fromEntries(utmKeys.flatMap(k => { const value = params.get(k); return safe(value) ? [[k, value]] : []; }));
  const sameSession = previous?.funnel === input.funnel && previous.sessionId === input.sessionId;
  const value: FunnelAttribution = { ...input, revision: funnelContentRevision, expiresAt: sameSession ? previous.expiresAt : Date.now() + 86400000, utm: { ...(sameSession ? previous.utm : {}), ...utm } };
  memory = value;
  try { sessionStorage.setItem(activeKey, JSON.stringify(value)); } catch { /* memory fallback */ }
  return value;
}

export function funnelEventProperties(context = readFunnelAttribution()) {
  return context === null ? {} : { funnelId: context.funnel, experienceId: `${context.funnel}_${context.variant.toUpperCase()}`, experimentId: context.experimentId, experimentMode: context.mode, funnelSessionId: context.sessionId, contentRevision: context.revision };
}

export function withFunnelAttribution(href: string, checkout = false): string {
  if (typeof window === "undefined") return href;
  const context = readFunnelAttribution();
  if (context === null) return href;
  const url = new URL(href, window.location.origin);
  for (const key of utmKeys) { const value = context.utm[key] ?? null; if (safe(value) && !url.searchParams.has(key)) url.searchParams.set(key, value); }
  const fields = { funnel: context.funnel, variant: context.variant, experiment: context.experimentId, mode: context.mode, session: context.sessionId, revision: context.revision, expires: String(context.expiresAt) };
  for (const [key, value] of Object.entries(fields)) url.searchParams.set(checkout ? `metadata[bv_${key}]` : `bv_${key}`, value);
  if (checkout) url.searchParams.set("metadata[experience_id]", `${context.funnel}_${context.variant.toUpperCase()}`);
  return url.origin === window.location.origin ? `${url.pathname}${url.search}${url.hash}` : url.toString();
}

export function quizEntryHref(route: "/quiz" | "/quiz-monj"): string {
  if (typeof window === "undefined") return route;
  const current = new URLSearchParams(window.location.search);
  const query = new URLSearchParams();
  const stored = readFunnelAttribution()?.utm ?? {};
  for (const key of utmKeys) {
    const value = current.get(key) ?? stored[key] ?? null;
    if (safe(value)) query.set(key, value);
  }
  return query.size === 0 ? route : `${route}?${query}`;
}
