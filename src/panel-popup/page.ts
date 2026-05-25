import { ext } from "../api";
import { isPanelTabMode } from "../panel-tab/mode";
import {
  PANEL_POPUP_PAGE,
  PANEL_POPUP_SESSION_TAB_KEY,
  type PanelPopupTab,
} from "./constants";
import { mountPanelPopup } from "./mount";

export function getPanelPopupPageUrl(): string {
  return ext.runtime.getURL(PANEL_POPUP_PAGE);
}

export function isPanelPopupPage(href: string): boolean {
  return href.startsWith(getPanelPopupPageUrl());
}

function resolveInitialTab(
  sessionTab: unknown,
  queryTab: string | null,
): PanelPopupTab {
  if (sessionTab === "info" || queryTab === "info") return "info";
  return "settings";
}

export async function resolvePanelPageInitialTab(): Promise<PanelPopupTab> {
  const { panelPopupTab } = await ext.storage.session.get(PANEL_POPUP_SESSION_TAB_KEY);
  await ext.storage.session.remove(PANEL_POPUP_SESSION_TAB_KEY);
  const tabParam = new URLSearchParams(location.search).get("tab");
  return resolveInitialTab(panelPopupTab, tabParam);
}

/** Mount settings/about UI when `panel-popup-page.html` is the action popup document. */
export async function bootstrapPanelPopupPageIfNeeded(): Promise<void> {
  if (!isPanelPopupPage(location.href)) return;
  if (isPanelTabMode()) return;

  const tab = await resolvePanelPageInitialTab();
  await mountPanelPopup(tab);
}
