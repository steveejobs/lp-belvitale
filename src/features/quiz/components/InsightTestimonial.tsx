import { useEffect, useRef, useState } from "react";
import type { InsightTestimonialProof } from "../content/insights";

export function InsightTestimonial({ proof }: { readonly proof: InsightTestimonialProof }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog !== null && !dialog.open) dialog.showModal();
  }, [open]);

  return (
    <aside className="q7-insight-proof" aria-label="Conversa fornecida pela marca">
      <div className="q7-insight-proof__eyebrow"><b>Na conversa com a marca</b></div>
      {proof.excerpt === undefined ? null : <blockquote>“{proof.excerpt}”</blockquote>}
      <p className="q7-insight-proof__context">Trecho do material fornecido pela Belvitale. Experiência individual, sem garantia de resultado.</p>
      <button type="button" onClick={() => setOpen(true)} aria-label="Abrir depoimento completo">
        <img
          src={proof.src}
          width={proof.width}
          height={proof.height}
          style={{ objectPosition: proof.position }}
          alt="Prévia de uma conversa enviada por uma cliente à Belvitale"
          loading="lazy"
          decoding="async"
        />
        <span><b>Ver relato completo</b><i aria-hidden="true">→</i></span>
      </button>

      <dialog
        ref={dialogRef}
        className="q7-insight-proof__dialog"
        aria-label="Conversa completa fornecida pela Belvitale"
        onClose={() => setOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}
      >
        <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Fechar depoimento">×</button>
        {open ? <img src={proof.src} width={proof.width} height={proof.height} alt="Conversa completa enviada por uma cliente à Belvitale" /> : null}
        <p>Relato individual fornecido pela marca. Experiências variam e não representam garantia de resultado.</p>
      </dialog>
    </aside>
  );
}
