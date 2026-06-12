"use client";

// Витрина экспоната: модальное окно с нейтральным тёмным «корпусом»,
// одинаковым во всех дизайн-режимах. Сам экспонат внутри — в дизайне своего проекта.
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Locale, Project } from "@/content/site";
import { getExhibit } from "./registry";

export function ExhibitOverlay({
  project,
  locale,
  onClose,
}: {
  project: Project | null;
  locale: Locale;
  onClose: () => void;
}) {
  // Esc + блокировка скролла, пока открыто.
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [project, onClose]);

  const entry = project ? getExhibit(project.id) : null;
  const live = project?.links.find((l) => l.kind === "live") ?? null;

  return (
    <AnimatePresence>
      {project && entry && (
        <motion.div
          key={project.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0f] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* шапка-«корпус» */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: project.accent }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {project.title}
                  <span className="ml-2 font-normal text-white/40">
                    {project.kind[locale]}
                  </span>
                </p>
                <p className="truncate text-[11px] text-white/35">
                  {entry.note[locale]}
                </p>
              </div>
              {live && (
                <a
                  href={live.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/40 hover:text-white sm:block"
                >
                  {live.label[locale]} ↗
                </a>
              )}
              <button
                onClick={onClose}
                aria-label={locale === "ru" ? "Закрыть" : "Close"}
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* тело экспоната */}
            <div className="min-h-0 flex-1 overflow-auto">
              <entry.component locale={locale} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
