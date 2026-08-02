import { openPanelPageInTab, panelTabPath } from "./index.js";
import { PANEL_PAGE_CONFIG } from "../panel-popup/constants.js";

export function panelTabPath2(panelTab) {
  return panelTabPath(PANEL_PAGE_CONFIG.pageHtml, panelTab);
}
export async function openPanelInTab(panelTab) {
  await openPanelPageInTab(panelTabPath2(panelTab), PANEL_PAGE_CONFIG.logLabel);
}
