// Реестр дизайн-режимов. Метаданные для переключателя; сами компоненты
// подключаются динамически в app/page.tsx (часть режимов использует WebGL → без SSR).
import type { L } from "@/content/site";

export type ModeId = "hyper" | "minimal" | "brutal" | "glass" | "arcade";

export type ModeMeta = {
  id: ModeId;
  name: L;
  blurb: L;
  accent: string;
  theme: "dark" | "light";
  ready: boolean; // реализован ли режим (для постепенной сборки)
};

export const MODES: ModeMeta[] = [
  {
    id: "hyper",
    name: { ru: "HYPERMODE", en: "HYPERMODE" },
    blurb: { ru: "Дикий, быстрый, навороченный", en: "Wild, fast, loaded" },
    accent: "#c6ff3a",
    theme: "dark",
    ready: true,
  },
  {
    id: "minimal",
    name: { ru: "Минимал", en: "Minimal" },
    blurb: { ru: "Сдержанно и дорого", en: "Restrained & refined" },
    accent: "#1a1a1a",
    theme: "light",
    ready: true,
  },
  {
    id: "brutal",
    name: { ru: "Брутализм", en: "Brutalism" },
    blurb: { ru: "Сырой и громкий", en: "Raw & loud" },
    accent: "#ffe800",
    theme: "light",
    ready: true,
  },
  {
    id: "glass",
    name: { ru: "Жидкое стекло", en: "Liquid Glass" },
    blurb: { ru: "Матовая глубина и свет", en: "Frosted depth & light" },
    accent: "#7cc6ff",
    theme: "dark",
    ready: true,
  },
  {
    id: "arcade",
    name: { ru: "Аркада", en: "Arcade" },
    blurb: { ru: "Игровой терминал", en: "Game terminal" },
    accent: "#34ff8a",
    theme: "dark",
    ready: true,
  },
];

export const DEFAULT_MODE: ModeId = "hyper";

export function getMode(id: ModeId): ModeMeta {
  return MODES.find((m) => m.id === id) ?? MODES[0];
}
