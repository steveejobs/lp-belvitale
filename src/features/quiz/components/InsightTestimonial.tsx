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
    <aside className="q7-insight-proof" aria-label="Depoimento de cliente">
      <div className="q7-insight-proof__eyebrow"><span aria-hidden="true" /><b>Relato relacionado</b><small>selecionado para esta leitura</small></div>
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
        <span><b>Toque para ler</b><i aria-hidden="true">↗</i></span>
      </button>

      <dialog
        ref={dialogRef}
        className="q7-insight-proof__dialog"
        onClose={() => setOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}
      >
        <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Fechar depoimento">×</button>
        <img src={proof.src} width={proof.width} height={proof.height} alt="Conversa completa enviada por uma cliente à Belvitale" />
        <p>Relato individual fornecido pela marca. Experiências variam e não representam garantia de resultado.</p>
      </dialog>
    </aside>
  );
}
