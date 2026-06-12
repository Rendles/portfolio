"use client";

// INT3GRATE — реконструкция фрагмента «Оргструктура AI-агентов» для портфолио.
// Самодостаточный экспонат в фиксированной дизайн-системе продукта
// (тёмный фиолетово-нейтральный, accent #6e56ff). Граф нарисован вручную
// на SVG — в проде эту роль выполняет XYFlow.

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import type { ExhibitProps } from "./types";

/* ─── дизайн-токены продукта ─────────────────────────────────────────── */

const ACCENT = "#6e56ff";
const NODE_W = 148;
const NODE_H = 54;

type Status = "active" | "busy" | "idle";

const STATUS_COLOR: Record<Status, string> = {
  active: "#3ddc97",
  busy: "#f0a64b",
  idle: "#6b6880",
};

/* ─── данные графа ───────────────────────────────────────────────────── */

type LogItem = { time: string; ru: string; en: string };

type Agent = {
  id: string;
  name: string;
  model: string;
  status: Status;
  x: number; // центр узла в координатах viewBox
  y: number;
  parent: string | null;
  tasksToday: number;
  baseCost: number; // $ с начала дня
  log: LogItem[];
};

const AGENTS: Agent[] = [
  {
    id: "orchestrator",
    name: "Orchestrator",
    model: "opus-4.5",
    status: "active",
    x: 320, y: 56,
    parent: null,
    tasksToday: 48,
    baseCost: 1.84,
    log: [
      { time: "14:21", ru: "задача → Sales Lead", en: "task assigned → Sales Lead" },
      { time: "14:18", ru: "план обновлён (12 шагов)", en: "plan updated (12 steps)" },
      { time: "14:05", ru: "эскалация от Support принята", en: "escalation from Support accepted" },
    ],
  },
  {
    id: "sales",
    name: "Sales Lead",
    model: "sonnet-4.6",
    status: "active",
    x: 150, y: 200,
    parent: "orchestrator",
    tasksToday: 19,
    baseCost: 0.62,
    log: [
      { time: "14:19", ru: "лид квалифицирован → CRM", en: "lead qualified → CRM" },
      { time: "14:12", ru: "задача → SDR Bot", en: "task assigned → SDR Bot" },
      { time: "13:58", ru: "отчёт отправлен Orchestrator", en: "report sent to Orchestrator" },
    ],
  },
  {
    id: "ops",
    name: "Ops Manager",
    model: "sonnet-4.6",
    status: "active",
    x: 382, y: 188,
    parent: "orchestrator",
    tasksToday: 23,
    baseCost: 0.71,
    log: [
      { time: "14:20", ru: "очередь: 4 задачи", en: "queue: 4 tasks" },
      { time: "14:07", ru: "задача → Support", en: "task assigned → Support" },
    ],
  },
  {
    id: "analyst",
    name: "Analyst",
    model: "sonnet-4.6",
    status: "idle",
    x: 586, y: 150,
    parent: "orchestrator",
    tasksToday: 6,
    baseCost: 0.18,
    log: [
      { time: "13:40", ru: "дашборд расходов обновлён", en: "spend dashboard updated" },
      { time: "12:55", ru: "аномалий не найдено", en: "no anomalies detected" },
    ],
  },
  {
    id: "sdr",
    name: "SDR Bot",
    model: "haiku-4.5",
    status: "busy",
    x: 84, y: 350,
    parent: "sales",
    tasksToday: 120,
    baseCost: 0.94,
    log: [
      { time: "14:21", ru: "письмо отправлено (37/120)", en: "email sent (37/120)" },
      { time: "14:20", ru: "контакт обогащён", en: "contact enriched" },
    ],
  },
  {
    id: "pricing",
    name: "Pricing",
    model: "haiku-4.5",
    status: "idle",
    x: 252, y: 368,
    parent: "sales",
    tasksToday: 4,
    baseCost: 0.07,
    log: [
      { time: "13:02", ru: "смета №214 готова", en: "quote #214 ready" },
      { time: "12:48", ru: "ожидает входных данных", en: "waiting for input" },
    ],
  },
  {
    id: "support",
    name: "Support",
    model: "sonnet-4.6",
    status: "busy",
    x: 450, y: 340,
    parent: "ops",
    tasksToday: 31,
    baseCost: 0.47,
    log: [
      { time: "14:22", ru: "тикет #882 закрыт", en: "ticket #882 closed" },
      { time: "14:17", ru: "ответ клиенту отправлен", en: "reply sent to customer" },
      { time: "14:11", ru: "тикет #882 принят", en: "ticket #882 accepted" },
    ],
  },
];

