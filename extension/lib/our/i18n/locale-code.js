"use strict";
var CHINESE_UI_LOCALE = "zh_CN";
var TRADITIONAL_CHINESE_RE = /^zh-(tw|hk|mo|hant)(-|$)|^zh-hant(-|$)/;
function mapChineseUiLocale(tag) {
  const lower = tag.trim().toLowerCase().replace(/_/g, "-");
  if (!lower.startsWith("zh")) return null;
  if (TRADITIONAL_CHINESE_RE.test(lower)) return null;
  return CHINESE_UI_LOCALE;
}
function normalizeLocaleCode(code) {
  if (code === "zh") return CHINESE_UI_LOCALE;
  return code;
}
function localeToHtmlLang(locale) {
  return locale.replace(/_/g, "-");
}

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.CHINESE_UI_LOCALE = CHINESE_UI_LOCALE;
globalThis.TRADITIONAL_CHINESE_RE = TRADITIONAL_CHINESE_RE;
globalThis.mapChineseUiLocale = mapChineseUiLocale;
globalThis.normalizeLocaleCode = normalizeLocaleCode;
globalThis.localeToHtmlLang = localeToHtmlLang;
