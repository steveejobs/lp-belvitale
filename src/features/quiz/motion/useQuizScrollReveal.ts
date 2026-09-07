import { useEffect, useRef, useState } from "react";

export function useQuizScrollReveal<ElementType extends HTMLElement>() {
  const ref = useRef<ElementType>(null);
  const [visible, setVisible] = useState(() => (
    typeof window !== "undefined" && (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    )
  ));

  useEffect(() => {
    const element = ref.current;
    if (element === null) return;
    if (visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? false),
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  return { ref, visible } as const;
}
