"use strict";
export function panelTabPath2(panelTab) {
  return panelTabPath(PANEL_PAGE_CONFIG.pageHtml, panelTab);
}
export async function openPanelInTab(panelTab) {
  await openPanelPageInTab(panelTabPath2(panelTab), PANEL_PAGE_CONFIG.logLabel);
}
