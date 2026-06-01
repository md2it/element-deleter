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
import { createBadgeTextColorAnimation } from "../../lib/src/badge/text-color-animation";
import {
  ensureLocaleInStorage,
  getAllElementsFillEnabled,
  getAllElementsOutlineEnabled,
  getLocale,
  getNotificationSeconds,
  getSelectionCaptionStyle,
} from "./storage";
import { openPanelFromSender } from "./panel-popup";
import {
  canOperateOnTab,
  getRestrictedNoticeDismissMs,
  isBlockedNoticeDismissedMessage,
  refreshRestrictedNoticeCache,
  showRestrictedNotice,
} from "./page-operability";
import type { SelectionCaptionStyle } from "./settings/selection-caption-style";
import { showWelcome, stopWelcomePinWatcher, watchWelcomePinStatus } from "./welcome";

const TOGGLE_DEBOUNCE_MS = 80;
let lastToggleTabId: number | undefined;
let lastToggleAt = 0;

const BADGE_TEXT_COLOR = "#ffffff";
const BADGE_RUNNING_TEXT = "◉";
const BADGE_RUNNING_BG_COLOR = "#dc2626";
const BADGE_RUNNING_TEXT_COLOR_WHITE: readonly [number, number, number] = [255, 255, 255];
const BADGE_RUNNING_TEXT_COLOR_YELLOW: readonly [number, number, number] = [250, 204, 21];
const BADGE_RUNNING_TEXT_COLOR_RED: readonly [number, number, number] = [185, 28, 28];
const BADGE_BLOCKED_TEXT = "✕";
const BADGE_DELETED_TEXT = "✓";
const BADGE_RESTORED_TEXT = "✓";
const BADGE_PREFIX_TEXT_COLOR = "#012292";
const BADGE_PREFIX_BG_COLOR = "#ffffff";
const BADGE_BLOCKED_BG_COLOR = "#e5e7eb";
const BADGE_BLOCKED_TEXT_COLOR = "#374151";
const BADGE_RESTORED_BG_COLOR = "#1d4ed8";
const BADGE_FLASH_MS = 1000;
const BADGE_RUNNING_ANIMATION_STEPS = 40;
const BADGE_RUNNING_ANIMATION_STEP_MS = 25;

const runningBadgeTextAnimation = createBadgeTextColorAnimation({
  startColor: BADGE_RUNNING_TEXT_COLOR_WHITE,
  midColor: BADGE_RUNNING_TEXT_COLOR_YELLOW,
  endColor: BADGE_RUNNING_TEXT_COLOR_RED,
  steps: BADGE_RUNNING_ANIMATION_STEPS,
  stepIntervalMs: BADGE_RUNNING_ANIMATION_STEP_MS,
  mode: "ping-pong",
});

/**
 * Badge state priority (catalog):
 * 1) prefix letter (handled by lib prefix badge; we only suppress/restore)
 * 2) cannot operate on page => X
 * 3) running => ON
 * 4) off => no badge
 */
const tabBlockedBadge = new Map<number, boolean>();
const tabPrefixBadgeShown = new Map<number, boolean>();
const tabFlashBadge = new Map<number, "deleted" | "restored">();
const blockedBadgeClearTimers = new Map<number, ReturnType<typeof setTimeout>>();
const flashBadgeClearTimers = new Map<number, ReturnType<typeof setTimeout>>();
const runningBadgeAnimationIntervals = new Map<number, ReturnType<typeof setInterval>>();
const runningBadgeAnimationFrame = new Map<number, number>();

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

function clearFlashBadgeTimer(tabId: number): void {
  const timer = flashBadgeClearTimers.get(tabId);
  if (timer === undefined) return;
  clearTimeout(timer);
  flashBadgeClearTimers.delete(tabId);
}

function clearFlashBadgeState(tabId: number): void {
  clearFlashBadgeTimer(tabId);
  tabFlashBadge.delete(tabId);
}

