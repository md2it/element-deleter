# Element Deleter

Browser extension (Chrome, Firefox) to remove page elements locally and restore them. No network, no data collection — changes apply only to your tab until you reload.

## Features

- Click the toolbar icon or `Ctrl+Shift+X` → `D` (`Cmd+Shift+X` → `D` on Mac) to enter delete mode
- Click elements to remove them
- Undo via notification button or `Ctrl+Z` / `Cmd+Z`
- Contour highlight, delete toasts, settings popup
- Works across frames better than typical alternatives (platform limits still apply)
- UI: EN, ES, FR, DE, RU, 中文, عربي

## Limitations

- iframes are selected and removed as a whole; highlight style differs from normal elements
- SVG path restore can be wrong in rare cases
- Welcome-page language is separate from the settings popup language

## Developers

**License:** [MIT](LICENSE)

**Author:** [Aleksei Terekhov](https://www.linkedin.com/in/alex-terekhov/) — [md2it.com](https://md2it.com)

### Install (built extension)

1. Open `chrome://extensions` (or Firefox equivalent).
2. Enable developer mode.
3. **Load unpacked** → select the `dist/` folder (store-ready build).

### Build from source

This repository contains **Element Deleter** sources only. Shared library code (`SHARED/`) is a private multi-project toolkit and is **not published**. You cannot rebuild from this repo alone.

TypeScript in `src/` is for reference; runtime code is in the bundled `.js` files inside `dist/`.

Russian product/tech specs (`SPEC-BIZ.md`, `SPEC-TECH.md`) are dev-only and not translated.
