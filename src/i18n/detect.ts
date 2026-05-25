import { detectLocale as detectLocaleBase } from "../../../SHARED/src/i18n/detect";
import type { Locale } from "./types";

export { getAcceptLanguageTags } from "../../../SHARED/src/i18n/detect";

function mapLanguageTag(tag: string): Locale | null {
  const lower = tag.trim().toLowerCase().replace(/_/g, "-");
  if (lower.startsWith("zh")) return "zh";
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
