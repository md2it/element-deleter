import type { Locale } from "./types";

export function isRtlLocale(locale: Locale): boolean {
  return locale === "ar";
}
