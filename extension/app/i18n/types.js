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

export { LOCALES, LOCALE_BUTTON_LABELS, isLocale };
