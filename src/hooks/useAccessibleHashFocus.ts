import { useEffect } from "react";

export function useAccessibleHashFocus() {
  useEffect(() => {
    const focusTarget = (hash: string) => {
      if (hash.length < 2) return;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target === null) return;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      window.requestAnimationFrame(() => target.focus({ preventScroll: true }));
    };

    const handleClick = (event: MouseEvent) => {
      const origin = event.target;
      if (!(origin instanceof Element)) return;
      const anchor = origin.closest<HTMLAnchorElement>('a[href^="#"]');
      if (anchor === null) return;
      window.setTimeout(() => focusTarget(anchor.hash), 0);
    };
    const handleHashChange = () => focusTarget(window.location.hash);

    document.addEventListener("click", handleClick);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);
}
