import { useEffect, useRef, useState } from "react";
import { recordCommerceEvent } from "../commerce/commerceEvents";
import { homeContent } from "../content/homeContent";
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
  if (offer.additionalBottles === undefined) {
    return `${String(total)} ${total === 1 ? "frasco" : "frascos"}`;
  }
  return `${String(offer.bottles)} frascos + ${String(offer.additionalBottles)} adicionais`;
}

interface OfferRowProps {
  readonly index: number;
  readonly offer: CommercialOffer;
  readonly interactive: boolean;
  readonly fixture: boolean;
  readonly selected: boolean;
  readonly onSelect: (offer: CommercialOffer) => void;
}

function OfferRow({
  index,
  offer,
  interactive,
  fixture,
  selected,
  onSelect,
}: OfferRowProps) {
  const totalBottles = getOfferTotalBottles(offer);
  const perBottle = calculatePricePerBottle(offer.price.cash, totalBottles);
  const label = homeContent.commercial.labels[offer.id];
  const days = offer.approximateDurationMonths * 30;

  return (
    <article
      className="commercial-offer"
      data-offer-id={offer.id}
      data-selected={selected}
      style={{ "--offer-index": index } as React.CSSProperties}
    >
      <div className="commercial-offer__identity">
        <p>{label}</p>
        <h3>{days} dias</h3>
      </div>

      <div className="commercial-offer__facts">
        <p>
          <span>Duração de rotina</span>
          <strong>{days} dias</strong>
        </p>
        {interactive ? (
          <>
            <p>
              <span>Conteúdo</span>
              <strong>{describeContents(offer)}</strong>
            </p>
            <p>
              <span>Cápsulas</span>
              <strong>{offer.totalCapsules}</strong>
            </p>
          </>
        ) : (
          <p className="commercial-offer__pending">
            Condições e composição da oferta aguardam aprovação.
          </p>
        )}
      </div>

      {interactive && offer.price.cash !== undefined ? (
        <div className="commercial-offer__decision">
          <div className="commercial-offer__price">
            <span>Valor total</span>
            <strong>{formatBRL(offer.price.cash)}</strong>
            {fixture ? <small>fixture interna · valor fictício</small> : null}
            {perBottle === null ? null : (
              <small>{formatBRL(perBottle)} por frasco</small>
            )}
          </div>
          <a
            className="commercial-offer__cta"
            href={offer.checkoutUrl}
            onClick={() => onSelect(offer)}
          >
            Escolher {label.toLowerCase()}
          </a>
        </div>
      ) : (
        <span className="commercial-offer__gate">Oferta não publicada</span>
      )}
    </article>
  );
}

export function CommercialSection() {
  const fixture = getDevelopmentFixture();
  const offers = fixture?.offers ?? commercialOffers;
  const dependencies =
    fixture?.dependencies ?? commercialPublicationDependencies;
  const offerDataReady = canPublishCommercialSection(offers, dependencies);
  const fixtureReady =
    fixture?.name === "commercial-ready" && offerDataReady;
  const publicReady =
    offerDataReady && regulatoryPublicationReady && commercialSurfaceReady;
  const interactive = publicReady || fixtureReady;
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const viewsRecorded = useRef(false);

  useEffect(() => {
    if (!interactive || viewsRecorded.current) return;
    viewsRecorded.current = true;
    offers.forEach((offer) => {
      recordCommerceEvent("offer_view", {
        offerId: offer.id,
        source: "homepage",
      });
    });
  }, [interactive, offers]);

  function selectOffer(offer: CommercialOffer) {
    setSelectedOfferId(offer.id);
    recordCommerceEvent("offer_select", {
      offerId: offer.id,
      source: "homepage",
    });
    recordCommerceEvent("checkout_click", {
      offerId: offer.id,
      source: "homepage",
    });
  }

  if (!import.meta.env.DEV && !publicReady) return null;

  const { commercial } = homeContent;

  return (
    <section
      className="commercial-section"
      id="kits"
      aria-labelledby="commercial-title"
      data-publication-ready={publicReady}
      data-ready-fixture={fixtureReady}
    >
      <div className="section-shell commercial-section__heading">
        <p className="eyebrow">{commercial.eyebrow}</p>
        <h2 id="commercial-title">{commercial.title}</h2>
        <p className="commercial-section__body">{commercial.body}</p>
        {import.meta.env.DEV ? (
          <p className="commercial-internal-state" role="status">
            {fixtureReady
              ? "Fixture de desenvolvimento — dados fictícios identificados"
              : "Gate ativo — ofertas, preços e checkout não estão publicados"}
          </p>
        ) : null}
      </div>

      <div className="section-shell commercial-offers">
        {offers.map((offer, index) => (
          <OfferRow
            index={index}
            offer={offer}
            interactive={interactive}
            fixture={fixtureReady}
            selected={selectedOfferId === offer.id}
            key={offer.id}
            onSelect={selectOffer}
          />
        ))}
      </div>

      {interactive ? (
        <div className="section-shell purchase-steps" aria-label="Como comprar">
          <p><span>Escolha</span> a opção que faz sentido para a sua organização.</p>
          <p><span>Pagamento</span> feito no ambiente Yampi.</p>
          <p><span>Acompanhamento</span> pelos canais informados após a compra.</p>
        </div>
      ) : null}
    </section>
  );
}
