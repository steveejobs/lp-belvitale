import {
  quizPlanIds,
  quizProfileIds,
  quizQuestionIds,
  quizVersion,
  type QuizPlanId,
  type QuizProfileId,
  type QuizQuestionId,
} from "../domain/quiz.types";

export const quizEventNames = [
  "quiz_started",
  "quiz_question_viewed",
  "quiz_question_answered",
  "quiz_insight_viewed",
  "quiz_completed",
  "quiz_profile_viewed",
  "quiz_offer_recommended",
  "quiz_offer_changed",
  "quiz_checkout_clicked",
  "quiz_restarted",
] as const;

export type QuizEventName = (typeof quizEventNames)[number];

export interface QuizEventPayload {
  readonly quiz_version: typeof quizVersion;
  readonly question_id?: QuizQuestionId;
  readonly step?: number;
  readonly insight_id?: "start" | "proof";
  readonly result_profile?: QuizProfileId;
  readonly recommended_plan?: QuizPlanId;
  readonly selected_plan?: QuizPlanId;
  readonly utm_source?: string;
  readonly utm_medium?: string;
  readonly utm_campaign?: string;
  readonly utm_content?: string;
  readonly utm_term?: string;
}

export type QuizEventPayloadInput = Omit<QuizEventPayload, "quiz_version">;

export interface LocalQuizEvent {
  readonly event: QuizEventName;
  readonly payload: QuizEventPayload;
}

type QuizAnalyticsAdapter = (event: LocalQuizEvent) => void;
const adapters = new Set<QuizAnalyticsAdapter>();

declare global {
  interface Window {
    __BELVITALE_ANALYTICS_CONSENT__?: boolean;
  }
}

const utmNames = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

function sanitizedAttribution(): Partial<QuizEventPayload> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    utmNames.flatMap((name) => {
      const value = params.get(name)?.trim();
      if (
        value === undefined ||
        value.length === 0 ||
        value.length > 100 ||
        value.includes("@") ||
        /(?:\+?\d[\s().-]?){8,}/.test(value) ||
        !/^[\p{L}\p{N}._~\-/ ]+$/u.test(value)
      ) {
        return [];
      }
      return [[name, value]];
    }),
  );
}

function sanitizePayload(payload: QuizEventPayloadInput): QuizEventPayload {
  const questionId = payload.question_id;
  const profile = payload.result_profile;
  const recommendation = payload.recommended_plan;
  const selected = payload.selected_plan;
  return {
    quiz_version: quizVersion,
    ...sanitizedAttribution(),
    ...(questionId !== undefined && quizQuestionIds.includes(questionId)
      ? { question_id: questionId }
      : {}),
    ...(payload.step !== undefined && Number.isInteger(payload.step) && payload.step >= 1 && payload.step <= 7
      ? { step: payload.step }
      : {}),
    ...(payload.insight_id === "start" || payload.insight_id === "proof"
      ? { insight_id: payload.insight_id }
      : {}),
    ...(profile !== undefined && quizProfileIds.includes(profile)
      ? { result_profile: profile }
      : {}),
    ...(recommendation !== undefined && quizPlanIds.includes(recommendation)
      ? { recommended_plan: recommendation }
      : {}),
    ...(selected !== undefined && quizPlanIds.includes(selected)
      ? { selected_plan: selected }
      : {}),
  };
}

export function registerQuizAnalyticsAdapter(adapter: QuizAnalyticsAdapter): () => void {
  adapters.add(adapter);
  return () => adapters.delete(adapter);
}

export function recordQuizEvent(
  event: QuizEventName,
  payload: QuizEventPayloadInput = {},
): void {
  const detail: LocalQuizEvent = { event, payload: sanitizePayload(payload) };
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<LocalQuizEvent>("belvitale:quiz", { detail }));
  if (window.__BELVITALE_ANALYTICS_CONSENT__ === true) {
    adapters.forEach((adapter) => adapter(detail));
  }
}
