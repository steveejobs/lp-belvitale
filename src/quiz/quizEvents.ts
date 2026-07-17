import { getQuizQuestion, quizTotalSteps } from "../data/quizQuestions";
import { isQuizProfile, type QuizProfile } from "../data/quizProfiles";
import {
  getStableQuizExperiment,
  type QuizExperimentVariant,
} from "./quizExperiment";
import { isQuizPlan, type QuizPlan } from "./quizRecommendation";

export const quizVersion = "3.0.0";

export type QuizEvent =
  | "quiz_view"
  | "quiz_start"
  | "quiz_question_view"
  | "quiz_answer"
  | "quiz_checkpoint_view"
  | "quiz_back"
  | "quiz_abandon"
  | "quiz_complete"
  | "quiz_result_view"
  | "quiz_recommendation_view"
  | "quiz_all_options_view"
  | "quiz_checkout_click"
  | "quiz_formula_click"
  | "quiz_label_click"
  | "quiz_restart";

export interface QuizEventPayload {
  readonly quiz_version: typeof quizVersion;
  readonly experiment_variant: QuizExperimentVariant;
  readonly question_id?: string;
  readonly answer_id?: string;
  readonly step?: number;
  readonly result_profile?: QuizProfile;
  readonly recommended_plan?: QuizPlan;
  readonly utm_source?: string;
  readonly utm_medium?: string;
  readonly utm_campaign?: string;
  readonly utm_content?: string;
  readonly utm_term?: string;
}

export type QuizEventPayloadInput = Partial<
  Pick<
    QuizEventPayload,
    | "question_id"
    | "answer_id"
    | "step"
    | "result_profile"
    | "recommended_plan"
  >
>;

export interface LocalQuizEvent {
  readonly event: QuizEvent;
  readonly payload: QuizEventPayload;
}

type QuizEventListener = (event: LocalQuizEvent) => void;
type QuizAnalyticsAdapter = (event: LocalQuizEvent) => void;

const listeners = new Set<QuizEventListener>();
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

function sanitizeUtmValue(value: string | null): string | undefined {
  if (value === null) return undefined;
  const trimmed = value.trim();
  if (
    trimmed.length === 0 ||
    trimmed.length > 100 ||
    trimmed.includes("@") ||
    /(?:\+?\d[\s().-]?){8,}/.test(trimmed) ||
    !/^[\p{L}\p{N}._~\-/ ]+$/u.test(trimmed)
  ) {
    return undefined;
  }
  return trimmed;
}

export function getQuizAttribution(
  currentSearch = typeof window === "undefined" ? "" : window.location.search,
): Partial<QuizEventPayload> {
  const params = new URLSearchParams(currentSearch);
  return Object.fromEntries(
    utmNames.flatMap((name) => {
      const value = sanitizeUtmValue(params.get(name));
      return value === undefined ? [] : [[name, value]];
    }),
  );
}

function sanitizePayload(
  payload: QuizEventPayloadInput,
): QuizEventPayload {
  const experiment = getStableQuizExperiment();
  const question =
    typeof payload.question_id === "string"
      ? getQuizQuestion(payload.question_id)
      : null;
  const answerValid =
    question !== null &&
    typeof payload.answer_id === "string" &&
    question.options.some((option) => option.id === payload.answer_id);

  return {
    quiz_version: quizVersion,
    experiment_variant: experiment.id,
    ...getQuizAttribution(),
    ...(question === null ? {} : { question_id: question.id }),
    ...(answerValid ? { answer_id: payload.answer_id } : {}),
    ...(typeof payload.step === "number" &&
    Number.isInteger(payload.step) &&
    payload.step >= 1 &&
    payload.step <= quizTotalSteps
      ? { step: payload.step }
      : {}),
    ...(isQuizProfile(payload.result_profile)
      ? { result_profile: payload.result_profile }
      : {}),
    ...(isQuizPlan(payload.recommended_plan)
      ? { recommended_plan: payload.recommended_plan }
      : {}),
  };
}

export function subscribeToQuizEvents(
  listener: QuizEventListener,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function registerQuizAnalyticsAdapter(
  adapter: QuizAnalyticsAdapter,
): () => void {
  adapters.add(adapter);
  return () => adapters.delete(adapter);
}

export function recordQuizEvent(
  event: QuizEvent,
  payload: QuizEventPayloadInput = {},
): void {
  const localEvent: LocalQuizEvent = {
    event,
    payload: sanitizePayload(payload),
  };
  listeners.forEach((listener) => listener(localEvent));

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<LocalQuizEvent>("belvitale:quiz", {
        detail: localEvent,
      }),
    );
    if (window.__BELVITALE_ANALYTICS_CONSENT__ === true) {
      adapters.forEach((adapter) => adapter(localEvent));
    }
  }
}
