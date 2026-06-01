# СКРИПТЫ

Общие скрипты — в [lib/scripts/](../../lib/scripts/). Запуск из корня проекта (`element-deleter/`).

- Скриншот страниц
   - `npm run screenshots:pages -- ru` → `capture-pages.mjs`
   - welcome + settings + about
- Обрезка изображений
   - `npm run screenshots:live` → `crop-live-screenshots.mjs`
   - В проекте нужен свой `PUBLICATION/scripts/welcome-seed-entry.ts` (данные welcome под расширение).

В `package.json` проекта:

```json
"screenshots:pages": "node ../lib/scripts/capture-pages.mjs",
"screenshots:live": "node ../lib/scripts/crop-live-screenshots.mjs"
```
