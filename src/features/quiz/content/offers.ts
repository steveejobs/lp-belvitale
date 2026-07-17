import type {
  QuizOfferContent,
  QuizPlanId,
} from "../domain/quiz.types";

export const quizOffers: Readonly<Record<QuizPlanId, QuizOfferContent>> = {
  "30-days": {
    id: "30-days",
    title: "1 frasco",
    durationLabel: "aproximadamente 30 dias",
    bottles: 1,
    paidBottles: 1,
    additionalBottles: 0,
    totalCapsules: 60,
    checkoutUrl: "https://belvitale.pay.yampi.com.br/r/PWJOI4I112",
    imageAlt: "Composição com um frasco real do CeluClin.",
    bestFor: "Conhecer o produto antes de organizar continuidade.",
    priceStatus: "blocked",
    checkoutStatus: "verified",
  },
  "90-days": {
    id: "90-days",
    title: "3 frascos",
    durationLabel: "aproximadamente 90 dias",
    bottles: 3,
    paidBottles: 3,
    additionalBottles: 0,
    totalCapsules: 180,
    checkoutUrl: "https://belvitale.pay.yampi.com.br/r/1E8NNCGJW9",
    imageAlt: "Composição com três frascos reais do CeluClin.",
    bestFor: "Continuidade moderada com menos decisões de reposição.",
    priceStatus: "blocked",
    checkoutStatus: "verified",
  },
  "210-days": {
    id: "210-days",
    title: "5 + 2 frascos",
    durationLabel: "aproximadamente 210 dias",
    bottles: 7,
    paidBottles: 5,
    additionalBottles: 2,
    totalCapsules: 420,
    checkoutUrl: "https://belvitale.pay.yampi.com.br/r/41CHX4MGPX",
    imageAlt: "Composição com sete frascos reais do CeluClin.",
    bestFor: "Estoque prolongado, poucas reposições e compromisso declarado de longo prazo.",
    priceStatus: "blocked",
    checkoutStatus: "verified",
  },
};

export const quizOfferOrder: readonly QuizPlanId[] = [
  "30-days",
  "90-days",
  "210-days",
];

export const commercialTransparency = {
  product:
    "CeluClin é um suplemento alimentar em cápsulas. Cada frasco contém 60 cápsulas; o modo de uso documentado no rótulo é de 2 cápsulas ao dia.",
  duration:
    "As durações são aproximações de estoque pelo modo de uso do rótulo. Uma opção maior não representa maior eficácia nem tempo necessário para resultado.",
  price:
    "Preço não exibido: o valor total apareceu nos checkouts oficiais, mas o parcelamento não pôde ser verificado na auditoria. Confira as condições atuais no checkout antes de comprar.",
  checkout:
    "O botão abre o checkout oficial da Belvitale. Nenhuma compra acontece neste clique.",
} as const;
