"use client";

import { motion } from "motion/react";
import { useApp } from "@/providers/AppProviders";
import type { ModeMeta } from "@/modes/registry";

// Стильная заглушка для ещё не собранных режимов (собираем по одному).
export function ModePlaceholder({ meta }: { meta: ModeMeta }) {
  const { locale } = useApp();
  const dark = meta.theme === "dark";

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{ background: dark ? "#0a0a0c" : "#f4f3ee", color: dark ? "#fff" : "#111" }}
    >
      <div
        className="pointer-events-none absolute -top-1/3 left-1/2 size-[80vmax] -translate-x-1/2 rounded-full opacity-30 blur-[120px]"
        style={{ background: meta.accent }}
      />
      <motion.span
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.25em]"
        style={{ borderColor: dark ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.15)" }}
      >
        <span className="size-2 rounded-full" style={{ background: meta.accent }} />
        {locale === "ru" ? "режим в сборке" : "mode in progress"}
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="relative text-[clamp(2.6rem,11vw,7rem)] font-bold leading-none"
        style={{ fontFamily: "var(--font-clash)" }}
      >
        {meta.name[locale]}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative mt-4 max-w-md text-lg opacity-60"
      >
        {meta.blurb[locale]}.{" "}
        {locale === "ru"
          ? "Этот дизайн-язык собираю следующим."
          : "Building this design language next."}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.35 }}
        className="relative mt-10 text-xs uppercase tracking-[0.3em] opacity-50"
      >
        {locale === "ru" ? "← вернись в HYPERMODE" : "← switch back to HYPERMODE"}
      </motion.p>
    </main>
  );
}
