import { isPanelPage } from "../../lib/our/panel-popup/page-path.js";
import { resolvePanelPageInitialTab } from "../../lib/our/panel-popup/resolve-tab.js";
import { isPanelTabMode } from "../../lib/our/panel-tab/index.js";
import { PANEL_PAGE_CONFIG, PANEL_POPUP_PAGE, PANEL_POPUP_TABS } from "./constants.js";
import { mountPanelPopup } from "./mount.js";

function isPanelPopupPage(href) {
  return isPanelPage(href, PANEL_POPUP_PAGE);
}
async function resolvePanelPageInitialTab2() {
  return resolvePanelPageInitialTab({
    sessionTabKey: PANEL_PAGE_CONFIG.sessionTabKey,
    defaultTab: "settings",
    validTabs: PANEL_POPUP_TABS,
  });
}
async function bootstrapPanelPopupPageIfNeeded() {
  if (!isPanelPopupPage(location.href)) return;
  if (isPanelTabMode()) return;
  const tab = await resolvePanelPageInitialTab2();
  await mountPanelPopup(tab);
}

export { isPanelPopupPage, resolvePanelPageInitialTab2, bootstrapPanelPopupPageIfNeeded };
