"use strict";
var RTL_LOCALES = /* @__PURE__ */ new Set(["ar"]);
function isRtlLocale(locale) {
  return RTL_LOCALES.has(locale);
}

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.RTL_LOCALES = RTL_LOCALES;
globalThis.isRtlLocale = isRtlLocale;
