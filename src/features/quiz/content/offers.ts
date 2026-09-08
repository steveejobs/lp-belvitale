import type { OfferId } from "../domain/quiz.types";

export interface OfferContent {
  readonly id: OfferId;
  readonly title: string;
  readonly badge: string;
  readonly summary: string;
  readonly replenishment: string;
  readonly cta: string;
}

// O kit de 210 dias permanece configurado para auditoria, mas não é publicado
// enquanto seu preço por frasco for superior ao do kit de 90 dias.
export const quizOfferOrder = ["one-month", "three-months"] as const satisfies readonly OfferId[];

export const quizOffers: Readonly<Record<OfferId, OfferContent>> = {
  "one-month": {
    id: "one-month",
    title: "30 dias",
    badge: "Para começar menor",
    summary: "Um frasco para quem ainda precisa sentir segurança antes de organizar uma continuidade.",
    replenishment: "Você volta a decidir em aproximadamente 30 dias.",
    cta: "Comprar 1 frasco",
  },
  "three-months": {
    id: "three-months",
    title: "90 dias",
    badge: "Para planejar a reposição",
    summary: "Três frascos para aproximadamente 90 dias de uso conforme o rótulo. Compare o investimento total com a opção de um frasco.",
    replenishment: "90 dias organizados, sem uma nova compra no meio do caminho.",
    cta: "Comprar 3 frascos",
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
