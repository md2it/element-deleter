import { ext } from "./api";
import {
  registerPrefixHintBadgeListeners,
  registerPrefixHintOperabilityListeners,
} from "../../lib/src/hotkeys";
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
import {
  registerBackgroundHotkeys,
  shouldSuppressToolbarClickAfterHotkeyCommand,
} from "./hotkeys/background";
import { DELETER_ACTIVE_COLOR } from "./hotkeys/commands";
import {
  ensureLocaleInStorage,
  getAllElementsFillEnabled,
  getAllElementsOutlineEnabled,
  getElementLabelEnabled,
  getLocale,
  getNotificationSeconds,
} from "./storage";
import { openPanelFromSender } from "./panel-popup";
import {
  canOperateOnTab,
  getRestrictedNoticeDismissMs,
  isBlockedNoticeDismissedMessage,
  refreshRestrictedNoticeCache,
  showRestrictedNotice,
} from "./page-operability";
import { showWelcome, stopWelcomePinWatcher, watchWelcomePinStatus } from "./welcome";

const TOGGLE_DEBOUNCE_MS = 80;
let lastToggleTabId: number | undefined;
let lastToggleAt = 0;

const BADGE_TEXT_COLOR = "#ffffff";
const BADGE_RUNNING_TEXT = "✓";
const BADGE_BLOCKED_TEXT = "✕";

/**
 * Badge state priority (catalog):
 * 1) prefix letter (handled by lib prefix badge; we only suppress/restore)
 * 2) cannot operate on page => X
 * 3) running => ON
 * 4) off => no badge
 */
const tabBlockedBadge = new Map<number, boolean>();
const tabPrefixBadgeShown = new Map<number, boolean>();
const blockedBadgeClearTimers = new Map<number, ReturnType<typeof setTimeout>>();

function clearBlockedBadgeTimer(tabId: number): void {
  const timer = blockedBadgeClearTimers.get(tabId);
  if (timer === undefined) return;
  clearTimeout(timer);
  blockedBadgeClearTimers.delete(tabId);
}

function clearBlockedBadgeState(tabId: number): void {
  clearBlockedBadgeTimer(tabId);
  tabBlockedBadge.set(tabId, false);
}

function onBlockedNoticeDismissed(tabId: number): void {
  if (!tabBlockedBadge.get(tabId)) return;
  clearBlockedBadgeState(tabId);
  void syncToolbarBadge(tabId);
}

function scheduleClearBlockedBadge(tabId: number, dismissMs: number): void {
  clearBlockedBadgeTimer(tabId);
  blockedBadgeClearTimers.set(
    tabId,
    setTimeout(() => {
      blockedBadgeClearTimers.delete(tabId);
      if (!tabBlockedBadge.get(tabId)) return;
      clearBlockedBadgeState(tabId);
      void syncToolbarBadge(tabId);
    }, dismissMs),
  );
}

async function showBlockedPageFeedback(
  tabId: number,
  windowId?: number,
): Promise<void> {
  tabBlockedBadge.set(tabId, true);
  await syncToolbarBadge(tabId);
  const dismissMs = await getRestrictedNoticeDismissMs();
  await showRestrictedNotice(tabId, windowId);
  scheduleClearBlockedBadge(tabId, dismissMs);
}

async function setToolbarBadge(
  tabId: number,
  text: string,
): Promise<void> {
  try {
    if (text) {
      await ext.action.setBadgeBackgroundColor({ tabId, color: DELETER_ACTIVE_COLOR });
      const setBadgeTextColor = (
        ext.action as typeof ext.action & {
          setBadgeTextColor?: (details: { tabId: number; color: string }) => Promise<void>;
        }
      ).setBadgeTextColor;
      await setBadgeTextColor?.({ tabId, color: BADGE_TEXT_COLOR });
    }
    await ext.action.setBadgeText({ tabId, text });
  } catch (err) {
    console.warn("[Element Deleter] setBadgeText failed:", err);
  }
}

async function syncToolbarBadge(tabId: number): Promise<void> {
  // Prefix letter overrides everything while armed.
  if (tabPrefixBadgeShown.get(tabId)) return;

  if (tabBlockedBadge.get(tabId)) {
    await setToolbarBadge(tabId, BADGE_BLOCKED_TEXT);
    return;
  }

  if (getTabActiveState(tabId)) {
    await setToolbarBadge(tabId, BADGE_RUNNING_TEXT);
    return;
  }

  await setToolbarBadge(tabId, "");
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
  allElementsOutlineEnabled: boolean;
  allElementsFillEnabled: boolean;
};

