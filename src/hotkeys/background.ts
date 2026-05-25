import { ext } from "../api";
import type { ContentToBg } from "../messages";
import { COMMAND_TOGGLE_DELETE, COMMAND_UNDO } from "./commands";
import { getStartHotkeyEnabled } from "./settings";

/** Ignore content `TOGGLE_REQUEST` shortly after manifest toggle command. */
export const TOGGLE_COMMAND_SUPPRESS_MS = 300;

let lastToggleCommandAt = 0;

export function shouldSuppressContentToggleAfterToggleCommand(
  lastAt: number,
  now: number,
  windowMs = TOGGLE_COMMAND_SUPPRESS_MS,
): boolean {
  return lastAt > 0 && now - lastAt < windowMs;
}

export type BackgroundHotkeysHost = {
  getActiveCommandTab: () => Promise<chrome.tabs.Tab | undefined>;
  undoOnTab: (tabId: number) => Promise<void>;
  toggleTab: (tabId: number, windowId?: number) => Promise<void>;
};

/** Manifest commands + content-script toggle fallback (`TOGGLE_REQUEST`). */
export function registerBackgroundHotkeys(host: BackgroundHotkeysHost): void {
  ext.commands.onCommand.addListener((command) => {
    void (async () => {
      const tab = await host.getActiveCommandTab();
      if (tab?.id === undefined) return;

      if (command === COMMAND_TOGGLE_DELETE) {
        if (!(await getStartHotkeyEnabled())) return;
        lastToggleCommandAt = Date.now();
        await host.toggleTab(tab.id, tab.windowId);
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
        shouldSuppressContentToggleAfterToggleCommand(
          lastToggleCommandAt,
          Date.now(),
        )
      ) {
        return;
      }
      await host.toggleTab(tabId, sender.tab?.windowId);
    })();
  });
}
