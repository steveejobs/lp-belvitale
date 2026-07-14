import type { CommercialOffer } from "./commercialOffers";
import type { QuizProfile } from "./quizProfiles";

export type QuizPublicationStatus = "development" | "approved" | "blocked";

export interface QuizOfferMapping {
  readonly profile: QuizProfile;
  readonly offerId?: CommercialOffer["id"];
  readonly status: "pending" | "approved" | "blocked";
}

export type QuizAccessMode = "interactive" | "unavailable";

export const quizOfferMappings: readonly QuizOfferMapping[] = [
  { profile: "simple-start", status: "pending" },
  { profile: "gradual-consistency", status: "pending" },
  { profile: "conscious-continuity", status: "pending" },
] as const;

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

export function getApprovedQuizOfferId(
  profile: QuizProfile,
): CommercialOffer["id"] | null {
  const mapping = quizOfferMappings.find((item) => item.profile === profile);
  return mapping?.status === "approved" && mapping.offerId !== undefined
    ? mapping.offerId
    : null;
}
