"use client";

// DATAPRANA — реконструкция фрагмента кабинета «Выплаты по контрактам».
// Собственная светлая финтех-тема продукта (в проде — Chakra UI + TanStack Table
// + Chart.js), не зависит от текущего дизайн-режима портфолио.
// Данные демонстрационные и статичные: живость даёт интерактив —
// сортировка по сумме/дате и раскрытие строк с деталями.
import { Fragment, useMemo, useState } from "react";
import { motion } from "motion/react";
import type { ExhibitProps } from "./types";

/* ─── палитра продукта ─────────────────────────────────────────────── */

const ACCENT = "#3b9dff";
const INK = "#1b2a41"; // основной текст
const MUTED = "#5e6e84"; // вторичный текст
const FAINT = "#8a99ad"; // подписи
const LINE = "#e4eaf2"; // границы
const CANVAS = "#f7f9fc"; // фон страницы

/* ─── данные (демо) ─────────────────────────────────────────────────── */

type Status = "paid" | "processing" | "pending";

type Row = {
  id: string;
  name: string;
  wallet: string;
  amount: number;
  date: string; // ISO, дата выплаты/заявки
  status: Status;
  invoice: string;
  spark: number[]; // выплаты по контракту за 6 месяцев, $k
  created: string;
  approved: string | null;
  paidAt: string | null;
};

const ROWS: Row[] = [
  {
    id: "CT-1042",
    name: "Nimbus Media",
    wallet: "0x1a2b8f04c9De73a51B6e02dD41f98E27a0b1c3d4",
    amount: 12840,
    date: "2026-06-10",
    status: "processing",
    invoice: "INV-2026-0712",
    spark: [4.2, 7.8, 6.1, 9.4, 8.2, 12.84],
    created: "2026-06-06",
    approved: "2026-06-08",
    paidAt: null,
  },
  {
    id: "CT-1038",
    name: "Atlas Logistics",
    wallet: "0x9c41Ee27b30aF8d2C65501bA9e74D03c812fE6a1",
    amount: 48200,
    date: "2026-06-04",
    status: "paid",
    invoice: "INV-2026-0688",
    spark: [21.5, 28.0, 24.6, 35.2, 41.9, 48.2],
    created: "2026-05-30",
    approved: "2026-06-02",
    paidAt: "2026-06-04",
  },
  {
    id: "CT-1051",
    name: "Vertex Labs",
    wallet: "0x5fD20c7aB14E96d8430Cc1fa278B5eD09241aA77",
    amount: 7950,
    date: "2026-06-02",
    status: "pending",
    invoice: "INV-2026-0679",
    spark: [2.1, 3.4, 5.0, 4.2, 6.8, 7.95],
    created: "2026-06-02",
    approved: null,
    paidAt: null,
  },
  {
    id: "CT-1027",
    name: "Orbita Retail",
    wallet: "0x73Ba6e15Dd02c84fA9107bC3e5F46a28d90E1b52",
    amount: 23460,
    date: "2026-05-28",
    status: "paid",
    invoice: "INV-2026-0641",
    spark: [18.4, 15.2, 19.8, 17.5, 22.1, 23.46],
    created: "2026-05-22",
    approved: "2026-05-25",
    paidAt: "2026-05-28",
  },
  {
    id: "CT-1033",
    name: "Helios Energy",
    wallet: "0xb804dD96e21Fc7a3508Ee14B6f92aC07d135fB29",
    amount: 31775.5,
    date: "2026-05-21",
    status: "processing",
    invoice: "INV-2026-0617",
    spark: [12.0, 16.6, 14.3, 21.7, 26.4, 31.78],
    created: "2026-05-17",
    approved: "2026-05-19",
    paidAt: null,
  },
  {
    id: "CT-1019",
    name: "Polar Finance",
    wallet: "0x2eC95a40F17dB683c021Aa86D54e09bF3d76c8E0",
    amount: 9310,
    date: "2026-05-15",
    status: "paid",
    invoice: "INV-2026-0594",
    spark: [6.5, 8.9, 7.2, 10.1, 8.6, 9.31],
    created: "2026-05-10",
    approved: "2026-05-12",
    paidAt: "2026-05-15",
  },
  {
    id: "CT-1008",
    name: "Quanta Systems",
    wallet: "0xe617F30bC92aD485f1B06dA72c84E95001dDb4c8",
    amount: 54120,
    date: "2026-05-07",
    status: "paid",
    invoice: "INV-2026-0552",
    spark: [30.2, 38.7, 35.0, 44.5, 49.8, 54.12],
    created: "2026-05-02",
    approved: "2026-05-04",
    paidAt: "2026-05-07",
  },
];

