# РАЗРАБОТКА, СБОРКА

- Node.js 18+ (LTS)
- В каталоге `browser-extensions`: `npm install` в `lib/`
- В `element-deleter/`: `npm run build` — JS из TypeScript (общий код из `lib/src` в бандле)
- Chrome: «Распакованное» → корень `element-deleter/` после build (или `dist/` после pack)
- `npm run watch` — пересборка при правках
- Prod: из корня каталога `./lib/scripts/pack-extension.zsh element-deleter` → `dist/` и `.zip`
