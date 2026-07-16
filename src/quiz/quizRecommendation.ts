import {
  commercialOffers,
  isValidCheckoutUrl,
  type CommercialOffer,
} from "../data/commercialOffers";
import {
  commercialPreviewReady,
  getCheckoutUrlWithUtms,
} from "../data/commercialPreview";
import {
  getApprovedQuizOfferId,
  type QuizOfferMapping,
} from "../data/quizPublication";
import type { QuizProfile } from "../data/quizProfiles";
import { quizPreviewEnabled } from "../data/quizPublicationConfig";
import { regulatoryPublicationReady } from "../data/regulatoryFacts";

export interface QuizCommercialRecommendation {
  readonly offer: CommercialOffer;
  readonly disclosure: "Opção sugerida para o seu ritmo";
  readonly checkoutUrl: string;
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
  const previewReady = quizPreviewEnabled && commercialPreviewReady;
  if (!regulatoryPublicationReady && !previewReady) return null;

  const offerId =
    mappings === undefined
      ? previewReady
        ? previewOfferIds[profile]
        : getApprovedQuizOfferId(profile)
      : (mappings.find(
          (mapping) =>
            mapping.profile === profile &&
            mapping.status === "approved" &&
            mapping.offerId !== undefined,
        )?.offerId ?? null);
  if (offerId === null) return null;

  const offer = offers.find((candidate) => candidate.id === offerId);
  if (
    offer === undefined ||
    !isValidCheckoutUrl(offer.checkoutUrl) ||
    offer.checkoutStatus !== "confirmed" ||
    offer.contentsStatus !== "confirmed"
  ) return null;

  return {
    offer,
    disclosure: "Opção sugerida para o seu ritmo",
    checkoutUrl: getCheckoutUrlWithUtms(offer.checkoutUrl),
    rationale: convenienceCopy[offer.id],
  };
}

const previewOfferIds: Readonly<Record<QuizProfile, CommercialOffer["id"]>> = {
  "simple-start": "one-month",
  "gradual-consistency": "three-months",
  "conscious-continuity": "seven-months",
};
