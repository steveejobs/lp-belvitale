import { useEffect, useRef, useState } from "react";
import { calculatePromotionTime } from "./timer.machine";

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const remaining = seconds % 60;
  return [hours, minutes, remaining].map((value) => String(value).padStart(2, "0")).join(":");
}

interface PromotionTimerProps {
  readonly expiresAt: string;
  readonly serverNow: number;
  readonly onExpired: () => void;
  readonly onFiveMinutes?: () => void;
  readonly onOneMinute?: () => void;
}

export function PromotionTimer({
  expiresAt,
  serverNow,
  onExpired,
  onFiveMinutes,
  onOneMinute,
}: PromotionTimerProps) {
  const [time, setTime] = useState(() => calculatePromotionTime(expiresAt, serverNow));
  const fired = useRef(new Set<string>());

  useEffect(() => {
    const offset = serverNow - Date.now();
    const update = () => setTime(calculatePromotionTime(expiresAt, Date.now() + offset));
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt, serverNow]);

  useEffect(() => {
    if (time.secondsRemaining <= 300 && time.secondsRemaining > 60 && !fired.current.has("5m")) {
      fired.current.add("5m");
      onFiveMinutes?.();
    }
    if (time.secondsRemaining <= 60 && time.secondsRemaining > 0 && !fired.current.has("1m")) {
      fired.current.add("1m");
      onOneMinute?.();
    }
    if (time.state === "expired" && !fired.current.has("expired")) {
      fired.current.add("expired");
      onExpired();
    }
  }, [onExpired, onFiveMinutes, onOneMinute, time]);

  return (
    <section className="quiz-timer" data-state={time.state} aria-label="Validade da condição">
      <span>Esta condição fica reservada por:</span>
      <strong aria-hidden="true">{formatTime(time.secondsRemaining)}</strong>
      <span className="sr-only" aria-live="polite">
        {time.state === "expired" ? "Condição expirada." : "Condição ainda disponível."}
      </span>
    </section>
  );
}
