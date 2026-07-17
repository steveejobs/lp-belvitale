export type QuizPublicationStatus = "development" | "approved" | "blocked";

export type QuizAccessMode = "interactive" | "unavailable";

export function getQuizAccessMode(
  status: QuizPublicationStatus,
  isDevelopment: boolean,
  internalFlag: boolean,
): QuizAccessMode {
  return status === "approved" || isDevelopment || internalFlag
    ? "interactive"
    : "unavailable";
}

export function resolveQuizPublicationStatus(
  publicationValue: string | undefined,
  isDevelopment: boolean,
): QuizPublicationStatus {
  if (publicationValue === "approved") return "approved";
  return isDevelopment ? "development" : "blocked";
}
