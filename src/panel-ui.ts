import { isRtlLocale, t, type Locale } from "./i18n";
import { PanelWindowSystem } from "./panel-window";
import {
  getElementLabelEnabled,
  getEscHotkeyEnabled,
  getLocale,
  getNotificationSeconds,
  getStartHotkeyEnabled,
  getUndoHotkeyEnabled,
} from "./storage";
import { ToastSystem } from "./toast";

const ROOT_ID = "dom-deleter-root";
const HOST_ATTR = "data-dom-deleter-ui";

function isPanelTabMode(): boolean {
  return new URLSearchParams(location.search).get("mode") === "tab";
}

export async function mountPanelPopup(
  initialTab: "settings" | "info",
): Promise<void> {
  const tabMode = isPanelTabMode();
  if (tabMode) {
    document.documentElement.classList.add("dd-panel-page--tab");
  }

  let locale: Locale = "en";
  let notificationSeconds = 4;
  let startHotkeyEnabled = true;
  let escHotkeyEnabled = true;
  let undoHotkeyEnabled = true;
  let elementLabelEnabled = true;

  const host = document.createElement("div");
  host.id = ROOT_ID;
  host.className = "dd-panel-popup";
  host.setAttribute(HOST_ATTR, "true");
  host.style.cssText = tabMode
    ? "display:block;width:100%;max-width:360px;min-height:520px;position:relative;pointer-events:auto;"
    : "display:block;width:360px;min-height:520px;position:relative;pointer-events:auto;";
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
    surface: tabMode ? undefined : "popup",
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
