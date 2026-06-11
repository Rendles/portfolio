"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { useApp } from "@/providers/AppProviders";
import { getMode } from "@/modes/registry";
import { ModePlaceholder } from "@/modes/ModePlaceholder";

// HYPERMODE использует WebGL → рендерим только на клиенте.
const HyperMode = dynamic(
  () => import("@/modes/hyper/HyperMode").then((m) => m.HyperMode),
  { ssr: false }
);
const BrutalMode = dynamic(() =>
  import("@/modes/brutal/BrutalMode").then((m) => m.BrutalMode)
);
const MinimalMode = dynamic(() =>
  import("@/modes/minimal/MinimalMode").then((m) => m.MinimalMode)
);
// Arcade использует эффект печати + живые часы → только на клиенте (избегаем гидрации).
const ArcadeMode = dynamic(
  () => import("@/modes/arcade/ArcadeMode").then((m) => m.ArcadeMode),
  { ssr: false }
);
const GlassMode = dynamic(() =>
  import("@/modes/glass/GlassMode").then((m) => m.GlassMode)
);

export default function Page() {
  const { mode } = useApp();
  const meta = getMode(mode);

  return (
    <AnimatePresence mode="wait">
      {/* Только opacity: filter/transform создают containing block и ломают
          position:fixed (курсор и шейдерный фон «прибиваются» к обёртке). */}
      <motion.div
        key={mode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {mode === "hyper" ? (
          <HyperMode />
        ) : mode === "brutal" ? (
          <BrutalMode />
        ) : mode === "minimal" ? (
          <MinimalMode />
        ) : mode === "arcade" ? (
          <ArcadeMode />
        ) : mode === "glass" ? (
          <GlassMode />
        ) : (
          <ModePlaceholder meta={meta} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
