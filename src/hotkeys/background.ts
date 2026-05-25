import {
  createToggleCommandSuppressTracker,
  registerManifestCommandHotkeys,
  type ManifestCommandHotkeysHost,
} from "../../../SHARED/src/hotkeys";
import { COMMAND_TOGGLE_DELETE, COMMAND_UNDO } from "./commands";
import { getStartHotkeyEnabled } from "./settings";

const toggleCommandSuppress = createToggleCommandSuppressTracker();

/** Paired `action.onClicked` after manifest `_execute_action` (same key as toggle). */
export function shouldSuppressToolbarClickAfterHotkeyCommand(
  now = Date.now(),
): boolean {
  return toggleCommandSuppress.shouldSuppressToolbarClick(now);
}

export type BackgroundHotkeysHost = {
  getActiveCommandTab: () => Promise<chrome.tabs.Tab | undefined>;
  undoOnTab: (tabId: number) => Promise<void>;
  toggleTab: (tabId: number, windowId?: number) => Promise<void>;
};

/** Manifest commands + content-script toggle fallback (`TOGGLE_REQUEST`). */
export function registerBackgroundHotkeys(host: BackgroundHotkeysHost): void {
  const manifestHost: ManifestCommandHotkeysHost = {
    getActiveCommandTab: host.getActiveCommandTab,
    onToggleCommand: async (tab) => {
      await host.toggleTab(tab.id!, tab.windowId);
    },
    onUndoCommand: async (tab) => {
      await host.undoOnTab(tab.id!);
    },
  };

  registerManifestCommandHotkeys({
    toggleCommand: COMMAND_TOGGLE_DELETE,
    undoCommand: COMMAND_UNDO,
    isToggleEnabled: getStartHotkeyEnabled,
    toggleRequestMessageType: "TOGGLE_REQUEST",
    onToggleRequest: (tabId, windowId) => host.toggleTab(tabId, windowId),
    host: manifestHost,
    suppress: toggleCommandSuppress,
  });
}
