import { ext } from "../api";
import type { ContentToBg } from "../messages";
import {
  COMMAND_DEACTIVATE,
  COMMAND_EXECUTE_ACTION,
  COMMAND_UNDO,
} from "./commands";
import { getStartHotkeyEnabled } from "./settings";

/** Ignore page `TOGGLE_REQUEST` shortly after manifest `_execute_action` (enable→off race). */
export const EXECUTE_ACTION_TOGGLE_SUPPRESS_MS = 300;

let lastExecuteActionAt = 0;

export function shouldSuppressContentToggleAfterExecuteAction(
  lastAt: number,
  now: number,
  windowMs = EXECUTE_ACTION_TOGGLE_SUPPRESS_MS,
): boolean {
  return lastAt > 0 && now - lastAt < windowMs;
}

export type BackgroundHotkeysHost = {
  getActiveCommandTab: () => Promise<chrome.tabs.Tab | undefined>;
  deactivateTab: (tabId: number) => Promise<void>;
  undoOnTab: (tabId: number) => Promise<void>;
  toggleTab: (tabId: number, windowId?: number) => Promise<void>;
};

/** Manifest commands + content-script toggle fallback (`TOGGLE_REQUEST`). */
export function registerBackgroundHotkeys(host: BackgroundHotkeysHost): void {
  ext.commands.onCommand.addListener((command) => {
    void (async () => {
      const tab = await host.getActiveCommandTab();
      if (tab?.id === undefined) return;

      if (command === COMMAND_EXECUTE_ACTION) {
        if (!(await getStartHotkeyEnabled())) return;
        lastExecuteActionAt = Date.now();
        await host.toggleTab(tab.id, tab.windowId);
        return;
      }

      if (command === COMMAND_DEACTIVATE) {
        if (!(await getStartHotkeyEnabled())) return;
        await host.deactivateTab(tab.id);
        return;
      }
      if (command === COMMAND_UNDO) {
        await host.undoOnTab(tab.id);
      }
    })();
  });

  ext.runtime.onMessage.addListener((message: ContentToBg, sender): boolean | void => {
    if (message.type !== "TOGGLE_REQUEST" || sender.tab?.id === undefined) {
      return;
    }
    const tabId = sender.tab.id;
    void (async () => {
      if (!(await getStartHotkeyEnabled())) return;
      if (
        shouldSuppressContentToggleAfterExecuteAction(
          lastExecuteActionAt,
          Date.now(),
        )
      ) {
        return;
      }
      await host.toggleTab(tabId, sender.tab?.windowId);
    })();
  });
}