/* ─── строки UI ─────────────────────────────────────────────────────── */

const T = {
  title: { ru: "Выплаты", en: "Payouts" },
  subtitle: {
    ru: "Выплаты по активным контрактам",
    en: "Payouts across active contracts",
  },
  period: { ru: "Последние 30 дней", en: "Last 30 days" },
  statPaid: { ru: "Всего выплачено", en: "Total paid out" },
  statProcessing: { ru: "В обработке", en: "In processing" },
  statContracts: { ru: "Активных контрактов", en: "Active contracts" },
  colContract: { ru: "Контракт", en: "Contract" },
  colWallet: { ru: "Кошелёк", en: "Wallet" },
  colAmount: { ru: "Сумма", en: "Amount" },
  colDate: { ru: "Дата", en: "Date" },
  colStatus: { ru: "Статус", en: "Status" },
  rowToggle: { ru: "Показать детали", en: "Toggle details" },
  detailInvoice: { ru: "Инвойс", en: "Invoice" },
  detailWallet: { ru: "Адрес кошелька", en: "Wallet address" },
  detailSpark: { ru: "Выплаты · 6 мес", en: "Payouts · 6 mo" },
  detailTimeline: { ru: "Статус выплаты", en: "Payout status" },
  stepCreated: { ru: "Создана", en: "Created" },
  stepApproved: { ru: "Подтверждена", en: "Approved" },
  stepPaid: { ru: "Выплачена", en: "Paid" },
  pendingDate: { ru: "ожидается", en: "pending" },
  statuses: {
    paid: { ru: "Выплачено", en: "Paid" },
    processing: { ru: "В обработке", en: "Processing" },
    pending: { ru: "Ожидает", en: "Pending" },
  } satisfies Record<Status, { ru: string; en: string }>,
} as const;

/* ─── хелперы ───────────────────────────────────────────────────────── */

function money(n: number, frac = 2): string {
  return (
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: frac,
      maximumFractionDigits: frac,
    })
  );
}

function shortAddr(a: string): string {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function fmtDate(iso: string, locale: "ru" | "en", withYear = true): string {
  return new Date(iso + "T00:00:00").toLocaleDateString(
    locale === "ru" ? "ru-RU" : "en-US",
    withYear
      ? { day: "numeric", month: "short", year: "numeric" }
      : { day: "numeric", month: "short" },
  );
}

/* ─── мелкие куски интерфейса ───────────────────────────────────────── */

const BADGE: Record<Status, { bg: string; text: string; dot: string }> = {
  paid: { bg: "#e6f7ef", text: "#177245", dot: "#22c55e" },
  processing: { bg: "#e8f3ff", text: "#1d6fd1", dot: ACCENT },
  pending: { bg: "#fdf3e1", text: "#b45309", dot: "#f59e0b" },
};

function StatusBadge({ status, locale }: { status: Status; locale: "ru" | "en" }) {
  const c = BADGE[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: c.bg, color: c.text }}
    >
      <span className="size-1.5 rounded-full" style={{ background: c.dot }} />
      {T.statuses[status][locale]}
    </span>
  );
}

