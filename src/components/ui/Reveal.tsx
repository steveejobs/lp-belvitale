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
}

export function Reveal({
  children,
  className = "",
  effect = "clip",
  delay = 0,
  style,
  ...props
}: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;

    const element = elementRef.current;
    if (element === null) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? false),
      { rootMargin: "-7% 0px -7%", threshold: 0.12 },
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
      data-visible={reducedMotion || visible}
      style={revealStyle}
    >
      {children}
    </div>
  );
}
