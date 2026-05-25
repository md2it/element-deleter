import {
  openPanelInActionPopup as openSharedPanelInActionPopup,
  panelPagePath,
  type PanelPageOpenTarget,
} from "../../../SHARED/src/panel-popup";
import { openPanelInTab } from "../panel-tab";
import { PANEL_PAGE_CONFIG, type PanelPopupTab } from "./constants";

export type { PanelPageOpenTarget as PanelPopupOpenTarget };

export function panelPopupPath(panelTab: PanelPopupTab): string {
  return panelPagePath(PANEL_PAGE_CONFIG.pageHtml, panelTab);
}

/** Keep async chain short — user gesture from context menu expires after long await. */
export function openPanelInActionPopup(
  panelTab: PanelPopupTab,
  target: PanelPageOpenTarget,
): void {
  openSharedPanelInActionPopup(
    PANEL_PAGE_CONFIG,
    panelTab,
    target,
    openPanelInTab,
  );
}

export function openPanelFromSender(
  panelTab: PanelPopupTab,
  senderTab: chrome.tabs.Tab | undefined,
): void {
  openPanelInActionPopup(panelTab, {
    tabId: senderTab?.id,
    windowId: senderTab?.windowId,
  });
}
