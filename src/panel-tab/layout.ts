import { PANEL_TAB_PAGE_CLASS } from "./constants";

/** Document-level tab layout (centered card on gray page). */
export function applyPanelTabPageLayout(): void {
  document.documentElement.classList.add(PANEL_TAB_PAGE_CLASS);
}
