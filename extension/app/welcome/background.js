import { ext } from "../../lib/our/api.js";
import { isActionOnToolbar } from "../../lib/our/pin.js";
import { openWelcomeTab, stopWelcomePinWatcher, watchWelcomePinStatus } from "../../lib/our/welcome/background.js";
import { getLocale } from "../storage.js";
import { WELCOME_PIN_WATCH_CONFIG, WELCOME_TAB_CONFIG } from "./constants.js";
import { buildWelcomeData } from "./data.js";

export function stopWelcomePinWatcher2(tabId) {
  stopWelcomePinWatcher(tabId);
}
export function watchWelcomePinStatus2(tabId) {
  watchWelcomePinStatus(tabId, WELCOME_PIN_WATCH_CONFIG);
}
export async function showWelcome() {
  const locale = await getLocale();
  const manifest = ext.runtime.getManifest();
  const isPinned = await isActionOnToolbar(ext.action);
  await openWelcomeTab(
    WELCOME_TAB_CONFIG,
    buildWelcomeData(locale, manifest.name, { isPinned }),
  );
}
