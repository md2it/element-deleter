import type { Locale } from "./i18n";
import type { PrefixHintContentToBg } from "../../lib/src/hotkeys/prefix-hint-messages";

export type BgToContent =
  | { type: "SET_ACTIVE"; active: boolean }
  | {
      type: "SETTINGS_UPDATED";
      notificationSeconds: number;
      locale: Locale;
      elementLabelEnabled: boolean;
      allElementsOutlineEnabled: boolean;
      allElementsFillEnabled: boolean;
    }
  | { type: "DELETE_CONTEXT_ELEMENT" }
  | { type: "PREFIX_ARM_TOGGLE"; hint: string };

export type ContentToBg =
  | { type: "ACTIVE_CHANGED"; active: boolean }
  | { type: "OPEN_PANEL"; tab: "settings" | "info" }
  | { type: "TOGGLE_REQUEST" }
  | { type: "WATCH_PIN_STATUS" }
  | PrefixHintContentToBg;

/** Content script response when background tries to activate on a tab. */
export type ContentActivationResponse = { ok: boolean };

export type BgToWelcome = { type: "PIN_STATUS_CHANGED"; pinned: boolean };

export const STORAGE_KEY = "notificationSeconds";
export const LOCALE_STORAGE_KEY = "locale";
/** Set when the user picks a language in settings; blocks auto re-detection. */
export const LOCALE_USER_SELECTED_KEY = "localeUserSelected";
/** Bumped when auto-detect logic changes; triggers one-time re-detect in background. */
export const LOCALE_DETECT_VERSION_KEY = "localeDetectVersion";
export const LOCALE_DETECT_VERSION = 5;
export const START_HOTKEY_ENABLED_KEY = "startHotkeyEnabled";
export const ESC_HOTKEY_ENABLED_KEY = "escHotkeyEnabled";
export const UNDO_HOTKEY_ENABLED_KEY = "undoHotkeyEnabled";
export const ELEMENT_LABEL_ENABLED_KEY = "elementLabelEnabled";
export const ALL_ELEMENTS_OUTLINE_ENABLED_KEY = "allElementsOutlineEnabled";
export const ALL_ELEMENTS_FILL_ENABLED_KEY = "allElementsFillEnabled";
export const DEFAULT_NOTIFICATION_SECONDS = 4;
