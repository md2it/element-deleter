"use strict";
function getAcceptLanguageTags() {
  return new Promise((resolve) => {
    const getAccept = ext.i18n?.getAcceptLanguages;
    if (typeof getAccept !== "function") {
      resolve(fallbackLanguageTags());
      return;
    }
    try {
      const maybePromise = getAccept((languages) => {
        resolve(pickLanguageTags(languages));
      });
      if (maybePromise && typeof maybePromise.then === "function") {
        void maybePromise
          .then((languages) => resolve(pickLanguageTags(languages)))
          .catch(() => resolve(fallbackLanguageTags()));
      }
    } catch {
      resolve(fallbackLanguageTags());
    }
  });
}
function pickLanguageTags(languages) {
  if (languages?.length) return [...languages];
  return fallbackLanguageTags();
}
function fallbackLanguageTags() {
  if (typeof navigator !== "undefined" && navigator.languages?.length) {
    return [...navigator.languages];
  }
  try {
    const ui = ext.i18n?.getUILanguage?.();
    return ui ? [ui] : [];
  } catch {
    return [];
  }
}
async function detectLocale(mapLanguageTag2, fallbackLocale) {
  const tags = await getAcceptLanguageTags();
  const seen = /* @__PURE__ */ new Set();
  for (const tag of tags) {
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const mapped = mapLanguageTag2(tag);
    if (mapped) return mapped;
  }
  return fallbackLocale;
}

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.getAcceptLanguageTags = getAcceptLanguageTags;
globalThis.pickLanguageTags = pickLanguageTags;
globalThis.fallbackLanguageTags = fallbackLanguageTags;
globalThis.detectLocale = detectLocale;
