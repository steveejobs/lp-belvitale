import type { CommercialOffer } from "./commercialOffers";

/** Public Yampi carts checked on 2026-09-08. Prices do not change publication gates. */
export const homeOfferFacts = {
  verifiedAt: "2026-09-08",
  prices: { "one-month": 89.9, "three-months": 169.9, "seven-months": 597 },
} as const;

export function getHomeOfferPrice(offer: CommercialOffer): number {
  return offer.price.status === "confirmed" && offer.price.cash !== undefined
    ? offer.price.cash
    : homeOfferFacts.prices[offer.id];
}
