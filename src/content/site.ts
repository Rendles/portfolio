// Единый источник контента. Не зависит от дизайн-режима.
// Любая локализованная строка — объект { ru, en }.

export type Locale = "ru" | "en";
export type L = Record<Locale, string>;

export type ProjectLink = {
  kind: "live" | "github" | "store";
  label: L; // «Открыть сайт», «Играть», «GitHub», «RuStore»
  href: string;
};

export type Project = {
  id: string;
  title: string;
  kind: L; // тип проекта
  role: L; // моя роль
  year: string;
  summary: L; // краткое описание (задача → что сделал)
  stack: string[];
  links: ProjectLink[];
  tags: L[]; // короткие маркеры
  accent: string; // фирменный цвет проекта
  solo: boolean;
  tier: "full" | "compact"; // полная карточка или компактная строка
};

export type WorkGroup = {
  id: string;
  title: L;
  blurb: L; // одна строка: роль/история группы
  projects: Project[];
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

  workGroups: [
    {
      id: "saas",
      title: { ru: "SaaS-платформы", en: "SaaS platforms" },
      blurb: {
        ru: "Продуктовые платформы: дизайн целиком мой, фронтенд — в команде 2–15 человек, местами тимлид.",
        en: "Product platforms: full design by me, frontend in teams of 2–15, sometimes as a lead.",
      },
      projects: [
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
          links: [
            { kind: "live", label: { ru: "Открыть сайт", en: "Visit site" }, href: "https://int3grate.ai/" },
          ],
          tags: [
            { ru: "AI", en: "AI" },
            { ru: "дизайн-система", en: "design system" },
            { ru: "графы", en: "graphs" },
          ],
          accent: "#6e56ff",
          solo: false,
          tier: "full",
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
          links: [
            { kind: "live", label: { ru: "Открыть сайт", en: "Visit site" }, href: "https://sprouter.ai/" },
          ],
          tags: [
            { ru: "realtime", en: "realtime" },
            { ru: "data-heavy", en: "data-heavy" },
            { ru: "карты", en: "maps" },
          ],
          accent: "#13d6a3",
          solo: false,
          tier: "full",
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
          links: [],
          tags: [
            { ru: "дашборд", en: "dashboard" },
            { ru: "графики", en: "charts" },
          ],
          accent: "#3b9dff",
          solo: false,
          tier: "full",
        },
      ],
    },
    {
      id: "leam",
      title: { ru: "Экосистема Leam", en: "Leam ecosystem" },
      blurb: {
        ru: "Fashion-стартап: магазинную экосистему собрал соло, в остальном работал в продуктовой команде.",
        en: "A fashion startup: built the commerce ecosystem solo, worked in the product team on the rest.",
      },
      projects: [
        {
          id: "leamshop",
          title: "LeamShop",
          kind: { ru: "Админ-панель e-commerce", en: "E-commerce admin panel" },
          role: { ru: "Дизайн + фронтенд — соло", en: "Design + frontend — solo" },
          year: "2023",
          summary: {
            ru: "Админ-панель fashion-магазина: бренды, образы, размерные сетки, аналитика — плюс браузерное расширение. Спроектировал и собрал в одиночку, от макета в Figma до релиза.",
            en: "A fashion-store admin panel: brands, outfits, size charts, analytics — plus a browser extension. Designed and built solo, from Figma to release.",
          },
          stack: ["React 18", "TypeScript", "Redux Toolkit", "styled-components", "Recharts"],
          links: [
            { kind: "live", label: { ru: "Открыть сайт", en: "Visit site" }, href: "https://shop.leam.pro/" },
          ],
          tags: [
            { ru: "соло", en: "solo" },
            { ru: "e-commerce", en: "e-commerce" },
            { ru: "расширение", en: "extension" },
          ],
          accent: "#ff5c38",
          solo: true,
          tier: "full",
        },
        {
          id: "leamwidget",
          title: "Leam Widget",
          kind: { ru: "Встраиваемый 3D-виджет", en: "Embeddable 3D widget" },
          role: { ru: "Дизайн + фронтенд — соло", en: "Design + frontend — solo" },
          year: "2023",
          summary: {
            ru: "Встраиваемый интерактивный виджет для сайтов магазинов с 3D на Three.js и мультиязычностью. Дизайн и код — полностью мои.",
            en: "An embeddable interactive widget for store sites with Three.js 3D and i18n. Design and code fully mine.",
          },
          stack: ["React 18", "TypeScript", "Three.js / R3F", "Ant Design", "i18next"],
          links: [
            { kind: "live", label: { ru: "Открыть виджет", en: "Open widget" }, href: "https://widget.leam.pro/" },
          ],
          tags: [
            { ru: "3D", en: "3D" },
            { ru: "соло", en: "solo" },
            { ru: "embed", en: "embed" },
          ],
          accent: "#ff9e3d",
          solo: true,
          tier: "full",
        },
        {
          id: "leamlanding",
          title: "Leam Landing",
          kind: { ru: "Лендинг бренда", en: "Brand landing page" },
          role: { ru: "Дизайн + контроль реализации", en: "Design + implementation oversight" },
          year: "2023",
          summary: {
            ru: "Дизайн лендинга бренда Leam; вёрстку делала команда — следил за реализацией и проверял соответствие макету.",
            en: "Designed the Leam brand landing; the team built it — I oversaw the implementation against the design.",
          },
          stack: ["Figma"],
          links: [
            { kind: "live", label: { ru: "Открыть сайт", en: "Visit site" }, href: "https://leam.pro/" },
          ],
          tags: [{ ru: "дизайн", en: "design" }],
          accent: "#f4c95d",
          solo: false,
          tier: "compact",
        },
        {
          id: "leamscan",
          title: "Leamscan",
          kind: { ru: "Мобильное приложение", en: "Mobile app" },
          role: { ru: "Продуктовая команда: дизайн, брейнштормы", en: "Product team: design, brainstorms" },
          year: "2023",
          summary: {
            ru: "Мобильное приложение Leam. Работал в продуктовой команде стартапа: дизайн, концепты, брейнштормы реализации.",
            en: "The Leam mobile app. Worked in the startup's product team: design, concepts, implementation brainstorms.",
          },
          stack: ["Figma"],
          links: [
            { kind: "store", label: { ru: "RuStore", en: "RuStore" }, href: "https://www.rustore.ru/catalog/app/com.example.leam_app" },
          ],
          tags: [{ ru: "mobile", en: "mobile" }],
          accent: "#e86f5a",
          solo: false,
          tier: "compact",
        },
      ],
    },
    {
      id: "freelance",
      title: { ru: "Фриланс", en: "Freelance" },
      blurb: {
        ru: "Заказная разработка: от миграции legacy-кода до сайта под ключ за два дня.",
        en: "Client work: from legacy migrations to a turnkey site in two days.",
      },
      projects: [
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
          links: [
            { kind: "live", label: { ru: "Открыть сайт", en: "Visit site" }, href: "https://hidelounge.ru/" },
          ],
          tags: [
            { ru: "анимации", en: "animation" },
            { ru: "миграция", en: "migration" },
          ],
          accent: "#e0a85e",
          solo: false,
          tier: "full",
        },
        {
          id: "wedding",
          title: "Save the Date",
          kind: { ru: "Свадебный сайт-приглашение", en: "Wedding invitation site" },
          role: { ru: "Дизайн + код — соло, за 2 дня", en: "Design + code — solo, in 2 days" },
          year: "2026",
          summary: {
            ru: "Лендинг-приглашение: обратный отсчёт, расписание, дресс-код, RSVP-форма в Telegram. Next.js + Framer Motion, reveal-анимации, reduced-motion.",
            en: "An invitation landing: countdown, schedule, dress code, an RSVP form to Telegram. Next.js + Framer Motion, reveal animations, reduced motion.",
          },
          stack: ["Next.js 16", "Framer Motion", "Tailwind v4"],
          links: [],
          tags: [{ ru: "соло", en: "solo" }],
          accent: "#f2a3b3",
          solo: true,
          tier: "compact",
        },
      ],
    },
    {
      id: "pet",
      title: { ru: "Пет-проекты", en: "Pet projects" },
      blurb: {
        ru: "Личные проекты по собственной инициативе — код открыт на GitHub.",
        en: "Personal projects built on my own initiative — open source on GitHub.",
      },
      projects: [
        {
          id: "gravitysmash",
          title: "Gravity Smash",
          kind: { ru: "Браузерная игра", en: "Browser game" },
          role: { ru: "Всё — соло", en: "Everything — solo" },
          year: "2026",
          summary: {
            ru: "Физическая puzzle-игра: Matter.js, canvas-рендер со своими эффектами, программный звук на Web Audio, два режима и магазин улучшений.",
            en: "A physics puzzle game: Matter.js, a custom-effects canvas renderer, programmatic Web Audio sound, two modes and an upgrade shop.",
          },
          stack: ["React 18", "TypeScript", "Matter.js", "Canvas", "Web Audio"],
          links: [
            { kind: "live", label: { ru: "Играть", en: "Play" }, href: "https://gravity-smash.vercel.app/" },
            { kind: "github", label: { ru: "GitHub", en: "GitHub" }, href: "https://github.com/Rendles/gravity-smash" },
          ],
          tags: [
            { ru: "игра", en: "game" },
            { ru: "физика", en: "physics" },
          ],
          accent: "#9d6bff",
          solo: true,
          tier: "compact",
        },
        {
          id: "braintone",
          title: "BrainTone",
          kind: { ru: "PWA · когнитивные тренировки", en: "PWA · cognitive training" },
          role: { ru: "Всё — соло", en: "Everything — solo" },
          year: "2026",
          summary: {
            ru: "Тренажёр для мозга: адаптивная сложность, честные измерения реакции через performance.now(), тонус-индекс по пяти доменам. Mobile-first PWA.",
            en: "A brain trainer: adaptive difficulty, honest reaction timing via performance.now(), a tone index across five domains. Mobile-first PWA.",
          },
          stack: ["Next.js", "TypeScript", "PWA", "Drizzle"],
          links: [
            { kind: "live", label: { ru: "Открыть", en: "Open" }, href: "https://braintone-zeta.vercel.app/" },
            { kind: "github", label: { ru: "GitHub", en: "GitHub" }, href: "https://github.com/Rendles/brain_tone" },
          ],
          tags: [
            { ru: "PWA", en: "PWA" },
            { ru: "игры", en: "games" },
          ],
          accent: "#2dd4bf",
          solo: true,
          tier: "compact",
        },
        {
          id: "proactive",
          title: "Proactive Assistant",
          kind: { ru: "Windows-демон с локальным AI", en: "Windows daemon with local AI" },
          role: { ru: "Всё — соло", en: "Everything — solo" },
          year: "2026",
          summary: {
            ru: "Фоновый ассистент: следит за активностью, анализирует её локальной моделью через Ollama и присылает уведомления. Без облака и телеметрии.",
            en: "A background assistant: tracks activity, analyses it with a local model via Ollama and sends nudges. No cloud, no telemetry.",
          },
          stack: ["Node.js", "Ollama", "SQLite"],
          links: [
            { kind: "github", label: { ru: "GitHub", en: "GitHub" }, href: "https://github.com/Rendles/proactive-assistant" },
          ],
          tags: [
            { ru: "AI", en: "AI" },
            { ru: "локально", en: "local" },
          ],
          accent: "#7dd87d",
          solo: true,
          tier: "compact",
        },
      ],
    },
  ] as WorkGroup[],

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

// Плоские списки для режимов, которым не нужна группировка.
export const allProjects: Project[] = site.workGroups.flatMap((g) => g.projects);
export const featuredProjects: Project[] = allProjects.filter((p) => p.tier === "full");
