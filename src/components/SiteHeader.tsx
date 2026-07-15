import { useEffect, useRef, useState, type MouseEvent } from "react";
import { navigationItems } from "../config/site";
import { commercialNavigationReady } from "../data/commercialPreview";

function MenuIcon({ close = false }: { readonly close?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
      <path
        d={close ? "m6 6 12 12M18 6 6 18" : "M4 8h16M4 16h16"}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function DarkWordmark() {
  return (
    <span className="brand-wordmark brand-wordmark--dark" aria-hidden="true">
      <img
        src="/brand/belvitale-wordmark-dark.webp"
        width="496"
        height="369"
        alt=""
        decoding="async"
      />
    </span>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 16);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

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
          <DarkWordmark />
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

        <a
          className="site-header__desktop-cta"
          href={commercialNavigationReady ? "#ofertas" : "#rotulo"}
        >
          {commercialNavigationReady ? "Ver opções" : "Ver o rótulo"}
        </a>

        <div className="site-header__mobile-actions">
          <a href={commercialNavigationReady ? "#ofertas" : "#resultados"}>
            {commercialNavigationReady ? "Ver opções" : "Resultados"}
          </a>
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
        aria-label="belvitale"
        onCancel={(event) => {
          event.preventDefault();
          setMenuOpen(false);
        }}
        onClick={handleBackdrop}
      >
        <div className="mobile-menu__panel">
          <div className="mobile-menu__heading">
            <DarkWordmark />
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
            href={commercialNavigationReady ? "#ofertas" : "#rotulo"}
            onClick={() => setMenuOpen(false)}
          >
            {commercialNavigationReady ? "Ver opções" : "Ver o rótulo"}
          </a>
        </div>
      </dialog>
    </header>
  );
}
