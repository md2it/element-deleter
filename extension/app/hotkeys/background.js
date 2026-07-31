import { registerPrefixBackgroundHotkeys } from "../../lib/our/hotkeys/prefix-background.js";
import { createToggleCommandSuppressTracker } from "../../lib/our/hotkeys/suppress.js";
import { DELETER_ACTIVE_COLOR } from "./commands.js";
import { getEscHotkeyEnabled, getStartHotkeyEnabled, getUndoHotkeyEnabled } from "./settings.js";

var COMMAND_TOGGLE = "activate-deactivate";
var COMMAND_UNDO = "undo-delete";
var COMMAND_DEACTIVATE = "deactivate-delete-mode";
var toggleCommandSuppress = createToggleCommandSuppressTracker();
function shouldSuppressToolbarClickAfterHotkeyCommand(now = Date.now()) {
  return toggleCommandSuppress.shouldSuppressToolbarClick(now);
}
function registerBackgroundHotkeys(host) {
  registerPrefixBackgroundHotkeys({
    badgeBackgroundColor: DELETER_ACTIVE_COLOR,
    getActiveCommandTab: host.getActiveCommandTab,
    isToggleEnabled: getStartHotkeyEnabled,
    toggleCommand: COMMAND_TOGGLE,
    toggleRequestMessageType: "TOGGLE_REQUEST",
    onToggleRequest: (tabId, windowId) => host.toggleTab(tabId, windowId),
    deactivateCommand: COMMAND_DEACTIVATE,
    isDeactivateCommandEnabled: getEscHotkeyEnabled,
    onDeactivateCommand: (tab) => host.deactivateTab(tab.id, tab.windowId),
    undoCommand: COMMAND_UNDO,
    isUndoCommandEnabled: getUndoHotkeyEnabled,
    onUndoCommand: (tab) => host.undoTab(tab.id, tab.windowId),
    suppress: toggleCommandSuppress,
  });
}

export { COMMAND_TOGGLE, COMMAND_UNDO, COMMAND_DEACTIVATE, toggleCommandSuppress, shouldSuppressToolbarClickAfterHotkeyCommand, registerBackgroundHotkeys };
