# PROGRESS — состояние разработки

> Точка сохранения для продолжения работы над сайтом-портфолио.

## Готово

- **Каркас движка режимов:** контент (`src/content/site.ts`, RU/EN), i18n, контексты (`src/providers/AppProviders.tsx`), переключатель (`src/components/ModeSwitcher.tsx`), реестр (`src/modes/registry.ts`), рендерер (`src/app/page.tsx`).
- **HYPERMODE** (`src/modes/hyper/`): шейдерный фон + частицы (`ShaderBackground`), курсор (`HyperCursor`), Lenis, hero, 3D-слайдер (`WorkSlider`), физика (`PhysicsPlayground`, matter.js), колесо навыков со скролл-вращением и эффектами (`SkillsWheel`), блок ИИ с иконками Simple Icons.
- **Брутализм** (`src/modes/brutal/BrutalMode.tsx`).
- **Минимал** (`src/modes/minimal/MinimalMode.tsx`).
- Деплой на Vercel (прод): https://portfolio-virid-five-19.vercel.app

## Осталось

- [ ] Режим **Жидкое стекло** (`glass`) — сейчас заглушка. Глассморфизм: матовые слои, глубина, преломление, свет. Тёмная тема, accent `#7cc6ff`.
- [ ] Режим **Аркада / Терминал** (`arcade`) — заглушка. Игровой/хакерский, тема ИБ. Тёмная тема, accent `#34ff8a`.
- [ ] Авто-деплой: подключить Git-репозиторий в настройках проекта Vercel (Settings → Git).
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
