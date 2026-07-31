# RESPONSES TO MODERATOR QUESTIONS


## Single purpose
Element Deleter lets you manually remove selected elements on the current page and restore them with undo—without reloading. It is aimed mainly at developers and QA (layout checks, UI states, unblocking test flows), and the same tool helps any user hide a specific ad, cookie banner, modal, or other blocking overlay when they choose the element themselves. Changes stay in the open tab only; this is not a network ad blocker and no data is collected or sent to any server.

## Permission justification
- `activeTab`
  Access the tab the user is working in when they click the toolbar icon or use a keyboard shortcut, so delete mode, undo, and settings run on that page only after an explicit action.

- `scripting`
  Inject the content script into the active tab after the user clicks the toolbar icon or uses a keyboard command, so manual element removal and undo work on that page.

- `storage`
  Save tool preferences locally (language, toast duration, element labels, outline/fill helpers for picking nodes). Keep short-lived session state per tab. No data is uploaded or shared.
