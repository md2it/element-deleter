import { ext } from "../api.js";

var PANEL_TAB_MODE_PARAM = "mode";
var PANEL_TAB_MODE_VALUE = "tab";
function isPanelTabMode(
  modeParam = PANEL_TAB_MODE_PARAM,
  modeValue = PANEL_TAB_MODE_VALUE,
  search = location.search,
) {
  return new URLSearchParams(search).get(modeParam) === modeValue;
}
function applyPanelTabPageLayout(pageClass) {
  document.documentElement.classList.add(pageClass);
}
function panelTabPath(
  pageHtml,
  panelTab,
  modeParam = PANEL_TAB_MODE_PARAM,
  modeValue = PANEL_TAB_MODE_VALUE,
  tabQueryParam = "tab",
) {
  const params = new URLSearchParams({
    [tabQueryParam]: panelTab,
    [modeParam]: modeValue,
  });
  return `${pageHtml}?${params.toString()}`;
}
async function openPanelPageInTab(panelTabPathValue, logLabel) {
  try {
    await ext.tabs.create({
      url: ext.runtime.getURL(panelTabPathValue),
      active: true,
    });
  } catch (err) {
    console.error(`[${logLabel}] panel tab failed:`, err);
  }
}

export { PANEL_TAB_MODE_PARAM, PANEL_TAB_MODE_VALUE, isPanelTabMode, applyPanelTabPageLayout, panelTabPath, openPanelPageInTab };
