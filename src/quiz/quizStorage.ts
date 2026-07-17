import {
  getQuizQuestion,
  isValidQuizOption,
  quizTotalSteps,
  type QuizAnswer,
} from "../data/quizQuestions";
import { isQuizProfile, type QuizProfile } from "../data/quizProfiles";
import {
  getQuizQuestionPath,
  sanitizeAnswersForPath,
} from "./quizAdaptive";
import {
  calculateQuizProfile,
  hasCompleteQuizAnswers,
  isAnswerValidForCurrentPath,
} from "./quizScoring";

export const quizStorageKey = "belvitale:quiz:v1";
export const quizStorageVersion = 3;
export const quizStorageMaxAgeMs = 30 * 24 * 60 * 60 * 1000;

export interface QuizStoredState {
  readonly answers: readonly QuizAnswer[];
  readonly currentStep: number;
  readonly startedAt?: string;
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
  "startedAt",
  "profile",
  "completedAt",
]);
const legacyDocumentKeys = new Set([
  "version",
  "savedAt",
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

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function parseAnswers(value: unknown): readonly QuizAnswer[] | null {
  if (!Array.isArray(value)) return null;
  const answers: QuizAnswer[] = [];
  const seen = new Set<string>();

  for (const candidate of value) {
    if (
      !isRecord(candidate) ||
      !hasOnlyKeys(candidate, new Set(["questionId", "optionId"])) ||
      typeof candidate.questionId !== "string" ||
      typeof candidate.optionId !== "string" ||
      seen.has(candidate.questionId) ||
      !isValidQuizOption(candidate.questionId, candidate.optionId)
    ) {
      return null;
    }
    seen.add(candidate.questionId);
    answers.push({
      questionId: candidate.questionId,
      optionId: candidate.optionId,
    });
  }

  if (!isAnswerValidForCurrentPath(answers)) return null;
  return sanitizeAnswersForPath(answers);
}

function parseCurrentStateFields(
  value: Record<string, unknown>,
): QuizStoredState | null {
  const answers = parseAnswers(value.answers);
  if (answers === null) return null;

  const rawStep = value.currentStep;
  if (
    typeof rawStep !== "number" ||
    !Number.isInteger(rawStep) ||
    rawStep < -1 ||
    rawStep > quizTotalSteps
  ) {
    return null;
  }

  const startedAt = value.startedAt;
  if (startedAt !== undefined && !isIsoDate(startedAt)) return null;
  if (rawStep >= 0 && startedAt === undefined) return null;

  const hasProfile = value.profile !== undefined;
  const hasCompletedAt = value.completedAt !== undefined;
  if (rawStep === quizTotalSteps) {
    if (
      !hasCompleteQuizAnswers(answers) ||
      !isQuizProfile(value.profile) ||
      !isIsoDate(value.completedAt) ||
      calculateQuizProfile(answers) !== value.profile
    ) {
      return null;
    }
    return {
      answers,
      currentStep: rawStep,
      ...(startedAt === undefined ? {} : { startedAt }),
      profile: value.profile,
      completedAt: value.completedAt,
    };
  }

  if (hasProfile || hasCompletedAt) return null;
  return {
    answers,
    currentStep: rawStep,
    ...(startedAt === undefined ? {} : { startedAt }),
  };
}

const legacyQuestionMap: Readonly<
  Record<string, Readonly<Record<string, QuizAnswer>>>
> = {
  "how-it-begins": {
    "begin-small": { questionId: "first-move", optionId: "start-tiny-now" },
    "begin-with-time": { questionId: "first-move", optionId: "choose-a-place" },
    "begin-inside-routine": {
      questionId: "first-move",
      optionId: "prepare-the-way",
    },
  },
  "what-breaks-the-rhythm": {
    "week-changes": { questionId: "planning-dose", optionId: "few-days" },
    "replacement-late": {
      questionId: "planning-dose",
      optionId: "future-decided",
    },
    "perfect-start": {
      questionId: "planning-dose",
      optionId: "next-gesture",
    },
    "one-day-break": { questionId: "planning-dose", optionId: "few-days" },
  },
  "after-a-missed-day": {
    "resume-without-compensating": {
      questionId: "missed-day",
      optionId: "resume-usual",
    },
    "make-it-smaller": {
      questionId: "missed-day",
      optionId: "make-smaller",
    },
    "reorganize-week": {
      questionId: "missed-day",
      optionId: "reshape-days",
    },
  },
};

function migrateLegacyState(
  value: Record<string, unknown>,
  now: Date,
): QuizStoredState | null {
  if (!Array.isArray(value.answers)) return null;
  const mapped = new Map<string, QuizAnswer>();

  for (const candidate of value.answers) {
    if (
      !isRecord(candidate) ||
      !hasOnlyKeys(candidate, new Set(["questionId", "optionId"])) ||
      typeof candidate.questionId !== "string" ||
      typeof candidate.optionId !== "string"
    ) {
      return null;
    }
    const answer = legacyQuestionMap[candidate.questionId]?.[candidate.optionId];
    if (answer !== undefined) mapped.set(answer.questionId, answer);
  }

  const rawStep = value.currentStep;
  if (
    typeof rawStep !== "number" ||
    !Number.isInteger(rawStep) ||
    rawStep < -1 ||
    rawStep > 5
  ) {
    return null;
  }

  const path = getQuizQuestionPath([...mapped.values()]);
  const answers = path.flatMap((question) => {
    const answer = mapped.get(question.id);
    return answer === undefined ? [] : [answer];
  });
  const currentStep = rawStep < 0 ? -1 : rawStep <= 2 ? rawStep : 3;
  return {
    answers,
    currentStep,
    ...(currentStep < 0 ? {} : { startedAt: now.toISOString() }),
  };
}

function isExpired(value: Record<string, unknown>, now: Date): boolean {
  if (!isIsoDate(value.savedAt)) return false;
  const age = now.getTime() - Date.parse(value.savedAt);
  return age > quizStorageMaxAgeMs;
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

    if (parsed.version === quizStorageVersion) {
      if (
        !hasOnlyKeys(parsed, currentDocumentKeys) ||
        !isIsoDate(parsed.savedAt)
      ) {
        return { state: createInitialQuizState(), status: "invalid" };
      }
      if (isExpired(parsed, now)) {
        return { state: createInitialQuizState(), status: "expired" };
      }
      const state = parseCurrentStateFields(parsed);
      return state === null
        ? { state: createInitialQuizState(), status: "invalid" }
        : { state, status: "valid" };
    }

    if (
      parsed.version !== undefined &&
      parsed.version !== 1 &&
      parsed.version !== 2
    ) {
      return { state: createInitialQuizState(), status: "invalid" };
    }
    if (!hasOnlyKeys(parsed, legacyDocumentKeys)) {
      return { state: createInitialQuizState(), status: "invalid" };
    }
    if (isExpired(parsed, now)) {
      return { state: createInitialQuizState(), status: "expired" };
    }
    const migrated = migrateLegacyState(parsed, now);
    return migrated === null
      ? { state: createInitialQuizState(), status: "invalid" }
      : { state: migrated, status: "migrated" };
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
    ...(state.startedAt === undefined ? {} : { startedAt: state.startedAt }),
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

export function getStoredQuestionCount(state: QuizStoredState): number {
  return state.answers.filter(
    (answer) => getQuizQuestion(answer.questionId) !== null,
  ).length;
}
