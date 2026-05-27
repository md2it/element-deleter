import {
  createToggleCommandSuppressTracker,
  registerPrefixBackgroundHotkeys,
} from "../../../lib/src/hotkeys";
import { DELETER_ACTIVE_COLOR } from "./commands";
import { getStartHotkeyEnabled } from "./settings";

const toggleCommandSuppress = createToggleCommandSuppressTracker();

/** Paired `action.onClicked` after manifest `_execute_action`. */
export function shouldSuppressToolbarClickAfterHotkeyCommand(
  now = Date.now(),
): boolean {
  return toggleCommandSuppress.shouldSuppressToolbarClick(now);
}

export type BackgroundHotkeysHost = {
  getActiveCommandTab: () => Promise<chrome.tabs.Tab | undefined>;
  toggleTab: (tabId: number, windowId?: number) => Promise<void>;
};

/** Content prefix chord + `TOGGLE_REQUEST` after action letter. */
export function registerBackgroundHotkeys(host: BackgroundHotkeysHost): void {
  registerPrefixBackgroundHotkeys({
    badgeBackgroundColor: DELETER_ACTIVE_COLOR,
    getActiveCommandTab: host.getActiveCommandTab,
    isToggleEnabled: getStartHotkeyEnabled,
    toggleRequestMessageType: "TOGGLE_REQUEST",
    onToggleRequest: (tabId, windowId) => host.toggleTab(tabId, windowId),
    suppress: toggleCommandSuppress,
  });
}
