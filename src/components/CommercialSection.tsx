import { useEffect, useRef } from "react";
import { recordCommerceEvent } from "../commerce/commerceEvents";
import { MobileOfferCta } from "./MobileOfferCta";
import {
  canPublishCommercialSection,
  commercialOffers,
  commercialPublicationDependencies,
  type CommercialOffer,
  type CommercialPublicationDependencies,
} from "../data/commercialOffers";
import { commercialPreviewReady } from "../data/commercialPreview";
import { commercialSurfaceReady } from "../data/commercialPublicationGate";
import { regulatoryPublicationReady } from "../data/regulatoryFacts";
import { OfferCard } from "./commercial/OfferCard";
import { Reveal } from "./ui/Reveal";
import { homeContent } from "../content/homeContent";

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

export function CommercialSection() {
  const { commercial } = homeContent;
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
        <Reveal className="commercial-section__heading section-shell" effect="slide-left">
          <p className="eyebrow">{commercial.eyebrow}</p>
          <h2 id="commercial-title">{commercial.title}</h2>
          <p>{commercial.body}</p>
        </Reveal>

        <Reveal className="offer-cards section-shell" effect="clip" delay={80}>
          {offers.map((offer, index) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              index={index}
              checkoutReady={checkoutReady}
            />
          ))}
        </Reveal>
      </section>
      <MobileOfferCta />
    </>
  );
}
