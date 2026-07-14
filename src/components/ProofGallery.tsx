import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  proofAssets,
  proofCategories,
  type ProofAsset,
  type ProofCategoryId,
} from "../data/proofGallery";
import { useReducedMotion } from "../hooks/useReducedMotion";

type ImageState = "idle" | "loading" | "loaded" | "missing" | "error";
type Direction = "previous" | "next";
type SimulatedAssetState = "empty" | "missing" | "error" | null;

const invalidImageData = "data:image/webp;base64,AAAA";

function getSimulatedAssetState(): SimulatedAssetState {
  if (!import.meta.env.DEV) return null;

  const value = new URLSearchParams(window.location.search).get("asset-state");
  if (value === "empty" || value === "missing" || value === "error") {
    return value;
  }

  return null;
}

interface GalleryMediaProps {
  readonly item: ProofAsset;
  readonly enabled: boolean;
  readonly active: boolean;
  readonly thumbnail?: boolean;
}

function GalleryMedia({
  item,
  enabled,
  active,
  thumbnail = false,
}: GalleryMediaProps) {
  const source = enabled ? item.src : null;
  const [resolution, setResolution] = useState<{
    readonly source: string;
    readonly status: "loaded" | "error";
  } | null>(null);
  const status: ImageState = !enabled
    ? "idle"
    : source === null
      ? "missing"
      : resolution?.source === source
        ? resolution.status
        : "loading";

  return (
    <div
      className={`gallery-media${thumbnail ? " gallery-media--thumbnail" : ""}`}
      data-image-state={status}
      aria-live={active && !thumbnail ? "polite" : "off"}
    >
      {source !== null ? (
        <img
          className="gallery-media__image"
          src={source}
          width={item.width}
          height={item.height}
          sizes={thumbnail ? "160px" : "(min-width: 896px) 760px, 86vw"}
          loading="lazy"
          decoding="async"
          draggable={false}
          alt={active && !thumbnail ? item.alt : ""}
          onLoad={() => setResolution({ source, status: "loaded" })}
          onError={() => setResolution({ source, status: "error" })}
        />
      ) : null}

      {status === "loading" && !thumbnail ? (
        <span className="gallery-media__message gallery-media__message--loading">
          Carregando imagem…
        </span>
      ) : null}
      {status === "missing" ? (
        <span className="gallery-media__message">Imagem ausente no acervo.</span>
      ) : null}
      {status === "error" ? (
        <span className="gallery-media__message">
          Não foi possível carregar esta imagem.
        </span>
      ) : null}
      {status === "loaded" && active && !thumbnail ? (
        <span className="sr-only">Imagem carregada.</span>
      ) : null}

      {!thumbnail && item.verificationStatus === "pending" ? (
        <span className="gallery-media__lock">
          Publicação bloqueada — autorização pendente
        </span>
      ) : null}
    </div>
  );
}

