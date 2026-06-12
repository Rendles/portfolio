"use client";

// Сцена демо: контейнер с декорациями + курсор. Играет только в вьюпорте,
// уважает prefers-reduced-motion (тогда стоит статичный кадр без курсора).
// Контент полностью некликабелен — это «кино», не интерактив.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import type { DemoScenario } from "./types";
import { useDemoPlayer } from "./useDemoPlayer";
import { DemoCursor } from "./DemoCursor";

export function DemoStage({
  steps,
  onAction,
  className = "",
  children,
}: {
  steps: DemoScenario;
  onAction: (action: string) => void;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const reduced = useReducedMotion();
  const playing = inView && !reduced;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { pos, pulse } = useDemoPlayer(ref, steps, onAction, playing);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`relative overflow-hidden ${className}`}
    >
      <div className="pointer-events-none h-full w-full select-none">
        {children}
      </div>
      {pos && playing && <DemoCursor x={pos.x} y={pos.y} pulse={pulse} />}
    </div>
  );
}
