import type { PanelPopupTab } from "../panel-popup/constants";
import { mountPanelSurface } from "../panel-popup/mount-panel-surface";
import { PANEL_TAB_HOST_STYLE } from "./constants";
import { applyPanelTabPageLayout } from "./layout";

export async function mountPanelTab(initialTab: PanelPopupTab): Promise<void> {
  applyPanelTabPageLayout();
  await mountPanelSurface(initialTab, { hostStyle: PANEL_TAB_HOST_STYLE });
}
