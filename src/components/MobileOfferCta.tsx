import { useEffect, useState } from "react";
import { commercialNavigationReady } from "../data/commercialPreview";

export function MobileOfferCta() {
  const [heroPassed, setHeroPassed] = useState(false);
  const [offersVisible, setOffersVisible] = useState(false);
  const [offersPassed, setOffersPassed] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);

  useEffect(() => {
    if (!commercialNavigationReady) return;
    const hero = document.querySelector<HTMLElement>("#inicio");
    const offers = document.querySelector<HTMLElement>("#ofertas");
    if (hero === null || offers === null) return;

    const updatePosition = () => {
      setHeroPassed(hero.getBoundingClientRect().bottom <= 72);
      setOffersPassed(offers.getBoundingClientRect().bottom <= 0);
    };
    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });

    const offersObserver = new IntersectionObserver(
      ([entry]) => setOffersVisible(entry?.isIntersecting ?? false),
      { threshold: 0.08 },
    );
    offersObserver.observe(offers);

    const updateOverlay = () => setOverlayOpen(document.querySelector("dialog[open]") !== null);
    const overlayObserver = new MutationObserver(updateOverlay);
    overlayObserver.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["open"],
    });
    updateOverlay();

    return () => {
      window.removeEventListener("scroll", updatePosition);
      offersObserver.disconnect();
      overlayObserver.disconnect();
    };
  }, []);

  if (!commercialNavigationReady) return null;

  return (
    <a
      className="mobile-offer-cta"
      href="#ofertas"
      data-visible={heroPassed && !offersVisible && !offersPassed && !overlayOpen}
      aria-hidden={!heroPassed || offersVisible || offersPassed || overlayOpen}
      tabIndex={heroPassed && !offersVisible && !offersPassed && !overlayOpen ? 0 : -1}
    >
      Ver opções
    </a>
  );
}
