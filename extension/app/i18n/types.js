"use strict";
var LOCALES = ["en", "es", "fr", "de", "ru", "zh_CN", "ar"];
var LOCALE_BUTTON_LABELS = {
  en: "EN",
  es: "ES",
  fr: "FR",
  de: "DE",
  ru: "RU",
  zh_CN: "中文",
  ar: "عربي",
};
function isLocale(value) {
  return typeof value === "string" && LOCALES.includes(value);
}

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.LOCALES = LOCALES;
globalThis.LOCALE_BUTTON_LABELS = LOCALE_BUTTON_LABELS;
globalThis.isLocale = isLocale;
