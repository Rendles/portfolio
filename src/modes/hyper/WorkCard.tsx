"use client";

import { motion } from "motion/react";
import type { Project, Locale } from "@/content/site";
import { ui } from "@/lib/i18n";
import { useExhibit } from "@/exhibits/ExhibitProvider";
import { hasExhibit } from "@/exhibits/registry";

export function WorkCard({
  project,
  index,
  locale,
}: {
  project: Project;
  index: number;
  locale: Locale;
}) {
  const n = String(index + 1).padStart(2, "0");
  const { openExhibit } = useExhibit();

  return (
    <motion.article
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-7 backdrop-blur-md transition-colors duration-500 hover:border-white/25 sm:p-10"
    >
      {/* свечение акцентом при наведении */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at var(--mx,50%) var(--my,0%), ${project.accent}22, transparent 60%)`,
        }}
      />
      <div
        className="pointer-events-none absolute left-0 top-0 h-px w-full opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${project.accent}, transparent)` }}
      />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-stretch">
        {/* левая колонка: индекс + визуальный блок */}
        <div className="flex shrink-0 flex-col justify-between gap-6 lg:w-64">
          <div className="flex items-center justify-between">
            <span
              className="text-6xl font-bold leading-none sm:text-7xl"
              style={{ fontFamily: "var(--font-clash)", color: project.accent }}
            >
              {n}
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-white/40">
              {project.year}
            </span>
          </div>
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10"
            style={{
              background: `linear-gradient(135deg, ${project.accent}28, #0c0c0f 70%)`,
            }}
          >
            <span
              className="absolute -bottom-4 -right-2 text-[5.5rem] font-bold leading-none opacity-20"
              style={{ fontFamily: "var(--font-clash)", color: project.accent }}
            >
              {project.title.slice(0, 2)}
            </span>
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/70 backdrop-blur">
              <span className="size-1.5 rounded-full" style={{ background: project.accent }} />
              {project.solo ? ui.project.solo[locale] : "team"}
            </span>
          </div>
        </div>

        {/* правая колонка: текст */}
        <div className="flex flex-1 flex-col">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">
            {project.kind[locale]}
          </p>
          <h3
            className="mt-2 text-3xl font-semibold text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-clash)" }}
          >
            {project.title}
          </h3>

          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/65">
            {project.summary[locale]}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/55"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-7">
            <span className="text-sm text-white/50">
              <span className="text-white/35">{ui.project.role[locale]}: </span>
              {project.role[locale]}
            </span>
            {project.links.length > 0 || hasExhibit(project.id) ? (
              <div className="flex flex-wrap items-center gap-2">
                {hasExhibit(project.id) && (
                  <button
                    type="button"
                    data-cursor
                    onClick={(e) => {
                      e.stopPropagation();
                      openExhibit(project.id);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold text-black transition-transform hover:scale-105"
                    style={{
                      background: project.accent,
                      borderColor: project.accent,
                      boxShadow: `0 0 16px ${project.accent}66, 0 0 2px ${project.accent}`,
                    }}
                  >
                    <span aria-hidden>▶</span>
                    {ui.project.demo[locale]}
                  </button>
                )}
                {project.links.map((l) =>
                  l.kind === "live" ? (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-105"
                      style={{ background: project.accent }}
                    >
                      {l.label[locale]}
                      <span aria-hidden>↗</span>
                    </a>
                  ) : (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-transform hover:scale-105"
                      style={{ borderColor: `${project.accent}66`, color: project.accent }}
                    >
                      {l.label[locale]}
                      <span aria-hidden>↗</span>
                    </a>
                  )
                )}
              </div>
            ) : (
              <span className="text-xs uppercase tracking-wider text-white/35">
                {ui.project.noLink[locale]}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
