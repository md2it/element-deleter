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

export { CHINESE_UI_LOCALE, TRADITIONAL_CHINESE_RE, mapChineseUiLocale, normalizeLocaleCode, localeToHtmlLang };
