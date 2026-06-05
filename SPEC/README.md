# SPECIFICATION RU: ELEMENT DELETER

> [!INFO] Project specification in Russian. Used during development.

Учитываем общие правила тоже [lib/SPEC/README.md](../../lib/SPEC/README.md).

Спецификация расширения Element Deleter.

- [overview.md](./overview.md) — описание, особенности, приватность, браузеры
- [user-journey.md](./user-journey.md) — пользовательские пути
- [biz-known-limitations.md](./biz-known-limitations.md) — известные ограничения
- [manifest-permissions.md](./manifest-permissions.md) — разрешения браузера
- Функциональные требования
  - [fr-enable-disable.md](./fr-enable-disable.md) — включение и выключение
  - [fr-target-highlight.md](./fr-target-highlight.md) — выделение целевого элемента
  - [fr-all-elements-highlight.md](./fr-all-elements-highlight.md) — выделение всех элементов страницы
  - [fr-delete.md](./fr-delete.md) — удаление
  - [fr-restore.md](./fr-restore.md) — восстановление
  - [fr-popup.md](./fr-popup.md) — открытие popup
  - [fr-hotkeys.md](./fr-hotkeys.md) — хоткеи
- UX/UI
  - [ui-brand-color.md](./ui-brand-color.md) — ключевой цвет
  - [ui-extension-icon.md](./ui-extension-icon.md) — иконка расширения
  - [ui-badge.md](./ui-badge.md) — badge
  - [ui-page-context-menu.md](./ui-page-context-menu.md) — контекстное меню страницы
  - [ui-toast.md](./ui-toast.md) — уведомления
  - [ui-header.md](./ui-header.md) — header
  - [ui-vertical-menu.md](./ui-vertical-menu.md) — вертикальное меню
  - [ui-pages.md](./ui-pages.md) — приветственное окно, SETTINGS / SHORTCUTS / ABOUT
  - [ui-animations.md](./ui-animations.md) — анимации
- [README.md](../README.md) — агент: сборка и правила

Общие ресурсы каталога:

- [lib/SPEC](../../lib/SPEC) — общие дефолтные требования для всех расширений
- [lib/BUILD.md](../../lib/BUILD.md) — сборка и упаковка
- [lib/scripts](../../lib/scripts) — общие скрипты, включая `minify-and-zip.zsh`
- [lib/our](../../lib/our) — переиспользуемые модули
- [lib/vendor/icons](../../lib/vendor/icons) и [lib/our/icons](../../lib/our/icons) — общие SVG-иконки
