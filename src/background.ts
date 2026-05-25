import { ext } from "./api";
import { TOOLBAR_ICON_PATHS, type ToolbarIconMode } from "./icon-paths";
import { getToolbarIconSets, type ToolbarIconSets } from "./icons";
import { isRtlLocale, t, type Locale } from "./i18n";
import type { BgToContent, ContentActivationResponse, ContentToBg } from "./messages";
import {
  ensureLocaleInStorage,
  getElementLabelEnabled,
  getEscHotkeyEnabled,
  getLocale,
  getNotificationSeconds,
  getStartHotkeyEnabled,
  getUndoHotkeyEnabled,
} from "./storage";
import { isActionOnToolbar, onActionToolbarChanged } from "../../SHARED/src/pin";
import { buildWelcomeData } from "./welcome-data";

const tabActive = new Map<number, boolean>();
const welcomePinWatchers = new Map<number, () => void>();

const RESTRICTED_NOTICE_POPUP = "blocked-notice.html";
const WELCOME_POPUP = "welcome.html";
const PANEL_POPUP_PAGE = "panel-popup-page.html";
const RESTRICTED_NOTICE_MIN_MS = 4000;

let restrictedNoticeCache: { text: string; dismissMs: number } | null = null;

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
  return tabActive.get(tabId) ? "active" : "inactive";
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

async function syncTabToolbarIcon(tabId: number): Promise<void> {
  await applyToolbarIcon({ tabId }, resolveToolbarIconMode(tabId));
}

async function setGlobalToolbarIcon(): Promise<void> {
  await applyToolbarIcon({}, "inactive");
}

async function syncAllTabIcons(): Promise<void> {
  const tabs = await ext.tabs.query({});
  for (const tab of tabs) {
    if (tab.id === undefined) continue;
    await syncTabToolbarIcon(tab.id);
  }
}

async function restrictedNoticeDismissMs(): Promise<number> {
  const seconds = await getNotificationSeconds();
  if (seconds <= 0) return RESTRICTED_NOTICE_MIN_MS;
  return seconds * 1000;
}

async function refreshRestrictedNoticeCache(): Promise<void> {
  const [locale, dismissMs] = await Promise.all([getLocale(), restrictedNoticeDismissMs()]);
  restrictedNoticeCache = { text: t(locale).restrictedPageNotice, dismissMs };
}

async function showRestrictedNotice(tabId: number): Promise<void> {
  if (!restrictedNoticeCache) {
    await refreshRestrictedNoticeCache();
  }
  const { text, dismissMs } = restrictedNoticeCache!;

  void ext.storage.session.set({
    restrictedNotice: { text, dismissMs },
  });

  const noticeUrl = ext.runtime.getURL(RESTRICTED_NOTICE_POPUP);
  let windowId: number | undefined;

  try {
    const tab = await ext.tabs.get(tabId);
    windowId = tab.windowId;
  } catch {
    /* tab may be gone */
  }

  try {
    await ext.action.setPopup({ tabId, popup: RESTRICTED_NOTICE_POPUP });
    const openPopup = (
      ext.action as typeof ext.action & {
        openPopup?: (details: { windowId: number }) => Promise<void>;
      }
    ).openPopup;
    if (openPopup && windowId !== undefined) {
      await openPopup({ windowId });
      return;
    }
    throw new Error("action.openPopup unavailable");
  } catch (err) {
    console.warn("[Element Deleter] openPopup notice failed, using tab:", err);
    try {
      await ext.tabs.create({
        url: `${noticeUrl}?mode=tab`,
        active: true,
      });
    } catch (err2) {
      console.error("[Element Deleter] restricted notice tab failed:", err2);
    }
  } finally {
    await ext.action.setPopup({ tabId, popup: "" });
  }
}

/** True when the browser allows programmatic scripting on the visible tab document. */
async function canOperateOnTab(tabId: number, frameId?: number): Promise<boolean> {
  try {
    const target =
      frameId !== undefined && frameId !== 0
        ? { tabId, frameIds: [frameId] }
        : { tabId };
    const [result] = await ext.scripting.executeScript({
      target,
      func: () => {
        try {
          const root = document.documentElement ?? document.body;
          if (!root) return false;
          const probe = document.createElement("div");
          probe.style.display = "none";
          root.appendChild(probe);
          const ok = probe.isConnected;
          probe.remove();
          return ok;
        } catch {
          return false;
        }
      },
    });
    return result?.result === true;
  } catch {
    return false;
  }
}


