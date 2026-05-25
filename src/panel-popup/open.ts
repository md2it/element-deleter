import { ext } from "../api";
import { openPanelInTab } from "../panel-tab/open";
import { PANEL_POPUP_PAGE, type PanelPopupTab } from "./constants";

export type PanelPopupOpenTarget = {
  /** Per-tab popup only when the icon is pinned; omit for the extensions menu. */
  tabId?: number;
  windowId?: number;
};

export function panelPopupPath(panelTab: PanelPopupTab): string {
  const params = new URLSearchParams({ tab: panelTab });
  return `${PANEL_POPUP_PAGE}?${params.toString()}`;
}

/** Keep async chain short — user gesture from context menu expires after long await. */
export function openPanelInActionPopup(
  panelTab: PanelPopupTab,
  target: PanelPopupOpenTarget,
): void {
  const { tabId, windowId } = target;
  const popup = panelPopupPath(panelTab);
  const setPopupDetails =
    tabId !== undefined ? { tabId, popup } : { popup };
  const clearPopupDetails = tabId !== undefined ? { tabId, popup: "" } : { popup: "" };

  void (async () => {
    await ext.action.setPopup(setPopupDetails);
    try {
      const openPopup = (
        ext.action as typeof ext.action & {
          openPopup?: (details: { windowId: number }) => Promise<void>;
        }
      ).openPopup;
      if (!openPopup) throw new Error("action.openPopup unavailable");
      await openPopup({ windowId });
    } catch (err) {
      console.warn("[Element Deleter] openPopup panel failed, using tab:", err);
      await openPanelInTab(panelTab);
    } finally {
      await ext.action.setPopup(clearPopupDetails);
    }
  })();
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
