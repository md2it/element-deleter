"use strict";
var PANEL_POPUP_PAGE = "panel-popup-page.html";
var PANEL_POPUP_ROOT_ID = "element-deleter-root";
var PANEL_POPUP_HOST_ATTR = "data-element-deleter-ui";
var PANEL_POPUP_SESSION_TAB_KEY = "panelPopupTab";
var PANEL_POPUP_TABS = ["settings", "shortcuts", "info"];
var PANEL_PAGE_CONFIG = {
  pageHtml: PANEL_POPUP_PAGE,
  sessionTabKey: PANEL_POPUP_SESSION_TAB_KEY,
  logLabel: "Element Deleter",
};

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.PANEL_POPUP_PAGE = PANEL_POPUP_PAGE;
globalThis.PANEL_POPUP_ROOT_ID = PANEL_POPUP_ROOT_ID;
globalThis.PANEL_POPUP_HOST_ATTR = PANEL_POPUP_HOST_ATTR;
globalThis.PANEL_POPUP_SESSION_TAB_KEY = PANEL_POPUP_SESSION_TAB_KEY;
globalThis.PANEL_POPUP_TABS = PANEL_POPUP_TABS;
globalThis.PANEL_PAGE_CONFIG = PANEL_PAGE_CONFIG;
