"use client";

// SPROUTER — самоиграющее «кино»-демо realtime-дашборда мониторинга
// майнинг-фермы. Фейковый курсор (DemoStage) сам открывает детали рига,
// листает отчёты и возвращается к мониторингу; зритель только смотрит.
// Оформление — собственная тёмная тема продукта, не зависит от режима
// портфолио. Раскладка адаптируется по ширине КОНТЕЙНЕРА (@container).

import { useCallback, useEffect, useId, useReducer } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DemoStage } from "../engine/DemoStage";
import { SPROUTER_SCENARIO } from "./scenario";
import {
  TICK_MS,
  fmtUptime,
  initScene,
  periodSummary,
  reportRows,
  sceneReducer,
  totalHash,
  type Rig,
  type SceneAction,
  type SceneState,
} from "./data";

const ACCENT = "#13d6a3";

/* ------------------------------------------------------------------ */
/* Локализация                                                         */
/* ------------------------------------------------------------------ */

const STR = {
  ru: {
    farm: "Ферма «Tomsk-01»",
    tabMonitor: "Мониторинг",
    tabReports: "Отчёты",
    statHashrate: "Суммарный хешрейт",
    statRigs: "Активные риги",
    statPower: "Потребление",
    statUptime: "Аптайм",
    sparkTitle: "Хешрейт фермы",
    sparkHint: "последние 36 обновлений",
    temp: "Темп.",
    fan: "Вент.",
    warn: "перегрев",
    statusOk: "в норме",
    statusWarn: "перегрев",
    panelTemp: "Температура",
    rowHash: "Хешрейт",
    rowPower: "Питание",
    rowShares: "Шары (прин.)",
    rowUptime: "Аптайм",
    reportsTitle: "Выработка фермы",
    period7: "7д",
    period30: "30д",
    sumHash: "Ср. хешрейт",
    sumUptime: "Ср. аптайм",
    sumIncidents: "Инциденты",
    thDate: "Дата",
    thHash: "TH/s ср.",
    thUptime: "Аптайм",
    thInc: "Инц.",
    dayUnit: "д",
  },
  en: {
    farm: "Farm “Tomsk-01”",
    tabMonitor: "Monitoring",
    tabReports: "Reports",
    statHashrate: "Total hashrate",
    statRigs: "Active rigs",
    statPower: "Power draw",
    statUptime: "Uptime",
    sparkTitle: "Farm hashrate",
    sparkHint: "last 36 ticks",
    temp: "Temp",
    fan: "Fan",
    warn: "overheat",
    statusOk: "nominal",
    statusWarn: "overheat",
    panelTemp: "Temperature",
    rowHash: "Hashrate",
    rowPower: "Power",
    rowShares: "Shares (acc.)",
    rowUptime: "Uptime",
    reportsTitle: "Farm output",
    period7: "7d",
    period30: "30d",
    sumHash: "Avg hashrate",
    sumUptime: "Avg uptime",
    sumIncidents: "Incidents",
    thDate: "Date",
    thHash: "Avg TH/s",
    thUptime: "Uptime",
    thInc: "Inc.",
    dayUnit: "d",
  },
} as const;

type Strings = (typeof STR)[keyof typeof STR];

/* ------------------------------------------------------------------ */
/* Демо                                                                */
/* ------------------------------------------------------------------ */

