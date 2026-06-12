// SPROUTER-демо: модель данных, детерминированная инициализация и редьюсер сцены.
// Все стартовые значения детерминированы (SSR-дружелюбно) — случайный дрейф
// появляется только в client-side тиках. Данные демонстрационные.

export type RigStatus = "ok" | "warn";

export type Rig = {
  id: string;
  temp: number; // °C
  hash: number; // TH/s
  fan: number; // %
  status: RigStatus;
  tempHist: number[]; // последние TEMP_HIST значений температуры
};

export type SceneState = {
  screen: "monitor" | "reports";
  selected: string | null; // риг с открытой панелью деталей
  period: "7d" | "30d";
  rigs: Rig[];
  history: number[]; // суммарный хешрейт фермы, последние HIST_LEN тиков
  ticks: number;
  clock: string; // "" до первого тика — чтобы SSR и гидрация совпадали
};

// Действия сцены. Строки — их дёргает сценарий через onAction; "tick" — интервал.
export type SceneAction =
  | "reset"
  | "open-rig"
  | "close-rig"
  | "show-reports"
  | "show-monitor"
  | "period-30"
  | "warn"
  | "recover"
  | "tick";

export const TICK_MS = 2000;
export const FOCUS_RIG = "RIG-A3"; // плитка, которую «открывает» курсор
export const INCIDENT_RIG = "RIG-B1"; // риг сценарного перегрева в финале цикла

const HIST_LEN = 36;
const TEMP_HIST = 28;
// 14д 06:32:47 аптайма к моменту открытия демо
const UPTIME_BASE_S = ((14 * 24 + 6) * 60 + 32) * 60 + 47;