const BY_ID = new Map(AGENTS.map((a) => [a.id, a]));

const EDGES = AGENTS.filter((a) => a.parent).map((a) => ({
  from: a.parent as string,
  to: a.id,
}));

function edgePath(from: Agent, to: Agent): string {
  const x1 = from.x;
  const y1 = from.y + NODE_H / 2;
  const x2 = to.x;
  const y2 = to.y - NODE_H / 2;
  const bend = Math.max(36, (y2 - y1) * 0.55);
  return `M ${x1} ${y1} C ${x1} ${y1 + bend}, ${x2} ${y2 - bend}, ${x2} ${y2}`;
}

/* ─── строки UI ──────────────────────────────────────────────────────── */

const STR = {
  ru: {
    title: "Оргструктура",
    graph: "Граф",
    table: "Таблица",
    agentsCount: (n: number, act: number) => `${n} агентов · ${act} активны`,
    today: "сегодня",
    model: "Модель",
    tasksToday: "Задач сегодня",
    spendToday: "Расход сегодня",
    activity: "Последние события",
    details: "Агент",
    status: { active: "активен", busy: "занят", idle: "ожидает" } as Record<Status, string>,
    legend: { active: "активен", busy: "занят", idle: "ожидает" } as Record<Status, string>,
  },
  en: {
    title: "Org structure",
    graph: "Graph",
    table: "Table",
    agentsCount: (n: number, act: number) => `${n} agents · ${act} active`,
    today: "today",
    model: "Model",
    tasksToday: "Tasks today",
    spendToday: "Spend today",
    activity: "Recent activity",
    details: "Agent",
    status: { active: "active", busy: "busy", idle: "idle" } as Record<Status, string>,
    legend: { active: "active", busy: "busy", idle: "idle" } as Record<Status, string>,
  },
};

const money = (v: number) => `$${v.toFixed(2)}`;

/* ─── компонент ──────────────────────────────────────────────────────── */

