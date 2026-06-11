"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { Locale, SkillGroup } from "@/content/site";
import { site } from "@/content/site";
import { ui } from "@/lib/i18n";

type EffectId = "orbit" | "flow" | "blobs" | "nodes";

const META: { accent: string; effect: EffectId }[] = [
  { accent: "#c6ff3a", effect: "orbit" }, // Frontend
  { accent: "#7cc6ff", effect: "flow" }, // Стиль и моушн
  { accent: "#ff5c38", effect: "blobs" }, // Дизайн
  { accent: "#b98cff", effect: "nodes" }, // Прочее
];

// бесшовная синусоида: повторяется каждые 50 ед. → translateX(-50%) даёт плавный цикл
function wavePath(amp: number, y: number, period = 50) {
  let d = `M 0 ${y}`;
  for (let x = 0; x <= 200; x += 4) {
    const yy = y + amp * Math.sin((x / period) * Math.PI * 2);
    d += ` L ${x} ${yy.toFixed(2)}`;
  }
  return d;
}

const CX = 76;
const CY = 50;
const R = 44;

export function SkillsWheel({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const groups = site.skills;

  // «облегчённый» рендер на мобильных/тач-устройствах: отключаем backdrop-blur
  // и декоративные анимации эффектов — они сильнее всего лагают при скролле.
  const [lite, setLite] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px), (pointer: coarse)");
    const update = () => setLite(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section
      id="skills"
      ref={ref}
      className="relative"
      style={{ height: `${groups.length * 68 + 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-5 sm:px-8 md:grid-cols-2">
          {/* левая колонка — заголовок */}
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-white/45">
              {String(groups.length).padStart(2, "0")} {locale === "ru" ? "направления" : "tracks"}
            </p>
            <h2
              className="text-5xl font-bold leading-[0.95] sm:text-7xl"
              style={{ fontFamily: "var(--font-clash)" }}
            >
              {ui.sections.skillsTitle[locale]}
            </h2>
            <p className="mt-6 max-w-xs text-white/55">
              {locale === "ru"
                ? "Крути колесо скроллом — карточки идут по кругу, у каждой свой характер."
                : "Scroll to turn the wheel — cards orbit, each with its own character."}
            </p>
            <div className="mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/35">
              <span className="animate-pulse">↓</span>
              {locale === "ru" ? "скролль" : "scroll"}
            </div>
          </div>

          {/* правая колонка — колесо */}
          <div className="relative mx-auto aspect-square w-full max-w-[400px] sm:max-w-[520px]">
            {groups.map((g, i) => (
              <WheelCard
                key={i}
                progress={scrollYProgress}
                index={i}
                total={groups.length}
                group={g}
                meta={META[i % META.length]}
                locale={locale}
                lite={lite}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WheelCard({
  progress,
  index,
  total,
  group,
  meta,
  locale,
  lite,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  group: SkillGroup;
  meta: { accent: string; effect: EffectId };
  locale: Locale;
  lite: boolean;
}) {
  // Раскладка по кольцу: карточка i выходит вперёд (угол = π) при p = i/(total-1).
  // Оборот за весь скролл = (total-1)/total круга (а не полный) → каждая карточка
  // появляется спереди ровно один раз, по порядку; в конце спереди — последняя.
  const span = total > 1 ? total - 1 : 1;
  const angleAt = (p: number) =>
    Math.PI + (p * span - index) * ((2 * Math.PI) / total);
  const normAt = (p: number) => (1 - Math.cos(angleAt(p))) / 2; // 1 спереди, 0 сзади

  const left = useTransform(progress, (p) => `${CX + R * Math.cos(angleAt(p))}%`);
  const top = useTransform(progress, (p) => `${CY + R * Math.sin(angleAt(p))}%`);
  const scale = useTransform(progress, (p) => 0.6 + 0.52 * normAt(p));
  const opacity = useTransform(progress, (p) => Math.max(0, normAt(p) * 1.35 - 0.2));
  const zIndex = useTransform(progress, (p) => Math.round(normAt(p) * 100));
  const rotate = useTransform(progress, (p) => {
    const a = angleAt(p);
    const delta = Math.atan2(Math.sin(a - Math.PI), Math.cos(a - Math.PI));
    return (delta * 180) / Math.PI * 0.14;
  });

  return (
    <motion.div
      style={{ left, top, scale, opacity, zIndex, rotate, x: "-50%", y: "-50%" }}
      className="absolute w-[280px] sm:w-[340px]"
    >
      <div
        className={`relative h-[360px] overflow-hidden rounded-[28px] border p-7 sm:h-[400px] ${
          lite ? "" : "backdrop-blur-md"
        }`}
        style={{
          borderColor: `${meta.accent}55`,
          // на мобильных фон непрозрачный (без backdrop-blur), тень мягче и дешевле
          background: lite ? "#0b0b10" : "rgba(9,9,13,0.82)",
          boxShadow: lite
            ? `0 10px 24px -16px ${meta.accent}66`
            : `0 30px 80px -24px ${meta.accent}55`,
        }}
      >
        {!lite && <Effect id={meta.effect} accent={meta.accent} />}

        <div className="relative flex h-full flex-col">
          <span
            className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em]"
            style={{ background: `${meta.accent}1f`, color: meta.accent }}
          >
            <span className="size-1.5 rounded-full" style={{ background: meta.accent }} />
            {String(index + 1).padStart(2, "0")}
          </span>

          <h3
            className="mt-4 text-2xl font-bold text-white sm:text-3xl"
            style={{ fontFamily: "var(--font-clash)" }}
          >
            {group.label[locale]}
          </h3>

          <ul className="mt-auto space-y-2">
            {group.items.map((it) => (
              <li key={it} className="flex items-center gap-2 text-white/70">
                <span className="size-1 rounded-full" style={{ background: meta.accent }} />
                {it}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── тематические эффекты ─── */

function Effect({ id, accent }: { id: EffectId; accent: string }) {
  if (id === "orbit") {
    return (
      <div className="pointer-events-none absolute right-5 top-5 size-28 opacity-70">
        <div className="absolute inset-0 rounded-full border" style={{ borderColor: `${accent}33` }} />
        <div className="absolute inset-4 rounded-full border" style={{ borderColor: `${accent}26` }} />
        <div className="absolute inset-0" style={{ animation: "hp-orbit 6s linear infinite" }}>
          <span
            className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 rounded-full"
            style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
          />
        </div>
        <div className="absolute inset-4" style={{ animation: "hp-orbit-rev 4s linear infinite" }}>
          <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 rounded-full" style={{ background: accent }} />
        </div>
        <span
          className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: accent, boxShadow: `0 0 14px ${accent}` }}
        />
      </div>
    );
  }

  if (id === "flow") {
    const layers = [
      { amp: 8, y: 50, op: 0.55, dur: "24s", color: accent },
      { amp: 12, y: 60, op: 0.32, dur: "17s", color: "#c6ff3a" },
      { amp: 6, y: 70, op: 0.6, dur: "30s", color: accent },
      { amp: 14, y: 80, op: 0.25, dur: "21s", color: "#a9e9ff" },
    ];
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {layers.map((l, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{ animation: `hp-float-y ${7 + i * 2}s ease-in-out ${i * 0.8}s infinite` }}
          >
            <svg
              className="absolute inset-y-0 left-0 h-full"
              style={{ width: "200%", opacity: l.op, animation: `hp-flow ${l.dur} linear infinite` }}
              viewBox="0 0 200 100"
              preserveAspectRatio="none"
              fill="none"
            >
              <path d={wavePath(l.amp, l.y)} stroke={l.color} strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
        ))}
        {/* мягкое затемнение снизу — список читается поверх волн */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{ background: "linear-gradient(to top, rgba(9,9,13,0.9), transparent)" }}
        />
      </div>
    );
  }

  if (id === "blobs") {
    return (
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div
          className="absolute right-6 top-6 size-24 blur-xl"
          style={{ background: accent, animation: "hp-blob 7s ease-in-out infinite" }}
        />
        <div
          className="absolute right-16 top-16 size-16 blur-lg"
          style={{ background: "#ff9d6e", animation: "hp-blob 9s ease-in-out -2s infinite" }}
        />
      </div>
    );
  }

  // nodes
  const nodes: [number, number][] = [
    [20, 22],
    [76, 34],
    [44, 80],
    [86, 68],
  ];
  return (
    <div className="pointer-events-none absolute right-4 top-4 size-32 opacity-70">
      <svg viewBox="0 0 100 100" className="size-full">
        <g
          stroke={accent}
          strokeWidth="0.8"
          fill="none"
          strokeDasharray="4 4"
          style={{ animation: "hp-dash 6s linear infinite" }}
        >
          <line x1="20" y1="22" x2="76" y2="34" />
          <line x1="76" y1="34" x2="44" y2="80" />
          <line x1="20" y1="22" x2="44" y2="80" />
          <line x1="76" y1="34" x2="86" y2="68" />
        </g>
        {nodes.map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="4"
            fill={accent}
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              animation: `hp-pulse ${2 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
