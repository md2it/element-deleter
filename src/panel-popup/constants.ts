import type { PanelPageConfig } from "../../../lib/src/panel-popup";

/** Extension page loaded under the toolbar action popup (not a content-script overlay). */
export const PANEL_POPUP_PAGE = "panel-popup-page.html";

export const PANEL_POPUP_ROOT_ID = "element-deleter-root";
export const PANEL_POPUP_HOST_ATTR = "data-element-deleter-ui";

export const PANEL_POPUP_SESSION_TAB_KEY = "panelPopupTab";

export type PanelPopupTab = "settings" | "shortcuts" | "info";

export type PanelMenuTab = PanelPopupTab;

export const PANEL_POPUP_TABS: readonly PanelPopupTab[] = [
  "settings",
  "shortcuts",
  "info",
];

export const PANEL_MENU_TABS: readonly PanelMenuTab[] = PANEL_POPUP_TABS;

export const PANEL_PAGE_CONFIG: PanelPageConfig = {
  pageHtml: PANEL_POPUP_PAGE,
  sessionTabKey: PANEL_POPUP_SESSION_TAB_KEY,
  logLabel: "Element Deleter",
};