export function SprouterDemo({ locale }: { locale: "ru" | "en" }) {
  const t = STR[locale];
  // двоеточия React-овского useId ломают url(#...) в SVG — вычищаем
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [s, dispatch] = useReducer(sceneReducer, undefined, initScene);

  // реалтайм-тики данных (дрейф значений) — независимо от сценария
  useEffect(() => {
    const id = window.setInterval(() => dispatch("tick"), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const onAction = useCallback(
    (a: string) => dispatch(a as SceneAction),
    [],
  );

  const selectedRig = s.rigs.find((r) => r.id === s.selected);

  return (
    <DemoStage
      steps={SPROUTER_SCENARIO}
      onAction={onAction}
      className="h-[440px] w-full"
    >
      <div className="@container flex h-full w-full flex-col bg-[#0d1117] text-[#e6edf3] antialiased">
        <TopBar t={t} screen={s.screen} clock={s.clock} uid={uid} />

        <div className="relative min-h-0 flex-1">
          <AnimatePresence initial={false} mode="wait">
            {s.screen === "monitor" ? (
              <Monitor key="monitor" s={s} t={t} uid={uid} />
            ) : (
              <Reports key="reports" t={t} period={s.period} locale={locale} />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {s.screen === "monitor" && selectedRig && (
              <RigPanel
                key="panel"
                rig={selectedRig}
                t={t}
                uid={uid}
                ticks={s.ticks}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </DemoStage>
  );
}

/* ------------------------------------------------------------------ */
/* Шапка: ферма + табы + LIVE                                          */
/* ------------------------------------------------------------------ */

function TopBar({
  t,
  screen,
  clock,
  uid,
}: {
  t: Strings;
  screen: SceneState["screen"];
  clock: string;
  uid: string;
}) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 @lg:px-4">
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#13d6a3] opacity-50" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#13d6a3]" />
        </span>
        <span className="truncate text-[11px] font-semibold tracking-tight @lg:text-xs">
          {t.farm}
        </span>
      </span>

      <nav className="ml-1 flex h-full items-stretch @lg:ml-3">
        <Tab
          demo="tab-monitor"
          active={screen === "monitor"}
          label={t.tabMonitor}
          uid={uid}
        />
        <Tab
          demo="tab-reports"
          active={screen === "reports"}
          label={t.tabReports}
          uid={uid}
        />
      </nav>

      <span className="ml-auto hidden font-mono text-[10px] tabular-nums text-white/35 @md:inline">
        {clock || "—:—:—"}
      </span>
      <span className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-[#13d6a3]/30 bg-[#13d6a3]/10 px-2 py-0.5 font-mono text-[9px] font-medium tracking-widest text-[#13d6a3] @md:ml-0">
        <span className="h-1 w-1 animate-pulse rounded-full bg-[#13d6a3]" />
        LIVE
      </span>
    </div>
  );
}

function Tab({
  demo,
  active,
  label,
  uid,
}: {
  demo: string;
  active: boolean;
  label: string;
  uid: string;
}) {
  return (
    <span
      data-demo={demo}
      className="relative flex items-center px-2.5 text-[11px] @lg:px-3 @lg:text-xs"
    >
      <span
        className={`transition-colors duration-300 ${
          active ? "font-medium text-[#e6edf3]" : "text-white/40"
        }`}
      >
        {label}
      </span>
      {active && (
        <motion.span
          layoutId={`${uid}-tab-underline`}
          className="absolute inset-x-1.5 bottom-0 h-0.5 rounded-full bg-[#13d6a3]"
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
        />
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Экран «Мониторинг»                                                  */
/* ------------------------------------------------------------------ */

function Monitor({
  s,
  t,
  uid,
}: {
  s: SceneState;
  t: Strings;
  uid: string;
}) {
  const total = totalHash(s.rigs);
  const power = total * 0.1035; // кВт — удельное потребление демо-ригов

  return (
    <motion.div
      className="flex h-full w-full flex-col bg-[#0d1117]"
      initial={{ opacity: 0, x: -28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -28 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* сводка */}
      <div className="grid shrink-0 grid-cols-2 gap-px border-b border-white/[0.06] bg-white/[0.06] @xl:grid-cols-4">
        <Stat label={t.statHashrate} value={total.toFixed(1)} unit="TH/s" accent />
        <Stat label={t.statRigs} value={`${s.rigs.length}/${s.rigs.length}`} />
        <Stat
          label={t.statPower}
          value={power.toFixed(1)}
          unit="kW"
          className="hidden @xl:block"
        />
        <Stat
          label={t.statUptime}
          value={fmtUptime(s.ticks, t.dayUnit)}
          className="hidden @xl:block"
        />
      </div>

      {/* спарклайн суммарного хешрейта — только на широком контейнере */}
      <div className="hidden shrink-0 px-4 pt-2.5 @xl:block">
        <div className="flex items-baseline justify-between">
          <span className="text-[9px] uppercase tracking-wider text-white/35">
            {t.sparkTitle}
          </span>
          <span className="font-mono text-[9px] text-white/25">
            {t.sparkHint}
          </span>
        </div>
        <LineChart
          values={s.history}
          id={`${uid}-spark`}
          color={ACCENT}
          className="mt-1 h-9 w-full"
        />
      </div>

      {/* сетка ригов: 2 колонки на узком, 4 на широком */}
      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-1.5 p-2.5 @lg:gap-2 @lg:p-3 @xl:grid-cols-4">
        {s.rigs.map((r) => (
          <RigTile key={r.id} rig={r} t={t} selected={s.selected === r.id} />
        ))}
      </div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  unit,
  accent = false,
  className = "",
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={`bg-[#0d1117] px-3 py-2 @lg:px-4 ${className}`}>
      <div className="text-[9px] uppercase tracking-wider text-white/35">
        {label}
      </div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span
          className={`font-mono text-base leading-none tabular-nums @lg:text-lg ${
            accent ? "text-[#13d6a3]" : "text-[#e6edf3]"
          }`}
        >
          {value}
        </span>
        {unit && (
          <span className="font-mono text-[9px] text-white/35">{unit}</span>
        )}
      </div>
    </div>
  );
}

function RigTile({
  rig,
  t,
  selected,
}: {
  rig: Rig;
  t: Strings;
  selected: boolean;
}) {
  const warn = rig.status === "warn";
  return (
    <div
      data-demo={`rig-${rig.id}`}
      className={`flex min-h-0 flex-col justify-between overflow-hidden rounded-md border p-2 transition-colors duration-500 @lg:p-2.5 ${
        warn
          ? "border-amber-400/50 bg-amber-400/[0.07]"
          : selected
            ? "border-[#13d6a3]/60 bg-[#13d6a3]/[0.05]"
            : "border-white/[0.07] bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="truncate font-mono text-[10px] tracking-wide text-white/55">
          {rig.id}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {warn && (
            <span className="font-mono text-[8px] uppercase tracking-wider text-amber-400">
              {t.warn}
            </span>
          )}
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
              warn ? "animate-pulse bg-amber-400" : "bg-[#13d6a3]"
            }`}
          />
        </span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="font-mono text-base leading-none tabular-nums @lg:text-xl">
          {rig.hash.toFixed(1)}
        </span>
        <span className="font-mono text-[9px] text-white/35">TH/s</span>
      </div>

      <div className="font-mono text-[9px] tabular-nums @lg:text-[10px]">
        <div className="flex items-center justify-between">
          <span className="text-white/35">{t.temp}</span>
          <span
            className={`transition-colors duration-500 ${
              warn ? "text-amber-400" : "text-white/70"
            }`}
          >
            {Math.round(rig.temp)}°C
          </span>
        </div>
        <div className="mt-0.5 hidden items-center justify-between @xl:flex">
          <span className="text-white/35">{t.fan}</span>
          <span className="text-white/70">{Math.round(rig.fan)}%</span>
        </div>
        <div className="mt-1 hidden h-px w-full overflow-hidden rounded-full bg-white/[0.07] @xl:block">
          <div
            className={`h-full transition-all duration-1000 ${
              warn ? "bg-amber-400/80" : "bg-[#13d6a3]/70"
            }`}
            style={{ width: `${Math.round(rig.fan)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Панель деталей рига (оверлей; на широком — боковой drawer)          */
/* ------------------------------------------------------------------ */

function RigPanel({
  rig,
  t,
  uid,
  ticks,
}: {
  rig: Rig;
  t: Strings;
  uid: string;
  ticks: number;
}) {
  const warn = rig.status === "warn";
  const color = warn ? "#fbbf24" : ACCENT;

  return (
    <>
      <motion.div
        className="absolute inset-0 bg-black/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      />
      <motion.aside
        className="absolute inset-y-0 right-0 flex w-full flex-col border-l border-white/[0.08] bg-[#0f141c] @md:w-72 @xl:w-80"
        initial={{ x: "104%" }}
        animate={{ x: 0 }}
        exit={{ x: "104%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
      >
        {/* шапка панели */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-mono text-sm tracking-wide">
              {rig.id}
            </span>
            <span
              className={`shrink-0 rounded-full border px-1.5 py-px font-mono text-[8px] uppercase tracking-wider ${
                warn
                  ? "border-amber-400/40 bg-amber-400/10 text-amber-400"
                  : "border-[#13d6a3]/30 bg-[#13d6a3]/10 text-[#13d6a3]"
              }`}
            >
              {warn ? t.statusWarn : t.statusOk}
            </span>
          </div>
          <span
            data-demo="panel-close"
            className="flex size-6 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/60"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path
                d="M1 1l8 8M9 1l-8 8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </div>

        {/* температурная мини-диаграмма */}
        <div className="shrink-0 border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[9px] uppercase tracking-wider text-white/35">
              {t.panelTemp}
            </span>
            <span
              className={`font-mono text-[11px] tabular-nums transition-colors duration-500 ${
                warn ? "text-amber-400" : "text-white/60"
              }`}
            >
              {Math.round(rig.temp)}°C
            </span>
          </div>
          <LineChart
            values={rig.tempHist}
            id={`${uid}-temp`}
            color={color}
            className="mt-1.5 h-12 w-full"
          />
        </div>

        {/* показатели */}
        <div className="min-h-0 flex-1 space-y-2.5 overflow-hidden px-4 py-3">
          <PanelRow label={t.rowHash} value={`${rig.hash.toFixed(2)} TH/s`} accent />
          <PanelRow label={t.temp} value={`${Math.round(rig.temp)}°C`} />
          <PanelRow label={t.rowPower} value={`${(rig.hash * 0.104).toFixed(2)} kW`} />
          <PanelRow
            label={t.rowShares}
            value={(18_402 + ticks * 3).toLocaleString("en-US")}
          />
          <PanelRow label={t.rowUptime} value={fmtUptime(ticks, t.dayUnit)} />

          {/* шкала вентилятора */}
          <div className="pt-1">
            <div className="flex items-center justify-between font-mono text-[10px] tabular-nums">
              <span className="font-sans text-[9px] uppercase tracking-wider text-white/35">
                {t.fan}
              </span>
              <span className="text-white/70">{Math.round(rig.fan)}%</span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  warn ? "bg-amber-400/80" : "bg-[#13d6a3]/70"
                }`}
                style={{ width: `${Math.round(rig.fan)}%` }}
              />
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function PanelRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[9px] uppercase tracking-wider text-white/35">
        {label}
      </span>
      <span
        className={`font-mono text-[11px] tabular-nums ${
          accent ? "text-[#13d6a3]" : "text-white/80"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Экран «Отчёты»                                                      */
/* ------------------------------------------------------------------ */

function Reports({
  t,
  period,
  locale,
}: {
  t: Strings;
  period: "7d" | "30d";
  locale: "ru" | "en";
}) {
  const rows = reportRows(period, locale);
  const sum = periodSummary(rows);
  const tableRows = rows.slice(-4).reverse(); // свежие сверху
  const min = Math.min(...rows.map((r) => r.hash));
  const max = Math.max(...rows.map((r) => r.hash));
  const span = Math.max(max - min, 0.5);

  return (
    <motion.div
      className="flex h-full w-full flex-col bg-[#0d1117]"
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 28 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* заголовок + переключатель периода */}
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 pt-2.5 @lg:px-4">
        <span className="truncate text-[11px] font-semibold tracking-tight @lg:text-xs">
          {t.reportsTitle}
        </span>
        <div className="flex shrink-0 rounded-md border border-white/10 bg-white/[0.03] p-0.5 font-mono text-[10px]">
          <PeriodBtn active={period === "7d"} label={t.period7} />
          <PeriodBtn active={period === "30d"} label={t.period30} demo="period-30" />
        </div>
      </div>

      {/* сводка периода */}
      <div className="grid shrink-0 grid-cols-3 gap-1.5 px-3 pt-2 @lg:gap-2 @lg:px-4">
        <SumCell label={t.sumHash} value={sum.hash.toFixed(1)} unit="TH/s" accent />
        <SumCell label={t.sumUptime} value={`${sum.uptime.toFixed(2)}%`} />
        <SumCell label={t.sumIncidents} value={String(sum.incidents)} />
      </div>

      {/* бар-чарт по дням */}
      <div className="min-h-0 flex-1 px-3 pb-1 pt-2.5 @lg:px-4">
        <div className="flex h-full items-end gap-[3px] @lg:gap-1">
          {rows.map((d, i) => {
            const h = 22 + ((d.hash - min) / span) * 74;
            const isLast = i === rows.length - 1;
            const showLabel = period === "7d" || i % 5 === 4;
            return (
              <div
                key={`${period}-${d.label}`}
                className="flex h-full min-w-0 flex-1 flex-col justify-end"
              >
                <motion.div
                  className={`w-full rounded-t-[3px] ${
                    isLast ? "bg-[#13d6a3]" : "bg-[#13d6a3]/40"
                  }`}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{
                    duration: 0.5,
                    delay: i * (period === "7d" ? 0.05 : 0.015),
                    ease: "easeOut",
                  }}
                />
                <div className="h-3.5 shrink-0 overflow-hidden pt-0.5 text-center font-mono text-[8px] whitespace-nowrap text-white/30 @lg:text-[9px]">
                  {showLabel ? d.label : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* таблица последних дней */}
      <div className="shrink-0 border-t border-white/[0.06] px-3 pb-2 pt-0.5 @lg:px-4">
        <table className="w-full table-fixed font-mono text-[10px] tabular-nums">
          <thead>
            <tr className="text-left text-[8px] uppercase tracking-wider text-white/30">
              <th className="py-1 font-normal">{t.thDate}</th>
              <th className="py-1 text-right font-normal">{t.thHash}</th>
              <th className="py-1 text-right font-normal">{t.thUptime}</th>
              <th className="hidden py-1 text-right font-normal @md:table-cell">
                {t.thInc}
              </th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((d) => (
              <tr key={d.label} className="border-t border-white/[0.04] text-white/70">
                <td className="py-[3px]">{d.label}</td>
                <td className="py-[3px] text-right text-[#13d6a3]/90">
                  {d.hash.toFixed(1)}
                </td>
                <td className="py-[3px] text-right">{d.uptime.toFixed(2)}%</td>
                <td className="hidden py-[3px] text-right @md:table-cell">
                  {d.incidents}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function PeriodBtn({
  active,
  label,
  demo,
}: {
  active: boolean;
  label: string;
  demo?: string;
}) {
  return (
    <span
      data-demo={demo}
      className={`rounded-[5px] px-2 py-0.5 transition-colors duration-300 ${
        active ? "bg-[#13d6a3]/15 text-[#13d6a3]" : "text-white/40"
      }`}
    >
      {label}
    </span>
  );
}

function SumCell({
  label,
  value,
  unit,
  accent = false,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-md border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5">
      <div className="truncate text-[8px] uppercase tracking-wider text-white/35 @lg:text-[9px]">
        {label}
      </div>
      <div className="mt-0.5 flex items-baseline gap-1 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className={`font-mono text-[13px] leading-none tabular-nums @lg:text-sm ${
              accent ? "text-[#13d6a3]" : "text-[#e6edf3]"
            }`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
        {unit && (
          <span className="font-mono text-[8px] text-white/35">{unit}</span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Линия с градиентной заливкой (спарклайн / температура)              */
/* ------------------------------------------------------------------ */

function LineChart({
  values,
  id,
  color,
  className = "",
}: {
  values: number[];
  id: string;
  color: string;
  className?: string;
}) {
  const W = 100;
  const H = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1.5);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - 3 - ((v - min) / span) * (H - 7);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.33, 0.66].map((f) => (
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
      <path d={`M0,${H} L${pts.join(" L")} L${W},${H} Z`} fill={`url(#${id})`} />
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
