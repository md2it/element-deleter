import { ext } from "../api.js";

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

export { getAcceptLanguageTags, pickLanguageTags, fallbackLanguageTags, detectLocale };
