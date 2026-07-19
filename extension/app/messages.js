"use strict";
var STORAGE_KEY = "notificationSeconds";
var LOCALE_STORAGE_KEY = "locale";
var LOCALE_USER_SELECTED_KEY = "localeUserSelected";
var START_HOTKEY_ENABLED_KEY = "startHotkeyEnabled";
var ESC_HOTKEY_ENABLED_KEY = "escHotkeyEnabled";
var UNDO_HOTKEY_ENABLED_KEY = "undoHotkeyEnabled";
var SELECTION_CAPTION_STYLE_KEY = "selectionCaptionStyle";
var ALL_ELEMENTS_OUTLINE_ENABLED_KEY = "allElementsOutlineEnabled";
var ALL_ELEMENTS_FILL_ENABLED_KEY = "allElementsFillEnabled";
var DEFAULT_NOTIFICATION_SECONDS = 4;
var LOCALE_DETECT_VERSION_KEY = "localeDetectVersion";
var LOCALE_DETECT_VERSION = 5;

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.STORAGE_KEY = STORAGE_KEY;
globalThis.LOCALE_STORAGE_KEY = LOCALE_STORAGE_KEY;
globalThis.LOCALE_USER_SELECTED_KEY = LOCALE_USER_SELECTED_KEY;
globalThis.START_HOTKEY_ENABLED_KEY = START_HOTKEY_ENABLED_KEY;
globalThis.ESC_HOTKEY_ENABLED_KEY = ESC_HOTKEY_ENABLED_KEY;
globalThis.UNDO_HOTKEY_ENABLED_KEY = UNDO_HOTKEY_ENABLED_KEY;
globalThis.SELECTION_CAPTION_STYLE_KEY = SELECTION_CAPTION_STYLE_KEY;
globalThis.ALL_ELEMENTS_OUTLINE_ENABLED_KEY = ALL_ELEMENTS_OUTLINE_ENABLED_KEY;
globalThis.ALL_ELEMENTS_FILL_ENABLED_KEY = ALL_ELEMENTS_FILL_ENABLED_KEY;
globalThis.DEFAULT_NOTIFICATION_SECONDS = DEFAULT_NOTIFICATION_SECONDS;
globalThis.LOCALE_DETECT_VERSION_KEY = LOCALE_DETECT_VERSION_KEY;
globalThis.LOCALE_DETECT_VERSION = LOCALE_DETECT_VERSION;
