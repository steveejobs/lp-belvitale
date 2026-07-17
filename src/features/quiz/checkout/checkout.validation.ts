import { checkoutUrls } from "./checkout.urls";
import type { OfferId } from "../domain/quiz.types";

export function isOfficialCheckoutUrl(offerId: OfferId, value: string): boolean {
  try {
    const actual = new URL(value);
    const expected = new URL(checkoutUrls[offerId]);
    return actual.protocol === "https:" && actual.hostname === expected.hostname && actual.pathname === expected.pathname;
  } catch {
    return false;
  }
}
