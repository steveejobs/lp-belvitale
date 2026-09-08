import { getHomeOfferPrice } from "../data/homeOfferFacts";
import { MobileOfferCta } from "./MobileOfferCta";
import {
  canPublishCommercialSection,
  commercialOffers,
  getOfferTotalBottles,
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
  const bestOffer = [...offers].sort((a, b) => getHomeOfferPrice(a) / getOfferTotalBottles(a) - getHomeOfferPrice(b) / getOfferTotalBottles(b))[0];
  const sortedOffers = [...offers].sort((a, b) => Number(b.id === bestOffer?.id) - Number(a.id === bestOffer?.id));
  const singleOffer = offers.find((offer) => getOfferTotalBottles(offer) === 1);

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
        <Reveal className="commercial-section__heading section-shell" effect="slide-left" stagger>
          <p className="eyebrow">{commercial.eyebrow}</p>
          <h2 id="commercial-title">{commercial.title}</h2>
          <p>{commercial.body}</p>
        </Reveal>

        <Reveal className="offer-cards section-shell" effect="clip" delay={80}>
          {sortedOffers.map((offer, index) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              index={index}
              checkoutReady={checkoutReady}
              bestValue={offer.id === bestOffer?.id}
              singlePrice={singleOffer === undefined ? undefined : getHomeOfferPrice(singleOffer)}
            />
          ))}
        </Reveal>
        <p className="section-shell commercial-section__conditions">Preços à vista conferidos em 08/09/2026, sujeitos a atualização no checkout. Compare o valor final antes de concluir. A quantidade do kit não representa um prazo de resultado.</p>
      </section>
      <MobileOfferCta />
    </>
  );
}
