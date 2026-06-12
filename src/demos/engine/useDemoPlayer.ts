"use client";

// Проигрыватель сценария: двигает курсор по шагам, зациклен.
// Координаты считаются относительно контейнера на каждом шаге —
// сценарий переживает ресайзы и адаптивную раскладку сцены.
import { useEffect, useRef, useState, type RefObject } from "react";
import type { DemoScenario } from "./types";

const SETTLE = { move: 750, click: 650, action: 450 } as const;

export type CursorState = {
  pos: { x: number; y: number } | null;
  pulse: number; // инкремент на каждый клик — ключ для анимации кольца
};

export function useDemoPlayer(
  containerRef: RefObject<HTMLElement | null>,
  steps: DemoScenario,
  onAction: (action: string) => void,
  playing: boolean
): CursorState {
  const [pos, setPos] = useState<CursorState["pos"]>(null);
  const [pulse, setPulse] = useState(0);
  const indexRef = useRef(0);
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;

  useEffect(() => {
    if (!playing || steps.length === 0) return;
    let cancelled = false;
    let timer = 0;

    const run = () => {
      if (cancelled) return;
      const step = steps[indexRef.current % steps.length];
      indexRef.current += 1;
      let settle: number;

      switch (step.type) {
        case "move": {
          const cont = containerRef.current;
          const el = cont?.querySelector(`[data-demo="${step.target}"]`);
          if (cont && el) {
            const c = cont.getBoundingClientRect();
            const r = el.getBoundingClientRect();
            setPos({
              x: r.left - c.left + r.width / 2,
              y: r.top - c.top + r.height / 2,
            });
          }
          settle = step.settle ?? SETTLE.move;
          break;
        }
        case "click": {
          setPulse((p) => p + 1);
          if (step.action) onActionRef.current(step.action);
          settle = step.settle ?? SETTLE.click;
          break;
        }
        case "action": {
          onActionRef.current(step.action);
          settle = step.settle ?? SETTLE.action;
          break;
        }
        case "wait": {
          settle = step.ms;
          break;
        }
      }

      timer = window.setTimeout(run, settle);
    };

    timer = window.setTimeout(run, 500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [playing, steps, containerRef]);

  return { pos, pulse };
}
