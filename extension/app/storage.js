"use strict";
async function getNotificationSeconds() {
  const data = await ext.storage.local.get(STORAGE_KEY);
  const raw = data[STORAGE_KEY];
  if (
    typeof raw !== "number" ||
    !Number.isInteger(raw) ||
    raw < 0 ||
    raw > 10
  ) {
    return DEFAULT_NOTIFICATION_SECONDS;
  }
  return raw;
}
async function setNotificationSeconds(value) {
  const clamped = Math.min(10, Math.max(0, Math.round(value)));
  await ext.storage.local.set({ [STORAGE_KEY]: clamped });
}
async function getLocale() {
  const data = await ext.storage.local.get(LOCALE_STORAGE_KEY);
  const raw = data[LOCALE_STORAGE_KEY];
  if (typeof raw === "string") {
    const normalized = normalizeLocaleCode(raw);
    if (isLocale(normalized)) {
      if (normalized !== raw) {
        await ext.storage.local.set({ [LOCALE_STORAGE_KEY]: normalized });
      }
      return normalized;
    }
  }
  return await detectLocale2();
}
async function setLocale(locale) {
  await ext.storage.local.set({
    [LOCALE_STORAGE_KEY]: locale,
    [LOCALE_USER_SELECTED_KEY]: true,
  });
}
async function getAllElementsOutlineEnabled() {
  const data = await ext.storage.local.get(ALL_ELEMENTS_OUTLINE_ENABLED_KEY);
  return data[ALL_ELEMENTS_OUTLINE_ENABLED_KEY] === true;
}
async function setAllElementsOutlineEnabled(value) {
  await ext.storage.local.set({ [ALL_ELEMENTS_OUTLINE_ENABLED_KEY]: value });
}
async function getAllElementsFillEnabled() {
  const data = await ext.storage.local.get(ALL_ELEMENTS_FILL_ENABLED_KEY);
  return data[ALL_ELEMENTS_FILL_ENABLED_KEY] === true;
}
async function setAllElementsFillEnabled(value) {
  await ext.storage.local.set({ [ALL_ELEMENTS_FILL_ENABLED_KEY]: value });
}
async function ensureLocaleInStorage() {
  const data = await ext.storage.local.get([
    LOCALE_STORAGE_KEY,
    LOCALE_USER_SELECTED_KEY,
    LOCALE_DETECT_VERSION_KEY,
  ]);
  if (data[LOCALE_USER_SELECTED_KEY] && isLocale(data[LOCALE_STORAGE_KEY])) {
    return;
  }
  const version = data[LOCALE_DETECT_VERSION_KEY];
  if (version === LOCALE_DETECT_VERSION && isLocale(data[LOCALE_STORAGE_KEY])) {
    return;
  }
  const detected = await detectLocale2();
  await ext.storage.local.set({
    [LOCALE_STORAGE_KEY]: detected,
    [LOCALE_DETECT_VERSION_KEY]: LOCALE_DETECT_VERSION,
  });
}

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.getNotificationSeconds = getNotificationSeconds;
globalThis.setNotificationSeconds = setNotificationSeconds;
globalThis.getLocale = getLocale;
globalThis.setLocale = setLocale;
globalThis.getAllElementsOutlineEnabled = getAllElementsOutlineEnabled;
globalThis.setAllElementsOutlineEnabled = setAllElementsOutlineEnabled;
globalThis.getAllElementsFillEnabled = getAllElementsFillEnabled;
globalThis.setAllElementsFillEnabled = setAllElementsFillEnabled;
globalThis.ensureLocaleInStorage = ensureLocaleInStorage;
