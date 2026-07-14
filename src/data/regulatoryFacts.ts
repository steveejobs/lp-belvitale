export type RegulatoryStatus = "confirmed" | "pending" | "blocked";

export interface RegulatoryFacts {
  readonly sanitaryStatus: RegulatoryStatus;
  readonly source: "manufacturer-documentation";
  readonly reviewedAt: string;
  readonly note: string;
}

/**
 * Este arquivo é um gate factual, não uma configuração de ambiente.
 * Variáveis de build nunca podem converter um status pendente em confirmado.
 */
export const regulatoryFacts: RegulatoryFacts = {
  sanitaryStatus: "pending",
  source: "manufacturer-documentation",
  reviewedAt: "2026-07-14",
  note: "A situação sanitária do produto ainda não foi documentalmente confirmada.",
};

export function canPublishRegulatedExperience(
  facts: RegulatoryFacts,
): boolean {
  return facts.sanitaryStatus === "confirmed";
}

export const regulatoryPublicationReady =
  canPublishRegulatedExperience(regulatoryFacts);
