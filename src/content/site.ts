// Единый источник контента. Не зависит от дизайн-режима.
// Любая локализованная строка — объект { ru, en }.

export type Locale = "ru" | "en";
export type L = Record<Locale, string>;

export type Project = {
  id: string;
  title: string;
  kind: L; // тип проекта
  role: L; // моя роль
  year: string;
  summary: L; // краткое описание (задача → что сделал)
  stack: string[];
  link: string | null;
  tags: L[]; // короткие маркеры
  accent: string; // фирменный цвет проекта
  solo: boolean;
};

export type SkillGroup = {
  label: L;
  items: string[];
};

export const site = {
  name: { ru: "Роман Шуклин", en: "Roman Shuklin" } as L,
  handle: "Rendles",
  roles: {
    ru: "Дизайнер интерфейсов · Frontend-разработчик",
    en: "Interface Designer · Frontend Developer",
  } as L,
  tagline: {
    ru: "Делаю продукт целиком — от пикселя в Figma до продакшена на React.",
    en: "I build products end-to-end — from a Figma pixel to React in production.",
  } as L,
  location: { ru: "Томск · удалёнка", en: "Tomsk · remote" } as L,

  about: {
    ru: "Дизайнер интерфейсов и фронтенд-разработчик в одном лице. Опыт с 2022 года: продуктовые SaaS-платформы, команды от 2 до 15 человек, местами тимлид. Сильная сторона — связка дизайн + код: вижу интерфейс глазами дизайнера и собираю его как разработчик, без потерь «на стыке».",
    en: "An interface designer and frontend developer in one. Working since 2022: product SaaS platforms, teams of 2 to 15, sometimes as a lead. My edge is the design + code combo: I see an interface as a designer and ship it as a developer — nothing lost in translation.",
  } as L,

  stats: [
    { value: "2022", label: { ru: "в профессии с", en: "in the field since" } as L },
    { value: "5+", label: { ru: "продуктов", en: "products" } as L },
    { value: "2–15", label: { ru: "размер команд", en: "team size" } as L },
    { value: "∞", label: { ru: "дизайн + код", en: "design + code" } as L },
  ],

  ai: {
    title: { ru: "Работа с ИИ", en: "Working with AI" } as L,
    body: {
      ru: "Использую ИИ как полноценный инструмент: Claude, GPT, Codex, Gemini, DeepSeek. Поднимаю локальные модели через Ollama, разворачивал локальную генерацию изображений и видео, работал с OpenClaw. Генерирую визуал и прототипы через GPT, Gemini, Recraft.",
      en: "I use AI as a real tool: Claude, GPT, Codex, Gemini, DeepSeek. I run local models via Ollama, deployed local image/video generation, worked with OpenClaw. I generate visuals and prototypes with GPT, Gemini and Recraft.",
    } as L,
    tools: ["Claude", "GPT", "Codex", "Gemini", "DeepSeek", "Ollama", "OpenClaw", "Recraft", "Framer"],
  },

  skills: [
    {
      label: { ru: "Frontend", en: "Frontend" },
      items: ["React 18/19", "Next.js", "TypeScript", "Redux Toolkit", "TanStack Query", "Vite", "Feature-Sliced Design"],
    },
    {
      label: { ru: "Стиль и моушн", en: "Style & motion" },
      items: ["Tailwind CSS", "SCSS-модули", "styled-components", "GSAP", "Framer Motion", "Lenis", "Three.js / R3F"],
    },
    {
      label: { ru: "Дизайн", en: "Design" },
      items: ["Figma", "дизайн-системы", "Dev Mode", "Framer", "Recraft", "прототипирование"],
    },
    {
      label: { ru: "Прочее", en: "More" },
      items: ["REST", "WebSocket / socket.io", "Strapi", "браузерные расширения", "i18n", "PWA"],
    },
  ] as SkillGroup[],

  projects: [
    {
      id: "leamshop",
      title: "LeamShop",
      kind: { ru: "E-commerce экосистема", en: "E-commerce ecosystem" },
      role: { ru: "Дизайн + фронтенд — соло", en: "Design + frontend — solo" },
      year: "2023",
      summary: {
        ru: "В одиночку собрал целую экосистему fashion-магазина: админ-панель, встраиваемый 3D-виджет и браузерное расширение. От макета в Figma до релиза.",
        en: "Built an entire fashion-commerce ecosystem solo: an admin panel, an embeddable 3D widget and a browser extension. From Figma to release.",
      },
      stack: ["React", "TypeScript", "Three.js", "Redux Toolkit", "Ant Design"],
      link: "https://shop.leam.pro/",
      tags: [
        { ru: "3D", en: "3D" },
        { ru: "соло", en: "solo" },
        { ru: "e-commerce", en: "e-commerce" },
      ],
      accent: "#ff5c38",
      solo: true,
    },
    {
      id: "int3grate",
      title: "INT3GRATE",
      kind: { ru: "SaaS · управление AI-агентами", en: "SaaS · AI agent management" },
      role: { ru: "Дизайн целиком + фронтенд в команде", en: "Full design + frontend in a team" },
      year: "2025",
      summary: {
        ru: "Платформа управления AI-агентами для бизнеса: агенты, чаты, согласования, аналитика расходов и визуализация оргструктуры на графах. Спроектировал весь UI и дизайн-систему.",
        en: "A platform to manage business AI agents: agents, chats, approvals, cost analytics and a graph-based org map. Designed the whole UI and design system.",
      },
      stack: ["React 19", "Feature-Sliced Design", "TanStack", "XYFlow", "Storybook"],
      link: "https://int3grate.ai/",
      tags: [
        { ru: "AI", en: "AI" },
        { ru: "дизайн-система", en: "design system" },
        { ru: "графы", en: "graphs" },
      ],
      accent: "#6e56ff",
      solo: false,
    },
    {
      id: "sprouter",
      title: "SPROUTER",
      kind: { ru: "SaaS · управление майнинг-фермами", en: "SaaS · mining farm management" },
      role: { ru: "Дизайн целиком + фронтенд в команде", en: "Full design + frontend in a team" },
      year: "2024",
      summary: {
        ru: "Дашборд реального времени на ~30 экранов: мониторинг оборудования, карты раскладки ферм, графики, отчётность и ролевой доступ. Сложные плотные интерфейсы с большими данными.",
        en: "A ~30-screen real-time dashboard: hardware monitoring, farm-layout maps, charts, reporting and role-based access. Dense, data-heavy interfaces.",
      },
      stack: ["React 19", "socket.io", "Leaflet", "Recharts", "Redux Toolkit"],
      link: "https://sprouter.ai/",
      tags: [
        { ru: "realtime", en: "realtime" },
        { ru: "data-heavy", en: "data-heavy" },
        { ru: "карты", en: "maps" },
      ],
      accent: "#13d6a3",
      solo: false,
    },
    {
      id: "hidelounge",
      title: "Hide Lounge",
      kind: { ru: "Промо-сайт ресторана", en: "Restaurant promo site" },
      role: { ru: "Фронтенд: анимации и миграция на Next.js", en: "Frontend: animation & Next.js migration" },
      year: "2026",
      summary: {
        ru: "Полный перенос анимированного сайта ресторана с React на Next.js, новые фичи и фиксы. Тяжёлая моушн-графика на GSAP, age-gate, интеграция бронирования и форм в Telegram.",
        en: "Full migration of an animated restaurant site from React to Next.js, plus new features. Heavy GSAP motion, an age-gate, booking integration and Telegram forms.",
      },
      stack: ["Next.js 16", "GSAP", "Framer Motion", "Lenis", "Tailwind CSS"],
      link: "https://hidelounge.ru/",
      tags: [
        { ru: "анимации", en: "animation" },
        { ru: "миграция", en: "migration" },
      ],
      accent: "#e0a85e",
      solo: false,
    },
    {
      id: "dataprana",
      title: "DATAPRANA",
      kind: { ru: "SaaS · данные и выплаты", en: "SaaS · data & payouts" },
      role: { ru: "Дизайн целиком + фронтенд в команде", en: "Full design + frontend in a team" },
      year: "2025",
      summary: {
        ru: "Личный кабинет для работы с данными и выплатами: контракты, кошельки, выводы, инвойсы и графики временных рядов. Таблицы с сортировкой и раскрытием строк.",
        en: "A dashboard for data and payouts: contracts, wallets, withdrawals, invoices and time-series charts. Sortable, expandable data tables.",
      },
      stack: ["React 19", "Feature-Sliced Design", "Chart.js", "TanStack Table", "Chakra UI"],
      link: null,
      tags: [
        { ru: "дашборд", en: "dashboard" },
        { ru: "графики", en: "charts" },
      ],
      accent: "#3b9dff",
      solo: false,
    },
  ] as Project[],

  contacts: {
    email: "rendles@yandex.ru",
    phone: "+7 923 416-42-42",
    phoneHref: "tel:+79234164242",
    telegram: "@Rendles",
    telegramHref: "https://t.me/Rendles",
    github: "github.com/Rendles",
    githubHref: "https://github.com/Rendles",
  },
} as const;

export type Site = typeof site;
