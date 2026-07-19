# RELEASE LIST

Regular SemVer logic.

---

## RELEASES

### 1.2.10
- Removed close button from the support survey window
- Fixed empty Settings panel (missing hotkey aria-label import)
- Fixed toolbar icon update failing under MV3 (icon paths resolved from service worker folder)
- Fixed support survey page runtime errors (missing state imports)

### 1.2.9
- Migrated the extension runtime and content entrypoint to ES modules with a shared content loader

### 1.2.8
- Unified Lucide UI icons via shared vendor copies (`lib/vendor/icons`)

### 1.2.7
- Welcome pin hint is positioned from the viewport edge (no fixed inset)

### 1.2.6
- Refactored background to a single modular entry (`app/background/main.js`) for Chrome MV3 and Firefox 121+
- Goal: replace the duplicated long script lists in `manifest.json` and `sw.js` with one import graph
- Prevents background modules from being registered in only one of the two lists (missed listeners, menus, or Welcome on one browser)

### 1.2.5
- Widened Welcome and tightened About overview copy for small screens

### 1.2.4
- Updated the Welcome page to match About

### 1.2.3
- Refined the About page layout

### 1.2.2
- Refined activity statistics in About

### 1.2.1
- Fixed support survey activity counter display and increment
- Fixed store rating link browser detection

### 1.2.0
- Added optional feedback survey and activity statistics in About

### 1.1.4
- Removed dead code

### 1.1.3
- Fixed bugs and errors

### 1.1.2
- Upd icon to better quality
- The grand refactoring: bandles split to chunks, removed dependencies

### 1.1.1
- Updated notifications

### 1.1.0
- New setting "Frame title"

### 1.0.9
- Minified production code

### 1.0.8
- Context menu for Firefox

### 1.0.7
- Removed extra buttons from the "Welcome" screen

### 1.0.6
- Redesign of UI windows

### 1.0.5
- More badge variants, including animated

### 1.0.4
- Shortcuts don't conflict with input fields anymore

### 1.0.3
- Clarifying UI texts

### 1.0.2
- Reduced the impact of hotkeys between applications

### 1.0.1
- Upd icon and badge logic
- Amendments for AMO compliance

### 1.0.0
- 1st release
- Highlight selected element
- Highlight all
- Element tag, id, class, pseudo-class
- Delete element
- Undo deleting
- Notifications
- Settings
- About
- Welcome page
- Hotkeys
- Status checking
