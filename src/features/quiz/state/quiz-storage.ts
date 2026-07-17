import type { QuizMachineState } from "../domain/quiz.types";
import { parseQuizMachineState } from "../domain/quiz.schema";
import { createInitialQuizState } from "./quiz-machine";

export const quizStorageKey = "belvitale.quiz.v4";
export const quizStorageTtlMs = 30 * 24 * 60 * 60 * 1000;

export function loadQuizState(
  storage: Pick<Storage, "getItem" | "removeItem"> = window.localStorage,
  now = Date.now(),
): QuizMachineState {
  try {
    const serialized = storage.getItem(quizStorageKey);
    if (serialized === null) return createInitialQuizState(new Date(now).toISOString());
    const parsed = parseQuizMachineState(JSON.parse(serialized) as unknown);
    if (parsed === null || now - Date.parse(parsed.updatedAt) > quizStorageTtlMs) {
      storage.removeItem(quizStorageKey);
      return createInitialQuizState(new Date(now).toISOString());
    }
    return parsed;
  } catch {
    storage.removeItem(quizStorageKey);
    return createInitialQuizState(new Date(now).toISOString());
  }
}

export function saveQuizState(
  state: QuizMachineState,
  storage: Pick<Storage, "setItem"> = window.localStorage,
): void {
  try {
    storage.setItem(quizStorageKey, JSON.stringify(state));
  } catch {
    // The experience remains functional when storage is unavailable.
  }
}

export function clearQuizState(
  storage: Pick<Storage, "removeItem"> = window.localStorage,
): void {
  try {
    storage.removeItem(quizStorageKey);
  } catch {
    // Nothing else is required when storage is unavailable.
  }
}