function Chevron({ direction }: { readonly direction: Direction }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <path
        d={direction === "previous" ? "m14.5 5-7 7 7 7" : "m9.5 5 7 7-7 7"}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function ProofGallery() {
  const [activeCategory, setActiveCategory] =
    useState<ProofCategoryId>("cellulite");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>("next");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const simulatedState = getSimulatedAssetState();

  const items = useMemo(() => {
    const categoryItems = proofAssets.filter(
      (item) => item.category === activeCategory,
    );

    if (simulatedState === "empty") return [];
    if (categoryItems.length === 0) return categoryItems;

    return categoryItems.map((item, index) => {
      if (index !== 0) return item;
      if (simulatedState === "missing") return { ...item, src: null };
      if (simulatedState === "error") {
        return { ...item, src: invalidImageData };
      }
      return item;
    });
  }, [activeCategory, simulatedState]);

  const currentItem = items[currentIndex] ?? null;
  const activeCategoryLabel =
    proofCategories.find((category) => category.id === activeCategory)?.label ??
    "Categoria";

  useEffect(
    () => () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    },
    [],
  );

  function updateIndex(nextIndex: number) {
    const boundedIndex = Math.max(0, Math.min(nextIndex, items.length - 1));
    setDirection(boundedIndex < currentIndex ? "previous" : "next");
    setCurrentIndex(boundedIndex);
  }

  function selectCategory(category: ProofCategoryId) {
    setActiveCategory(category);
    setCurrentIndex(0);
    setDirection("next");
    scrollerRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }

  function scrollToIndex(nextIndex: number) {
    updateIndex(nextIndex);
    const scroller = scrollerRef.current;
    if (scroller === null) return;

    const slides = Array.from(
      scroller.querySelectorAll<HTMLElement>("[data-slide-index]"),
    );
    const firstSlide = slides[0];
    const targetSlide = slides[nextIndex];
    if (firstSlide === undefined || targetSlide === undefined) return;

    scroller.scrollTo({
      left: targetSlide.offsetLeft - firstSlide.offsetLeft,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  function move(directionToMove: Direction) {
    scrollToIndex(
      currentIndex + (directionToMove === "previous" ? -1 : 1),
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft" && currentIndex > 0) {
      event.preventDefault();
      move("previous");
    }
    if (event.key === "ArrowRight" && currentIndex < items.length - 1) {
      event.preventDefault();
      move("next");
    }
  }

  function handleNativeScroll() {
    if (scrollFrameRef.current !== null) {
      window.cancelAnimationFrame(scrollFrameRef.current);
    }

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      const scroller = scrollerRef.current;
      if (scroller === null) return;

      const slides = Array.from(
        scroller.querySelectorAll<HTMLElement>("[data-slide-index]"),
      );
      const firstSlide = slides[0];
      if (firstSlide === undefined) return;

      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      for (const [index, slide] of slides.entries()) {
        const target = slide.offsetLeft - firstSlide.offsetLeft;
        const distance = Math.abs(target - scroller.scrollLeft);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      }

      if (closestIndex !== currentIndex) updateIndex(closestIndex);
    });
  }

  const thumbnailIndexes = [currentIndex - 1, currentIndex + 1].filter(
    (index) => index >= 0 && index < items.length,
  );
  const progress =
    items.length === 0 ? 0 : ((currentIndex + 1) / items.length) * 100;

  return (
    <section
      className="proof-gallery"
      aria-labelledby="proof-gallery-title"
      aria-describedby="proof-gallery-description"
    >
      <div className="section-shell">
        <div className="section-heading section-heading--gallery">
          <p className="eyebrow">Acervo em validação</p>
          <h2 id="proof-gallery-title">
            Histórias que merecem ser vistas com contexto
          </h2>
          <p id="proof-gallery-description">
            Cada experiência é individual. Esta área será publicada somente com
            registros reais, autorização e contexto confirmado.
          </p>
        </div>

        <p className="publication-status" role="status">
          <span aria-hidden="true" className="publication-status__dot" />
          Visualização interna — publicação bloqueada
        </p>

        <div className="gallery-filters" aria-label="Categorias da galeria">
          {proofCategories.map((category) => (
            <button
              className="gallery-filter"
              data-active={category.id === activeCategory}
              type="button"
              aria-pressed={category.id === activeCategory}
              key={category.id}
              onClick={() => selectCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="gallery-empty" role="status">
            <p>Nenhuma imagem disponível nesta categoria.</p>
            <span>O espaço permanece reservado até a validação do acervo.</span>
          </div>
        ) : (
          <>
            <div
              className="gallery-mobile"
              ref={scrollerRef}
              tabIndex={0}
              aria-label={`Galeria de ${activeCategoryLabel}. Use gestos ou as setas para navegar.`}
              onKeyDown={handleKeyDown}
              onScroll={handleNativeScroll}
            >
              <ol className="gallery-mobile__track">
                {items.map((item, index) => (
                  <li
                    className="gallery-mobile__slide"
                    data-active={index === currentIndex}
                    data-slide-index={index}
                    aria-current={index === currentIndex ? "true" : undefined}
                    key={item.id}
                  >
                    <GalleryMedia
                      item={item}
                      enabled={Math.abs(index - currentIndex) <= 1}
                      active={index === currentIndex}
                    />
                  </li>
                ))}
              </ol>
            </div>

            <div
              className="gallery-desktop"
              tabIndex={0}
              aria-label={`Galeria de ${activeCategoryLabel}. Use as setas do teclado para navegar.`}
              onKeyDown={handleKeyDown}
            >
              <div
                className="gallery-desktop__main"
                data-direction={direction}
                key={currentItem?.id}
              >
                {currentItem === null ? null : (
                  <GalleryMedia item={currentItem} enabled active />
                )}
              </div>

              <div className="gallery-desktop__thumbnails" aria-label="Imagens próximas">
                {thumbnailIndexes.map((index) => {
                  const item = items[index];
                  if (item === undefined) return null;
                  return (
                    <button
                      className="gallery-thumbnail"
                      type="button"
                      aria-label={`Ir para imagem ${String(index + 1)} de ${String(items.length)}`}
                      key={item.id}
                      onClick={() => scrollToIndex(index)}
                    >
                      <GalleryMedia
                        item={item}
                        enabled
                        active={false}
                        thumbnail
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="gallery-navigation">
              <div className="gallery-navigation__buttons">
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Imagem anterior"
                  disabled={currentIndex === 0}
                  onClick={() => move("previous")}
                >
                  <Chevron direction="previous" />
                </button>
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Próxima imagem"
                  disabled={currentIndex === items.length - 1}
                  onClick={() => move("next")}
                >
                  <Chevron direction="next" />
                </button>
              </div>

              <p className="gallery-counter" aria-live="polite">
                <span className="sr-only">Imagem </span>
                {currentIndex + 1} / {items.length}
              </p>

              <div
                className="gallery-progress"
                role="progressbar"
                aria-label="Progresso da galeria"
                aria-valuemin={1}
                aria-valuemax={items.length}
                aria-valuenow={currentIndex + 1}
              >
                <span style={{ width: `${String(progress)}%` }} />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
