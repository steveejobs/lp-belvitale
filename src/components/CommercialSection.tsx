import { useEffect, useRef, useState } from "react";
import { recordCommerceEvent } from "../commerce/commerceEvents";
import { homeContent } from "../content/homeContent";
import {
  campaignAssets,
  canRenderCampaignAsset,
  internalMediaPreview,
} from "../data/campaignAssets";
import { checkoutGalleryAssets } from "../data/galleryAssets";
import {
  calculatePricePerBottle,
  canPublishCommercialSection,
  commercialOffers,
  commercialPublicationDependencies,
  formatBRL,
  getOfferTotalBottles,
  type CommercialOffer,
  type CommercialPublicationDependencies,
} from "../data/commercialOffers";
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

function describeContents(offer: CommercialOffer): string {
  const total = getOfferTotalBottles(offer);
  if (offer.additionalBottles === undefined) return `${String(total)} ${total === 1 ? "frasco" : "frascos"}`;
  return `${String(offer.bottles)} frascos + ${String(offer.additionalBottles)} adicionais`;
}

interface OfferLaneProps {
  readonly offer: CommercialOffer;
  readonly index: number;
  readonly selected: boolean;
  readonly checkoutReady: boolean;
  readonly fixture: boolean;
  readonly onSelect: (offer: CommercialOffer) => void;
}

function OfferLane({ offer, index, selected, checkoutReady, fixture, onSelect }: OfferLaneProps) {
  const label = homeContent.commercial.labels[offer.id];
  const totalBottles = getOfferTotalBottles(offer);
  const days = offer.approximateDurationMonths * 30;
  const product = campaignAssets.productFrontPrimary;
  const showProduct = canRenderCampaignAsset(product);
  const kit = checkoutGalleryAssets.find((asset) => {
    if (offer.id === "one-month") return asset.id === "kit-one-month";
    if (offer.id === "three-months") return asset.id === "kit-three-months";
    return asset.id === "kit-seven-months";
  });
  const showKit = internalMediaPreview && kit !== undefined;
  const perBottle = calculatePricePerBottle(offer.price.cash, totalBottles);

  return (
    <article className="offer-lane" data-offer-id={offer.id} data-selected={selected} style={{ "--offer-index": index } as React.CSSProperties}>
      <button className="offer-lane__selector" type="button" aria-pressed={selected} onClick={() => onSelect(offer)}>
        <span>0{index + 1}</span>
        <strong>{label}</strong>
        <small>{days} dias</small>
      </button>

      <div className="offer-lane__bottles" aria-hidden="true" data-count={totalBottles} data-mode={showKit ? "kit" : "bottles"}>
        {showKit ? (
          <img
            className="offer-lane__kit"
            src={kit.src}
            width={kit.width}
            height={kit.height}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : showProduct
          ? Array.from({ length: totalBottles }, (_, bottleIndex) => (
              <img
                key={bottleIndex}
                src={product.src}
                width={product.width}
                height={product.height}
                alt=""
                loading="lazy"
                decoding="async"
              />
            ))
          : <span>{totalBottles}</span>}
      </div>

      <div className="offer-lane__facts">
        <p><span>Conteúdo</span><strong>{describeContents(offer)}</strong></p>
        <p><span>Cápsulas</span><strong>{offer.totalCapsules}</strong></p>
        {checkoutReady && offer.price.cash !== undefined ? (
          <p className="offer-lane__price">
            <span>Valor total</span><strong>{formatBRL(offer.price.cash)}</strong>
            {fixture ? <small>fixture interna · valor fictício</small> : null}
            {perBottle === null ? null : <small>{formatBRL(perBottle)} por frasco</small>}
          </p>
        ) : (
          <p className="offer-lane__pending"><span>Compra</span><strong>Condições em validação</strong></p>
        )}
      </div>

      {checkoutReady ? (
        <a className="offer-lane__cta" href={offer.checkoutUrl} onClick={() => {
          recordCommerceEvent("checkout_click", { offerId: offer.id, source: "homepage" });
        }}>
          Escolher {label.toLowerCase()}
        </a>
      ) : (
        <span className="offer-lane__gate">Checkout protegido pelo gate</span>
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
  const checkoutReady = publicReady || fixtureReady;
  const [selectedOfferId, setSelectedOfferId] = useState(offers[1]?.id ?? offers[0]?.id ?? null);
  const viewsRecorded = useRef(false);

  useEffect(() => {
    if (!checkoutReady || viewsRecorded.current) return;
    viewsRecorded.current = true;
    offers.forEach((offer) => recordCommerceEvent("offer_view", { offerId: offer.id, source: "homepage" }));
  }, [checkoutReady, offers]);

  if (!internalMediaPreview && !publicReady) return null;

  function selectOffer(offer: CommercialOffer) {
    setSelectedOfferId(offer.id);
    recordCommerceEvent("offer_select", { offerId: offer.id, source: "homepage" });
  }

  const { commercial } = homeContent;

  return (
    <section className="commercial-section" id="kits" aria-labelledby="commercial-title" data-publication-ready={publicReady} data-ready-fixture={fixtureReady}>
      <div className="commercial-section__heading section-shell">
        <p className="eyebrow">{commercial.eyebrow}</p>
        <h2 id="commercial-title">{commercial.title}</h2>
        <p>{commercial.body}</p>
        {!publicReady ? <small role="status">Direção interna · nenhuma oferta ou compra está publicada.</small> : null}
      </div>

      <div className="offer-lanes section-shell">
        {offers.map((offer, index) => (
          <OfferLane
            key={offer.id}
            offer={offer}
            index={index}
            selected={selectedOfferId === offer.id}
            checkoutReady={checkoutReady}
            fixture={fixtureReady}
            onSelect={selectOffer}
          />
        ))}
      </div>

      <div className="purchase-ribbon" aria-label="Como a compra funcionará quando as ofertas forem aprovadas">
        <p><span>Escolha</span> a duração pela conveniência.</p>
        <p><span>Pagamento</span> no ambiente Yampi.</p>
        <p><span>Acompanhamento</span> pelos canais informados após a compra.</p>
      </div>
    </section>
  );
}
