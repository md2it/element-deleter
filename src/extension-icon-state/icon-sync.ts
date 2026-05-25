import { ext } from "../api";
import { TOOLBAR_ICON_PATHS, type ToolbarIconMode } from "../icon-paths";
import { getToolbarIconSets, type ToolbarIconSets } from "../icons";
import { getTabActiveState } from "./tab-active-state";

const ICON_SYNCED_TAB_IDS_KEY = "iconSyncedTabIds";

let toolbarIcons: ToolbarIconSets | null = null;
let toolbarIconsFailed = false;

function loadToolbarIcons(): ToolbarIconSets | null {
  if (toolbarIcons) return toolbarIcons;
  if (toolbarIconsFailed) return null;
  try {
    toolbarIcons = getToolbarIconSets();
    return toolbarIcons;
  } catch (err) {
    toolbarIconsFailed = true;
    console.error("[Element Deleter] dynamic toolbar icons unavailable:", err);
    return null;
  }
}

function resolveToolbarIconMode(tabId: number): ToolbarIconMode {
  return getTabActiveState(tabId) ? "active" : "inactive";
}

async function applyToolbarIcon(
  details: { tabId?: number },
  mode: ToolbarIconMode,
): Promise<void> {
  const sets = loadToolbarIcons();
  const paths = TOOLBAR_ICON_PATHS[mode];

  if (sets) {
    const imageData = sets[mode];
    try {
      await ext.action.setIcon({ ...details, imageData });
      return;
    } catch (err) {
      console.warn("[Element Deleter] setIcon(imageData) failed, using SVG paths:", err);
    }
  }

  try {
    await ext.action.setIcon({ ...details, path: paths });
  } catch (err) {
    if (details.tabId !== undefined) {
      console.warn("[Element Deleter] setIcon(tabId, path) failed:", err);
      try {
        await ext.action.setIcon({ path: paths });
      } catch (err2) {
        console.error("[Element Deleter] setIcon(path) failed:", err2);
      }
      return;
    }
    console.error("[Element Deleter] setIcon failed:", err);
  }
}

async function getIconSyncedTabIds(): Promise<number[]> {
  const data = await ext.storage.session.get(ICON_SYNCED_TAB_IDS_KEY);
  const raw = data[ICON_SYNCED_TAB_IDS_KEY];
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is number => typeof id === "number");
}

async function setIconSyncedTabIds(ids: number[]): Promise<void> {
  await ext.storage.session.set({ [ICON_SYNCED_TAB_IDS_KEY]: ids });
}

async function rememberIconSyncedTab(tabId: number): Promise<void> {
  const ids = await getIconSyncedTabIds();
  if (ids.includes(tabId)) return;
  await setIconSyncedTabIds([...ids, tabId]);
}

export async function forgetIconSyncedTab(tabId: number): Promise<void> {
  const ids = await getIconSyncedTabIds();
  if (!ids.includes(tabId)) return;
  await setIconSyncedTabIds(ids.filter((id) => id !== tabId));
}

export async function syncIconForTab(tabId: number): Promise<void> {
  await applyToolbarIcon({ tabId }, resolveToolbarIconMode(tabId));
  await rememberIconSyncedTab(tabId);
}

export async function setGlobalToolbarIcon(): Promise<void> {
  await applyToolbarIcon({}, "inactive");
}

async function syncAllTabIcons(): Promise<void> {
  const tabIds = await getIconSyncedTabIds();
  const alive: number[] = [];
  for (const tabId of tabIds) {
    try {
      await applyToolbarIcon({ tabId }, resolveToolbarIconMode(tabId));
      alive.push(tabId);
    } catch {
      /* tab closed */
    }
  }
  if (alive.length !== tabIds.length) {
    await setIconSyncedTabIds(alive);
  }
}

export async function bootstrapToolbarIcons(): Promise<void> {
  await setGlobalToolbarIcon();
  await syncAllTabIcons();
}
