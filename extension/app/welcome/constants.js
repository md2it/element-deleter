"use strict";
var WELCOME_PAGE = "welcome.html";
var WELCOME_SESSION_DATA_KEY = "welcomeData";
var WELCOME_TAB_CONFIG = {
  pageHtml: WELCOME_PAGE,
  sessionDataKey: WELCOME_SESSION_DATA_KEY,
  logLabel: "Element Deleter",
};
var WELCOME_PIN_WATCH_CONFIG = {
  pinStatusChangedMessageType: "PIN_STATUS_CHANGED",
};

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.WELCOME_PAGE = WELCOME_PAGE;
globalThis.WELCOME_SESSION_DATA_KEY = WELCOME_SESSION_DATA_KEY;
globalThis.WELCOME_TAB_CONFIG = WELCOME_TAB_CONFIG;
globalThis.WELCOME_PIN_WATCH_CONFIG = WELCOME_PIN_WATCH_CONFIG;
