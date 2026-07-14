import { useEffect, useRef, useState, type MouseEvent } from "react";
import { navigationItems } from "../config/site";

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
      <path
        d="m6 6 12 12M18 6 6 18"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 12);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null || !menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [menuOpen]);

  useEffect(() => {
    if (wasOpenRef.current && !menuOpen) menuButtonRef.current?.focus();
    wasOpenRef.current = menuOpen;
  }, [menuOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 56rem)");
    const closeOnDesktop = () => {
      if (desktopQuery.matches) setMenuOpen(false);
    };
    desktopQuery.addEventListener("change", closeOnDesktop);
    return () => desktopQuery.removeEventListener("change", closeOnDesktop);
  }, []);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) setMenuOpen(false);
  }

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <div className="site-header__inner">
        <a
          className="site-wordmark"
          href="#inicio"
          aria-label="Belvitale — início"
        >
          Belvitale
        </a>

        <nav
          className="site-header__desktop-nav"
          aria-label="Navegação principal"
        >
          <ul>
            {navigationItems.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <a className="site-header__desktop-cta" href="#celuclin">
          Conhecer o CeluClin
        </a>

        <div className="site-header__mobile-actions">
          <a
            className="site-header__mobile-cta"
            href="#celuclin"
            aria-label="Conhecer o CeluClin"
          >
            Conhecer
          </a>
          <button
            className="site-header__menu-button"
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
        onCancel={(event) => {
          event.preventDefault();
          setMenuOpen(false);
        }}
        onClick={handleBackdropClick}
      >
        <div className="mobile-menu__panel">
          <div className="mobile-menu__heading">
            <p id="mobile-menu-title">Belvitale</p>
            <button
              className="mobile-menu__close"
              ref={closeButtonRef}
              type="button"
              aria-label="Fechar menu"
              onClick={() => setMenuOpen(false)}
            >
              <CloseIcon />
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
            className="mobile-menu__cta"
            href="#celuclin"
            onClick={() => setMenuOpen(false)}
          >
            Conhecer o CeluClin
          </a>
        </div>
      </dialog>
    </header>
  );
}
