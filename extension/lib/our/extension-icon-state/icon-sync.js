import { ext } from "../api.js";
import { getTabActiveState } from "./tab-active-state.js";

export function createIconSync(config) {
  const { paths, syncedTabIdsStorageKey, logLabel, getImageSets } = config;
  let imageSetsFailed = false;
  function loadImageSets() {
    if (!getImageSets || imageSetsFailed) return null;
    try {
      return getImageSets();
    } catch (err) {
      imageSetsFailed = true;
      console.error(`[${logLabel}] dynamic toolbar icons unavailable:`, err);
      return null;
    }
  }
  function resolveToolbarIconMode(tabId) {
    return getTabActiveState(tabId) ? "active" : "inactive";
  }
  async function applyToolbarIcon(details, mode) {
    const sets = loadImageSets();
    const iconPaths = paths[mode];
    if (sets) {
      const imageData = sets[mode];
      try {
        await ext.action.setIcon({ ...details, imageData });
        return;
      } catch (err) {
        console.warn(
          `[${logLabel}] setIcon(imageData) failed, using SVG paths:`,
          err,
        );
      }
    }
    try {
      await ext.action.setIcon({ ...details, path: iconPaths });
    } catch (err) {
      if (details.tabId !== void 0) {
        console.warn(`[${logLabel}] setIcon(tabId, path) failed:`, err);
        try {
          await ext.action.setIcon({ path: iconPaths });
        } catch (err2) {
          console.error(`[${logLabel}] setIcon(path) failed:`, err2);
        }
        return;
      }
      console.error(`[${logLabel}] setIcon failed:`, err);
    }
  }
  async function getIconSyncedTabIds() {
    const data = await ext.storage.session.get(syncedTabIdsStorageKey);
    const raw = data[syncedTabIdsStorageKey];
    if (!Array.isArray(raw)) return [];
    return raw.filter((id) => typeof id === "number");
  }
  async function setIconSyncedTabIds(ids) {
    await ext.storage.session.set({ [syncedTabIdsStorageKey]: ids });
  }
  async function rememberIconSyncedTab(tabId) {
    const ids = await getIconSyncedTabIds();
    if (ids.includes(tabId)) return;
    await setIconSyncedTabIds([...ids, tabId]);
  }
  async function forgetIconSyncedTab2(tabId) {
    const ids = await getIconSyncedTabIds();
    if (!ids.includes(tabId)) return;
    await setIconSyncedTabIds(ids.filter((id) => id !== tabId));
  }
  async function syncIconForTab2(tabId) {
    await applyToolbarIcon({ tabId }, resolveToolbarIconMode(tabId));
    await rememberIconSyncedTab(tabId);
  }
  async function setGlobalToolbarIcon2() {
    await applyToolbarIcon({}, "inactive");
  }
  async function syncAllTabIcons() {
    const tabIds = await getIconSyncedTabIds();
    const alive = [];
    for (const tabId of tabIds) {
      try {
        await applyToolbarIcon({ tabId }, resolveToolbarIconMode(tabId));
        alive.push(tabId);
      } catch {}
    }
    if (alive.length !== tabIds.length) {
      await setIconSyncedTabIds(alive);
    }
  }
  async function bootstrapToolbarIcons2() {
    await setGlobalToolbarIcon2();
    await syncAllTabIcons();
  }
  return {
    syncIconForTab: syncIconForTab2,
    forgetIconSyncedTab: forgetIconSyncedTab2,
    setGlobalToolbarIcon: setGlobalToolbarIcon2,
    bootstrapToolbarIcons: bootstrapToolbarIcons2,
  };
}