async function injectContent(tabId: number, frameId?: number): Promise<boolean> {
  try {
    const target =
      frameId !== undefined && frameId !== 0
        ? { tabId, frameIds: [frameId] }
        : { tabId, allFrames: true };
    await ext.scripting.executeScript({
      target,
      files: ["content.js"],
    });
    return true;
  } catch (err) {
    console.warn("[Element Deleter] injectContent failed:", err);
    return false;
  }
}

function isActivationSuccess(
  message: BgToContent,
  response: unknown,
): boolean {
  if (message.type === "SET_ACTIVE" && message.active) {
    return (response as ContentActivationResponse | undefined)?.ok === true;
  }
  return true;
}

async function sendToTab(
  tabId: number,
  message: BgToContent,
  frameId?: number,
): Promise<boolean> {
  try {
    const response =
      frameId !== undefined && frameId !== 0
        ? await ext.tabs.sendMessage(tabId, message, { frameId })
        : await ext.tabs.sendMessage(tabId, message);
    return isActivationSuccess(message, response);
  } catch (err) {
    console.warn("[Element Deleter] sendToTab failed:", err);
    return false;
  }
}

type ContentSettings = {
  notificationSeconds: number;
  locale: Locale;
  elementLabelEnabled: boolean;
};

async function loadAllSettings(): Promise<ContentSettings> {
  const [notificationSeconds, locale, elementLabelEnabled] = await Promise.all([
    getNotificationSeconds(),
    getLocale(),
    getElementLabelEnabled(),
  ]);
  return {
    notificationSeconds,
    locale,
    elementLabelEnabled,
  };
}

function settingsUpdatedMessage(settings: ContentSettings): BgToContent {
  return { type: "SETTINGS_UPDATED", ...settings };
}

async function sendWithInject(
  tabId: number,
  message: BgToContent,
  frameId?: number,
): Promise<boolean> {
  if (await sendToTab(tabId, message, frameId)) return true;
  if (!(await injectContent(tabId, frameId))) return false;
  return sendToTab(tabId, message, frameId);
}

async function setTabActive(tabId: number, active: boolean): Promise<void> {
  if (active && !(await canOperateOnTab(tabId))) {
    tabActive.set(tabId, false);
    await syncTabToolbarIcon(tabId);
    await showRestrictedNotice(tabId);
    return;
  }

  const reached = active
    ? await sendWithInject(tabId, { type: "SET_ACTIVE", active: true })
    : await sendToTab(tabId, { type: "SET_ACTIVE", active: false });

  if (active && !reached) {
    tabActive.set(tabId, false);
    await syncTabToolbarIcon(tabId);
    await sendToTab(tabId, { type: "SET_ACTIVE", active: false });
    await showRestrictedNotice(tabId);
    return;
  }

  if (active && reached) {
    await sendToTab(tabId, settingsUpdatedMessage(await loadAllSettings()));
  }
}

async function deactivateTab(tabId: number): Promise<void> {
  if (!tabActive.get(tabId)) return;
  tabActive.set(tabId, false);
  await syncTabToolbarIcon(tabId);
  await setTabActive(tabId, false);
}

async function undoOnTab(tabId: number): Promise<void> {
  if (!(await getUndoHotkeyEnabled())) return;
  await sendWithInject(tabId, { type: "UNDO_LAST" });
}

async function toggleTab(tabId: number): Promise<void> {
  const next = !tabActive.get(tabId);
  if (!next) {
    tabActive.set(tabId, false);
    await syncTabToolbarIcon(tabId);
    await setTabActive(tabId, false);
    return;
  }

  if (!(await canOperateOnTab(tabId))) {
    tabActive.set(tabId, false);
    await syncTabToolbarIcon(tabId);
    await showRestrictedNotice(tabId);
    return;
  }

  tabActive.set(tabId, true);
  await syncTabToolbarIcon(tabId);
  await setTabActive(tabId, true);
}

const CONTEXT_MENU_SETTINGS = "dom-deleter-settings";
const CONTEXT_MENU_ABOUT = "dom-deleter-about";
const CONTEXT_MENU_DELETE = "dom-deleter-delete-element";
const COMMAND_DEACTIVATE = "deactivate";
const COMMAND_UNDO = "undo-delete";

/** Chrome `all` includes `action`; page delete must not appear on the toolbar icon menu. */
const PAGE_CONTEXT_MENU_CONTEXTS = [
  "page",
  "frame",
  "selection",
  "link",
  "editable",
  "image",
  "video",
  "audio",
] as const;

