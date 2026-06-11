# PROGRESS — состояние разработки

> Точка сохранения для продолжения работы над сайтом-портфолио.

## Готово

- **Каркас движка режимов:** контент (`src/content/site.ts`, RU/EN), i18n, контексты (`src/providers/AppProviders.tsx`), переключатель (`src/components/ModeSwitcher.tsx`), реестр (`src/modes/registry.ts`), рендерер (`src/app/page.tsx`).
- **HYPERMODE** (`src/modes/hyper/`): шейдерный фон + частицы (`ShaderBackground`), курсор (`HyperCursor`), Lenis, hero, 3D-слайдер (`WorkSlider`), физика (`PhysicsPlayground`, matter.js), колесо навыков со скролл-вращением и эффектами (`SkillsWheel`), блок ИИ с иконками Simple Icons.
- **Брутализм** (`src/modes/brutal/BrutalMode.tsx`).
- **Минимал** (`src/modes/minimal/MinimalMode.tsx`).
- **Аркада / Терминал** (`src/modes/arcade/ArcadeMode.tsx`): CRT-оверлей (сканлайны, виньетка, мерцание), boot-секвенция при входе, эффект печати таглайна, живые часы, проекты как «модули», тема ИБ, accent `#34ff8a`. CRT-кейфреймы — в `globals.css` (`arc-scan`, `arc-flicker`, `arc-glitch`, `arc-pulse-ring`).
- **Жидкое стекло** (`src/modes/glass/GlassMode.tsx`): дрейфующие цветные орбы под frosted-панелями (`<Glass>`: backdrop-blur + внутренний блик + тень), световое пятно за курсором в hero, акцентное свечение карточек проектов, accent `#7cc6ff`. Кейфрейм `gl-drift` — в `globals.css`.
- Деплой на Vercel (прод): https://portfolio-virid-five-19.vercel.app

## Осталось

- Все 5 режимов готовы (HYPERMODE, Минимал, Брутализм, Аркада, Жидкое стекло).
- [ ] Авто-деплой: подключить Git-репозиторий в настройках проекта Vercel (Settings → Git).
- [ ] Свой домен (опц.), реальные скриншоты проектов (опц.).
- [ ] Свой домен (опц.), реальные скриншоты проектов (опц.).

## Как добавить новый режим

1. Создать `src/modes/<id>/<Name>Mode.tsx` (рендерит контент из `site` по тому же образцу).
2. В `src/modes/registry.ts` поставить `ready: true` нужному режиму.
3. В `src/app/page.tsx` добавить ветку `mode === "<id>" ? <NameMode /> : ...` и `dynamic`-импорт.
4. `npm run build` → `vercel --prod`.

## Команды

```
npm run dev      # http://localhost:3000
npm run build
vercel --prod    # деплой (CLI залогинен под rendles)
```
