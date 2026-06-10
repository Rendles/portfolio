// UI-строки интерфейса (заголовки секций, кнопки, подписи). Контент — в content/site.ts.
import type { L, Locale } from "@/content/site";

export type { Locale } from "@/content/site";

export const ui = {
  nav: {
    work: { ru: "Работы", en: "Work" },
    about: { ru: "Обо мне", en: "About" },
    skills: { ru: "Навыки", en: "Skills" },
    ai: { ru: "ИИ", en: "AI" },
    contact: { ru: "Контакты", en: "Contact" },
  },
  hero: {
    available: { ru: "Открыт к удалёнке и заказам", en: "Open to remote work & freelance" },
    scroll: { ru: "Листай вниз", en: "Scroll down" },
    cta: { ru: "Написать мне", en: "Get in touch" },
  },
  sections: {
    workTitle: { ru: "Избранные работы", en: "Selected work" },
    workSub: { ru: "Пять продуктов: дизайн целиком, фронтенд — соло или в команде.", en: "Five products: full design, frontend solo or in a team." },
    aboutTitle: { ru: "Кто я", en: "Who I am" },
    skillsTitle: { ru: "Чем владею", en: "What I do" },
    aiTitle: { ru: "ИИ как инструмент", en: "AI as a tool" },
    contactTitle: { ru: "Поговорим?", en: "Let's talk" },
    contactSub: { ru: "Дизайн, фронтенд или и то и другое — пишите.", en: "Design, frontend or both — reach out." },
  },
  project: {
    role: { ru: "Роль", en: "Role" },
    stack: { ru: "Стек", en: "Stack" },
    visit: { ru: "Открыть сайт", en: "Visit site" },
    noLink: { ru: "под NDA · по запросу", en: "under NDA · on request" },
    solo: { ru: "соло", en: "solo" },
  },
  switcher: {
    label: { ru: "Режим дизайна", en: "Design mode" },
    hint: { ru: "Один контент — разные дизайн-языки. Переключай.", en: "One content — different design languages. Switch it." },
  },
} satisfies Record<string, Record<string, L>>;

export function pick(value: L, locale: Locale): string {
  return value[locale];
}