const ACTION_MENU_EMOJI = {
  settings: "⚙️",
  about: "ℹ️",
} as const;

type ContextMenuCreateProps = chrome.contextMenus.CreateProperties;

let ensureContextMenuChain: Promise<void> = Promise.resolve();

function logContextMenuError(action: string, detail?: unknown): void {
  const err = ext.runtime.lastError;
  if (!err) return;
  console.error(`[Element Deleter] contextMenus.${action} failed:`, err.message, detail);
}

async function createContextMenuItem(
  props: ContextMenuCreateProps,
): Promise<void> {
  await new Promise<void>((resolve) => {
    ext.contextMenus.create(props, () => {
      logContextMenuError("create", props);
      resolve();
    });
  });
}

function actionMenuTitle(title: string, emoji: string, locale: Locale): string {
  // RTL labels + leading LTR emoji reorder inconsistently in native menus (bidi).
  return isRtlLocale(locale) ? `${title} ${emoji}` : `${emoji} ${title}`;
}

async function ensureContextMenu(): Promise<void> {
  ensureContextMenuChain = ensureContextMenuChain.then(async () => {
    const locale = await getLocale();
    const strings = t(locale);

    await new Promise<void>((resolve) => {
      ext.contextMenus.removeAll(() => {
        logContextMenuError("removeAll");
        resolve();
      });
    });

    await createContextMenuItem({
      id: CONTEXT_MENU_SETTINGS,
      title: actionMenuTitle(strings.titleSettings, ACTION_MENU_EMOJI.settings, locale),
      contexts: ["action", "browser_action"],
    });
    await createContextMenuItem({
      id: CONTEXT_MENU_ABOUT,
      title: actionMenuTitle(strings.titleAbout, ACTION_MENU_EMOJI.about, locale),
      contexts: ["action", "browser_action"],
    });
    await createContextMenuItem({
      id: CONTEXT_MENU_DELETE,
      title: strings.contextMenuDeleteElement,
      contexts: [...PAGE_CONTEXT_MENU_CONTEXTS],
    });
  });

  await ensureContextMenuChain;
}

async function pushSettingsToActiveTabs(): Promise<void> {
  const settings = await loadAllSettings();
  const message = settingsUpdatedMessage(settings);
  for (const tabId of tabActive.keys()) {
    if (!tabActive.get(tabId)) continue;
    await sendToTab(tabId, message);
  }
}