async function loadAllSettings(): Promise<ContentSettings> {
  const [
    notificationSeconds,
    locale,
    elementLabelEnabled,
    allElementsOutlineEnabled,
    allElementsFillEnabled,
  ] = await Promise.all([
    getNotificationSeconds(),
    getLocale(),
    getElementLabelEnabled(),
    getAllElementsOutlineEnabled(),
    getAllElementsFillEnabled(),
  ]);
  return {
    notificationSeconds,
    locale,
    elementLabelEnabled,
    allElementsOutlineEnabled,
    allElementsFillEnabled,
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
    await showBlockedPageFeedback(tabId, windowId);
    return;
  }

  const reached = active
    ? await sendWithInject(tabId, { type: "SET_ACTIVE", active: true })
    : await sendToTab(tabId, { type: "SET_ACTIVE", active: false });

  if (active && !reached) {
    setTabActiveState(tabId, false);
    await syncIconForTab(tabId);
    await sendToTab(tabId, { type: "SET_ACTIVE", active: false });
    await showBlockedPageFeedback(tabId, windowId);
    return;
  }

  if (active && reached) {
    clearBlockedBadgeState(tabId);
    await sendToTab(tabId, settingsUpdatedMessage(await loadAllSettings()));
  }

  if (!active) {
    clearBlockedBadgeState(tabId);
  }

  await syncToolbarBadge(tabId);
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
    clearBlockedBadgeState(tabId);
    await syncIconForTab(tabId);
    await syncToolbarBadge(tabId);
    await setTabActive(tabId, false, windowId);
    return;
  }

  if (!(await canOperateOnTab(tabId))) {
    setTabActiveState(tabId, false);
    await syncIconForTab(tabId);
    await showBlockedPageFeedback(tabId, windowId);
    return;
  }

  setTabActiveState(tabId, true);
  clearBlockedBadgeState(tabId);
  await syncIconForTab(tabId);
  await syncToolbarBadge(tabId);
  await setTabActive(tabId, true, windowId);
}

const CONTEXT_MENU_SETTINGS = "element-deleter-settings";
const CONTEXT_MENU_ABOUT = "element-deleter-about";
const CONTEXT_MENU_DELETE = "element-deleter-delete-element";

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
  if (shouldSuppressToolbarClickAfterHotkeyCommand()) return;
  await toggleTab(tab.id, tab.windowId);
});

registerBackgroundHotkeys({
  getActiveCommandTab,
  toggleTab,
});

registerPrefixHintOperabilityListeners({
  canOperateOnTab,
  onBlockedOnTab: showBlockedPageFeedback,
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
        await showBlockedPageFeedback(tabId, tab?.windowId);
        return;
      }
      const ok = await sendWithInject(tabId, { type: "DELETE_CONTEXT_ELEMENT" }, frameId);
      if (!ok) {
        await showBlockedPageFeedback(tabId, tab?.windowId);
      }
    })();
  }
});

ext.runtime.onMessage.addListener(
  (message: ContentToBg | unknown, sender): boolean | void => {
    if (isBlockedNoticeDismissedMessage(message)) {
      onBlockedNoticeDismissed(message.tabId);
      return;
    }
    const contentMessage = message as ContentToBg;
    if (contentMessage.type === "ACTIVE_CHANGED" && sender.tab?.id !== undefined) {
      const tabId = sender.tab.id;
      onContentActiveChanged(tabId, contentMessage.active);
      if (!contentMessage.active) {
        clearBlockedBadgeState(tabId);
      }
      void syncToolbarBadge(tabId);
    }
    if (contentMessage.type === "OPEN_PANEL") {
      openPanelFromSender(contentMessage.tab, sender.tab);
    }
    if (contentMessage.type === "WATCH_PIN_STATUS" && sender.tab?.id !== undefined) {
      watchWelcomePinStatus(sender.tab.id);
    }
  },
);

ext.tabs.onRemoved.addListener((tabId) => {
  stopWelcomePinWatcher(tabId);
  clearBlockedBadgeTimer(tabId);
  tabBlockedBadge.delete(tabId);
  tabPrefixBadgeShown.delete(tabId);
});

registerPrefixHintBadgeListeners({
  badgeBackgroundColor: DELETER_ACTIVE_COLOR,
  canShowPrefixBadgeOnTab: canOperateOnTab,
  onShow: (tabId) => {
    if (tabId === undefined) return;
    tabPrefixBadgeShown.set(tabId, true);
  },
  onHide: (tabId) => {
    if (tabId === undefined) return;
    tabPrefixBadgeShown.set(tabId, false);
    void syncToolbarBadge(tabId);
  },
});

registerExtensionIconStateListeners();

ext.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  const secondsChange = changes.notificationSeconds;
  const localeChange = changes.locale;
  const elementLabelChange = changes.elementLabelEnabled;
  const outlineChange = changes.allElementsOutlineEnabled;
  const fillChange = changes.allElementsFillEnabled;
  if (
    !secondsChange &&
    !localeChange &&
    !elementLabelChange &&
    !outlineChange &&
    !fillChange
  ) {
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
