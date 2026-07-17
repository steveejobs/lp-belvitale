import { checkoutUrls } from "../checkout/checkout.urls";
import type { QuizPromotion } from "./campaign.types";

export const quizPromotion: QuizPromotion = {
  id: "celuclin-quiz-v6-checkout-snapshot",
  version: "2026-07-17.1",
  status: "draft",
  startsAt: "2026-07-17T14:40:56.778Z",
  endsAt: "2026-07-18T14:40:56.778Z",
  offers: {
    "one-month": {
      id: "one-month",
      checkoutUrl: checkoutUrls["one-month"],
      regularPrice: 197,
      campaignPrice: 89.9,
      quantity: 1,
      approximateDays: 30,
      imageSrc: "/offers/celuclin-one.webp",
    },
    "three-months": {
      id: "three-months",
      checkoutUrl: checkoutUrls["three-months"],
      regularPrice: 591,
      campaignPrice: 169.9,
      quantity: 3,
      approximateDays: 90,
      imageSrc: "/offers/celuclin-three.webp",
    },
    "seven-months": {
      id: "seven-months",
      checkoutUrl: checkoutUrls["seven-months"],
      regularPrice: 1379,
      campaignPrice: 597,
      quantity: 7,
      approximateDays: 210,
      imageSrc: "/offers/celuclin-seven.webp",
    },
  },
  // Nenhum código foi aprovado ou validado no checkout. A lista vazia impede
  // que a interface fabrique desconto, cronômetro ou cupom.
  rewards: [],
};

export const checkoutSnapshot = {
  auditedAt: "2026-07-17T14:40:56.778Z",
  source: "Estado inicial oficial incorporado ao HTML dos três checkouts Yampi",
  installmentVerified: false,
  couponVerified: false,
} as const;
