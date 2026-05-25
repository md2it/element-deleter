import { mountPanelSurface } from "./mount-shared";

const PANEL_POPUP_HOST_STYLE =
  "display:block;width:360px;min-height:520px;position:relative;pointer-events:auto;";

export async function mountPanelPopup(
  initialTab: "settings" | "info",
): Promise<void> {
  await mountPanelSurface(initialTab, {
    hostStyle: PANEL_POPUP_HOST_STYLE,
    surface: "popup",
  });
}
