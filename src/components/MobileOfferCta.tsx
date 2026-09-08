import { useEffect, useState } from "react";
import { commercialNavigationReady } from "../data/commercialPreview";

export function MobileOfferCta() {
  const [heroPassed, setHeroPassed] = useState(false);
  const [offersVisible, setOffersVisible] = useState(false);
  const [offersPassed, setOffersPassed] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [protectedSurfaceVisible, setProtectedSurfaceVisible] = useState(false);

  useEffect(() => {
    if (!commercialNavigationReady) return;
    const hero = document.querySelector<HTMLElement>("#inicio");
    const offers = document.querySelector<HTMLElement>("#ofertas");
    if (hero === null || offers === null) return;

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry === undefined) return;
        setHeroPassed(!entry.isIntersecting && entry.boundingClientRect.bottom <= 72);
      },
      { rootMargin: "-72px 0px 0px" },
    );
    heroObserver.observe(hero);

    const offersObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry === undefined) return;
        setOffersVisible(entry.isIntersecting);
        setOffersPassed(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
      },
      { threshold: 0.08 },
    );
    offersObserver.observe(offers);

    const protectedSurfaces = Array.from(
      document.querySelectorAll<HTMLElement>(
        "#liberdade, .skin-context, #celuclin, #resultados, #descobrir, #rotulo, #faq",
      ),
    );
    const visibleProtectedSurfaces = new Set<Element>();
    const protectedSurfaceObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleProtectedSurfaces.add(entry.target);
          else visibleProtectedSurfaces.delete(entry.target);
        });
        setProtectedSurfaceVisible(visibleProtectedSurfaces.size > 0);
      },
      { threshold: 0.12 },
    );
    protectedSurfaces.forEach((surface) => protectedSurfaceObserver.observe(surface));

    const updateOverlay = () => setOverlayOpen(document.querySelector("dialog[open]") !== null);
    const overlayObserver = new MutationObserver(updateOverlay);
    overlayObserver.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["open"],
    });
    updateOverlay();

    return () => {
      heroObserver.disconnect();
      offersObserver.disconnect();
      protectedSurfaceObserver.disconnect();
      overlayObserver.disconnect();
    };
  }, []);

  if (!commercialNavigationReady) return null;

  return (
    <a
      className="mobile-offer-cta"
      href="#ofertas"
      data-visible={
        heroPassed &&
        !offersVisible &&
        !offersPassed &&
        !overlayOpen &&
        !protectedSurfaceVisible
      }
      aria-hidden={
        !heroPassed ||
        offersVisible ||
        offersPassed ||
        overlayOpen ||
        protectedSurfaceVisible
      }
      tabIndex={
        heroPassed &&
        !offersVisible &&
        !offersPassed &&
        !overlayOpen &&
        !protectedSurfaceVisible
          ? 0
          : -1
      }
    >
      Ver kits e preços
    </a>
  );
}
