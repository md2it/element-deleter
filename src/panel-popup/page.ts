import {
  getPanelPageUrl,
  isPanelPage,
  resolvePanelPageInitialTab as resolveLibPanelPageInitialTab,
} from "../../../lib/src/panel-popup";
import { isPanelTabMode } from "../panel-tab";
import {
  PANEL_PAGE_CONFIG,
  PANEL_POPUP_PAGE,
  PANEL_POPUP_TABS,
  type PanelPopupTab,
} from "./constants";
import { mountPanelPopup } from "./mount";

export function getPanelPopupPageUrl(): string {
  return getPanelPageUrl(PANEL_POPUP_PAGE);
}

export function isPanelPopupPage(href: string): boolean {
  return isPanelPage(href, PANEL_POPUP_PAGE);
}

export async function resolvePanelPageInitialTab(): Promise<PanelPopupTab> {
  return resolveLibPanelPageInitialTab({
    sessionTabKey: PANEL_PAGE_CONFIG.sessionTabKey,
    defaultTab: "settings",
    validTabs: PANEL_POPUP_TABS,
  });
}

/** Mount settings/about UI when `panel-popup-page.html` is the action popup document. */
export async function bootstrapPanelPopupPageIfNeeded(): Promise<void> {
  if (!isPanelPopupPage(location.href)) return;
  if (isPanelTabMode()) return;

  const tab = await resolvePanelPageInitialTab();
  await mountPanelPopup(tab);
}
