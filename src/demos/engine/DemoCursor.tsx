"use client";

// Фейковый курсор: стрелка с пружинным движением + пульс-кольцо на клик.
import { motion } from "motion/react";

export function DemoCursor({
  x,
  y,
  pulse,
}: {
  x: number;
  y: number;
  pulse: number;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute left-0 top-0 z-20"
      initial={false}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 110, damping: 18, mass: 0.7 }}
    >
      {/* пульс-кольцо: перезапускается сменой key */}
      {pulse > 0 && (
        <motion.span
          key={pulse}
          className="absolute -left-3 -top-3 size-6 rounded-full border-2 border-white/80"
          initial={{ scale: 0.4, opacity: 0.9 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      )}
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        className="-translate-x-[3px] -translate-y-[2px] drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]"
      >
        <path
          d="M5.5 3.2 19 12.2l-6.2 1.1-3.2 5.5z"
          fill="#fff"
          stroke="#1a1a1a"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}
