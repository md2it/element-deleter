import { ext } from "../api.js";
import { registerPrefixHintBadgeListeners } from "./prefix-hint-badge.js";

var EXECUTE_ACTION_COMMAND = "_execute_action";
function isToggleCommand(command, config) {
  return (
    command === EXECUTE_ACTION_COMMAND ||
    (config.toggleCommand !== void 0 && command === config.toggleCommand)
  );
}
export function registerPrefixBackgroundHotkeys(config) {
  registerPrefixHintBadgeListeners({
    badgeBackgroundColor: config.badgeBackgroundColor,
  });
  ext.commands.onCommand.addListener((command) => {
    if (isToggleCommand(command, config)) {
      config.suppress.stampToggleCommand();
      void (async () => {
        const tab = await config.getActiveCommandTab();
        if (tab?.id === void 0) return;
        if (!(await config.isToggleEnabled())) return;
        await config.onToggleRequest(tab.id, tab.windowId);
      })();
      return;
    }
    if (
      config.deactivateCommand &&
      command === config.deactivateCommand
    ) {
      void (async () => {
        const tab = await config.getActiveCommandTab();
        if (tab?.id === void 0) return;
        if (
          config.isDeactivateCommandEnabled &&
          !(await config.isDeactivateCommandEnabled(tab))
        ) {
          return;
        }
        await config.onDeactivateCommand?.(tab);
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
