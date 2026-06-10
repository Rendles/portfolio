"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, type PanInfo } from "motion/react";
import type { Locale } from "@/content/site";
import { site } from "@/content/site";
import { ui } from "@/lib/i18n";

const projects = site.projects;

function transformFor(offset: number) {
  const abs = Math.abs(offset);
  const sign = Math.sign(offset);
  return {
    x: offset * 300,
    z: -abs * 280,
    rotateY: -sign * 26,
    scale: Math.max(0.5, 1 - abs * 0.13),
    opacity: abs > 2 ? 0 : 1 - abs * 0.22,
    filter: `blur(${abs * 1.6}px)`,
  };
}

export function WorkSlider({ locale }: { locale: Locale }) {
  const [active, setActive] = useState(0);
  const count = projects.length;

  const go = useCallback(
    (dir: number) => setActive((a) => (a + dir + count) % count),
    [count]
  );

  // клавиатура
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -70 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 70 || info.velocity.x > 400) go(-1);
  };

  return (
    <div className="select-none">
      <div
        className="relative h-[460px] sm:h-[560px]"
        style={{ perspective: "1800px" }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          onDragEnd={onDragEnd}
        >
          {projects.map((p, i) => {
            // кратчайшее смещение по кольцу
            let offset = i - active;
            if (offset > count / 2) offset -= count;
            if (offset < -count / 2) offset += count;
            const isActive = offset === 0;
            const tf = transformFor(offset);

            return (
              <motion.div
                key={p.id}
                role="button"
                tabIndex={isActive ? -1 : 0}
                onClick={() => !isActive && setActive(i)}
                onKeyDown={(e) => {
                  if (!isActive && (e.key === "Enter" || e.key === " ")) setActive(i);
                }}
                animate={tf}
                transition={{ type: "spring", stiffness: 130, damping: 20 }}
                className="absolute left-1/2 top-1/2 -ml-[150px] -mt-[220px] w-[300px] cursor-pointer sm:-ml-[210px] sm:-mt-[270px] sm:w-[420px]"
                style={{ zIndex: 20 - Math.abs(offset) }}
                data-cursor
                aria-label={p.title}
              >
                <Card project={p} locale={locale} active={isActive} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* контролы */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          onClick={() => go(-1)}
          data-cursor
          className="flex size-12 items-center justify-center rounded-full border border-white/15 text-xl text-white/70 transition-colors hover:border-[#c6ff3a] hover:text-[#c6ff3a]"
          aria-label="prev"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          {projects.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActive(i)}
              data-cursor
              aria-label={`go ${i + 1}`}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === active ? 34 : 10,
                background: i === active ? "#c6ff3a" : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          data-cursor
          className="flex size-12 items-center justify-center rounded-full border border-white/15 text-xl text-white/70 transition-colors hover:border-[#c6ff3a] hover:text-[#c6ff3a]"
          aria-label="next"
        >
          →
        </button>
      </div>
    </div>
  );
}

function Card({
  project,
  locale,
  active,
}: {
  project: (typeof projects)[number];
  locale: Locale;
  active: boolean;
}) {
  const n = String(projects.indexOf(project) + 1).padStart(2, "0");
  return (
    <div
      className="h-[440px] overflow-hidden rounded-3xl border text-left backdrop-blur-md sm:h-[540px]"
      style={{
        borderColor: active ? `${project.accent}66` : "rgba(255,255,255,0.1)",
        background: "rgba(10,10,14,0.72)",
        boxShadow: active
          ? `0 30px 80px -20px ${project.accent}55, 0 0 0 1px ${project.accent}22`
          : "0 20px 50px -30px rgba(0,0,0,0.8)",
      }}
    >
      {/* визуальная шапка */}
      <div
        className="relative h-40 overflow-hidden sm:h-48"
        style={{ background: `linear-gradient(135deg, ${project.accent}33, #0a0a0e 75%)` }}
      >
        <span
          className="absolute -bottom-6 right-2 text-[7rem] font-bold leading-none opacity-25"
          style={{ fontFamily: "var(--font-clash)", color: project.accent }}
        >
          {project.title.slice(0, 2)}
        </span>
        <span
          className="absolute left-5 top-5 text-5xl font-bold"
          style={{ fontFamily: "var(--font-clash)", color: project.accent }}
        >
          {n}
        </span>
        <span className="absolute right-5 top-5 rounded-full bg-black/45 px-3 py-1 text-[10px] uppercase tracking-wider text-white/70 backdrop-blur">
          {project.solo ? ui.project.solo[locale] : "team"} · {project.year}
        </span>
      </div>

      <div className="flex h-[calc(100%-10rem)] flex-col p-6 sm:h-[calc(100%-12rem)] sm:p-7">
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
          {project.kind[locale]}
        </p>
        <h3
          className="mt-1.5 text-2xl font-semibold text-white sm:text-3xl"
          style={{ fontFamily: "var(--font-clash)" }}
        >
          {project.title}
        </h3>

        <motion.div
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 flex flex-1 flex-col"
        >
          <p className="line-clamp-4 text-sm leading-relaxed text-white/65">
            {project.summary[locale]}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.stack.slice(0, 4).map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/12 px-2.5 py-1 text-[11px] text-white/55"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            <span className="text-xs text-white/45">{project.role[locale]}</span>
            {project.link ? (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-105"
                style={{ background: project.accent }}
              >
                {ui.project.visit[locale]} ↗
              </a>
            ) : (
              <span className="text-[11px] uppercase tracking-wider text-white/35">
                {ui.project.noLink[locale]}
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
