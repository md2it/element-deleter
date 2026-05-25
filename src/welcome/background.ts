import { isActionOnToolbar, onActionToolbarChanged } from "../../../SHARED/src/pin";
import { ext } from "../api";
import { getLocale } from "../storage";
import { WELCOME_PAGE } from "./constants";
import { buildWelcomeData } from "./data";

const welcomePinWatchers = new Map<number, () => void>();

export function stopWelcomePinWatcher(tabId: number): void {
  welcomePinWatchers.get(tabId)?.();
  welcomePinWatchers.delete(tabId);
}

function notifyWelcomePinned(tabId: number): void {
  void ext.tabs
    .sendMessage(tabId, { type: "PIN_STATUS_CHANGED", pinned: true })
    .catch(() => {
      /* welcome tab closed */
    });
  stopWelcomePinWatcher(tabId);
}

export function watchWelcomePinStatus(tabId: number): void {
  stopWelcomePinWatcher(tabId);

  void isActionOnToolbar(ext.action).then((pinned) => {
    if (pinned === true) notifyWelcomePinned(tabId);
  });

  const stop = onActionToolbarChanged(ext.action, (pinned) => {
    if (!pinned) return;
    notifyWelcomePinned(tabId);
  });
  welcomePinWatchers.set(tabId, stop);
}

export async function showWelcome(): Promise<void> {
  const locale = await getLocale();
  const manifest = ext.runtime.getManifest();
  const isPinned = await isActionOnToolbar(ext.action);

  await ext.storage.session.set({
    welcomeData: buildWelcomeData(locale, manifest.name, { isPinned }),
  });

  try {
    await ext.tabs.create({
      url: ext.runtime.getURL(WELCOME_PAGE),
      active: true,
    });
  } catch (err) {
    console.error("[Element Deleter] welcome tab failed:", err);
  }
}
