import { isValidQuizOption, quizQuestions } from "../data/quizQuestions";
import { isQuizProfile, type QuizProfile } from "../data/quizProfiles";
import {
  calculateQuizProfile,
  hasCompleteQuizAnswers,
  type QuizAnswer,
} from "./quizScoring";

export const quizStorageKey = "belvitale:quiz:v1";
export const quizStorageVersion = 2;
export const quizStorageMaxAgeMs = 30 * 24 * 60 * 60 * 1000;

export interface QuizStoredState {
  readonly answers: readonly QuizAnswer[];
  readonly currentStep: number;
  readonly profile?: QuizProfile;
  readonly completedAt?: string;
}

interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type QuizStorageParseStatus =
  | "empty"
  | "valid"
  | "migrated"
  | "expired"
  | "invalid";

export interface QuizStorageParseResult {
  readonly state: QuizStoredState;
  readonly status: QuizStorageParseStatus;
}

const currentDocumentKeys = new Set([
  "version",
  "savedAt",
  "answers",
  "currentStep",
  "profile",
  "completedAt",
]);
const legacyDocumentKeys = new Set([
  "version",
  "answers",
  "currentStep",
  "profile",
  "completedAt",
]);

export function createInitialQuizState(): QuizStoredState {
  return { answers: [], currentStep: -1 };
}

function getBrowserStorage(): StorageAdapter | null {
  try {
    return typeof globalThis.localStorage === "undefined"
      ? null
      : globalThis.localStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  allowedKeys: ReadonlySet<string>,
): boolean {
  return Object.keys(value).every((key) => allowedKeys.has(key));
}

function parseAnswers(value: unknown): readonly QuizAnswer[] | null {
  if (!Array.isArray(value)) return null;

  const answers = new Map<string, QuizAnswer>();
  for (const candidate of value) {
    if (
      !isRecord(candidate) ||
      !hasOnlyKeys(candidate, new Set(["questionId", "optionId"])) ||
      typeof candidate.questionId !== "string" ||
      typeof candidate.optionId !== "string" ||
      !isValidQuizOption(candidate.questionId, candidate.optionId) ||
      answers.has(candidate.questionId)
    ) {
      return null;
    }
    answers.set(candidate.questionId, {
      questionId: candidate.questionId,
      optionId: candidate.optionId,
    });
  }

  return quizQuestions.flatMap((question) => {
    const answer = answers.get(question.id);
    return answer === undefined ? [] : [answer];
  });
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function parseStateFields(
  value: Record<string, unknown>,
): QuizStoredState | null {
  const answers = parseAnswers(value.answers);
  if (answers === null) return null;

  const rawStep = value.currentStep;
  if (
    typeof rawStep !== "number" ||
    !Number.isInteger(rawStep) ||
    rawStep < -1 ||
    rawStep > quizQuestions.length
  ) {
    return null;
  }

  const hasProfile = value.profile !== undefined;
  const hasCompletedAt = value.completedAt !== undefined;
  const complete = hasCompleteQuizAnswers(answers);

  if (rawStep === quizQuestions.length) {
    if (
      !complete ||
      !isQuizProfile(value.profile) ||
      !isIsoDate(value.completedAt) ||
      calculateQuizProfile(answers) !== value.profile
    ) {
      return null;
    }

    return {
      answers,
      currentStep: rawStep,
      profile: value.profile,
      completedAt: value.completedAt,
    };
  }

  if (hasProfile || hasCompletedAt) return null;
  return { answers, currentStep: rawStep };
}

export function inspectQuizStoredState(
  value: string | null,
  now: Date = new Date(),
): QuizStorageParseResult {
  if (value === null) {
    return { state: createInitialQuizState(), status: "empty" };
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed)) {
      return { state: createInitialQuizState(), status: "invalid" };
    }

    const version = parsed.version;
    if (version === quizStorageVersion) {
      if (
        !hasOnlyKeys(parsed, currentDocumentKeys) ||
        !isIsoDate(parsed.savedAt)
      ) {
        return { state: createInitialQuizState(), status: "invalid" };
      }

      const savedAt = Date.parse(parsed.savedAt);
      if (now.getTime() - savedAt > quizStorageMaxAgeMs) {
        return { state: createInitialQuizState(), status: "expired" };
      }

      const state = parseStateFields(parsed);
      return state === null
        ? { state: createInitialQuizState(), status: "invalid" }
        : { state, status: "valid" };
    }

    if (
      version !== undefined &&
      version !== 1
    ) {
      return { state: createInitialQuizState(), status: "invalid" };
    }

    if (!hasOnlyKeys(parsed, legacyDocumentKeys)) {
      return { state: createInitialQuizState(), status: "invalid" };
    }

    const state = parseStateFields(parsed);
    return state === null
      ? { state: createInitialQuizState(), status: "invalid" }
      : { state, status: "migrated" };
  } catch {
    return { state: createInitialQuizState(), status: "invalid" };
  }
}

export function parseQuizState(
  value: string | null,
  now: Date = new Date(),
): QuizStoredState {
  return inspectQuizStoredState(value, now).state;
}

export function loadQuizState(
  storage: StorageAdapter | null = getBrowserStorage(),
  now: Date = new Date(),
): QuizStoredState {
  if (storage === null) return createInitialQuizState();

  try {
    const result = inspectQuizStoredState(storage.getItem(quizStorageKey), now);
    if (result.status === "invalid" || result.status === "expired") {
      storage.removeItem(quizStorageKey);
      return createInitialQuizState();
    }
    if (result.status === "migrated") {
      saveQuizState(result.state, storage, now);
    }
    return result.state;
  } catch {
    try {
      storage.removeItem(quizStorageKey);
    } catch {
      // O armazenamento indisponível não cria qualquer fallback externo.
    }
    return createInitialQuizState();
  }
}

export function saveQuizState(
  state: QuizStoredState,
  storage: StorageAdapter | null = getBrowserStorage(),
  now: Date = new Date(),
): void {
  if (storage === null) return;

  const persisted = {
    version: quizStorageVersion,
    savedAt: now.toISOString(),
    answers: state.answers.map(({ questionId, optionId }) => ({
      questionId,
      optionId,
    })),
    currentStep: state.currentStep,
    ...(state.profile === undefined ? {} : { profile: state.profile }),
    ...(state.completedAt === undefined
      ? {}
      : { completedAt: state.completedAt }),
  };

  try {
    storage.setItem(quizStorageKey, JSON.stringify(persisted));
  } catch {
    // A interface continua funcional quando o armazenamento está indisponível.
  }
}

export function clearQuizState(
  storage: StorageAdapter | null = getBrowserStorage(),
): void {
  if (storage === null) return;
  try {
    storage.removeItem(quizStorageKey);
  } catch {
    // Não há dado alternativo ou envio externo como fallback.
  }
}
