# SCRIPTS

Shared scripts are located in [lib/scripts/](../../lib/scripts/). Run them from the project root (`element-deleter/`).

- Page screenshots
   - `npm run screenshots:pages -- ru` → `capture-pages.mjs`
   - welcome + settings + about
- Image cropping
   - `npm run screenshots:live` → `crop-live-screenshots.mjs`
   - The project must provide its own `docs/publication/scripts/welcome-seed-entry.ts` (extension-specific welcome page data).
