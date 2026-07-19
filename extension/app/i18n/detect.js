import { detectLocale } from "../../lib/our/i18n/detect.js";
import { mapChineseUiLocale } from "../../lib/our/i18n/locale-code.js";

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

export { mapLanguageTag, detectLocale2 };
