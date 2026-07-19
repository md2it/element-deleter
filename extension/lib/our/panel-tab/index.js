"use strict";
var PANEL_TAB_MODE_PARAM = "mode";
var PANEL_TAB_MODE_VALUE = "tab";
function isPanelTabMode(
  modeParam = PANEL_TAB_MODE_PARAM,
  modeValue = PANEL_TAB_MODE_VALUE,
  search = location.search,
) {
  return new URLSearchParams(search).get(modeParam) === modeValue;
}
function applyPanelTabPageLayout(pageClass) {
  document.documentElement.classList.add(pageClass);
}
function panelTabPath(
  pageHtml,
  panelTab,
  modeParam = PANEL_TAB_MODE_PARAM,
  modeValue = PANEL_TAB_MODE_VALUE,
  tabQueryParam = "tab",
) {
  const params = new URLSearchParams({
    [tabQueryParam]: panelTab,
    [modeParam]: modeValue,
  });
  return `${pageHtml}?${params.toString()}`;
}
async function openPanelPageInTab(panelTabPathValue, logLabel) {
  try {
    await ext.tabs.create({
      url: ext.runtime.getURL(panelTabPathValue),
      active: true,
    });
  } catch (err) {
    console.error(`[${logLabel}] panel tab failed:`, err);
  }
}

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.PANEL_TAB_MODE_PARAM = PANEL_TAB_MODE_PARAM;
globalThis.PANEL_TAB_MODE_VALUE = PANEL_TAB_MODE_VALUE;
globalThis.isPanelTabMode = isPanelTabMode;
globalThis.applyPanelTabPageLayout = applyPanelTabPageLayout;
globalThis.panelTabPath = panelTabPath;
globalThis.openPanelPageInTab = openPanelPageInTab;
