import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

type RevealEffect = "clip" | "scale" | "slide-left" | "slide-right";

interface RevealProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  readonly children: ReactNode;
  readonly effect?: RevealEffect;
  readonly delay?: number;
  readonly stagger?: boolean;
}

export function Reveal({
  children,
  className = "",
  effect = "clip",
  delay = 0,
  stagger = false,
  style,
  ...props
}: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reducedMotion) return;

    const element = elementRef.current;
    if (element === null) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? false),
      { rootMargin: "0px 0px -9%", threshold: 0.08 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const revealStyle = {
    ...style,
    "--bv-reveal-delay": `${String(delay)}ms`,
  } as CSSProperties;

  return (
    <div
      {...props}
      ref={elementRef}
      className={`bv-reveal ${className}`.trim()}
      data-effect={effect}
      data-stagger={stagger}
      data-visible={reducedMotion || visible}
      style={revealStyle}
    >
      {children}
    </div>
  );
}
