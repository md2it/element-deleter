import { PANEL_TAB_MODE_PARAM, PANEL_TAB_MODE_VALUE } from "./constants";

export function isPanelTabMode(search: string = location.search): boolean {
  return new URLSearchParams(search).get(PANEL_TAB_MODE_PARAM) === PANEL_TAB_MODE_VALUE;
}
