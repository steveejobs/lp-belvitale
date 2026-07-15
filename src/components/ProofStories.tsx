import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { homeContent } from "../content/homeContent";
import { commercialNavigationReady } from "../data/commercialPreview";
import {
  proofAssets,
  proofAuthorization,
  proofCategories,
  type ProofAsset,
  type ProofCategoryId,
} from "../data/proofGallery";
import { useReducedMotion } from "../hooks/useReducedMotion";

const autoplayDelay = 5200;
const resumeDelay = 3200;

function Arrow({ direction }: { readonly direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <path
        d={direction === "left" ? "M15 5 8 12l7 7" : "m9 5 7 7-7 7"}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

interface ProofFigureProps {
  readonly asset: ProofAsset;
  readonly position: "previous" | "current" | "next";
}

function ProofFigure({ asset, position }: ProofFigureProps) {
  const current = position === "current";
  return (
    <figure className="proof-figure" data-position={position} aria-hidden={!current}>
      <img
        src={asset.src}
        width={asset.width}
        height={asset.height}
        alt={current ? asset.alt : ""}
        loading="lazy"
        decoding="async"
        draggable={false}
        style={{
          objectFit: asset.fit,
          objectPosition: asset.objectPosition,
        }}
      />
      <figcaption className="sr-only">Imagem autorizada da série selecionada.</figcaption>
    </figure>
  );
}

export function ProofStories() {
  const sectionRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [activeCategory, setActiveCategory] = useState<ProofCategoryId>("cellulite");
  const [activeByCategory, setActiveByCategory] = useState<Record<ProofCategoryId, number>>({
    cellulite: 0,
    laxity: 0,
    "localized-fat": 0,
  });
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const reducedMotion = useReducedMotion();
  const { proof } = homeContent;

  const categoryAssets = useMemo(
    () => proofAssets.filter((asset) => asset.category === activeCategory),
    [activeCategory],
  );
  const activeIndex = activeByCategory[activeCategory];

  const selectAsset = useCallback((category: ProofCategoryId, index: number) => {
    const assets = proofAssets.filter((asset) => asset.category === category);
    const normalized = (index + assets.length) % assets.length;
    setActiveByCategory((current) => ({ ...current, [category]: normalized }));
  }, []);

  const resumeAfterInteraction = useCallback(() => {
    if (resumeTimerRef.current !== null) window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      setInteractionPaused(false);
      resumeTimerRef.current = null;
    }, resumeDelay);
  }, []);

  const pauseForInteraction = useCallback(() => {
    if (resumeTimerRef.current !== null) window.clearTimeout(resumeTimerRef.current);
    setInteractionPaused(true);
  }, []);

  const interact = useCallback(
    (nextIndex: number) => {
      pauseForInteraction();
      selectAsset(activeCategory, nextIndex);
      resumeAfterInteraction();
    }, [activeCategory, pauseForInteraction, resumeAfterInteraction, selectAsset],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (section === null || !("IntersectionObserver" in window)) {
      setGalleryVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setGalleryVisible(entry?.isIntersecting ?? false),
      { threshold: 0.32 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (
      reducedMotion ||
      !galleryVisible ||
      !pageVisible ||
      interactionPaused ||
      hovered ||
      focusWithin ||
      dragging ||
      categoryAssets.length < 2
    ) return;

    const timer = window.setTimeout(() => {
      selectAsset(activeCategory, activeIndex + 1);
    }, autoplayDelay);
    return () => window.clearTimeout(timer);
  }, [
    activeCategory,
    activeIndex,
    categoryAssets.length,
    galleryVisible,
    dragging,
    focusWithin,
    hovered,
    interactionPaused,
    pageVisible,
    reducedMotion,
    selectAsset,
  ]);

  useEffect(() => () => {
    if (resumeTimerRef.current !== null) window.clearTimeout(resumeTimerRef.current);
  }, []);

  const previousIndex = (activeIndex - 1 + categoryAssets.length) % categoryAssets.length;
  const nextIndex = (activeIndex + 1) % categoryAssets.length;
  const rendered = categoryAssets.filter((_, index) =>
    new Set([previousIndex, activeIndex, nextIndex]).has(index),
  );

  function positionFor(asset: ProofAsset): ProofFigureProps["position"] {
    const index = categoryAssets.indexOf(asset);
    if (index === activeIndex) return "current";
    if (index === previousIndex && previousIndex !== nextIndex) return "previous";
    return "next";
  }

  function changeCategory(category: ProofCategoryId) {
    pauseForInteraction();
    setActiveCategory(category);
    setDragOffset(0);
    resumeAfterInteraction();
  }

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    pointerRef.current = { x: event.clientX, y: event.clientY };
    setDragOffset(0);
    setDragging(true);
    pauseForInteraction();
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const horizontal = event.clientX - pointerRef.current.x;
    const vertical = event.clientY - pointerRef.current.y;
    if (Math.abs(horizontal) <= Math.abs(vertical)) return;
    setDragOffset(Math.max(-96, Math.min(96, horizontal)));
  }

  function pointerEnd(event: PointerEvent<HTMLDivElement>) {
    const horizontal = event.clientX - pointerRef.current.x;
    const vertical = event.clientY - pointerRef.current.y;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragOffset(0);
    setDragging(false);
    if (Math.abs(horizontal) >= 44 && Math.abs(horizontal) > Math.abs(vertical) * 1.15) {
      selectAsset(activeCategory, activeIndex + (horizontal < 0 ? 1 : -1));
    }
    resumeAfterInteraction();
  }

  return (
    <section
      className="proof-stories"
      id="resultados"
      ref={sectionRef}
      aria-labelledby="proof-title"
    >
      <div className="proof-stories__heading section-shell">
        <p className="eyebrow">{proof.eyebrow}</p>
        <h2 id="proof-title">Resultados organizados para você ver com clareza.</h2>
        <p>{proof.context}</p>
      </div>

      <div
        className="proof-gallery section-shell"
        ref={galleryRef}
        data-autoplay={
          !reducedMotion &&
          galleryVisible &&
          pageVisible &&
          !interactionPaused &&
          !hovered &&
          !focusWithin &&
          !dragging
        }
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          resumeAfterInteraction();
        }}
        onFocusCapture={() => setFocusWithin(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setFocusWithin(false);
            resumeAfterInteraction();
          }
        }}
      >
        <div className="proof-gallery__tabs" role="tablist" aria-label="Soluções apresentadas">
          {proofCategories.map((category) => (
            <button
              key={category.id}
              id={`proof-tab-${category.id}`}
              type="button"
              role="tab"
              aria-selected={activeCategory === category.id}
              aria-controls="proof-active-panel"
              onClick={() => changeCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        <section
          className="proof-gallery__panel"
          id="proof-active-panel"
          role="tabpanel"
          aria-labelledby={`proof-tab-${activeCategory}`}
        >
          <div
            className="proof-gallery__stage"
            style={{ "--proof-drag": `${String(dragOffset)}px` } as CSSProperties}
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={pointerEnd}
            onPointerCancel={pointerEnd}
          >
            {rendered.map((asset) => (
              <ProofFigure asset={asset} position={positionFor(asset)} key={asset.id} />
            ))}
          </div>

          <div className="proof-gallery__controls">
            <button
              type="button"
              onClick={() => interact(activeIndex - 1)}
              aria-label={`Imagem anterior de ${proofCategories.find((item) => item.id === activeCategory)?.label ?? "resultados"}`}
            >
              <Arrow direction="left" />
            </button>
            <span aria-live="polite">
              {String(activeIndex + 1).padStart(2, "0")} / {String(categoryAssets.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => interact(activeIndex + 1)}
              aria-label={`Próxima imagem de ${proofCategories.find((item) => item.id === activeCategory)?.label ?? "resultados"}`}
            >
              <Arrow direction="right" />
            </button>
          </div>
          <div className="proof-gallery__progress" aria-hidden="true">
            <span key={`${activeCategory}-${String(activeIndex)}`} />
          </div>
        </section>
      </div>

      <div className="proof-stories__disclaimer section-shell">
        <strong>{proofAuthorization.disclaimer}</strong>
        <span>As séries não informam pessoa, período ou duração.</span>
      </div>

      {commercialNavigationReady ? (
        <div className="proof-stories__action section-shell">
          <a className="button button--primary" href="#ofertas">Ver opções do CeluClin</a>
        </div>
      ) : null}
    </section>
  );
}
