import type { CommercialOffer } from "./commercialOffers";

interface OfferVisual {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly note: string;
}

export interface OfferPresentation {
  readonly kicker: string;
  readonly title: string;
  readonly contents: string;
  readonly duration: string;
  readonly action: string;
  readonly featured: boolean;
  readonly visual: OfferVisual;
}

const presentations: Record<CommercialOffer["id"], OfferPresentation> = {
  "one-month": {
    kicker: "Começar",
    title: "CeluClin 1 Mês",
    contents: "1 pote",
    duration: "Aproximadamente 30 dias",
    action: "Escolher 1 mês",
    featured: false,
    visual: {
      src: "/offers/celuclin-one-editorial.webp",
      width: 683,
      height: 740,
      note: "Composição ilustrativa do kit",
    },
  },
  "three-months": {
    kicker: "Continuar",
    title: "CeluClin 3 Meses",
    contents: "3 potes",
    duration: "Aproximadamente 90 dias",
    action: "Escolher 3 meses",
    featured: true,
    visual: {
      src: "/offers/celuclin-three-editorial.webp",
      width: 686,
      height: 778,
      note: "Composição ilustrativa do kit",
    },
  },
  "seven-months": {
    kicker: "Organizar por mais tempo",
    title: "CeluClin 7 Meses",
    contents: "5 potes + 2 grátis",
    duration: "Aproximadamente 210 dias",
    action: "Escolher 7 meses",
    featured: false,
    visual: {
      src: "/offers/celuclin-seven-editorial.webp",
      width: 762,
      height: 759,
      note: "Composição ilustrativa · 5 + 2 frascos",
    },
  },
};

export function getOfferPresentation(offer: CommercialOffer): OfferPresentation {
  return presentations[offer.id];
}
