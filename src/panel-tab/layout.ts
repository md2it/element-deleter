import { applyPanelTabPageLayout as applySharedPanelTabPageLayout } from "../../../SHARED/src/panel-tab";
import { PANEL_TAB_PAGE_CLASS } from "./constants";

/** Document-level tab layout (centered card on gray page). */
export function applyPanelTabPageLayout(): void {
  applySharedPanelTabPageLayout(PANEL_TAB_PAGE_CLASS);
}
