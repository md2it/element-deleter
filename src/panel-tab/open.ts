import {
  openPanelPageInTab,
  panelTabPath as sharedPanelTabPath,
} from "../../../SHARED/src/panel-tab";
import { PANEL_PAGE_CONFIG, type PanelPopupTab } from "../panel-popup/constants";

export function panelTabPath(panelTab: PanelPopupTab): string {
  return sharedPanelTabPath(PANEL_PAGE_CONFIG.pageHtml, panelTab);
}

export async function openPanelInTab(panelTab: PanelPopupTab): Promise<void> {
  await openPanelPageInTab(panelTabPath(panelTab), PANEL_PAGE_CONFIG.logLabel);
}
