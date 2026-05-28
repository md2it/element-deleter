export type Locale = "en" | "es" | "fr" | "de" | "ru" | "zh_CN" | "ar";

export const LOCALES: readonly Locale[] = [
  "en",
  "es",
  "fr",
  "de",
  "ru",
  "zh_CN",
  "ar",
] as const;

/** Button labels in settings (fixed per README). */
export const LOCALE_BUTTON_LABELS: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  fr: "FR",
  de: "DE",
  ru: "RU",
  zh_CN: "中文",
  ar: "عربي",
};

export type Strings = {
  tabSettings: string;
  tabShortcuts: string;
  tabAbout: string;
  shortcutsRunStopHeading: string;
  shortcutsUndoHeading: string;
  shortcutsStepPress: string;
  shortcutsStepOnMac: string;
  shortcutsStepRelease: string;
  shortcutsStepThenPress: string;
  shortcutsStopHeading: string;
  shortcutsSafetyLine1: string;
  shortcutsSafetyLine2: string;
  aboutCreditPrefix: string;
  aboutCreditAuthor: string;
  notificationPeriodPrefix: string;
  notificationPeriodSuffix: string;
  notificationPeriodHint: string;
  startHotkeyToggleLabel: string;
  escHotkeyToggleLabel: string;
  undoHotkeyToggleLabel: string;
  allElementsOutlineToggleLabel: string;
  allElementsFillToggleLabel: string;
  toastDeleted: string;
  toastRestored: string;
  btnRestore: string;
  panelSubtitle: string;
  titleSettings: string;
  titleAbout: string;
  contextMenuDeleteElement: string;
  restrictedPageNotice: string;
  welcomePin: string;
  welcomePinStep1: string;
  welcomePinStep2: string;
  welcomePinStep3: string;
  aboutBullets: readonly string[];
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
