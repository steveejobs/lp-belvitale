import { isQuizProfile, type QuizProfile } from "../data/quizProfiles";

export type QuizEvent =
  | "quiz_view"
  | "quiz_start"
  | "quiz_step_complete"
  | "quiz_complete"
  | "quiz_restart"
  | "quiz_composition_click";

export interface QuizEventPayload {
  readonly step?: number;
  readonly profile?: QuizProfile;
  readonly source: "quiz";
}

export interface LocalQuizEvent {
  readonly event: QuizEvent;
  readonly payload: QuizEventPayload;
}

type QuizEventListener = (event: LocalQuizEvent) => void;

const listeners = new Set<QuizEventListener>();

export function subscribeToQuizEvents(
  listener: QuizEventListener,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function sanitizePayload(payload: QuizEventPayload): QuizEventPayload {
  return {
    source: "quiz",
    ...(typeof payload.step === "number" &&
    Number.isInteger(payload.step) &&
    payload.step >= 1 &&
    payload.step <= 6
      ? { step: payload.step }
      : {}),
    ...(isQuizProfile(payload.profile) ? { profile: payload.profile } : {}),
  };
}

export function recordQuizEvent(
  event: QuizEvent,
  payload: QuizEventPayload,
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
  }
}
