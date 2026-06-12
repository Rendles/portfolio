// Сценарий «кино»-цикла SPROUTER-демо (~20 с, бесшовный):
// осмотр мониторинга → детали рига → отчёты → период 30д → назад,
// фоном один риг уходит в перегрев и восстанавливается.
// Финальный кадр (мониторинг, всё в норме) совпадает с "reset".

import type { DemoScenario } from "../engine/types";
import { FOCUS_RIG } from "./data";

export const SPROUTER_SCENARIO: DemoScenario = [
  // 1. экран «Мониторинг», данные тикают — зритель осматривается
  { type: "action", action: "reset", settle: 200 },
  { type: "wait", ms: 1500 },

  // 2. курсор к плитке рига → клик → панель деталей
  { type: "move", target: `rig-${FOCUS_RIG}` },
  { type: "click", action: "open-rig", settle: 700 },
  { type: "wait", ms: 2100 },

  // 3. крестик панели → закрылась
  { type: "move", target: "panel-close", settle: 600 },
  { type: "click", action: "close-rig", settle: 700 },

  // 4. таб «Отчёты» → экран отчётов
  { type: "move", target: "tab-reports" },
  { type: "click", action: "show-reports", settle: 900 },
  { type: "wait", ms: 2100 },

  // 5. переключатель периода → бары перестраиваются на 30д
  { type: "move", target: "period-30", settle: 650 },
  { type: "click", action: "period-30", settle: 800 },
  { type: "wait", ms: 2100 },

  // 6. таб «Мониторинг» → назад; фоном перегрев и восстановление рига
  { type: "move", target: "tab-monitor" },
  { type: "click", action: "show-monitor", settle: 900 },
  { type: "action", action: "warn", settle: 2700 },
  { type: "action", action: "recover", settle: 1900 },
];