// id, темп., хешрейт, вентилятор
const BASE: Array<[string, number, number, number]> = [
  ["RIG-A1", 61, 12.4, 64],
  ["RIG-A2", 58, 13.1, 58],
  ["RIG-A3", 64, 11.8, 71],
  ["RIG-A4", 60, 12.9, 62],
  ["RIG-B1", 63, 12.2, 67],
  ["RIG-B2", 59, 13.4, 55],
  ["RIG-B3", 66, 11.5, 74],
  ["RIG-B4", 62, 12.7, 60],
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
const pad2 = (n: number) => String(n).padStart(2, "0");

export const totalHash = (rigs: Rig[]) => rigs.reduce((s, r) => s + r.hash, 0);

/* ------------------------------------------------------------------ */
/* Инициализация и тики                                                */
/* ------------------------------------------------------------------ */

export function initScene(): SceneState {
  const rigs: Rig[] = BASE.map(([id, temp, hash, fan], k) => ({
    id,
    temp,
    hash,
    fan,
    status: "ok",
    // детерминированная «предыстория» температуры — мини-график не пустой
    tempHist: Array.from(
      { length: TEMP_HIST },
      (_, i) => temp + Math.sin(i * 0.55 + k) * 1.6 + Math.sin(i * 0.21 + k * 2) * 0.8,
    ),
  }));
  const base = totalHash(rigs);
  const history = Array.from(
    { length: HIST_LEN },
    (_, i) => base + Math.sin(i * 0.55) * 1.3 + Math.sin(i * 0.21 + 2) * 0.9,
  );
  return {
    screen: "monitor",
    selected: null,
    period: "7d",
    rigs,
    history,
    ticks: 0,
    clock: "",
  };
}

function tickRig(r: Rig): Rig {
  const warn = r.status === "warn";
  const temp = warn
    ? clamp(r.temp + rand(-0.6, 1.6), 78, 91)
    : clamp(r.temp + rand(-0.8, 0.8), 55, 72);
  return {
    ...r,
    temp,
    hash: warn
      ? clamp(r.hash + rand(-0.3, 0.1), 8.5, 11)
      : clamp(r.hash + rand(-0.25, 0.25), 10.6, 14.4),
    fan: warn
      ? clamp(r.fan + rand(-1, 2), 88, 100)
      : clamp(r.fan + rand(-2, 2), 48, 82),
    tempHist: [...r.tempHist.slice(-(TEMP_HIST - 1)), temp],
  };
}

const setIncident = (rigs: Rig[], to: RigStatus): Rig[] =>
  rigs.map((r) =>
    r.id === INCIDENT_RIG
      ? to === "warn"
        ? {
            ...r,
            status: "warn",
            temp: 83,
            fan: 94,
            hash: clamp(r.hash - 2.1, 8.5, 11),
          }
        : {
            ...r,
            status: "ok",
            temp: 66,
            fan: 76,
            hash: clamp(r.hash + 2.1, 10.6, 14.4),
          }
      : r,
  );

export function sceneReducer(s: SceneState, a: SceneAction): SceneState {
  switch (a) {
    case "reset":
      // согласован с финалом цикла: экран мониторинга, панель закрыта,
      // период отчётов возвращается к 7д незаметно для зрителя
      return { ...s, screen: "monitor", selected: null, period: "7d" };
    case "open-rig":
      return { ...s, selected: FOCUS_RIG };
    case "close-rig":
      return { ...s, selected: null };
    case "show-reports":
      return { ...s, screen: "reports", selected: null };
    case "show-monitor":
      return { ...s, screen: "monitor" };
    case "period-30":
      return { ...s, period: "30d" };
    case "warn":
      return { ...s, rigs: setIncident(s.rigs, "warn") };
    case "recover":
      return { ...s, rigs: setIncident(s.rigs, "ok") };
    case "tick": {
      const rigs = s.rigs.map(tickRig);
      const d = new Date();
      return {
        ...s,
        rigs,
        history: [...s.history.slice(-(HIST_LEN - 1)), totalHash(rigs)],
        ticks: s.ticks + 1,
        clock: `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`,
      };
    }
    default:
      return s;
  }
}

/* ------------------------------------------------------------------ */
/* Форматирование                                                      */
/* ------------------------------------------------------------------ */

export function fmtUptime(ticks: number, dayUnit: string): string {
  const total = UPTIME_BASE_S + ticks * Math.round(TICK_MS / 1000);
  const days = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  return `${days}${dayUnit} ${pad2(h)}:${pad2(m)}:${pad2(sec)}`;
}

/* ------------------------------------------------------------------ */
/* Отчёты — детерминированные «дни»                                    */
/* ------------------------------------------------------------------ */

export type DayRow = {
  label: string;
  hash: number; // средний хешрейт за день, TH/s
  uptime: number; // %
  incidents: number;
};

const MONTHS_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Дни считаются от фиксированной «сегодняшней» даты — данные демонстрационные
// и детерминированные (никакой разницы между сервером и клиентом).
const REPORT_TODAY = { y: 2026, m: 5, d: 12 }; // 12 июня 2026

export function reportRows(period: "7d" | "30d", locale: "ru" | "en"): DayRow[] {
  const n = period === "7d" ? 7 : 30;
  const rows: DayRow[] = [];
  for (let k = n - 1; k >= 0; k--) {
    const date = new Date(REPORT_TODAY.y, REPORT_TODAY.m, REPORT_TODAY.d - k);
    const i = 60 - k; // абсолютный индекс дня — хвост 30д совпадает с 7д
    rows.push({
      label:
        locale === "ru"
          ? `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}`
          : `${MONTHS_EN[date.getMonth()]} ${date.getDate()}`,
      hash: 99.5 + Math.sin(i * 0.9) * 2.4 + Math.sin(i * 0.37 + 2) * 1.6,
      uptime: 100 - Math.abs(Math.sin(i * 1.31)) * 1.2,
      incidents: Math.max(0, Math.round(Math.abs(Math.sin(i * 2.13)) * 2.2 - 0.7)),
    });
  }
  return rows;
}

export function periodSummary(rows: DayRow[]) {
  return {
    hash: rows.reduce((s, r) => s + r.hash, 0) / rows.length,
    uptime: rows.reduce((s, r) => s + r.uptime, 0) / rows.length,
    incidents: rows.reduce((s, r) => s + r.incidents, 0),
  };
}
