import type { PromotionOffer } from "../campaign/campaign.types";
import { quizPromotion } from "../campaign/campaign.config";
import { buildCheckoutUrl } from "../checkout/checkout.utm";
import { isOfficialCheckoutUrl } from "../checkout/checkout.validation";
import { quizOffers } from "../content/offers";

interface CheckoutCTAProps {
  readonly offer: PromotionOffer;
  readonly rewardId?: string;
  readonly onClick: () => void;
  readonly className?: string;
}

export function CheckoutCTA({ offer, rewardId, onClick, className = "" }: CheckoutCTAProps) {
  const valid = isOfficialCheckoutUrl(offer.id, offer.checkoutUrl);
  const href = valid
    ? buildCheckoutUrl(offer.checkoutUrl, window.location.search, {
        campaignId: quizPromotion.id,
        offerId: offer.id,
        ...(rewardId === undefined ? {} : { rewardId }),
      })
    : undefined;
  return valid && href !== undefined ? (
    <a className={"q6-primary q6-checkout " + className} href={href} onClick={onClick}>
      {quizOffers[offer.id].cta} <span aria-hidden="true">→</span>
    </a>
  ) : (
    <button className={"q6-primary q6-checkout " + className} type="button" disabled>Checkout indisponível</button>
  );
}
