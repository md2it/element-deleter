import { isRtlLocale, t, type Locale } from "../i18n";
import {
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
  let elementLabelEnabled = true;

  const host = document.createElement("div");
  host.id = PANEL_POPUP_ROOT_ID;
  host.className = "dd-panel-popup";
  host.setAttribute(PANEL_POPUP_HOST_ATTR, "true");
  host.style.cssText = hostStyle;
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = process.env.CSS_CONTENT ?? "";
  shadow.appendChild(style);

  [
    notificationSeconds,
    locale,
    startHotkeyEnabled,
    escHotkeyEnabled,
    undoHotkeyEnabled,
    elementLabelEnabled,
  ] = await Promise.all([
    getNotificationSeconds(),
    getLocale(),
    getStartHotkeyEnabled(),
    getEscHotkeyEnabled(),
    getUndoHotkeyEnabled(),
    getElementLabelEnabled(),
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
    getStrings: () => t(locale),
    isRtl: () => isRtlLocale(locale),
    toast,
  });

  panelWindow.openPanel(initialTab);
}
