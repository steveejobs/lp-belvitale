import {
  useRef,
  type PointerEvent,
  type PointerEventHandler,
  type RefObject,
} from "react";
import { useReducedMotion } from "./useReducedMotion";

interface PointerMotionOptions {
  readonly propertyX: `--${string}`;
  readonly propertyY: `--${string}`;
  readonly maxX?: number;
  readonly maxY?: number;
  readonly output?: "offset" | "position";
}

interface PointerMotionBindings<T extends HTMLElement> {
  readonly ref: RefObject<T | null>;
  readonly onPointerMove: PointerEventHandler<T>;
  readonly onPointerLeave: PointerEventHandler<T>;
  readonly onPointerCancel: PointerEventHandler<T>;
}

function clampRatio(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function usePointerMotion<T extends HTMLElement>({
  propertyX,
  propertyY,
  maxX = 8,
  maxY = 6,
  output = "offset",
}: PointerMotionOptions): PointerMotionBindings<T> {
  const ref = useRef<T>(null);
  const reducedMotion = useReducedMotion();

  function reset(element: T | null) {
    if (element === null) return;
    element.style.setProperty(propertyX, output === "position" ? "50%" : "0px");
    element.style.setProperty(propertyY, output === "position" ? "50%" : "0px");
  }

  function move(event: PointerEvent<T>) {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratioX = clampRatio((event.clientX - bounds.left) / bounds.width);
    const ratioY = clampRatio((event.clientY - bounds.top) / bounds.height);
    const x = output === "position" ? `${String(ratioX * 100)}%` : `${String((ratioX - 0.5) * maxX)}px`;
    const y = output === "position" ? `${String(ratioY * 100)}%` : `${String((ratioY - 0.5) * maxY)}px`;
    event.currentTarget.style.setProperty(propertyX, x);
    event.currentTarget.style.setProperty(propertyY, y);
  }

  function leave(event: PointerEvent<T>) {
    reset(event.currentTarget);
  }

  return {
    ref,
    onPointerMove: move,
    onPointerLeave: leave,
    onPointerCancel: leave,
  };
}
