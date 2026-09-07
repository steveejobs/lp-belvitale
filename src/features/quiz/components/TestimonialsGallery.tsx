import { useEffect, useMemo, useRef, useState } from "react";
import { quizTestimonials, type QuizTestimonial } from "../content/testimonials";

const ITEMS_PER_PAGE = 6;
const AUTOPLAY_MS = 6200;

export function TestimonialsGallery() {
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<QuizTestimonial | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pageCount = Math.ceil(quizTestimonials.length / ITEMS_PER_PAGE);
  const visible = useMemo(
    () => quizTestimonials.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE),
    [page],
  );

  useEffect(() => {
    if (paused || selected !== null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setPage((value) => (value + 1) % pageCount), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [pageCount, paused, selected]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (selected !== null && dialog !== null && !dialog.open) dialog.showModal();
  }, [selected]);

  const move = (delta: number) => {
    setPaused(true);
    setPage((value) => (value + delta + pageCount) % pageCount);
  };

  return (
    <section
      className="q7-testimonials"
      aria-labelledby="q7-testimonials-title"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
    >
      <header className="q7-testimonials__heading">
        <div>
          <p className="q7-step-label">Conversas que chegaram até a Belvitale</p>
          <h2 id="q7-testimonials-title">Antes de acreditar em uma promessa, veja o que outras mulheres decidiram contar.</h2>
        </div>
        <p>São 42 conversas únicas, preservadas em formato de print. Toque em qualquer uma para ler sem pressa.</p>
      </header>

      <div className="q7-testimonials__stage" aria-live="polite">
        <div className="q7-testimonials__grid" key={page}>
          {visible.map((testimonial, index) => (
            <button
              className="q7-testimonial-card"
              type="button"
              key={testimonial.id}
              onClick={() => setSelected(testimonial)}
              aria-label={`Abrir conversa ${String(page * ITEMS_PER_PAGE + index + 1)} de ${String(quizTestimonials.length)}`}
            >
              <img
                src={testimonial.src}
                width={testimonial.width}
                height={testimonial.height}
                alt="Captura de uma conversa de cliente enviada à Belvitale"
                loading="lazy"
                decoding="async"
              />
              <span><b>Relato enviado</b><small>toque para ampliar</small></span>
            </button>
          ))}
        </div>
      </div>

      <div className="q7-testimonials__controls">
        <button type="button" onClick={() => move(-1)} aria-label="Ver conversas anteriores">←</button>
        <div className="q7-testimonials__pages" aria-label={`Grupo ${String(page + 1)} de ${String(pageCount)}`}>
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              type="button"
              key={index}
              data-current={index === page}
              onClick={() => { setPaused(true); setPage(index); }}
              aria-label={`Ver grupo ${String(index + 1)}`}
              aria-current={index === page ? "true" : undefined}
            />
          ))}
        </div>
        <span>{String(page + 1).padStart(2, "0")} / {String(pageCount).padStart(2, "0")}</span>
        <button type="button" onClick={() => move(1)} aria-label="Ver próximas conversas">→</button>
      </div>

      <p className="q7-testimonials__note">Relatos individuais fornecidos pela marca. Experiências variam e não representam garantia de resultado.</p>

      <dialog
        ref={dialogRef}
        className="q7-testimonial-dialog"
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <button className="q7-testimonial-dialog__close" type="button" onClick={() => dialogRef.current?.close()} aria-label="Fechar conversa">×</button>
        {selected === null ? null : (
          <img src={selected.src} width={selected.width} height={selected.height} alt="Captura ampliada de uma conversa de cliente enviada à Belvitale" />
        )}
      </dialog>
    </section>
  );
}
