import { parseQuizSession } from "../domain/quiz.schema";
import { QUIZ_VERSION, type QuizSessionState } from "../domain/quiz.types";

export const quizStorageKey = "belvitale.quiz.v7";
export const quizSessionDurationMs = 24 * 60 * 60 * 1000;

function sessionId(): string {
  try { return crypto.randomUUID(); } catch { return "quiz-" + Date.now().toString(36); }
}

export function createQuizSession(now = new Date()): QuizSessionState {
  return {
    version: QUIZ_VERSION,
    sessionId: sessionId(),
    stageId: "opening",
    visitedStageIds: ["opening"],
    answers: {},
    firstName: "",
    nameProvided: false,
    savedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + quizSessionDurationMs).toISOString(),
  };
}

export function loadQuizSession(storage: Storage = localStorage, now = new Date()): QuizSessionState {
  try {
    const raw = storage.getItem(quizStorageKey);
    const parsed = parseQuizSession(raw === null ? null : JSON.parse(raw), now.getTime());
    if (parsed !== null) return parsed;
    storage.removeItem(quizStorageKey);
  } catch {
    try { storage.removeItem(quizStorageKey); } catch { /* storage indisponível */ }
  }
  return createQuizSession(now);
}

export function saveQuizSession(state: QuizSessionState, storage: Storage = localStorage): void {
  try {
    storage.setItem(quizStorageKey, JSON.stringify({ ...state, savedAt: new Date().toISOString() }));
  } catch { /* a experiência continua em memória */ }
}

export function clearQuizSession(storage: Storage = localStorage): void {
  try { storage.removeItem(quizStorageKey); } catch { /* storage indisponível */ }
}
