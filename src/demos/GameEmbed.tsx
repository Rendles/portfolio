"use client";

// Ленивый «фасад» для встраивания браузерных игр: до клика — постер с кнопкой
// (iframe не грузится вообще), по клику — настоящий iframe. Решает две проблемы:
// перфоманс (тяжёлые игры не грузятся при скролле) и перехват скролла/тача
// iframe'ом на мобильных. Крестик выгружает iframe обратно в постер.
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

type Locale = "ru" | "en";

// Генеративная декорация постера: набор «парящих» геометрических фигур.
// Координаты в процентах, всё детерминировано — без рандома, чтобы не было
// рассинхрона SSR/клиента.
const SHAPES: {
  kind: "square" | "circle" | "triangle" | "ring";
  left: number; // %
  top: number; // %
  size: number; // px
  rotate: number; // град
  drift: number; // амплитуда покачивания, px
  duration: number; // сек
  delay: number; // сек
  opacity: number;
}[] = [
  { kind: "square", left: 8, top: 18, size: 34, rotate: 14, drift: 12, duration: 6.5, delay: 0, opacity: 0.5 },
  { kind: "circle", left: 22, top: 64, size: 22, rotate: 0, drift: 9, duration: 5.2, delay: 0.8, opacity: 0.4 },
  { kind: "triangle", left: 78, top: 22, size: 30, rotate: -18, drift: 14, duration: 7.1, delay: 0.3, opacity: 0.45 },
  { kind: "ring", left: 86, top: 62, size: 40, rotate: 0, drift: 10, duration: 6.0, delay: 1.2, opacity: 0.35 },
  { kind: "square", left: 64, top: 78, size: 18, rotate: 32, drift: 8, duration: 5.6, delay: 0.5, opacity: 0.4 },
  { kind: "triangle", left: 38, top: 12, size: 20, rotate: 8, drift: 11, duration: 6.8, delay: 1.6, opacity: 0.35 },
  { kind: "circle", left: 50, top: 86, size: 12, rotate: 0, drift: 7, duration: 4.8, delay: 0.2, opacity: 0.3 },
];

function Shape({
  kind,
  size,
  accent,
}: {
  kind: (typeof SHAPES)[number]["kind"];
  size: number;
  accent: string;
}) {
  if (kind === "triangle") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3 21 20 H3 Z"
          fill="none"
          stroke={accent}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="block"
      style={{
        width: size,
        height: size,
        border: `1.6px solid ${accent}`,
        borderRadius: kind === "square" ? 4 : 9999,
        // у «кольца» — двойная обводка через box-shadow
        boxShadow: kind === "ring" ? `inset 0 0 0 4px ${accent}22` : undefined,
      }}
    />
  );
}

export function GameEmbed({
  locale,
  title,
  src,
  accent,
  note,
}: {
  locale: Locale;
  title: string;
  src: string;
  accent: string;
  note?: { ru: string; en: string };
}) {
  const [open, setOpen] = useState(false); // iframe смонтирован
  const [loaded, setLoaded] = useState(false); // iframe загрузился
  const reduced = useReducedMotion();

  const t = {
    play: { ru: "▶ Играть", en: "▶ Play" }[locale],
    playLabel: {
      ru: `Запустить игру «${title}»`,
      en: `Launch game "${title}"`,
    }[locale],
    closeLabel: {
      ru: "Свернуть игру обратно в постер",
      en: "Collapse game back to poster",
    }[locale],
    hint: (note ?? {
      ru: "Игра загрузится по клику",
      en: "The game loads on click",
    })[locale],
    loading: { ru: "Загрузка…", en: "Loading…" }[locale],
  };

  const collapse = () => {
    setOpen(false);
    setLoaded(false); // выгружаем iframe полностью
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#0c0c12] aspect-[4/5] sm:aspect-[16/10]">
      {open ? (
        <>
          {/* пока iframe грузится — пульсирующий спиннер на тёмном фоне */}
          {!loaded && (
            <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-3">
              <span
                className="size-10 animate-spin rounded-full border-2 border-white/15"
                style={{ borderTopColor: accent }}
                aria-hidden="true"
              />
              <span className="text-xs tracking-wide text-white/40">
                {t.loading}
              </span>
            </div>
          )}
          <iframe
            src={src}
            title={title}
            allow="fullscreen"
            className={`absolute inset-0 z-10 h-full w-full border-0 transition-opacity duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setLoaded(true)}
          />
          {/* крестик: выгружает iframe — важно на мобильных, где он ест тач/скролл */}
          <button
            type="button"
            onClick={collapse}
            aria-label={t.closeLabel}
            className="absolute right-2 top-2 z-20 flex size-8 items-center justify-center rounded-full bg-black/55 text-white/75 backdrop-blur-sm transition-colors hover:bg-black/75 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path
                d="M2 2 12 12 M12 2 2 12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t.playLabel}
          className="group absolute inset-0 flex h-full w-full cursor-pointer flex-col items-center justify-center gap-4 text-left"
        >
          {/* мягкое свечение акцентного цвета по центру */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              opacity: 0.7,
              background: `radial-gradient(ellipse 70% 55% at 50% 45%, ${accent}2e 0%, ${accent}14 40%, transparent 70%)`,
            }}
          />
          {/* лёгкая сетка-подложка под «игровое поле» */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `linear-gradient(${accent} 1px, transparent 1px), linear-gradient(90deg, ${accent} 1px, transparent 1px)`,
              backgroundSize: "44px 44px",
            }}
          />
          {/* парящие фигуры */}
          {SHAPES.map((s, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className="pointer-events-none absolute"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                opacity: s.opacity,
                rotate: s.rotate,
              }}
              animate={
                reduced
                  ? undefined
                  : { y: [-s.drift, s.drift], rotate: [s.rotate - 6, s.rotate + 6] }
              }
              transition={{
                duration: s.duration,
                delay: s.delay,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            >
              <Shape kind={s.kind} size={s.size} accent={accent} />
            </motion.span>
          ))}

          {/* контент постера */}
          <span className="relative z-10 px-6 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {title}
          </span>
          <span
            className="relative z-10 inline-flex items-center rounded-full px-7 py-2.5 text-sm font-semibold text-white transition-transform duration-300 group-hover:scale-105"
            style={{
              backgroundColor: accent,
              boxShadow: `0 0 24px ${accent}55, 0 0 64px ${accent}26`,
            }}
          >
            {t.play}
          </span>
          <span className="relative z-10 px-6 text-center text-xs text-white/40">
            {t.hint}
          </span>
        </button>
      )}
    </div>
  );
}
