import type { CSSProperties, PointerEvent } from "react";
import { recordCommerceEvent } from "../../commerce/commerceEvents";
import { campaignAssets, canRenderCampaignAsset } from "../../data/campaignAssets";
import { getOfferTotalBottles, type CommercialOffer } from "../../data/commercialOffers";
import { getCheckoutUrlWithUtms } from "../../data/commercialPreview";
import { getOfferPresentation } from "../../data/offerPresentation";

interface OfferCardProps {
  readonly offer: CommercialOffer;
  readonly index: number;
  readonly checkoutReady: boolean;
}

export function OfferCard({ offer, index, checkoutReady }: OfferCardProps) {
  const product = campaignAssets.productFrontPrimary;
  const bottles = getOfferTotalBottles(offer);
  const presentation = getOfferPresentation(offer);
  const showProduct = canRenderCampaignAsset(product);

  function movePackshot(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--offer-pointer-x", `${String(x * 7)}px`);
    event.currentTarget.style.setProperty("--offer-pointer-y", `${String(y * 5)}px`);
  }

  function resetPackshot(event: PointerEvent<HTMLElement>) {
    event.currentTarget.style.setProperty("--offer-pointer-x", "0px");
    event.currentTarget.style.setProperty("--offer-pointer-y", "0px");
  }

  return (
    <article
      className="offer-card"
      data-offer-id={offer.id}
      data-count={bottles}
      data-featured={presentation.featured}
      style={{ "--offer-index": index } as CSSProperties}
      onPointerMove={movePackshot}
      onPointerLeave={resetPackshot}
    >
      <div className="offer-card__heading">
        <p className="offer-card__kicker">{presentation.kicker}</p>
        <h3>{presentation.title}</h3>
        <p>{presentation.duration}</p>
      </div>

      <div
        className="offer-card__packshots"
        data-count={bottles}
        role="img"
        aria-label={`${String(bottles)} frascos de CeluClin`}
      >
        {showProduct ? (
          <img
            src={presentation.visual.src}
            width={presentation.visual.width}
            height={presentation.visual.height}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : null}
      </div>

      <div className="offer-card__summary">
        <strong>{presentation.contents}</strong>
        <span>{offer.totalCapsules} cápsulas no total</span>
      </div>

      {checkoutReady ? (
        <a
          className="offer-card__cta"
          href={getCheckoutUrlWithUtms(offer.checkoutUrl)}
          onClick={() => {
            recordCommerceEvent("checkout_click", {
              offerId: offer.id,
              source: "homepage",
            });
          }}
        >
          {presentation.action}
        </a>
      ) : (
        <button className="offer-card__cta" type="button" disabled>
          Opção temporariamente indisponível
        </button>
      )}
    </article>
  );
}
