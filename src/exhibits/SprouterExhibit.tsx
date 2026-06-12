"use client";

// SPROUTER — реконструкция фрагмента realtime-дашборда мониторинга майнинг-фермы.
// Собственное фиксированное оформление продукта (тёмный плотный дашборд),
// не зависящее от текущего дизайн-режима портфолио. Данные демонстрационные.
import { useEffect, useState } from "react";
import type { ExhibitProps } from "./types";

/* ------------------------------------------------------------------ */
/* Модель данных                                                       */
/* ------------------------------------------------------------------ */

type RigStatus = "ok" | "warn" | "offline";

type Rig = {
  id: string;
  temp: number; // °C
  hash: number; // TH/s
  fan: number; // %
  status: RigStatus;
  left: number; // тиков до восстановления (warn/offline)
};

type DashState = {
  rigs: Rig[];
  history: number[]; // суммарный хешрейт, последние HISTORY_LEN тиков
  updatedAt: number;
  startedAt: number; // для аптайма
};

const HISTORY_LEN = 40;
const TICK_MS = 1800;
// 14д 06:32:47 к моменту открытия экспоната
const UPTIME_BASE_MS = (((14 * 24 + 6) * 60 + 32) * 60 + 47) * 1000;

const INITIAL_RIGS: Rig[] = [
  { id: "RIG-A1", temp: 61, hash: 12.4, fan: 64, status: "ok", left: 0 },
  { id: "RIG-A2", temp: 58, hash: 13.1, fan: 58, status: "ok", left: 0 },
  { id: "RIG-A3", temp: 64, hash: 11.8, fan: 71, status: "ok", left: 0 },
  { id: "RIG-A4", temp: 60, hash: 12.9, fan: 62, status: "ok", left: 0 },
  { id: "RIG-B1", temp: 63, hash: 12.2, fan: 67, status: "ok", left: 0 },
  { id: "RIG-B2", temp: 59, hash: 13.4, fan: 55, status: "ok", left: 0 },
  { id: "RIG-B3", temp: 66, hash: 11.5, fan: 74, status: "ok", left: 0 },
  { id: "RIG-B4", temp: 62, hash: 12.7, fan: 60, status: "ok", left: 0 },
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const totalHash = (rigs: Rig[]) => rigs.reduce((s, r) => s + r.hash, 0);

function tickRig(rig: Rig): Rig {
  if (rig.status === "offline") {
    if (rig.left <= 1) {
      // восстановился
      return {
        ...rig,
        status: "ok",
        left: 0,
        temp: rand(57, 63),
        hash: rand(11.5, 13.5),
        fan: rand(58, 70),
      };
    }
    return { ...rig, left: rig.left - 1, temp: 0, hash: 0, fan: 0 };
  }

  if (rig.status === "warn") {
    if (rig.left <= 1) {
      // остыл
      return {
        ...rig,
        status: "ok",
        left: 0,
        temp: rand(60, 66),
        hash: rand(11.5, 13.5),
        fan: rand(62, 76),
      };
    }
    // перегрев: температура растёт, вентилятор разгоняется, хешрейт проседает
    return {
      ...rig,
      left: rig.left - 1,
      temp: clamp(rig.temp + rand(1.5, 3.5), 60, 92),
      hash: clamp(rig.hash - rand(0.1, 0.5), 8, 15),
      fan: clamp(rig.fan + rand(3, 7), 40, 100),
    };
  }

  // ok: изредка уходит в warning или offline
  const roll = Math.random();
  if (roll < 0.022) {
    return {
      ...rig,
      status: "warn",
      left: 3 + Math.floor(Math.random() * 4),
      temp: clamp(rig.temp + rand(3, 6), 55, 92),
      fan: clamp(rig.fan + rand(5, 10), 40, 100),
    };
  }
  if (roll < 0.034) {
    return {
      ...rig,
      status: "offline",
      left: 2 + Math.floor(Math.random() * 3),
      temp: 0,
      hash: 0,
      fan: 0,
    };
  }
  // обычный дрейф значений
  return {
    ...rig,
    temp: clamp(rig.temp + rand(-0.8, 0.8), 55, 72),
    hash: clamp(rig.hash + rand(-0.25, 0.25), 10.6, 14.4),
    fan: clamp(rig.fan + rand(-2, 2), 48, 82),
  };
}

function tickState(s: DashState): DashState {
  const rigs = s.rigs.map(tickRig);
  return {
    ...s,
    rigs,
    history: [...s.history.slice(-(HISTORY_LEN - 1)), totalHash(rigs)],
    updatedAt: Date.now(),
  };
}

function initState(): DashState {
  const rigs = INITIAL_RIGS.map((r) => ({ ...r }));
  const base = totalHash(rigs);
  // Детерминированная «предыстория», чтобы спарклайн не был пустым
  const history = Array.from(
    { length: HISTORY_LEN },
    (_, i) => base + Math.sin(i * 0.55) * 1.3 + Math.sin(i * 0.21 + 2) * 0.9,
  );
  const now = Date.now();
  return { rigs, history, updatedAt: now, startedAt: now - UPTIME_BASE_MS };
}

/* ------------------------------------------------------------------ */
/* Форматирование                                                      */
/* ------------------------------------------------------------------ */

const pad2 = (n: number) => String(n).padStart(2, "0");

function fmtTime(ts: number): string {
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function fmtUptime(ms: number, dayUnit: string): string {
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${days}${dayUnit} ${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

/* ------------------------------------------------------------------ */
/* Локализация                                                         */
/* ------------------------------------------------------------------ */

const STR = {
  ru: {
    farm: "Ферма «Tomsk-01»",
    online: "онлайн",
    tabs: ["Мониторинг", "Схема", "Отчёты"],
    updated: "обн.",
    statHashrate: "Суммарный хешрейт",
    statPower: "Потребление",
    statRigs: "Активные риги",
    statUptime: "Аптайм",
    sparkTitle: "Хешрейт фермы",
    sparkHint: "последние 40 обновлений",
    temp: "Темп.",
    hash: "Хешрейт",
    fan: "Вент.",
    warn: "перегрев",
    offline: "офлайн",
    dayUnit: "д",
  },
  en: {
    farm: "Farm “Tomsk-01”",
    online: "online",
    tabs: ["Monitoring", "Layout", "Reports"],
    updated: "upd.",
    statHashrate: "Total hashrate",
    statPower: "Power draw",
    statRigs: "Active rigs",
    statUptime: "Uptime",
    sparkTitle: "Farm hashrate",
    sparkHint: "last 40 ticks",
    temp: "Temp",
    hash: "Hashrate",
    fan: "Fan",
    warn: "overheat",
    offline: "offline",
    dayUnit: "d",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Подкомпоненты (внутри файла — экспонат самодостаточный)             */
/* ------------------------------------------------------------------ */

const DOT_COLOR: Record<RigStatus, string> = {
  ok: "bg-[#13d6a3]",
  warn: "bg-amber-400",
  offline: "bg-rose-500",
};

const TILE_STYLE: Record<RigStatus, string> = {
  ok: "border-white/[0.07] bg-white/[0.02]",
  warn: "border-amber-400/40 bg-amber-400/[0.06]",
  offline: "border-white/[0.05] bg-transparent",
};

function RigTile({
  rig,
  t,
}: {
  rig: Rig;
  t: (typeof STR)[keyof typeof STR];
}) {
  const off = rig.status === "offline";
  const dim = off ? "text-white/25" : "text-[#e6edf3]";

  return (
    <div
      className={`rounded-md border p-3 transition-colors duration-700 ${TILE_STYLE[rig.status]}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] tracking-wide text-white/55">
          {rig.id}
        </span>
        <span className="flex items-center gap-1.5">
          {rig.status !== "ok" && (
            <span
              className={`font-mono text-[9px] uppercase tracking-wider transition-colors duration-700 ${
                rig.status === "warn" ? "text-amber-400" : "text-rose-400/80"
              }`}
            >
              {rig.status === "warn" ? t.warn : t.offline}
            </span>
          )}
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-700 ${DOT_COLOR[rig.status]}`}
          />
        </span>
      </div>

      <div className="mt-2.5 flex items-baseline gap-1">
        <span
          className={`font-mono text-xl leading-none tabular-nums transition-colors duration-700 ${dim}`}
        >
          {off ? "——" : rig.hash.toFixed(1)}
        </span>
        <span className="font-mono text-[10px] text-white/35">TH/s</span>
      </div>

      <div className="mt-2.5 space-y-1 font-mono text-[10px] tabular-nums">
        <div className="flex items-center justify-between">
          <span className="text-white/35">{t.temp}</span>
          <span
            className={`transition-colors duration-700 ${
              off
                ? "text-white/25"
                : rig.status === "warn"
                  ? "text-amber-400"
                  : "text-white/75"
            }`}
          >
            {off ? "—" : `${Math.round(rig.temp)}°C`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/35">{t.fan}</span>
          <span className={off ? "text-white/25" : "text-white/75"}>
            {off ? "—" : `${Math.round(rig.fan)}%`}
          </span>
        </div>
        {/* шкала вентилятора */}
        <div className="h-px w-full overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className={`h-full transition-all duration-1000 ${
              rig.status === "warn" ? "bg-amber-400/80" : "bg-[#13d6a3]/70"
            }`}
            style={{ width: off ? "0%" : `${Math.round(rig.fan)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function Sparkline({ history }: { history: number[] }) {
  const W = 100;
  const H = 32;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const span = Math.max(max - min, 1.5);
  const pts = history.map((v, i) => {
    const x = (i / (history.length - 1)) * W;
    const y = H - 3 - ((v - min) / span) * (H - 7);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const area = `M0,${H} L${pts.join(" L")} L${W},${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-16 w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sprouter-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#13d6a3" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#13d6a3" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1="0"
          y1={H * f}
          x2={W}
          y2={H * f}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <path d={area} fill="url(#sprouter-spark-fill)" />
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="#13d6a3"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Экспонат                                                            */
/* ------------------------------------------------------------------ */

export default function SprouterExhibit({ locale }: ExhibitProps) {
  const t = STR[locale];
  const [state, setState] = useState<DashState>(initState);

  useEffect(() => {
    const id = window.setInterval(() => setState(tickState), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const { rigs, history, updatedAt, startedAt } = state;
  const total = totalHash(rigs);
  const power = total * 0.1035; // кВт, ≈ удельное потребление демо-ригов
  const active = rigs.filter((r) => r.status !== "offline").length;

  return (
    <div className="w-full bg-[#0d1117] text-[#e6edf3] antialiased">
      {/* Табы-декорации + LIVE + время обновления */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 sm:px-5">
        <div className="flex" aria-hidden="true">
          {t.tabs.map((tab, i) => (
            <span
              key={tab}
              className={`cursor-default border-b-2 px-3 py-2.5 text-xs ${
                i === 0
                  ? "border-[#13d6a3] font-medium text-[#e6edf3]"
                  : "border-transparent text-white/35"
              }`}
            >
              {tab}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[10px] tabular-nums text-white/35 sm:inline">
            {t.updated} {fmtTime(updatedAt)}
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-[#13d6a3]/30 bg-[#13d6a3]/10 px-2 py-0.5 font-mono text-[9px] font-medium tracking-widest text-[#13d6a3]">
            <span className="h-1 w-1 animate-pulse rounded-full bg-[#13d6a3]" />
            LIVE
          </span>
        </div>
      </div>

      {/* Шапка фермы */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-3 pt-4 sm:px-5">
        <h3 className="text-base font-semibold tracking-tight">{t.farm}</h3>
        <span className="flex items-center gap-1.5 text-xs text-[#13d6a3]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#13d6a3] opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#13d6a3]" />
          </span>
          {t.online}
        </span>
      </div>

      {/* Сводка */}
      <div className="grid grid-cols-2 gap-px border-y border-white/[0.06] bg-white/[0.06] sm:grid-cols-4">
        {[
          {
            label: t.statHashrate,
            value: total.toFixed(1),
            unit: "TH/s",
            accent: true,
          },
          {
            label: t.statPower,
            value: power.toFixed(1),
            unit: "kW",
            accent: false,
          },
          {
            label: t.statRigs,
            value: `${active}/${rigs.length}`,
            unit: "",
            accent: false,
          },
          {
            label: t.statUptime,
            value: fmtUptime(updatedAt - startedAt, t.dayUnit),
            unit: "",
            accent: false,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#0d1117] px-4 py-3 sm:px-5">
            <div className="text-[10px] uppercase tracking-wider text-white/35">
              {stat.label}
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span
                className={`font-mono text-lg leading-none tabular-nums ${
                  stat.accent ? "text-[#13d6a3]" : "text-[#e6edf3]"
                }`}
              >
                {stat.value}
              </span>
              {stat.unit && (
                <span className="font-mono text-[10px] text-white/35">
                  {stat.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Спарклайн суммарного хешрейта */}
      <div className="px-4 pt-4 sm:px-5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wider text-white/35">
            {t.sparkTitle}
          </span>
          <span className="font-mono text-[10px] text-white/25">
            {t.sparkHint}
          </span>
        </div>
        <div className="mt-2">
          <Sparkline history={history} />
        </div>
      </div>

      {/* Сетка ригов */}
      <div className="grid grid-cols-2 gap-2 p-4 sm:p-5 md:grid-cols-4">
        {rigs.map((rig) => (
          <RigTile key={rig.id} rig={rig} t={t} />
        ))}
      </div>
    </div>
  );
}
