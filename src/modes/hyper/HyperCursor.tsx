"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

// Кастомный курсор: лаймовый диск с mix-blend-difference, увеличивается на интерактиве.
export function HyperCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const scale = useMotionValue(1);

  const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.4 });
  const sScale = useSpring(scale, { stiffness: 300, damping: 22 });

  useEffect(() => {
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement;
      scale.set(el.closest("a, button, [data-cursor]") ? 2.8 : 1);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [x, y, scale]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[10000] hidden md:block"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        style={{ scale: sScale }}
        className="-ml-2.5 -mt-2.5 size-5 rounded-full bg-[#c6ff3a] mix-blend-difference"
      />
    </motion.div>
  );
}
