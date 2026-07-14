import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type RefObject,
} from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

const labelImage = "/label/celuclin-label-front.webp";
const labelPdf = "/label/celuclin-label-complete.pdf";
type ImageState = "loading" | "loaded" | "error";

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24">
      <path
        d="m6 6 12 12M18 6 6 18"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

interface LabelModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly triggerRef: RefObject<HTMLButtonElement | null>;
}

function LabelModal({ open, onClose, triggerRef }: LabelModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null || !open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [open]);

  useEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus();
    wasOpen.current = open;
  }, [open, triggerRef]);

  function closeFromBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) onClose();
  }

  return (
    <dialog
      className="label-modal"
      ref={dialogRef}
      aria-labelledby="label-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={closeFromBackdrop}
    >
      <div className="label-modal__content">
        <h3 className="sr-only" id="label-modal-title">
          Rótulo original ampliado do CeluClin
        </h3>
        <button
          className="label-modal__close"
          ref={closeRef}
          type="button"
          aria-label="Fechar rótulo ampliado"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
        <div className="label-modal__viewport">
          <img
            src={labelImage}
            width="1310"
            height="621"
            alt="Arte plana completa do rótulo do suplemento alimentar CeluClin"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </div>
      </div>
    </dialog>
  );
}

export function LabelTransparency() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageState, setImageState] = useState<ImageState>("loading");
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const focusFromHash = () => {
      if (window.location.hash !== "#rotulo") return;
      window.requestAnimationFrame(() =>
        titleRef.current?.focus({ preventScroll: true }),
      );
    };
    focusFromHash();
    window.addEventListener("hashchange", focusFromHash);
    return () => window.removeEventListener("hashchange", focusFromHash);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (section === null) return;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setRevealed(true);
        observer.disconnect();
      },
      { threshold: 0.25 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const closeModal = useCallback(() => setModalOpen(false), []);

  return (
    <section
      className="label-transparency"
      id="rotulo"
      ref={sectionRef}
      data-revealed={revealed}
      aria-labelledby="label-section-title"
    >
      <div className="section-shell label-transparency__heading">
        <p className="eyebrow">O objeto que conta tudo</p>
        <h2 id="label-section-title" ref={titleRef} tabIndex={-1}>
          O rótulo não é rodapé.
          <em>É parte da escolha.</em>
        </h2>
        <p>
          Abra, amplie e leia a arte plana original da embalagem com calma.
        </p>
      </div>

      <div className="label-roll" data-state={imageState}>
        <div className="label-roll__edge" aria-hidden="true" />
        <img
          src={labelImage}
          width="1310"
          height="621"
          sizes="(min-width: 75rem) 86rem, 140vw"
          loading="lazy"
          decoding="async"
          alt="Arte plana completa do rótulo do suplemento alimentar CeluClin"
          onLoad={() => setImageState("loaded")}
          onError={() => setImageState("error")}
        />
        {imageState === "loading" ? (
          <span className="label-roll__state">Abrindo o rótulo…</span>
        ) : null}
        {imageState === "error" ? (
          <span className="label-roll__state" role="status">
            A imagem não carregou. O PDF original continua disponível.
          </span>
        ) : null}
      </div>

      <div className="section-shell label-actions">
        <button
          className="button button--primary"
          ref={triggerRef}
          type="button"
          disabled={imageState === "error"}
          onClick={() => setModalOpen(true)}
        >
          Ampliar para ler
        </button>
        <a
          className="text-link"
          href={labelPdf}
          download="celuclin-rotulo-completo.pdf"
          type="application/pdf"
        >
          Abrir PDF completo
          <span aria-hidden="true">↗</span>
        </a>
        <p>Arte plana original da embalagem; não representa um frasco.</p>
      </div>

      <LabelModal
        open={modalOpen}
        onClose={closeModal}
        triggerRef={triggerRef}
      />
    </section>
  );
}
