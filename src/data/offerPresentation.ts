import type { CommercialOffer } from "./commercialOffers";

interface OfferVisual {
  readonly src: string;
  readonly width: number;
  readonly height: number;
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
    visual: { src: "/offers/celuclin-one.webp", width: 800, height: 700 },
  },
  "three-months": {
    kicker: "Continuar",
    title: "CeluClin 3 Meses",
    contents: "3 potes",
    duration: "Aproximadamente 90 dias",
    action: "Escolher 3 meses",
    featured: true,
    visual: { src: "/offers/celuclin-three.webp", width: 1000, height: 700 },
  },
  "seven-months": {
    kicker: "Organizar por mais tempo",
    title: "CeluClin 7 Meses",
    contents: "5 potes + 2 grátis",
    duration: "Aproximadamente 210 dias",
    action: "Escolher 7 meses",
    featured: false,
    visual: { src: "/offers/celuclin-seven.webp", width: 1200, height: 760 },
  },
};

export function getOfferPresentation(offer: CommercialOffer): OfferPresentation {
  return presentations[offer.id];
}
