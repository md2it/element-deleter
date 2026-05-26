import { detectLocale as detectLocaleBase } from "../../../SHARED/src/i18n/detect";
import { mapChineseUiLocale } from "../../../SHARED/src/i18n/locale-code";
import type { Locale } from "./types";

export { getAcceptLanguageTags } from "../../../SHARED/src/i18n/detect";

function mapLanguageTag(tag: string): Locale | null {
  const chinese = mapChineseUiLocale(tag);
  if (chinese) return chinese;
  const lower = tag.trim().toLowerCase().replace(/_/g, "-");
  const base = lower.split("-")[0];
  const map: Record<string, Locale> = {
    en: "en",
    es: "es",
    fr: "fr",
    de: "de",
    ru: "ru",
    ar: "ar",
  };
  return map[base] ?? null;
}

export function detectLocale(): Promise<Locale> {
  return detectLocaleBase(mapLanguageTag, "en");
}
