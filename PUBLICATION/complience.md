# ОТВЕТЫ НА ВОПРОСЫ МОДЕРАТОРОВ


## Single purpose
An extension must have a single purpose that is narrow and easy-to-understand

Element Deleter lets you manually remove selected elements on the current page and restore them with undo—without reloading. It is aimed mainly at developers and QA (layout checks, UI states, unblocking test flows), and the same tool helps any user hide a specific ad, cookie banner, modal, or other blocking overlay when they choose the element themselves. Changes stay in the open tab only; this is not a network ad blocker and no data is collected or sent to any server.

## Permission justification
- `activeTab`
  Access the tab the user is working in when they click the toolbar icon, use a keyboard shortcut, or choose a context menu item, so delete mode, undo, and settings run on that page only after an explicit action.

- `scripting`
  Inject the content script into the active tab when it is not already available (after install, in iframes, or when auto-injection failed), so manual element removal and undo work on that page.

- `storage`
  Save tool preferences locally (language, hotkeys, toast duration, element labels, outline/fill helpers for picking nodes). Keep short-lived session state per tab. No data is uploaded or shared.

- `contextMenus`
  Offer “Delete element” on page right-click for quick removal (e.g. a banner or overlay), and “Settings” / “About” on the extension icon menu to open the control panel.

- host permission (`<all_urls>` in `content_scripts`)
  Users need this on any site they open—localhost and staging for dev/QA, or public pages when removing a chosen ad or blocking UI. The content script only hides or restores elements the user selects in the DOM; it does not block network requests, read credentials, or send page content to external servers.

