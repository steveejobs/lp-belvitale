import { useEffect, useRef, useState, type MouseEvent } from "react";
import { navigationItems } from "../config/site";
import { quizPublicationApproved } from "../data/quizPublicationConfig";

function MenuIcon({ close = false }: { readonly close?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24">
      <path
        d={close ? "m6 6 12 12M18 6 6 18" : "M4 8h16M8 16h12"}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 16);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const quizAvailable =
    import.meta.env.DEV ||
    import.meta.env.VITE_INTERNAL_QUIZ === "true" ||
    quizPublicationApproved;

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null || !menuOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      if (dialog.open) dialog.close();
    };
  }, [menuOpen]);

  useEffect(() => {
    if (wasOpen.current && !menuOpen) menuButtonRef.current?.focus();
    wasOpen.current = menuOpen;
  }, [menuOpen]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 56rem)");
    const close = () => {
      if (query.matches) setMenuOpen(false);
    };
    query.addEventListener("change", close);
    return () => query.removeEventListener("change", close);
  }, []);

  function handleBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) setMenuOpen(false);
  }

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <div className="section-shell site-header__inner">
        <a className="site-wordmark" href="#inicio" aria-label="Belvitale — início">
          belvitale
        </a>

        <nav className="site-header__desktop-nav" aria-label="Navegação principal">
          <ul>
            {navigationItems.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <a className="site-header__desktop-cta" href={quizAvailable ? "/quiz" : "#resultados"}>
          {quizAvailable ? "Descobrir meu ritmo" : "Ver resultados"}
        </a>

        <div className="site-header__mobile-actions">
          <a href="#resultados">Resultados</a>
          <button
            ref={menuButtonRef}
            type="button"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      <dialog
        className="mobile-menu"
        id="menu-mobile"
        ref={dialogRef}
        aria-labelledby="mobile-menu-title"
        onCancel={(event) => {
          event.preventDefault();
          setMenuOpen(false);
        }}
        onClick={handleBackdrop}
      >
        <div className="mobile-menu__panel">
          <div className="mobile-menu__heading">
            <p id="mobile-menu-title">belvitale</p>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Fechar menu"
              onClick={() => setMenuOpen(false)}
            >
              <MenuIcon close />
            </button>
          </div>
          <nav aria-label="Navegação mobile">
            <ul>
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href} onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a
            className="button button--primary"
            href={quizAvailable ? "/quiz" : "#resultados"}
            onClick={() => setMenuOpen(false)}
          >
            {quizAvailable ? "Descobrir meu ritmo" : "Ver resultados"}
          </a>
        </div>
      </dialog>
    </header>
  );
}