function clearRunningBadgeAnimation(tabId: number): void {
  const interval = runningBadgeAnimationIntervals.get(tabId);
  if (interval !== undefined) {
    clearInterval(interval);
    runningBadgeAnimationIntervals.delete(tabId);
  }
  runningBadgeAnimationFrame.delete(tabId);
}

function ensureRunningBadgeAnimation(tabId: number): void {
  if (runningBadgeAnimationIntervals.has(tabId)) return;
  runningBadgeAnimationFrame.set(tabId, 0);
  runningBadgeAnimationIntervals.set(
    tabId,
    setInterval(() => {
      if (!getTabActiveState(tabId)) {
        clearRunningBadgeAnimation(tabId);
        return;
      }
      const currentFrame = runningBadgeAnimationFrame.get(tabId) ?? 0;
      runningBadgeAnimationFrame.set(
        tabId,
        runningBadgeTextAnimation.nextFrame(currentFrame),
      );
      void syncToolbarBadge(tabId);
    }, runningBadgeTextAnimation.stepIntervalMs),
  );
}

function scheduleClearFlashBadge(tabId: number): void {
  clearFlashBadgeTimer(tabId);
  flashBadgeClearTimers.set(
    tabId,
    setTimeout(() => {
      flashBadgeClearTimers.delete(tabId);
      if (!tabFlashBadge.has(tabId)) return;
      clearFlashBadgeState(tabId);
      void syncToolbarBadge(tabId);
    }, BADGE_FLASH_MS),
  );
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

type BadgeVisuals = {
  text: string;
  backgroundColor?: string;
  textColor?: string;
};

async function setToolbarBadge(
  tabId: number,
  visuals: BadgeVisuals,
): Promise<void> {
  try {
    if (visuals.text) {
      await ext.action.setBadgeBackgroundColor({
        tabId,
        color: visuals.backgroundColor ?? DELETER_ACTIVE_COLOR,
      });
      const setBadgeTextColor = (
        ext.action as typeof ext.action & {
          setBadgeTextColor?: (details: { tabId: number; color: string }) => Promise<void>;
        }
      ).setBadgeTextColor;
      await setBadgeTextColor?.({ tabId, color: visuals.textColor ?? BADGE_TEXT_COLOR });
    }
    await ext.action.setBadgeText({ tabId, text: visuals.text });
  } catch (err) {
    console.warn("[Element Deleter] setBadgeText failed:", err);
  }
}

async function syncToolbarBadge(tabId: number): Promise<void> {
  // Prefix letter overrides everything while armed.
  if (tabPrefixBadgeShown.get(tabId)) {
    clearRunningBadgeAnimation(tabId);
    return;
  }

  const flash = tabFlashBadge.get(tabId);
  if (flash === "deleted") {
    clearRunningBadgeAnimation(tabId);
    await setToolbarBadge(tabId, { text: BADGE_DELETED_TEXT });
    return;
  }
  if (flash === "restored") {
    clearRunningBadgeAnimation(tabId);
    await setToolbarBadge(tabId, {
      text: BADGE_RESTORED_TEXT,
      backgroundColor: BADGE_RESTORED_BG_COLOR,
    });
    return;
  }

  if (tabBlockedBadge.get(tabId)) {
    clearRunningBadgeAnimation(tabId);
    await setToolbarBadge(tabId, {
      text: BADGE_BLOCKED_TEXT,
      backgroundColor: BADGE_BLOCKED_BG_COLOR,
      textColor: BADGE_BLOCKED_TEXT_COLOR,
    });
    return;
  }

  if (getTabActiveState(tabId)) {
    ensureRunningBadgeAnimation(tabId);
    const frame = runningBadgeAnimationFrame.get(tabId) ?? 0;
    await setToolbarBadge(tabId, {
      text: BADGE_RUNNING_TEXT,
      backgroundColor: BADGE_RUNNING_BG_COLOR,
      textColor: runningBadgeTextAnimation.getColor(frame),
    });
    return;
  }

  clearRunningBadgeAnimation(tabId);
  await setToolbarBadge(tabId, { text: "" });
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
  selectionCaptionStyle: SelectionCaptionStyle;
  allElementsOutlineEnabled: boolean;
  allElementsFillEnabled: boolean;
};

async function loadAllSettings(): Promise<ContentSettings> {
  const [
    notificationSeconds,
    locale,
    selectionCaptionStyle,
    allElementsOutlineEnabled,
    allElementsFillEnabled,
  ] = await Promise.all([
    getNotificationSeconds(),
    getLocale(),
    getSelectionCaptionStyle(),
    getAllElementsOutlineEnabled(),
    getAllElementsFillEnabled(),
  ]);
  return {
    notificationSeconds,
    locale,
    selectionCaptionStyle,
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
    clearFlashBadgeState(tabId);
    clearRunningBadgeAnimation(tabId);
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
    clearFlashBadgeState(tabId);
    clearRunningBadgeAnimation(tabId);
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
const CONTEXT_MENU_SHORTCUTS = "element-deleter-shortcuts";
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
  shortcuts: "⌨️",
  about: "ℹ️",
} as const;

type ContextMenuCreateProps = chrome.contextMenus.CreateProperties;

let ensureContextMenuChain: Promise<void> = Promise.resolve();

async function createContextMenuItem(
  props: ContextMenuCreateProps,
): Promise<void> {
  try {
    await ext.contextMenus.create(props);
  } catch (err) {
    console.error("[Element Deleter] contextMenus.create failed:", err, props);
  }
}

function actionMenuTitle(title: string, emoji: string, locale: Locale): string {
  // RTL labels + leading LTR emoji reorder inconsistently in native menus (bidi).
  return isRtlLocale(locale) ? `${title} ${emoji}` : `${emoji} ${title}`;
}

async function ensureContextMenu(): Promise<void> {
  ensureContextMenuChain = ensureContextMenuChain.then(async () => {
    const locale = await getLocale();
    const strings = t(locale);

    try {
      await ext.contextMenus.removeAll();
    } catch (err) {
      console.error("[Element Deleter] contextMenus.removeAll failed:", err);
    }

    await createContextMenuItem({
      id: CONTEXT_MENU_SETTINGS,
      title: actionMenuTitle(strings.titleSettings, ACTION_MENU_EMOJI.settings, locale),
      contexts: ["action"],
    });
    await createContextMenuItem({
      id: CONTEXT_MENU_SHORTCUTS,
      title: actionMenuTitle(
        strings.titleShortcuts,
        ACTION_MENU_EMOJI.shortcuts,
        locale,
      ),
      contexts: ["action"],
    });
    await createContextMenuItem({
      id: CONTEXT_MENU_ABOUT,
      title: actionMenuTitle(strings.titleAbout, ACTION_MENU_EMOJI.about, locale),
      contexts: ["action"],
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
  if (info.menuItemId === CONTEXT_MENU_SHORTCUTS) {
    openPanelFromSender("shortcuts", tab);
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
        clearFlashBadgeState(tabId);
        clearRunningBadgeAnimation(tabId);
      }
      void syncToolbarBadge(tabId);
    }
    if (contentMessage.type === "BADGE_FLASH" && sender.tab?.id !== undefined) {
      const tabId = sender.tab.id;
      tabFlashBadge.set(tabId, contentMessage.variant);
      scheduleClearFlashBadge(tabId);
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
  clearFlashBadgeTimer(tabId);
  clearRunningBadgeAnimation(tabId);
  tabBlockedBadge.delete(tabId);
  tabFlashBadge.delete(tabId);
  tabPrefixBadgeShown.delete(tabId);
});

registerPrefixHintBadgeListeners({
  badgeBackgroundColor: BADGE_PREFIX_BG_COLOR,
  badgeTextColor: BADGE_PREFIX_TEXT_COLOR,
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
  const selectionCaptionChange = changes.selectionCaptionStyle;
  const outlineChange = changes.allElementsOutlineEnabled;
  const fillChange = changes.allElementsFillEnabled;
  if (
    !secondsChange &&
    !localeChange &&
    !selectionCaptionChange &&
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
  await ensureContextMenu();
  await refreshRestrictedNoticeCache();
  await bootstrapToolbarIcons();
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