export default function Int3grateExhibit({ locale }: ExhibitProps) {
  const t = STR[locale];
  const [selectedId, setSelectedId] = useState("orchestrator");

  // Расход $ по агентам: тикает вверх на «копейки» у работающих агентов.
  const [costs, setCosts] = useState<Record<string, number>>(() =>
    Object.fromEntries(AGENTS.map((a) => [a.id, a.baseCost])),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setCosts((prev) => {
        const next = { ...prev };
        for (const a of AGENTS) {
          if (a.status !== "idle") {
            next[a.id] = next[a.id] + 0.004 + Math.random() * 0.028;
          }
        }
        return next;
      });
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const totalCost = useMemo(
    () => Object.values(costs).reduce((s, v) => s + v, 0),
    [costs],
  );

  const selected = BY_ID.get(selectedId) ?? AGENTS[0];
  const activeCount = AGENTS.filter((a) => a.status === "active").length;

  const isEdgeHot = (e: { from: string; to: string }) =>
    e.from === selectedId || e.to === selectedId;

  return (
    <div className="flex w-full flex-col bg-[#0e0d16] text-[#f2f0fa] md:h-[560px]">
      {/* ── шапка фрагмента ── */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/[0.07] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          {/* мини-логотип продукта */}
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #4a35c2)` }}
            aria-hidden
          >
            i3
          </span>
          <h2 className="text-sm font-semibold tracking-tight">{t.title}</h2>
        </div>

        {/* переключатель вида (декорация: активен Graph) */}
        <div
          className="flex items-center gap-0.5 rounded-lg bg-white/[0.05] p-0.5 text-xs"
          role="tablist"
          aria-label="View"
        >
          <button
            role="tab"
            aria-selected="true"
            className="rounded-md bg-[#262240] px-3 py-1 font-medium text-white shadow-[inset_0_0_0_1px_rgba(110,86,255,0.35)]"
          >
            {t.graph}
          </button>
          <button
            role="tab"
            aria-selected="false"
            className="cursor-default rounded-md px-3 py-1 text-white/35"
          >
            {t.table}
          </button>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-white/40">
            {t.agentsCount(AGENTS.length, activeCount)}
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-[#6e56ff]/30 bg-[#6e56ff]/10 px-2.5 py-1 text-xs font-medium text-[#b3a6ff] tabular-nums">
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <circle cx="5" cy="5" r="3.5" fill="none" stroke={ACCENT} strokeWidth="1.5" />
              <path d="M5 3.2v3.6M3.8 4.2h2.4M3.8 5.8h2.4" stroke={ACCENT} strokeWidth="0.9" />
            </svg>
            {money(totalCost)} {t.today}
          </span>
        </div>
      </header>

      {/* ── тело: граф + панель деталей ── */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* граф */}
        <div className="relative h-[340px] min-h-0 md:h-auto md:flex-1">
          {/* точечная сетка-фон, как на канвасе */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
            aria-hidden
          />
          {/* мягкое свечение сверху */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 45% at 50% 0%, rgba(110,86,255,0.10), transparent 70%)",
            }}
            aria-hidden
          />

          <div className="h-full w-full overflow-auto">
            <svg
              viewBox="0 0 720 412"
              preserveAspectRatio="xMidYMid meet"
              className="h-full w-full min-w-[540px]"
              role="group"
              aria-label={t.title}
            >
              {/* рёбра */}
              {EDGES.map((e, i) => {
                const from = BY_ID.get(e.from) as Agent;
                const to = BY_ID.get(e.to) as Agent;
                const d = edgePath(from, to);
                const hot = isEdgeHot(e);
                return (
                  <g key={`${e.from}-${e.to}`}>
                    <path
                      d={d}
                      fill="none"
                      stroke={hot ? ACCENT : "rgba(255,255,255,0.10)"}
                      strokeOpacity={hot ? 0.65 : 1}
                      strokeWidth={hot ? 1.5 : 1}
                      className="transition-all duration-300"
                    />
                    {/* «пульс» — задача, бегущая по ребру */}
                    <circle
                      r={hot ? 3 : 2.3}
                      fill={hot ? "#a797ff" : "#564a8f"}
                      opacity={hot ? 0.95 : 0.7}
                    >
                      <animateMotion
                        dur={`${2.6 + (i % 3) * 0.5}s`}
                        begin={`-${(i * 0.7).toFixed(1)}s`}
                        repeatCount="indefinite"
                        path={d}
                      />
                    </circle>
                  </g>
                );
              })}

              {/* узлы */}
              {AGENTS.map((a) => {
                const sel = a.id === selectedId;
                return (
                  <g
                    key={a.id}
                    transform={`translate(${a.x - NODE_W / 2}, ${a.y - NODE_H / 2})`}
                    onClick={() => setSelectedId(a.id)}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedId(a.id)}
                    tabIndex={0}
                    role="button"
                    aria-pressed={sel}
                    aria-label={`${a.name} — ${t.status[a.status]}`}
                    className="group cursor-pointer outline-none"
                  >
                    {/* внешнее кольцо выделения */}
                    {sel && (
                      <rect
                        x={-4}
                        y={-4}
                        width={NODE_W + 8}
                        height={NODE_H + 8}
                        rx={15}
                        fill="none"
                        stroke={ACCENT}
                        strokeOpacity={0.35}
                        strokeWidth={1.5}
                      />
                    )}
                    <rect
                      width={NODE_W}
                      height={NODE_H}
                      rx={12}
                      fill={sel ? "#1a1729" : "#15131f"}
                      stroke={sel ? ACCENT : "rgba(255,255,255,0.10)"}
                      strokeWidth={sel ? 1.5 : 1}
                      className="transition-all duration-200 group-hover:stroke-white/30 group-focus-visible:stroke-white/40"
                      style={
                        sel
                          ? { filter: "drop-shadow(0 0 14px rgba(110,86,255,0.40))" }
                          : undefined
                      }
                    />
                    {/* статус-индикатор */}
                    <circle
                      cx={18}
                      cy={NODE_H / 2}
                      r={6.5}
                      fill={STATUS_COLOR[a.status]}
                      opacity={0.16}
                    />
                    <circle cx={18} cy={NODE_H / 2} r={3.2} fill={STATUS_COLOR[a.status]} />
                    <text
                      x={32}
                      y={NODE_H / 2 - 3}
                      fontSize={12}
                      fontWeight={600}
                      fill="#f2f0fa"
                      className="pointer-events-none select-none"
                    >
                      {a.name}
                    </text>
                    <text
                      x={32}
                      y={NODE_H / 2 + 13}
                      fontSize={9.5}
                      fill="rgba(255,255,255,0.40)"
                      className="pointer-events-none select-none font-mono"
                    >
                      {a.model}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* легенда статусов */}
          <div className="pointer-events-none absolute bottom-2.5 left-3.5 flex items-center gap-3 text-[10px] text-white/35">
            {(["active", "busy", "idle"] as Status[]).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: STATUS_COLOR[s] }}
                />
                {t.legend[s]}
              </span>
            ))}
          </div>
        </div>

        {/* панель деталей: справа на десктопе, снизу на мобильном */}
        <aside className="w-full shrink-0 border-t border-white/[0.07] bg-[#121019] md:w-[280px] md:border-l md:border-t-0">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex h-full flex-col px-4 py-4 sm:px-5"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/30">
              {t.details}
            </p>

            <div className="mt-2 flex items-center gap-2.5">
              <span
                className="size-2.5 rounded-full"
                style={{
                  background: STATUS_COLOR[selected.status],
                  boxShadow: `0 0 8px ${STATUS_COLOR[selected.status]}66`,
                }}
              />
              <h3 className="text-base font-semibold tracking-tight">{selected.name}</h3>
              <span
                className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  color: STATUS_COLOR[selected.status],
                  background: `${STATUS_COLOR[selected.status]}1f`,
                }}
              >
                {t.status[selected.status]}
              </span>
            </div>

            <dl className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <dt className="text-white/40">{t.model}</dt>
                <dd className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[11px] text-white/80">
                  {selected.model}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-white/40">{t.tasksToday}</dt>
                <dd className="font-medium tabular-nums">{selected.tasksToday}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-white/40">{t.spendToday}</dt>
                <dd className="font-medium text-[#b3a6ff] tabular-nums">
                  {money(costs[selected.id] ?? 0)}
                </dd>
              </div>
            </dl>

            <div className="my-4 h-px bg-white/[0.07]" />

            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/30">
              {t.activity}
            </p>
            <ul className="mt-2.5 space-y-2">
              {selected.log.map((item, i) => (
                <li key={i} className="flex gap-2.5 text-xs leading-snug">
                  <span className="shrink-0 font-mono text-[10px] text-white/30 tabular-nums">
                    {item.time}
                  </span>
                  <span className="text-white/70">{item[locale]}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
