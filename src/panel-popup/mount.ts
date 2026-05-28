import { mountPanelSurface } from "./mount-panel-surface";

const PANEL_POPUP_HOST_STYLE =
  "display:block;width:372px;min-height:500px;position:relative;pointer-events:auto;";

export async function mountPanelPopup(
  initialTab: "settings" | "shortcuts" | "info",
): Promise<void> {
  await mountPanelSurface(initialTab, {
    hostStyle: PANEL_POPUP_HOST_STYLE,
    surface: "popup",
  });
}
