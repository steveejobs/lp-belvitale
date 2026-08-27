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
    badge: "Para começar menor",
    summary: "Um frasco para quem ainda precisa sentir segurança antes de organizar uma continuidade.",
    replenishment: "Você volta a decidir em aproximadamente 30 dias.",
    cta: "Começar com 1 frasco",
  },
  "three-months": {
    id: "three-months",
    title: "90 dias",
    badge: "Mais coerente com seu resultado",
    summary: "Três frascos organizam aproximadamente 90 dias para você não transformar o próximo mês em mais um ponto de desistência.",
    replenishment: "90 dias organizados, sem uma nova compra no meio do caminho.",
    cta: "Quero construir 90 dias",
  },
  "seven-months": {
    id: "seven-months",
    title: "210 dias",
    badge: "5 + 2 grátis",
    summary: "Sete frascos para quem já decidiu proteger a continuidade por mais tempo e reduzir reposições.",
    replenishment: "Aproximadamente 210 dias com 5 frascos + 2 adicionais.",
    cta: "Garantir 5 + 2 frascos",
  },
};
