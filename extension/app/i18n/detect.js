"use strict";
function mapLanguageTag(tag) {
  const chinese = mapChineseUiLocale(tag);
  if (chinese) return chinese;
  const lower = tag.trim().toLowerCase().replace(/_/g, "-");
  const base = lower.split("-")[0];
  const map = {
    en: "en",
    es: "es",
    fr: "fr",
    de: "de",
    ru: "ru",
    ar: "ar",
  };
  return map[base] ?? null;
}
function detectLocale2() {
  return detectLocale(mapLanguageTag, "en");
}

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.mapLanguageTag = mapLanguageTag;
globalThis.detectLocale2 = detectLocale2;
