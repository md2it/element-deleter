import {
  createToggleCommandSuppressTracker,
  registerPrefixManifestHotkeys,
  type PrefixManifestHotkeysHost,
} from "../../../lib/src/hotkeys";
import type { BgToContent } from "../messages";
import {
  COMMAND_TOGGLE_DELETE,
  DELETER_ACTIVE_COLOR,
  PREFIX_ACTION_KEY,
} from "./commands";
import { getStartHotkeyEnabled } from "./settings";

const toggleCommandSuppress = createToggleCommandSuppressTracker();

/** Paired `action.onClicked` after manifest `_execute_action` (same key as prefix). */
export function shouldSuppressToolbarClickAfterHotkeyCommand(
  now = Date.now(),
): boolean {
  return toggleCommandSuppress.shouldSuppressToolbarClick(now);
}

export type BackgroundHotkeysHost = {
  getActiveCommandTab: () => Promise<chrome.tabs.Tab | undefined>;
  toggleTab: (tabId: number, windowId?: number) => Promise<void>;
  sendToTab: (tabId: number, message: BgToContent) => Promise<boolean>;
};

/** Manifest prefix chord + action letter + content fallback (`TOGGLE_REQUEST`). */
export function registerBackgroundHotkeys(host: BackgroundHotkeysHost): void {
  const manifestHost: PrefixManifestHotkeysHost = {
    getActiveCommandTab: host.getActiveCommandTab,
    armPrefixOnTab: async (tab, hintLetter) => {
      await host.sendToTab(tab.id!, {
        type: "PREFIX_ARM_TOGGLE",
        hint: hintLetter,
      });
    },
  };

  registerPrefixManifestHotkeys({
    prefixCommands: [COMMAND_TOGGLE_DELETE],
    hintLetter: PREFIX_ACTION_KEY,
    badgeBackgroundColor: DELETER_ACTIVE_COLOR,
    isPrefixEnabled: getStartHotkeyEnabled,
    isToggleEnabled: getStartHotkeyEnabled,
    toggleRequestMessageType: "TOGGLE_REQUEST",
    onToggleRequest: (tabId, windowId) => host.toggleTab(tabId, windowId),
    host: manifestHost,
    suppress: toggleCommandSuppress,
  });
}
