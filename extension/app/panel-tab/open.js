import { openPanelPageInTab, panelTabPath } from "../../lib/our/panel-tab/index.js";
import { PANEL_PAGE_CONFIG } from "../panel-popup/constants.js";

export function panelTabPath2(panelTab) {
  return panelTabPath(PANEL_PAGE_CONFIG.pageHtml, panelTab);
}
export async function openPanelInTab(panelTab) {
  await openPanelPageInTab(panelTabPath2(panelTab), PANEL_PAGE_CONFIG.logLabel);
}
