"use strict";
import { openPanelInActionPopup } from "../../lib/our/panel-popup/open-action-popup.js";
import { openPanelInTab } from "../panel-tab/open.js";

export function openPanelInActionPopup2(panelTab, target) {
  openPanelInActionPopup(PANEL_PAGE_CONFIG, panelTab, target, openPanelInTab);
}
export function openPanelFromSender(panelTab, senderTab) {
  openPanelInActionPopup2(panelTab, {
    tabId: senderTab?.id,
    windowId: senderTab?.windowId,
  });
}