function SortGlyph({ dir }: { dir: "asc" | "desc" | null }) {
  if (dir === null) {
    // нейтральная пара стрелок у несортированной колонки
    return (
      <svg width="8" height="12" viewBox="0 0 8 12" aria-hidden style={{ color: "#b7c3d2" }}>
        <path d="M4 0.5 7 4H1L4 0.5Z" fill="currentColor" />
        <path d="M4 11.5 1 8h6l-3 3.5Z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" aria-hidden style={{ color: ACCENT }}>
      {dir === "asc" ? (
        <path d="M4 1.5 7.5 8h-7L4 1.5Z" fill="currentColor" />
      ) : (
        <path d="M4 10.5.5 4h7L4 10.5Z" fill="currentColor" />
      )}
    </svg>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const W = 148;
  const H = 40;
  const PAD = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [
    PAD + (i * (W - PAD * 2)) / (values.length - 1),
    H - PAD - ((v - min) / span) * (H - PAD * 2),
  ]);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${H - 1} L${pts[0][0].toFixed(1)} ${H - 1} Z`;
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden className="block">
      <path d={area} fill={ACCENT} fillOpacity="0.09" />
      <path d={line} fill="none" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="3" fill="#fff" stroke={ACCENT} strokeWidth="1.6" />
    </svg>
  );
}

function Timeline({ row, locale }: { row: Row; locale: "ru" | "en" }) {
  const steps = [
    { label: T.stepCreated[locale], date: row.created },
    { label: T.stepApproved[locale], date: row.approved },
    { label: T.stepPaid[locale], date: row.paidAt },
  ];
  return (
    <ol className="m-0 list-none p-0">
      {steps.map((s, i) => {
        const done = s.date !== null;
        const nextDone = i < steps.length - 1 && steps[i + 1].date !== null;
        return (
          <li key={s.label} className="flex gap-2.5">
            <div className="flex w-3 flex-col items-center">
              <span
                className="mt-[3px] size-2.5 shrink-0 rounded-full"
                style={
                  done
                    ? { background: ACCENT }
                    : { background: "#fff", boxShadow: `inset 0 0 0 1.5px #c3cedc` }
                }
              />
              {i < steps.length - 1 && (
                <span
                  className="w-px flex-1"
                  style={{ background: nextDone ? ACCENT : LINE, minHeight: 14 }}
                />
              )}
            </div>
            <div className={i < steps.length - 1 ? "pb-2.5" : ""}>
              <p className="text-xs font-medium leading-4" style={{ color: done ? INK : FAINT }}>
                {s.label}
              </p>
              <p className="text-[11px] leading-4" style={{ color: FAINT }}>
                {s.date ? fmtDate(s.date, locale, false) : T.pendingDate[locale]}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ─── экспонат ──────────────────────────────────────────────────────── */

type SortKey = "amount" | "date";

export default function DatapranaExhibit({ locale }: ExhibitProps) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "date",
    dir: "desc",
  });
  // По умолчанию раскрыта верхняя (свежая) строка — у неё незавершённый таймлайн.
  const [open, setOpen] = useState<Set<string>>(() => new Set(["CT-1042"]));

  const toggleSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" },
    );

  const toggleRow = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const rows = useMemo(() => {
    const sorted = [...ROWS].sort((a, b) => {
      const v = sort.key === "amount" ? a.amount - b.amount : a.date.localeCompare(b.date);
      return sort.dir === "asc" ? v : -v;
    });
    return sorted;
  }, [sort]);

  const stats = useMemo(() => {
    const paid = ROWS.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0);
    const processing = ROWS.filter((r) => r.status !== "paid").reduce((s, r) => s + r.amount, 0);
    return { paid, processing, contracts: ROWS.length };
  }, []);

  const headerBtn = (key: SortKey, label: string) => (
    <button
      type="button"
      onClick={() => toggleSort(key)}
      className="inline-flex items-center gap-1.5 rounded transition-colors hover:text-[#1b2a41] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b9dff]"
      style={{ color: sort.key === key ? INK : undefined }}
    >
      {label}
      <SortGlyph dir={sort.key === key ? sort.dir : null} />
    </button>
  );

  const statCards = [
    {
      label: T.statPaid[locale],
      value: money(stats.paid, 0),
      icon: (
        <path d="M3.5 8.5 6.5 11.5 12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
      ),
      iconBg: "#e6f7ef",
      iconColor: "#177245",
    },
    {
      label: T.statProcessing[locale],
      value: money(stats.processing, 0),
      icon: (
        <>
          <circle cx="8" cy="8" r="5.5" />
          <path d="M8 5.2V8l2 1.4" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ),
      iconBg: "#e8f3ff",
      iconColor: "#1d6fd1",
    },
    {
      label: T.statContracts[locale],
      value: String(stats.contracts),
      icon: (
        <>
          <rect x="3.5" y="2.5" width="9" height="11" rx="1.5" />
          <path d="M6 5.8h4M6 8.3h4M6 10.8h2.5" strokeLinecap="round" />
        </>
      ),
      iconBg: "#f0ecff",
      iconColor: "#6d5cd3",
    },
  ];

  return (
    <div
      className="w-full p-4 antialiased sm:p-6"
      style={{ background: CANVAS, color: INK, fontFeatureSettings: '"tnum"' }}
    >
      {/* шапка */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight sm:text-xl">{T.title[locale]}</h2>
          <p className="mt-0.5 text-xs" style={{ color: MUTED }}>
            {T.subtitle[locale]}
          </p>
        </div>
        {/* период — декорация селектора */}
        <div
          className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs font-medium shadow-[0_1px_2px_rgba(16,42,67,0.05)]"
          style={{ borderColor: LINE, color: MUTED }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
            <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
            <path d="M2.5 6.8h11M5.5 1.8v3M10.5 1.8v3" strokeLinecap="round" />
          </svg>
          {T.period[locale]}
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
            <path d="M2 3.5 5 6.5 8 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* стат-карточки */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {statCards.map((c) => (
          <div
            key={c.label}
            className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(16,42,67,0.05),0_10px_28px_-18px_rgba(16,42,67,0.18)]"
            style={{ borderColor: LINE }}
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: c.iconBg, color: c.iconColor }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                {c.icon}
              </svg>
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium" style={{ color: FAINT }}>
                {c.label}
              </p>
              <p className="text-base font-bold tabular-nums tracking-tight sm:text-lg">
                {c.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* таблица */}
      <div
        className="mt-4 overflow-hidden rounded-xl border bg-white shadow-[0_1px_2px_rgba(16,42,67,0.05),0_14px_36px_-22px_rgba(16,42,67,0.2)]"
        style={{ borderColor: LINE }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-[13px]">
            <thead>
              <tr
                className="text-[11px] font-semibold uppercase tracking-[0.06em]"
                style={{ color: FAINT, background: "#fafbfd" }}
              >
                <th className="px-4 py-2.5 font-semibold sm:px-5">{T.colContract[locale]}</th>
                <th className="px-3 py-2.5 font-semibold">{T.colWallet[locale]}</th>
                <th
                  className="px-3 py-2.5 text-right font-semibold"
                  aria-sort={sort.key === "amount" ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                >
                  {headerBtn("amount", T.colAmount[locale])}
                </th>
                <th
                  className="px-3 py-2.5 font-semibold"
                  aria-sort={sort.key === "date" ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                >
                  {headerBtn("date", T.colDate[locale])}
                </th>
                <th className="px-3 py-2.5 font-semibold">{T.colStatus[locale]}</th>
                <th className="w-10 px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isOpen = open.has(row.id);
                return (
                  <Fragment key={row.id}>
                    <tr
                      onClick={() => toggleRow(row.id)}
                      className="cursor-pointer border-t transition-colors hover:bg-[#f4f8fd]"
                      style={{
                        borderColor: LINE,
                        background: isOpen ? "#f4f8fd" : undefined,
                      }}
                    >
                      <td className="px-4 py-3 sm:px-5">
                        <p className="font-semibold leading-4">{row.name}</p>
                        <p className="mt-0.5 font-mono text-[11px] leading-4" style={{ color: FAINT }}>
                          {row.id}
                        </p>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs" style={{ color: MUTED }}>
                        {shortAddr(row.wallet)}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold tabular-nums">
                        {money(row.amount)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3" style={{ color: MUTED }}>
                        {fmtDate(row.date, locale)}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={row.status} locale={locale} />
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-label={T.rowToggle[locale]}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(row.id);
                          }}
                          className="inline-flex size-6 items-center justify-center rounded-md border bg-white transition-colors hover:border-[#3b9dff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b9dff]"
                          style={{ borderColor: LINE, color: MUTED }}
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            aria-hidden
                            className="transition-transform duration-200"
                            style={{ transform: isOpen ? "rotate(180deg)" : undefined }}
                          >
                            <path d="M2 3.5 5 6.5 8 3.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    {/* раскрытая деталь — всегда в DOM, анимируется высота */}
                    <tr>
                      <td colSpan={6} className="p-0">
                        <motion.div
                          initial={false}
                          animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div
                            className="grid gap-3 border-t px-4 py-4 sm:grid-cols-[1.25fr_1fr_1fr] sm:px-5"
                            style={{ borderColor: LINE, background: "#f3f8fe" }}
                          >
                            {/* инвойс + полный адрес */}
                            <div
                              className="rounded-lg border bg-white p-3"
                              style={{ borderColor: LINE }}
                            >
                              <p className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: FAINT }}>
                                {T.detailInvoice[locale]}
                              </p>
                              <p className="mt-1 font-mono text-xs font-semibold" style={{ color: INK }}>
                                {row.invoice}
                              </p>
                              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: FAINT }}>
                                {T.detailWallet[locale]}
                              </p>
                              <p className="mt-1 break-all font-mono text-[11px] leading-4" style={{ color: MUTED }}>
                                {row.wallet}
                              </p>
                            </div>
                            {/* спарклайн */}
                            <div
                              className="rounded-lg border bg-white p-3"
                              style={{ borderColor: LINE }}
                            >
                              <p className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: FAINT }}>
                                {T.detailSpark[locale]}
                              </p>
                              <div className="mt-2">
                                <Sparkline values={row.spark} />
                              </div>
                              <p className="mt-1 text-[11px] tabular-nums" style={{ color: MUTED }}>
                                {money(row.spark[row.spark.length - 1] * 1000, 0)}
                                <span style={{ color: FAINT }}> · {locale === "ru" ? "посл. месяц" : "last month"}</span>
                              </p>
                            </div>
                            {/* таймлайн статуса */}
                            <div
                              className="rounded-lg border bg-white p-3"
                              style={{ borderColor: LINE }}
                            >
                              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: FAINT }}>
                                {T.detailTimeline[locale]}
                              </p>
                              <Timeline row={row} locale={locale} />
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
