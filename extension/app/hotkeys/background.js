import { registerPrefixBackgroundHotkeys } from "../../lib/our/hotkeys/prefix-background.js";
import { createToggleCommandSuppressTracker } from "../../lib/our/hotkeys/suppress.js";
import { DELETER_ACTIVE_COLOR } from "./commands.js";
import { getStartHotkeyEnabled } from "./settings.js";

var toggleCommandSuppress = createToggleCommandSuppressTracker();
function shouldSuppressToolbarClickAfterHotkeyCommand(now = Date.now()) {
  return toggleCommandSuppress.shouldSuppressToolbarClick(now);
}
function registerBackgroundHotkeys(host) {
  registerPrefixBackgroundHotkeys({
    badgeBackgroundColor: DELETER_ACTIVE_COLOR,
    getActiveCommandTab: host.getActiveCommandTab,
    isToggleEnabled: getStartHotkeyEnabled,
    toggleRequestMessageType: "TOGGLE_REQUEST",
    onToggleRequest: (tabId, windowId) => host.toggleTab(tabId, windowId),
    suppress: toggleCommandSuppress,
  });
}

export { toggleCommandSuppress, shouldSuppressToolbarClickAfterHotkeyCommand, registerBackgroundHotkeys };
