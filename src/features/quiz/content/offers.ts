import type { OfferId } from "../domain/quiz.types";

export interface OfferContent {
  readonly id: OfferId;
  readonly title: string;
  readonly badge: string;
  readonly summary: string;
  readonly replenishment: string;
  readonly cta: string;
}

export const quizOfferOrder = ["one-month", "three-months", "seven-months"] as const satisfies readonly OfferId[];

export const quizOffers: Readonly<Record<OfferId, OfferContent>> = {
  "one-month": {
    id: "one-month",
    title: "30 dias",
    badge: "Conhecer primeiro",
    summary: "Um frasco para conhecer antes de organizar continuidade.",
    replenishment: "Nova decisão em aproximadamente 30 dias.",
    cta: "Escolher 30 dias",
  },
  "three-months": {
    id: "three-months",
    title: "90 dias",
    badge: "Sua opção principal",
    summary: "Três frascos organizam aproximadamente 90 dias e evitam que você precise decidir novamente no próximo mês.",
    replenishment: "Continuidade moderada com menos reposições.",
    cta: "Escolher 90 dias",
  },
  "seven-months": {
    id: "seven-months",
    title: "210 dias",
    badge: "Estoque prolongado",
    summary: "Sete frascos para organizar um estoque prolongado e reduzir reposições.",
    replenishment: "Poucas reposições por mais tempo.",
    cta: "Escolher 210 dias",
  },
};
