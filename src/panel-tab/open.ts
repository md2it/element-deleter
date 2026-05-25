import { ext } from "../api";
import { PANEL_POPUP_PAGE, type PanelPopupTab } from "../panel-popup/constants";
import { PANEL_TAB_MODE_PARAM, PANEL_TAB_MODE_VALUE } from "./constants";

export function panelTabPath(panelTab: PanelPopupTab): string {
  const params = new URLSearchParams({
    tab: panelTab,
    [PANEL_TAB_MODE_PARAM]: PANEL_TAB_MODE_VALUE,
  });
  return `${PANEL_POPUP_PAGE}?${params.toString()}`;
}

export async function openPanelInTab(panelTab: PanelPopupTab): Promise<void> {
  try {
    await ext.tabs.create({
      url: ext.runtime.getURL(panelTabPath(panelTab)),
      active: true,
    });
  } catch (err) {
    console.error("[Element Deleter] panel tab failed:", err);
  }
}
