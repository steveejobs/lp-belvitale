import { useEffect, useRef, useState } from "react";
import { recordCommerceEvent } from "../commerce/commerceEvents";
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

function describeBottleContents(offer: CommercialOffer): string {
  if (offer.additionalBottles === undefined) {
    return `${String(offer.bottles)} ${offer.bottles === 1 ? "pote" : "potes"}`;
  }

  return `${String(offer.bottles)} potes + ${String(offer.additionalBottles)} adicionais`;
}

interface OfferCardProps {
  readonly offer: CommercialOffer;
  readonly displayOfferImage: boolean;
  readonly isReadyFixture: boolean;
  readonly isSelected: boolean;
  readonly onSelect: (offer: CommercialOffer) => void;
}

function OfferCard({
  offer,
  displayOfferImage,
  isReadyFixture,
  isSelected,
  onSelect,
}: OfferCardProps) {
  const totalBottles = getOfferTotalBottles(offer);
  const pricePerBottle = calculatePricePerBottle(
    offer.price.cash,
    totalBottles,
  );

  return (
    <article
      className="commercial-offer"
      data-offer-id={offer.id}
      data-selected={isSelected}
    >
      <div className="commercial-offer__visual">
        {displayOfferImage && offer.image.src !== undefined ? (
          <img
            src={offer.image.src}
            alt={`Opção CeluClin para ${offer.title}`}
            width={offer.image.width}
            height={offer.image.height}
            loading="lazy"
            decoding="async"
            sizes="(min-width: 56rem) 30vw, calc(100vw - 2rem)"
          />
        ) : import.meta.env.DEV ? (
          <span aria-hidden="true">
            {isReadyFixture ? "fixture" : "mídia bloqueada"}
          </span>
        ) : null}
      </div>

      <div className="commercial-offer__body">
        <p className="commercial-offer__position">
          {offer.approximateDurationMonths === 1 ? "Rotina de" : "Rotina por"}
        </p>
        <h3>{offer.title}</h3>

        <dl className="commercial-offer__facts">
          <div>
            <dt>Conteúdo</dt>
            <dd>{describeBottleContents(offer)}</dd>
          </div>
          <div>
            <dt>Duração aproximada</dt>
            <dd>{String(offer.approximateDurationMonths * 30)} dias</dd>
          </div>
          <div>
            <dt>Cápsulas</dt>
            <dd>{String(offer.totalCapsules)}</dd>
          </div>
        </dl>

        {isReadyFixture && offer.price.cash !== undefined ? (
          <div className="commercial-offer__price" aria-label="Preço total">
            <span>Preço total</span>
            <strong>{formatBRL(offer.price.cash)}</strong>
            {offer.price.installments !== undefined &&
            offer.price.installmentValue !== undefined ? (
              <small>
                {String(offer.price.installments)} parcelas de {" "}
                {formatBRL(offer.price.installmentValue)} {" "}
                {offer.price.hasInterest === false ? "sem juros" : "com juros"}
              </small>
            ) : null}
            {pricePerBottle !== null ? (
              <small>{formatBRL(pricePerBottle)} por pote</small>
            ) : null}
          </div>
        ) : null}

        {isReadyFixture ? (
          <a
            className="commercial-offer__cta"
            href={offer.checkoutUrl}
            onClick={() => onSelect(offer)}
          >
            Escolher {offer.title}
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function CommercialSection() {
  const fixture = getDevelopmentFixture();
  const offers = fixture?.offers ?? commercialOffers;
  const dependencies =
    fixture?.dependencies ?? commercialPublicationDependencies;
  const isReady = canPublishCommercialSection(offers, dependencies);
  const isReadyFixture = fixture?.name === "commercial-ready" && isReady;
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const viewsRecorded = useRef(false);

  useEffect(() => {
    if (!isReady || viewsRecorded.current) return;
    viewsRecorded.current = true;
    offers.forEach((offer) => {
      recordCommerceEvent("offer_view", {
        offerId: offer.id,
        source: "homepage",
      });
    });
  }, [isReady, offers]);

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

  if (!import.meta.env.DEV && !isReady) return null;

  return (
    <section
      className="commercial-section"
      id="kits"
      aria-labelledby="commercial-title"
      data-publication-ready={isReady}
      data-ready-fixture={isReadyFixture}
    >
      <div className="section-shell commercial-section__layout">
        <div className="section-heading commercial-section__heading">
          <p className="eyebrow">Escolha sua rotina</p>
          <h2 id="commercial-title">
            Uma opção para cada momento da sua rotina.
          </h2>
          <p>
            Compare as opções disponíveis e escolha a que faz sentido para você.
          </p>
        </div>

        {import.meta.env.DEV ? (
          isReadyFixture ? (
            <p className="commercial-internal-state" role="status">
              Fixture de desenvolvimento — dados fictícios
            </p>
          ) : !isReady ? (
            <p className="commercial-internal-state" role="status">
              Oferta bloqueada — dados comerciais pendentes
            </p>
          ) : null
        ) : null}

        <div className="commercial-offers" aria-label="Comparação das opções">
          {offers.map((offer) => (
            <OfferCard
              offer={offer}
              displayOfferImage={isReady && !isReadyFixture}
              isReadyFixture={isReadyFixture}
              isSelected={offer.id === selectedOfferId}
              key={offer.id}
              onSelect={selectOffer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
