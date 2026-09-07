import type { PromotionOffer } from "../campaign/campaign.types";
import { quizPromotion } from "../campaign/campaign.config";
import { buildCheckoutUrl } from "../checkout/checkout.utm";
import { isOfficialCheckoutUrl } from "../checkout/checkout.validation";
import { quizOffers } from "../content/offers";
import { getQuizExperimentAssignment } from "../experiment/quiz.experiment";

interface CheckoutCTAProps {
  readonly offer: PromotionOffer;
  readonly rewardId?: string;
  readonly onClick: () => void;
  readonly className?: string;
}

export function CheckoutCTA({ offer, rewardId, onClick, className = "" }: CheckoutCTAProps) {
  const valid = isOfficialCheckoutUrl(offer.id, offer.checkoutUrl);
  const experiment = getQuizExperimentAssignment();
  const href = valid
    ? buildCheckoutUrl(offer.checkoutUrl, window.location.search, {
        campaignId: quizPromotion.id,
        offerId: offer.id,
        experimentId: experiment.experimentId,
        experimentVariant: experiment.variant,
        experimentMode: experiment.source === "forced" ? "qa" : "randomized",
        ...(rewardId === undefined ? {} : { rewardId }),
      })
    : undefined;
  return valid && href !== undefined ? (
    <a className={"q7-primary q7-checkout " + className} href={href} onClick={onClick}>
      {quizOffers[offer.id].cta} <span aria-hidden="true">→</span>
    </a>
  ) : (
    <button className={"q7-primary q7-checkout " + className} type="button" disabled>Checkout indisponível</button>
  );
}
