import { useEffect, useRef } from "react";
import { recordCommerceEvent } from "../commerce/commerceEvents";
import { MobileOfferCta } from "./MobileOfferCta";
import { campaignAssets, canRenderCampaignAsset } from "../data/campaignAssets";
import {
  canPublishCommercialSection,
  commercialOffers,
  commercialPublicationDependencies,
  getOfferTotalBottles,
  type CommercialOffer,
  type CommercialPublicationDependencies,
} from "../data/commercialOffers";
import {
  commercialPreviewReady,
  getCheckoutUrlWithUtms,
} from "../data/commercialPreview";
import { commercialSurfaceReady } from "../data/commercialPublicationGate";
import { regulatoryPublicationReady } from "../data/regulatoryFacts";

interface CommercialDevelopmentFixture {
  readonly name: "commercial-ready";
  readonly offers: readonly CommercialOffer[];
  readonly dependencies: CommercialPublicationDependencies;
}

type FixtureWindow = Window & {
  readonly __BELVITALE_COMMERCIAL_FIXTURE__?: CommercialDevelopmentFixture;
};

function getDevelopmentFixture(): CommercialDevelopmentFixture | null {
  if (!import.meta.env.DEV) return null;
  return (window as FixtureWindow).__BELVITALE_COMMERCIAL_FIXTURE__ ?? null;
}

function offerCopy(offer: CommercialOffer) {
  if (offer.id === "one-month") {
    return {
      title: "CeluClin 1 Mês",
      contents: "1 pote",
      duration: "Aproximadamente 30 dias",
      action: "Escolher 1 mês",
    };
  }
  if (offer.id === "three-months") {
    return {
      title: "CeluClin 3 Meses",
      contents: "3 potes",
      duration: "Aproximadamente 90 dias",
      action: "Escolher 3 meses",
    };
  }
  return {
    title: "CeluClin 7 Meses",
    contents: "5 potes + 2 grátis",
    duration: "Aproximadamente 210 dias",
    action: "Escolher 7 meses",
  };
}

const offerVisuals = {
  "one-month": { src: "/offers/celuclin-one.webp", width: 800, height: 700 },
  "three-months": { src: "/offers/celuclin-three.webp", width: 1000, height: 700 },
  "seven-months": { src: "/offers/celuclin-seven.webp", width: 1200, height: 760 },
} as const;

interface OfferCardProps {
  readonly offer: CommercialOffer;
  readonly index: number;
  readonly checkoutReady: boolean;
}

function OfferCard({ offer, index, checkoutReady }: OfferCardProps) {
  const product = campaignAssets.productFrontPrimary;
  const bottles = getOfferTotalBottles(offer);
  const copy = offerCopy(offer);
  const showProduct = canRenderCampaignAsset(product);
  const visual = offerVisuals[offer.id];

  return (
    <article
      className="offer-card"
      data-offer-id={offer.id}
      data-count={bottles}
      style={{ "--offer-index": index } as React.CSSProperties}
    >
      <div className="offer-card__heading">
        <span>0{index + 1}</span>
        <div>
          <h3>{copy.title}</h3>
          <p>{copy.duration}</p>
        </div>
      </div>

      <div
        className="offer-card__packshots"
        data-count={bottles}
        role="img"
        aria-label={`${String(bottles)} frascos de CeluClin`}
      >
        {showProduct ? (
          <img
            src={visual.src}
            width={visual.width}
            height={visual.height}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : null}
      </div>

      <div className="offer-card__summary">
        <strong>{copy.contents}</strong>
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
          {copy.action}
        </a>
      ) : (
        <button className="offer-card__cta" type="button" disabled>
          Checkout indisponível
        </button>
      )}
    </article>
  );
}

export function CommercialSection() {
  const fixture = getDevelopmentFixture();
  const offers = fixture?.offers ?? commercialOffers;
  const dependencies = fixture?.dependencies ?? commercialPublicationDependencies;
  const offerDataReady = canPublishCommercialSection(offers, dependencies);
  const fixtureReady = fixture?.name === "commercial-ready" && offerDataReady;
  const publicReady = offerDataReady && regulatoryPublicationReady && commercialSurfaceReady;
  const previewReady = fixture === null && commercialPreviewReady;
  const checkoutReady = publicReady || previewReady || fixtureReady;
  const viewsRecorded = useRef(false);

  useEffect(() => {
    if (!checkoutReady || viewsRecorded.current) return;
    viewsRecorded.current = true;
    offers.forEach((offer) =>
      recordCommerceEvent("offer_view", { offerId: offer.id, source: "homepage" }),
    );
  }, [checkoutReady, offers]);

  if (!publicReady && !previewReady && fixture === null) return null;

  return (
    <>
      <section
        className="commercial-section"
        id="ofertas"
        aria-labelledby="commercial-title"
        data-publication-ready={publicReady}
        data-preview-ready={previewReady || fixtureReady}
      >
        <div className="commercial-section__heading section-shell">
          <p className="eyebrow">Opções CeluClin</p>
          <h2 id="commercial-title">Escolha como começar.</h2>
          <p>
            Compare pela duração que cabe na sua rotina. A condição comercial atual
            aparece no checkout da Belvitale.
          </p>
        </div>

        <div className="offer-cards section-shell">
          {offers.map((offer, index) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              index={index}
              checkoutReady={checkoutReady}
            />
          ))}
        </div>
      </section>
      <MobileOfferCta />
    </>
  );
}
