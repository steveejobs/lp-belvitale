import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { recordHomeEvent } from "../analytics/homeEvents";
import type { ProofAsset, ProofCategory } from "../data/proofGallery";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { ArrowIcon } from "./ui/ArrowIcon";
import { Reveal } from "./ui/Reveal";

const autoplayDelay = 5200;
const resumeDelay = 3200;

interface ProofFigureProps {
  readonly asset: ProofAsset;
  readonly position: "previous" | "current" | "next";
}

interface ProofCategoryGalleryProps {
  readonly category: ProofCategory;
  readonly assets: readonly ProofAsset[];
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

export function ProofCategoryGallery({ category, assets }: ProofCategoryGalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const swipeCommittedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const reducedMotion = useReducedMotion();

  const selectAsset = useCallback(
    (index: number) => {
      const normalized = (index + assets.length) % assets.length;
      setActiveIndex(normalized);
    },
    [assets.length],
  );

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
      selectAsset(nextIndex);
      recordHomeEvent("proof_interaction", { proofCategory: category.id });
      resumeAfterInteraction();
    },
    [category.id, pauseForInteraction, resumeAfterInteraction, selectAsset],
  );

  useEffect(() => {
    const gallery = galleryRef.current;
    if (gallery === null || !("IntersectionObserver" in window)) {
      setGalleryVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setGalleryVisible(entry?.isIntersecting ?? false),
      { threshold: 0.3 },
    );
    observer.observe(gallery);
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
      assets.length < 2
    ) return;

    const timer = window.setTimeout(() => selectAsset(activeIndex + 1), autoplayDelay);
    return () => window.clearTimeout(timer);
  }, [
    activeIndex,
    assets.length,
    dragging,
    focusWithin,
    galleryVisible,
    hovered,
    interactionPaused,
    pageVisible,
    reducedMotion,
    selectAsset,
  ]);

  useEffect(
    () => () => {
      if (resumeTimerRef.current !== null) window.clearTimeout(resumeTimerRef.current);
    },
    [],
  );

  const previousIndex = (activeIndex - 1 + assets.length) % assets.length;
  const nextIndex = (activeIndex + 1) % assets.length;
  const rendered = assets.filter((_, index) =>
    new Set([previousIndex, activeIndex, nextIndex]).has(index),
  );

  function positionFor(asset: ProofAsset): ProofFigureProps["position"] {
    const index = assets.indexOf(asset);
    if (index === activeIndex) return "current";
    if (index === previousIndex && previousIndex !== nextIndex) return "previous";
    return "next";
  }

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    pointerRef.current = { x: event.clientX, y: event.clientY };
    swipeCommittedRef.current = false;
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
    if (!swipeCommittedRef.current && Math.abs(horizontal) >= 44 && Math.abs(horizontal) > Math.abs(vertical) * 1.15) {
      swipeCommittedRef.current = true;
      selectAsset(activeIndex + (horizontal < 0 ? 1 : -1));
    }
  }

  function pointerEnd(event: PointerEvent<HTMLDivElement>) {
    const horizontal = event.clientX - pointerRef.current.x;
    const vertical = event.clientY - pointerRef.current.y;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragOffset(0);
    setDragging(false);
    if (!swipeCommittedRef.current && Math.abs(horizontal) >= 44 && Math.abs(horizontal) > Math.abs(vertical) * 1.15) {
      selectAsset(activeIndex + (horizontal < 0 ? 1 : -1));
    }
    resumeAfterInteraction();
  }

  const autoplayActive =
    !reducedMotion &&
    galleryVisible &&
    pageVisible &&
    !interactionPaused &&
    !hovered &&
    !focusWithin &&
    !dragging;
  const stageStyle = {
    "--proof-drag": `${String(dragOffset)}px`,
  } as CSSProperties;

  return (
    <section
      className="proof-category"
      id={`resultados-${category.id}`}
      data-proof-category={category.id}
      aria-labelledby={`proof-title-${category.id}`}
    >
      <header className="proof-category__intro">
        <h3 id={`proof-title-${category.id}`}>{category.label}</h3>
        <p>{assets.length} imagens autorizadas</p>
      </header>

      <Reveal effect="scale">
        <div
          className="proof-gallery"
          ref={galleryRef}
          data-category={category.id}
          data-active-index={activeIndex}
          data-autoplay={autoplayActive}
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
        <div className="proof-gallery__meta">
          <strong>{category.label}</strong>
          <span>
            {String(activeIndex + 1).padStart(2, "0")} / {String(assets.length).padStart(2, "0")}
          </span>
        </div>

        <div
          className="proof-gallery__stage"
          style={stageStyle}
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
            aria-label={`Imagem anterior de ${category.label}`}
          >
            <ArrowIcon direction="left" />
          </button>
          <div className="proof-gallery__dots" role="group" aria-label={`Escolher imagem de ${category.label}`}>
            {assets.map((asset, index) => (
              <button
                key={asset.id}
                type="button"
                className="proof-gallery__dot"
                aria-label={`Ver imagem ${String(index + 1)} de ${String(assets.length)} de ${category.label}`}
                aria-pressed={index === activeIndex}
                onClick={() => interact(index)}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
          <span className="sr-only" aria-live="polite">
            Imagem {activeIndex + 1} de {assets.length} de {category.label}
          </span>
          <button
            type="button"
            onClick={() => interact(activeIndex + 1)}
            aria-label={`Próxima imagem de ${category.label}`}
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
        <div className="proof-gallery__progress" aria-hidden="true">
          <span key={`${category.id}-${String(activeIndex)}`} />
        </div>
        </div>
      </Reveal>
    </section>
  );
}
