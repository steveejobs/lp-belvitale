import { useEffect, useRef } from "react";
import { recordHomeEvent } from "../../analytics/homeEvents";
import { recordCommerceEvent } from "../../commerce/commerceEvents";
import { getOfferTotalBottles, type CommercialOffer } from "../../data/commercialOffers";
import { getCheckoutUrlWithUtms } from "../../data/commercialPreview";
import { getHomeOfferPrice } from "../../data/homeOfferFacts";

interface OfferCardProps {
  readonly offer: CommercialOffer;
  readonly index: number;
  readonly checkoutReady: boolean;
  readonly bestValue?: boolean;
  readonly singlePrice?: number | undefined;
}
const brl = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function OfferCard({ offer, checkoutReady, bestValue = false, singlePrice }: OfferCardProps) {
  const articleRef = useRef<HTMLElement>(null);
  const bottles = getOfferTotalBottles(offer);
  const price = getHomeOfferPrice(offer);
  const saving = singlePrice === undefined ? 0 : Math.round((singlePrice * bottles - price) * 100) / 100;

  useEffect(() => {
    const article = articleRef.current;
    if (!checkoutReady || article === null) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      recordCommerceEvent("offer_view", { offerId: offer.id, source: "homepage" });
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(article);
    return () => observer.disconnect();
  }, [checkoutReady, offer.id]);

  return (
    <article ref={articleRef} className="offer-card" data-offer-id={offer.id} data-count={bottles} data-featured={bestValue}>
      <div className="offer-card__heading">
        <p className="offer-card__kicker">{bestValue ? "Melhor preço por frasco" : bottles === 1 ? "Para começar" : "Para planejar por mais tempo"}</p>
        <h3>{bottles} {bottles === 1 ? "frasco" : "frascos"} de CeluClin</h3>
        <p>{offer.totalCapsules} cápsulas · a mesma fórmula</p>
      </div>
      <div className="offer-card__product">
        <img src="/product/celuclin-home-640.webp" width="640" height="960" alt="Apresentação ilustrativa de um frasco CeluClin." loading="lazy" decoding="async" />
        <div><strong>{bottles === 1 ? "Seu primeiro frasco." : bestValue ? "Mais cuidado. Menos por frasco." : "Sua rotina, organizada."}</strong><span>{bottles} {bottles === 1 ? "frasco no kit" : "frascos no kit"}</span></div>
      </div>
      <div className="offer-card__price">
        <span>Total do kit à vista</span><strong>{brl(price)}</strong>
        <span>{brl(price / bottles)} por frasco</span>
      </div>
      <p className="offer-card__saving">{saving > 0 && bottles > 1 ? <>Economize <strong>{brl(saving)}</strong> em comparação com {bottles} frascos avulsos.</> : "Uma opção para incluir no seu dia a dia."}</p>
      {checkoutReady ? <a className="offer-card__cta" href={getCheckoutUrlWithUtms(offer.checkoutUrl)} onClick={() => {
        recordCommerceEvent("checkout_click", { offerId: offer.id, source: "homepage" });
        recordHomeEvent("checkout_start", { offerId: offer.id });
      }}>Quero {bottles === 1 ? "meu CeluClin" : `meus ${String(bottles)} frascos`} <span aria-hidden="true">↗</span></a> : <button className="offer-card__cta" type="button" disabled>Opção temporariamente indisponível</button>}
      <small className="offer-card__checkout-note">Frete e formas de pagamento no checkout.</small>
    </article>
  );
}
