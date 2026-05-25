import { ext } from "./api";
import {
  bootstrapToolbarIcons,
  forEachActiveTabId,
  getTabActiveState,
  onContentActiveChanged,
  registerExtensionIconStateListeners,
  setTabActiveState,
  syncIconForTab,
} from "./extension-icon-state";
import { isRtlLocale, t, type Locale } from "./i18n";
import type { BgToContent, ContentActivationResponse, ContentToBg } from "./messages";
import { registerBackgroundHotkeys } from "./hotkeys/background";
import {
  ensureLocaleInStorage,
  getElementLabelEnabled,
  getLocale,
  getNotificationSeconds,
  getUndoHotkeyEnabled,
} from "./storage";
import { openPanelFromSender } from "./panel-popup";
import {
  canOperateOnTab,
  refreshRestrictedNoticeCache,
  showRestrictedNotice,
} from "./page-operability";
import { showWelcome, stopWelcomePinWatcher, watchWelcomePinStatus } from "./welcome";

const TOGGLE_DEBOUNCE_MS = 80;
let lastToggleTabId: number | undefined;
let lastToggleAt = 0;

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

async function setTabActive(
  tabId: number,
  active: boolean,
  windowId?: number,
): Promise<void> {
  if (active && !(await canOperateOnTab(tabId))) {
    setTabActiveState(tabId, false);
    await syncIconForTab(tabId);
    await showRestrictedNotice(tabId, windowId);
    return;
  }

  const reached = active
    ? await sendWithInject(tabId, { type: "SET_ACTIVE", active: true })
    : await sendToTab(tabId, { type: "SET_ACTIVE", active: false });

  if (active && !reached) {
    setTabActiveState(tabId, false);
    await syncIconForTab(tabId);
    await sendToTab(tabId, { type: "SET_ACTIVE", active: false });
    await showRestrictedNotice(tabId, windowId);
    return;
  }

  if (active && reached) {
    await sendToTab(tabId, settingsUpdatedMessage(await loadAllSettings()));
  }
}

async function undoOnTab(tabId: number): Promise<void> {
  if (!(await getUndoHotkeyEnabled())) return;
  await sendWithInject(tabId, { type: "UNDO_LAST" });
}

async function toggleTab(tabId: number, windowId?: number): Promise<void> {
  const now = Date.now();
  if (
    tabId === lastToggleTabId &&
    now - lastToggleAt < TOGGLE_DEBOUNCE_MS
  ) {
    return;
  }
  lastToggleTabId = tabId;
  lastToggleAt = now;

  const next = !getTabActiveState(tabId);
  if (!next) {
    setTabActiveState(tabId, false);
    await syncIconForTab(tabId);
    await setTabActive(tabId, false, windowId);
    return;
  }

  if (!(await canOperateOnTab(tabId))) {
    setTabActiveState(tabId, false);
    await syncIconForTab(tabId);
    await showRestrictedNotice(tabId, windowId);
    return;
  }

  setTabActiveState(tabId, true);
  await syncIconForTab(tabId);
  await setTabActive(tabId, true, windowId);
}

const CONTEXT_MENU_SETTINGS = "dom-deleter-settings";
const CONTEXT_MENU_ABOUT = "dom-deleter-about";
const CONTEXT_MENU_DELETE = "dom-deleter-delete-element";

function getActiveCommandTab(): Promise<chrome.tabs.Tab | undefined> {
  return new Promise((resolve) => {
    ext.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.id !== undefined) {
        resolve(tab);
        return;
      }
      ext.tabs.query({ active: true, currentWindow: true }, (fallback) => {
        resolve(fallback[0]);
      });
    });
  });
}

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
  const activeTabIds: number[] = [];
  forEachActiveTabId((tabId) => {
    activeTabIds.push(tabId);
  });
  for (const tabId of activeTabIds) {
    await sendToTab(tabId, message);
  }
}

ext.action.onClicked.addListener(async (tab) => {
  if (tab.id === undefined) return;
  await toggleTab(tab.id, tab.windowId);
});

registerBackgroundHotkeys({
  getActiveCommandTab,
  undoOnTab,
  toggleTab,
});

ext.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_SETTINGS) {
    openPanelFromSender("settings", tab);
    return;
  }
  if (info.menuItemId === CONTEXT_MENU_ABOUT) {
    openPanelFromSender("info", tab);
    return;
  }
  if (info.menuItemId === CONTEXT_MENU_DELETE) {
    void (async () => {
      const tabId = tab?.id;
      if (tabId === undefined) return;
      const frameId = info.frameId ?? 0;
      if (!(await canOperateOnTab(tabId, frameId))) {
        await showRestrictedNotice(tabId, tab?.windowId);
        return;
      }
      const ok = await sendWithInject(tabId, { type: "DELETE_CONTEXT_ELEMENT" }, frameId);
      if (!ok) await showRestrictedNotice(tabId, tab?.windowId);
    })();
  }
});

ext.runtime.onMessage.addListener(
  (message: ContentToBg, sender): boolean | void => {
    if (message.type === "ACTIVE_CHANGED" && sender.tab?.id !== undefined) {
      onContentActiveChanged(sender.tab.id, message.active);
    }
    if (message.type === "OPEN_PANEL") {
      openPanelFromSender(message.tab, sender.tab);
    }
    if (message.type === "WATCH_PIN_STATUS" && sender.tab?.id !== undefined) {
      watchWelcomePinStatus(sender.tab.id);
    }
  },
);

ext.tabs.onRemoved.addListener((tabId) => {
  stopWelcomePinWatcher(tabId);
});

registerExtensionIconStateListeners();

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
  await bootstrapToolbarIcons();
  await ensureContextMenu();
};

void ext.runtime.onInstalled.addListener((details) => {
  void onBootstrap();
  if (details.reason === "install") {
    void showWelcome();
  }
});

void ext.runtime.onStartup.addListener(() => {
  void onBootstrap();
});

void onBootstrap();
