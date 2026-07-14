import {
  canPublishOffer,
  commercialOffers,
  type CommercialOffer,
} from "../data/commercialOffers";
import {
  getApprovedQuizOfferId,
  type QuizOfferMapping,
} from "../data/quizPublication";
import type { QuizProfile } from "../data/quizProfiles";
import { regulatoryPublicationReady } from "../data/regulatoryFacts";

export interface QuizCommercialRecommendation {
  readonly offer: CommercialOffer;
  readonly disclosure: "Próximo passo comercial";
  readonly rationale: string;
}

const convenienceCopy: Readonly<Record<CommercialOffer["id"], string>> = {
  "one-month":
    "Pelo seu jeito de começar, a opção de 30 dias pode deixar a primeira decisão mais simples.",
  "three-months":
    "Pelo seu jeito de organizar hábitos, a opção de 90 dias pode reduzir reposições e combinar com uma rotina planejada.",
  "seven-months":
    "Pelo seu jeito de proteger rotinas já organizadas, a opção de 210 dias pode reduzir reposições frequentes.",
};

export function resolveQuizRecommendation(
  profile: QuizProfile,
  mappings?: readonly QuizOfferMapping[],
  offers: readonly CommercialOffer[] = commercialOffers,
): QuizCommercialRecommendation | null {
  if (!regulatoryPublicationReady) return null;

  const offerId =
    mappings === undefined
      ? getApprovedQuizOfferId(profile)
      : (mappings.find(
          (mapping) =>
            mapping.profile === profile &&
            mapping.status === "approved" &&
            mapping.offerId !== undefined,
        )?.offerId ?? null);
  if (offerId === null) return null;

  const offer = offers.find((candidate) => candidate.id === offerId);
  if (offer === undefined || !canPublishOffer(offer)) return null;

  return {
    offer,
    disclosure: "Próximo passo comercial",
    rationale: convenienceCopy[offer.id],
  };
}
