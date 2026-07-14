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

type LabelImageState = "loading" | "loaded" | "error";

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
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
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null || !open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [open]);

  useEffect(() => {
    if (wasOpenRef.current && !open) triggerRef.current?.focus();
    wasOpenRef.current = open;
  }, [open, triggerRef]);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) onClose();
  }

  return (
    <dialog
      className="label-modal"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="label-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={handleBackdropClick}
    >
      <div className="label-modal__content">
        <h3 id="label-modal-title" className="sr-only">
          Rótulo completo do CeluClin
        </h3>
        <button
          className="label-modal__close"
          ref={closeButtonRef}
          type="button"
          aria-label="Fechar rótulo ampliado"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
        <div className="label-modal__image-viewport">
          <img
            src={labelImage}
            width="1310"
            height="621"
            alt="Arte plana completa do rótulo do suplemento alimentar CeluClin"
            draggable={false}
          />
        </div>
      </div>
    </dialog>
  );
}

export function LabelTransparency() {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageState, setImageState] = useState<LabelImageState>("loading");
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (section === null) return;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      const frame = window.requestAnimationFrame(() => setRevealed(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.55 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const closeModal = useCallback(() => setModalOpen(false), []);

  return (
    <section
      id="rotulo"
      className="label-transparency"
      ref={sectionRef}
      data-revealed={revealed}
      aria-labelledby="label-section-title"
    >
      <div className="section-shell label-transparency__layout">
        <div className="section-heading section-heading--label">
          <p className="eyebrow">Transparência de ponta a ponta</p>
          <h2 id="label-section-title">
            Nada escondido. Leia exatamente o que você está levando.
          </h2>
          <p>
            Veja o rótulo original e confira as informações da embalagem com
            calma.
          </p>
        </div>

        <div
          className="label-artwork"
          data-state={imageState}
          aria-live="polite"
        >
          <img
            src={labelImage}
            width="1310"
            height="621"
            sizes="(min-width: 1200px) 1100px, (min-width: 720px) 90vw, calc(100vw - 32px)"
            loading={import.meta.env.DEV ? "lazy" : "eager"}
            decoding="async"
            alt="Arte plana completa do rótulo do suplemento alimentar CeluClin"
            onLoad={() => setImageState("loaded")}
            onError={() => setImageState("error")}
          />
          {imageState === "loading" ? (
            <span className="label-artwork__state">Carregando rótulo…</span>
          ) : null}
          {imageState === "loaded" ? (
            <span className="sr-only">Rótulo carregado.</span>
          ) : null}
          {imageState === "error" ? (
            <span className="label-artwork__state">
              Não foi possível carregar o rótulo.
            </span>
          ) : null}
        </div>

        <div className="label-actions">
          <button
            className="button button--primary"
            ref={triggerRef}
            type="button"
            disabled={imageState === "error"}
            onClick={() => setModalOpen(true)}
          >
            Ampliar rótulo
          </button>
          <a
            className="button button--secondary"
            href={labelPdf}
            download="celuclin-rotulo-completo.pdf"
            type="application/pdf"
          >
            Baixar rótulo completo
          </a>
        </div>

        <p className="label-note">
          Arte plana original da embalagem. O arquivo não representa um frasco.
        </p>
      </div>

      <LabelModal
        open={modalOpen}
        onClose={closeModal}
        triggerRef={triggerRef}
      />
    </section>
  );
}
