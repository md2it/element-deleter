"use strict";
import { registerPrefixHintBadgeListeners } from "./prefix-hint-badge.js";

var EXECUTE_ACTION_COMMAND = "_execute_action";
export function registerPrefixBackgroundHotkeys(config) {
  registerPrefixHintBadgeListeners({
    badgeBackgroundColor: config.badgeBackgroundColor,
  });
  ext.commands.onCommand.addListener((command) => {
    if (command === EXECUTE_ACTION_COMMAND) {
      config.suppress.stampToggleCommand();
      void (async () => {
        const tab = await config.getActiveCommandTab();
        if (tab?.id === void 0) return;
        if (!(await config.isToggleEnabled())) return;
        await config.onToggleRequest(tab.id, tab.windowId);
      })();
      return;
    }
    if (!config.undoCommand || command !== config.undoCommand) {
      return;
    }
    void (async () => {
      const tab = await config.getActiveCommandTab();
      if (tab?.id === void 0) return;
      if (
        config.isUndoCommandEnabled &&
        !(await config.isUndoCommandEnabled(tab))
      ) {
        return;
      }
      await config.onUndoCommand?.(tab);
    })();
  });
  ext.runtime.onMessage.addListener((message, sender) => {
    const msg = message;
    if (
      msg.type !== config.toggleRequestMessageType ||
      sender.tab?.id === void 0
    ) {
      return;
    }
    const tabId = sender.tab.id;
    void (async () => {
      if (!(await config.isToggleEnabled())) return;
      await config.onToggleRequest(tabId, sender.tab?.windowId);
    })();
  });
}

// app/hotkeys/background.js is a shared classic-script file (also loaded as a
// content script) that still calls this as a bare global identifier, so it
// needs to keep resolving via globalThis.
globalThis.registerPrefixBackgroundHotkeys = registerPrefixBackgroundHotkeys;
