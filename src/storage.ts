import { ext } from "./api";
import {
  detectLocale,
  isLocale,
  type Locale,
} from "./i18n";
import {
  DEFAULT_NOTIFICATION_SECONDS,
  ELEMENT_LABEL_ENABLED_KEY,
  LOCALE_DETECT_VERSION,
  LOCALE_DETECT_VERSION_KEY,
  LOCALE_STORAGE_KEY,
  LOCALE_USER_SELECTED_KEY,
  ESC_HOTKEY_ENABLED_KEY,
  START_HOTKEY_ENABLED_KEY,
  STORAGE_KEY,
  UNDO_HOTKEY_ENABLED_KEY,
} from "./messages";

export async function getNotificationSeconds(): Promise<number> {
  const data = await ext.storage.local.get(STORAGE_KEY);
  const raw = data[STORAGE_KEY];
  if (typeof raw !== "number" || !Number.isInteger(raw) || raw < 0 || raw > 10) {
    return DEFAULT_NOTIFICATION_SECONDS;
  }
  return raw;
}

export async function setNotificationSeconds(value: number): Promise<void> {
  const clamped = Math.min(10, Math.max(0, Math.round(value)));
  await ext.storage.local.set({ [STORAGE_KEY]: clamped });
}

export async function getLocale(): Promise<Locale> {
  const data = await ext.storage.local.get(LOCALE_STORAGE_KEY);
  const raw = data[LOCALE_STORAGE_KEY];
  if (isLocale(raw)) return raw;
  return await detectLocale();
}

/** Background only: persist auto-detected locale and migrate bad values from older builds. */
export async function ensureLocaleInStorage(): Promise<void> {
  const data = await ext.storage.local.get([
    LOCALE_STORAGE_KEY,
    LOCALE_USER_SELECTED_KEY,
    LOCALE_DETECT_VERSION_KEY,
  ]);

  if (data[LOCALE_USER_SELECTED_KEY] && isLocale(data[LOCALE_STORAGE_KEY])) {
    return;
  }

  const version = data[LOCALE_DETECT_VERSION_KEY];
  if (
    version === LOCALE_DETECT_VERSION &&
    isLocale(data[LOCALE_STORAGE_KEY])
  ) {
    return;
  }

  const detected = await detectLocale();
  await ext.storage.local.set({
    [LOCALE_STORAGE_KEY]: detected,
    [LOCALE_DETECT_VERSION_KEY]: LOCALE_DETECT_VERSION,
  });
}

export async function setLocale(locale: Locale): Promise<void> {
  await ext.storage.local.set({
    [LOCALE_STORAGE_KEY]: locale,
    [LOCALE_USER_SELECTED_KEY]: true,
  });
}

function readBooleanSetting(data: Record<string, unknown>, key: string): boolean {
  const raw = data[key];
  return raw !== false;
}

export async function getStartHotkeyEnabled(): Promise<boolean> {
  const data = await ext.storage.local.get(START_HOTKEY_ENABLED_KEY);
  return readBooleanSetting(data, START_HOTKEY_ENABLED_KEY);
}

export async function setStartHotkeyEnabled(value: boolean): Promise<void> {
  await ext.storage.local.set({ [START_HOTKEY_ENABLED_KEY]: value });
}

export async function getEscHotkeyEnabled(): Promise<boolean> {
  const data = await ext.storage.local.get(ESC_HOTKEY_ENABLED_KEY);
  return readBooleanSetting(data, ESC_HOTKEY_ENABLED_KEY);
}

export async function setEscHotkeyEnabled(value: boolean): Promise<void> {
  await ext.storage.local.set({ [ESC_HOTKEY_ENABLED_KEY]: value });
}

export async function getUndoHotkeyEnabled(): Promise<boolean> {
  const data = await ext.storage.local.get(UNDO_HOTKEY_ENABLED_KEY);
  return readBooleanSetting(data, UNDO_HOTKEY_ENABLED_KEY);
}

export async function setUndoHotkeyEnabled(value: boolean): Promise<void> {
  await ext.storage.local.set({ [UNDO_HOTKEY_ENABLED_KEY]: value });
}

export async function getElementLabelEnabled(): Promise<boolean> {
  const data = await ext.storage.local.get(ELEMENT_LABEL_ENABLED_KEY);
  return readBooleanSetting(data, ELEMENT_LABEL_ENABLED_KEY);
}

export async function setElementLabelEnabled(value: boolean): Promise<void> {
  await ext.storage.local.set({ [ELEMENT_LABEL_ENABLED_KEY]: value });
}
