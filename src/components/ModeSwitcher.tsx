"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useApp } from "@/providers/AppProviders";
import { MODES } from "@/modes/registry";
import { ui } from "@/lib/i18n";

export function ModeSwitcher() {
  const { mode, setMode, locale, toggleLocale } = useApp();
  const [open, setOpen] = useState(false);
  const active = MODES.find((m) => m.id === mode)!;

  return (
    <div className="fixed inset-x-0 bottom-5 z-[9999] flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-center gap-2">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="mb-1 w-[min(92vw,560px)] rounded-2xl border border-white/12 bg-black/72 p-2 backdrop-blur-2xl shadow-[0_20px_70px_-20px_rgba(0,0,0,0.8)]"
            >
              <p className="px-2 pt-1 pb-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
                {ui.switcher.hint[locale]}
              </p>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {MODES.map((m) => {
                  const isActive = m.id === mode;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setMode(m.id);
                        setOpen(false);
                      }}
                      className="group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors"
                      style={{
                        borderColor: isActive ? m.accent : "rgba(255,255,255,0.08)",
                        background: isActive ? `${m.accent}1a` : "rgba(255,255,255,0.02)",
                      }}
                    >
                      <span
                        className="size-2.5 shrink-0 rounded-full transition-transform group-hover:scale-125"
                        style={{ background: m.accent, boxShadow: `0 0 12px ${m.accent}` }}
                      />
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold text-white">
                          {m.name[locale]}
                          {!m.ready && (
                            <span className="ml-1.5 text-[10px] font-normal uppercase tracking-wider text-white/40">
                              soon
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-[11px] text-white/45">
                          {m.blurb[locale]}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1.5 rounded-full border border-white/12 bg-black/72 p-1.5 backdrop-blur-2xl shadow-[0_16px_50px_-16px_rgba(0,0,0,0.8)]">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-full py-1.5 pl-2.5 pr-3.5 text-white transition-colors hover:bg-white/8"
          >
            <span
              className="size-3 rounded-full"
              style={{ background: active.accent, boxShadow: `0 0 14px ${active.accent}` }}
            />
            <span className="text-[12px] font-medium tabular-nums">
              <span className="text-white/40">{ui.switcher.label[locale]}:</span>{" "}
              {active.name[locale]}
            </span>
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              className="text-white/40 text-[10px]"
            >
              ▲
            </motion.span>
          </button>

          <span className="h-5 w-px bg-white/12" />

          <button
            onClick={toggleLocale}
            className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-white/8"
            aria-label="Toggle language"
          >
            <span className={locale === "ru" ? "text-white" : "text-white/35"}>RU</span>
            <span className="mx-1 text-white/25">/</span>
            <span className={locale === "en" ? "text-white" : "text-white/35"}>EN</span>
          </button>
        </div>
      </div>
    </div>
  );
}
