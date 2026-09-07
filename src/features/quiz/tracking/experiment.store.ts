import { quizExperimentId, type QuizExperimentVariant } from "../experiment/quiz.experiment";
import type { QuizAnalyticsEvent, QuizTrackedEvent } from "./analytics.types";

export const experimentMetricsStorageKey = "belvitale.quiz.ab.metrics.v1";
const maximumObservations = 5_000;

export interface ExperimentObservation {
  readonly experimentId: typeof quizExperimentId;
  readonly event: QuizAnalyticsEvent;
  readonly variant: QuizExperimentVariant;
  readonly sessionId: string;
  readonly deviceClass: "mobile" | "desktop";
  readonly occurredAt: string;
}

export const experimentFunnel = [
  { event: "quiz_opened", label: "Abriu o quiz" },
  { event: "quiz_started", label: "Começou" },
  { event: "quiz_insight_viewed", label: "Viu um insight" },
  { event: "quiz_completed", label: "Concluiu" },
  { event: "quiz_offer_recommended", label: "Viu a oferta" },
  { event: "quiz_checkout_clicked", label: "Clicou para comprar" },
] as const satisfies readonly Readonly<{ event: QuizAnalyticsEvent; label: string }>[];

function isObservation(value: unknown): value is ExperimentObservation {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<ExperimentObservation>;
  return item.experimentId === quizExperimentId &&
    experimentFunnel.some((step) => step.event === item.event) &&
    (item.variant === "a" || item.variant === "b") &&
    typeof item.sessionId === "string" && item.sessionId.length > 0 && item.sessionId.length < 100 &&
    (item.deviceClass === "mobile" || item.deviceClass === "desktop") &&
    typeof item.occurredAt === "string";
}

export function readExperimentObservations(storage: Storage = localStorage): readonly ExperimentObservation[] {
  try {
    const raw = storage.getItem(experimentMetricsStorageKey);
    const parsed: unknown = raw === null ? [] : JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isObservation) : [];
  } catch {
    return [];
  }
}

export function recordLocalExperimentEvent(event: QuizTrackedEvent, storage: Storage = localStorage): void {
  if (!experimentFunnel.some((step) => step.event === event.event)) return;
  // Links ?ab=a e ?ab=b existem somente para QA visual. Eles nunca entram na
  // amostra, evitando contaminar o experimento com visitas da própria equipe.
  if (new URLSearchParams(window.location.search).has("ab")) return;
  const variant = event.properties.experimentVariant;
  if (variant !== "a" && variant !== "b") return;
  const observation: ExperimentObservation = {
    experimentId: quizExperimentId,
    event: event.event,
    variant,
    sessionId: event.properties.sessionId,
    deviceClass: event.properties.deviceClass,
    occurredAt: event.occurredAt,
  };
  try {
    const previous = readExperimentObservations(storage);
    const duplicate = previous.some((item) =>
      item.sessionId === observation.sessionId &&
      item.variant === observation.variant &&
      item.event === observation.event,
    );
    if (duplicate) return;
    storage.setItem(experimentMetricsStorageKey, JSON.stringify([...previous, observation].slice(-maximumObservations)));
    window.dispatchEvent(new CustomEvent("belvitale:ab-data"));
  } catch { /* analytics local nunca bloqueia o quiz */ }
}

export function clearExperimentObservations(storage: Storage = localStorage): void {
  try {
    storage.removeItem(experimentMetricsStorageKey);
    window.dispatchEvent(new CustomEvent("belvitale:ab-data"));
  } catch { /* armazenamento indisponível */ }
}

export function seedExperimentObservations(storage: Storage = localStorage, sessionsPerVariant = 120): void {
  const observations: ExperimentObservation[] = [];
  const now = Date.now();
  const rates: Readonly<Record<QuizExperimentVariant, readonly number[]>> = {
    a: [1, 0.78, 0.58, 0.43, 0.37, 0.12],
    b: [1, 0.84, 0.66, 0.52, 0.46, 0.22],
  };
  for (const variant of ["a", "b"] as const) {
    for (let index = 0; index < sessionsPerVariant; index += 1) {
      for (const [stepIndex, step] of experimentFunnel.entries()) {
        if (index / sessionsPerVariant >= (rates[variant][stepIndex] ?? 0)) continue;
        observations.push({
          experimentId: quizExperimentId,
          event: step.event,
          variant,
          sessionId: `demo-${variant}-${String(index + 1)}`,
          deviceClass: index % 3 === 0 ? "desktop" : "mobile",
          occurredAt: new Date(now - (sessionsPerVariant - index) * 60_000).toISOString(),
        });
      }
    }
  }
  try {
    storage.setItem(experimentMetricsStorageKey, JSON.stringify(observations));
    window.dispatchEvent(new CustomEvent("belvitale:ab-data"));
  } catch { /* armazenamento indisponível */ }
}

export interface VariantReport {
  readonly variant: QuizExperimentVariant;
  readonly counts: Readonly<Record<(typeof experimentFunnel)[number]["event"], number>>;
  readonly checkoutRate: number;
}

export function buildExperimentReport(observations: readonly ExperimentObservation[]): readonly [VariantReport, VariantReport] {
  const build = (variant: QuizExperimentVariant): VariantReport => {
    const variantItems = observations.filter((item) => item.variant === variant);
    const counts = Object.fromEntries(experimentFunnel.map((step) => [
      step.event,
      new Set(variantItems.filter((item) => item.event === step.event).map((item) => item.sessionId)).size,
    ])) as VariantReport["counts"];
    const opened = counts.quiz_opened;
    return { variant, counts, checkoutRate: opened === 0 ? 0 : counts.quiz_checkout_clicked / opened };
  };
  return [build("a"), build("b")];
}
