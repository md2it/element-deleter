import { mountPanelShadowHost } from "../../../lib/src/panel-shell";
import { isRtlLocale, t, type Locale } from "../i18n";
import {
  getAllElementsFillEnabled,
  getAllElementsOutlineEnabled,
  getElementLabelEnabled,
  getEscHotkeyEnabled,
  getLocale,
  getNotificationSeconds,
  getStartHotkeyEnabled,
  getUndoHotkeyEnabled,
} from "../storage";
import { ToastSystem } from "../toast";
import { PANEL_POPUP_HOST_ATTR, PANEL_POPUP_ROOT_ID, type PanelPopupTab } from "./constants";
import { PanelWindowSystem } from "./window";

export type PanelMountSurface = {
  hostStyle: string;
  /** `popup` enables popup-only chrome in `PanelWindowSystem`; omit for tab page. */
  surface?: "popup";
};

export async function mountPanelSurface(
  initialTab: PanelPopupTab,
  { hostStyle, surface }: PanelMountSurface,
): Promise<void> {
  let locale: Locale = "en";
  let notificationSeconds = 4;
  let startHotkeyEnabled = true;
  let escHotkeyEnabled = true;
  let undoHotkeyEnabled = true;
  let elementLabelEnabled = false;
  let allElementsOutlineEnabled = false;
  let allElementsFillEnabled = false;

  const { shadow } = mountPanelShadowHost({
    rootId: PANEL_POPUP_ROOT_ID,
    hostClassName: "dd-panel-popup",
    hostAttr: PANEL_POPUP_HOST_ATTR,
    hostStyle,
    cssContent: process.env.PANEL_CSS_CONTENT ?? "",
  });

  [
    notificationSeconds,
    locale,
    startHotkeyEnabled,
    escHotkeyEnabled,
    undoHotkeyEnabled,
    elementLabelEnabled,
    allElementsOutlineEnabled,
    allElementsFillEnabled,
  ] = await Promise.all([
    getNotificationSeconds(),
    getLocale(),
    getStartHotkeyEnabled(),
    getEscHotkeyEnabled(),
    getUndoHotkeyEnabled(),
    getElementLabelEnabled(),
    getAllElementsOutlineEnabled(),
    getAllElementsFillEnabled(),
  ]);

  let panelWindow!: PanelWindowSystem;

  const toast = new ToastSystem({
    shadow,
    getNotificationSeconds: () => notificationSeconds,
    getStrings: () => t(locale),
    isRtl: () => isRtlLocale(locale),
    openPanel: (tab) => panelWindow.openPanel(tab),
    undoById: async () => false,
  });

  panelWindow = new PanelWindowSystem({
    shadow,
    surface,
    onClose: () => window.close(),
    getLocale: () => locale,
    setLocale: (next) => {
      locale = next;
    },
    getNotificationSeconds: () => notificationSeconds,
    setNotificationSeconds: (seconds) => {
      notificationSeconds = seconds;
    },
    getStartHotkeyEnabled: () => startHotkeyEnabled,
    setStartHotkeyEnabled: (enabled) => {
      startHotkeyEnabled = enabled;
    },
    getEscHotkeyEnabled: () => escHotkeyEnabled,
    setEscHotkeyEnabled: (enabled) => {
      escHotkeyEnabled = enabled;
    },
    getUndoHotkeyEnabled: () => undoHotkeyEnabled,
    setUndoHotkeyEnabled: (enabled) => {
      undoHotkeyEnabled = enabled;
    },
    getElementLabelEnabled: () => elementLabelEnabled,
    setElementLabelEnabled: (enabled) => {
      elementLabelEnabled = enabled;
    },
    getAllElementsOutlineEnabled: () => allElementsOutlineEnabled,
    setAllElementsOutlineEnabled: (enabled) => {
      allElementsOutlineEnabled = enabled;
    },
    getAllElementsFillEnabled: () => allElementsFillEnabled,
    setAllElementsFillEnabled: (enabled) => {
      allElementsFillEnabled = enabled;
    },
    getStrings: () => t(locale),
    isRtl: () => isRtlLocale(locale),
    toast,
  });

  panelWindow.openPanel(initialTab);
}