function stopWelcomePinWatcher(tabId: number): void {
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

function watchWelcomePinStatus(tabId: number): void {
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

async function showWelcome(): Promise<void> {
  const locale = await getLocale();
  const manifest = ext.runtime.getManifest();
  const isPinned = await isActionOnToolbar(ext.action);

  await ext.storage.session.set({
    welcomeData: buildWelcomeData(locale, manifest.name, { isPinned }),
  });

  try {
    await ext.tabs.create({
      url: ext.runtime.getURL(WELCOME_POPUP),
      active: true,
    });
  } catch (err) {
    console.error("[Element Deleter] welcome tab failed:", err);
  }
}

type PanelPopupTarget = {
  /** Per-tab popup only when the icon is pinned; omit for the extensions menu. */
  tabId?: number;
  windowId: number;
};

function panelPopupPath(panelTab: "settings" | "info", mode?: "tab"): string {
  const params = new URLSearchParams({ tab: panelTab });
  if (mode === "tab") params.set("mode", "tab");
  return `${PANEL_POPUP_PAGE}?${params.toString()}`;
}

async function openPanelPopupTab(panelTab: "settings" | "info"): Promise<void> {
  try {
    await ext.tabs.create({
      url: ext.runtime.getURL(panelPopupPath(panelTab, "tab")),
      active: true,
    });
  } catch (err) {
    console.error("[Element Deleter] panel popup tab failed:", err);
  }
}

/** Keep async chain short — user gesture from context menu expires after long await. */
function openPanelInActionPopup(
  panelTab: "settings" | "info",
  target: PanelPopupTarget,
): void {
  const { tabId, windowId } = target;
  const popup = panelPopupPath(panelTab);
  const setPopupDetails =
    tabId !== undefined ? { tabId, popup } : { popup };
  const clearPopupDetails = tabId !== undefined ? { tabId, popup: "" } : { popup: "" };

  void (async () => {
    await ext.action.setPopup(setPopupDetails);
    try {
      const openPopup = (
        ext.action as typeof ext.action & {
          openPopup?: (details: { windowId: number }) => Promise<void>;
        }
      ).openPopup;
      if (!openPopup) throw new Error("action.openPopup unavailable");
      await openPopup({ windowId });
    } catch (err) {
      console.warn("[Element Deleter] openPopup panel failed, using tab:", err);
      await openPanelPopupTab(panelTab);
    } finally {
      await ext.action.setPopup(clearPopupDetails);
    }
  })();
}

function handleOpenPanel(
  panelTab: "settings" | "info",
  senderTab: chrome.tabs.Tab | undefined,
): void {
  openPanelInActionPopup(panelTab, {
    tabId: senderTab?.id,
    windowId: senderTab?.windowId,
  });
}

ext.action.onClicked.addListener(async (tab) => {
  if (tab.id === undefined) return;
  await toggleTab(tab.id);
});

ext.commands.onCommand.addListener(async (command) => {
  const [tab] = await ext.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) return;
  const tabId = tab.id;

  if (command === COMMAND_DEACTIVATE) {
    if (!(await getStartHotkeyEnabled())) return;
    await deactivateTab(tabId);
    return;
  }
  if (command === COMMAND_UNDO) {
    await undoOnTab(tabId);
  }
});

ext.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_SETTINGS) {
    handleOpenPanel("settings", tab);
    return;
  }
  if (info.menuItemId === CONTEXT_MENU_ABOUT) {
    handleOpenPanel("info", tab);
    return;
  }
  if (info.menuItemId === CONTEXT_MENU_DELETE) {
    void (async () => {
      const tabId = tab?.id;
      if (tabId === undefined) return;
      const frameId = info.frameId ?? 0;
      if (!(await canOperateOnTab(tabId, frameId))) {
        await showRestrictedNotice(tabId);
        return;
      }
      const ok = await sendWithInject(tabId, { type: "DELETE_CONTEXT_ELEMENT" }, frameId);
      if (!ok) await showRestrictedNotice(tabId);
    })();
  }
});

ext.runtime.onMessage.addListener(
  (message: ContentToBg, sender): boolean | void => {
    if (message.type === "TOGGLE_REQUEST" && sender.tab?.id !== undefined) {
      const tabId = sender.tab.id;
      void (async () => {
        if (!(await getStartHotkeyEnabled())) return;
        await toggleTab(tabId);
      })();
      return;
    }
    if (message.type === "ACTIVE_CHANGED" && sender.tab?.id !== undefined) {
      const active = message.active;
      tabActive.set(sender.tab.id, active);
      void syncTabToolbarIcon(sender.tab.id);
    }
    if (message.type === "OPEN_PANEL") {
      handleOpenPanel(message.tab, sender.tab);
    }
    if (message.type === "WATCH_PIN_STATUS" && sender.tab?.id !== undefined) {
      watchWelcomePinStatus(sender.tab.id);
    }
  },
);

ext.tabs.onRemoved.addListener((tabId) => {
  stopWelcomePinWatcher(tabId);
  tabActive.delete(tabId);
});

ext.tabs.onActivated.addListener(({ tabId }) => {
  void syncTabToolbarIcon(tabId);
});

ext.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading" || changeInfo.url !== undefined) {
    tabActive.set(tabId, false);
  }

  if (changeInfo.url === undefined && changeInfo.status !== "complete") {
    return;
  }

  void syncTabToolbarIcon(tabId);
});

ext.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  const secondsChange = changes.notificationSeconds;
  const localeChange = changes.locale;
  const elementLabelChange = changes.elementLabelEnabled;
  if (!secondsChange && !localeChange && !elementLabelChange) {
    return;
  }

  if (secondsChange || localeChange) {
    void refreshRestrictedNoticeCache();
  }

  if (localeChange) {
    void ensureContextMenu();
  }

  void pushSettingsToActiveTabs();
});

const onBootstrap = async (): Promise<void> => {
  await ensureLocaleInStorage();
  await refreshRestrictedNoticeCache();
  await setGlobalToolbarIcon();
  await syncAllTabIcons();
};

void ext.runtime.onInstalled.addListener((details) => {
  void ensureContextMenu();
  void onBootstrap();
  if (details.reason === "install") {
    void showWelcome();
  }
});

void ext.runtime.onStartup.addListener(() => {
  void ensureContextMenu();
  void onBootstrap();
});

void ensureContextMenu();
