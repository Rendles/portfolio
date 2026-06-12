// Движок «кино»-демо: сценарий — список шагов, которые проигрывает фейковый курсор.
// Сцена (декорации) — обычный React-компонент; шаги ссылаются на элементы
// по атрибуту data-demo и дёргают её состояние через именованные действия.

export type DemoStep =
  // курсор плывёт к центру элемента [data-demo="target"]; settle — пауза после (мс)
  | { type: "move"; target: string; settle?: number }
  // клик в текущей позиции (пульс-кольцо) + опциональное действие сцене
  | { type: "click"; action?: string; settle?: number }
  // смена состояния сцены без клика (фоновые события)
  | { type: "action"; action: string; settle?: number }
  // просто пауза — дать зрителю рассмотреть
  | { type: "wait"; ms: number };

export type DemoScenario = DemoStep[];
