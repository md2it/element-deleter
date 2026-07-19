"use strict";
function getPanelPageUrl(pageHtml) {
  return ext.runtime.getURL(pageHtml);
}
function isPanelPage(href, pageHtml) {
  return href.startsWith(getPanelPageUrl(pageHtml));
}
function panelPagePath(pageHtml, panelTab, extraParams, tabQueryParam = "tab") {
  const params = new URLSearchParams({
    [tabQueryParam]: panelTab,
    ...extraParams,
  });
  return `${pageHtml}?${params.toString()}`;
}

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.getPanelPageUrl = getPanelPageUrl;
globalThis.isPanelPage = isPanelPage;
globalThis.panelPagePath = panelPagePath;
