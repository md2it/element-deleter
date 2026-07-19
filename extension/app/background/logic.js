"use strict";
import { createBadgeTextColorAnimation } from "../../lib/our/badge/text-color-animation.js";
import {
  getTabActiveState,
  setTabActiveState,
} from "../../lib/our/extension-icon-state/tab-active-state.js";
import {
  getRestrictedNoticeDismissMs,
  showRestrictedNotice,
  refreshRestrictedNoticeCache,
} from "../page-operability/notice.js";
import { canOperateOnTab } from "../../lib/our/page-operability/can-operate.js";
import {
  syncIconForTab,
  onContentActiveChanged2,
  registerExtensionIconStateListeners2,
  bootstrapToolbarIcons,
} from "../extension-icon-state/index.js";
import { isBlockedNoticeDismissedMessage } from "../../lib/our/page-operability/messages.js";
import { watchWelcomePinStatus2, showWelcome } from "../welcome/background.js";
import {
  handleSupportSurveyScenarioComplete,
  recordSupportSurveyAction,
} from "../support-survey/background.js";
import { registerPrefixHintBadgeListeners } from "../../lib/our/hotkeys/prefix-hint-badge.js";
import { openPanelFromSender } from "../panel-popup/open.js";

var TOGGLE_DEBOUNCE_MS = 80;
var lastToggleTabId;
var lastToggleAt = 0;
var BADGE_TEXT_COLOR = "#ffffff";
var BADGE_RUNNING_TEXT = "◉";
var BADGE_RUNNING_BG_COLOR = "#dc2626";
var BADGE_RUNNING_TEXT_COLOR_WHITE = [255, 255, 255];
var BADGE_RUNNING_TEXT_COLOR_YELLOW = [250, 204, 21];
var BADGE_RUNNING_TEXT_COLOR_RED = [185, 28, 28];
var BADGE_BLOCKED_TEXT = "✕";
var BADGE_DELETED_TEXT = "✓";
var BADGE_RESTORED_TEXT = "✓";
var BADGE_PREFIX_TEXT_COLOR = "#012292";
var BADGE_PREFIX_BG_COLOR = "#ffffff";
var BADGE_BLOCKED_BG_COLOR = "#e5e7eb";
var BADGE_BLOCKED_TEXT_COLOR = "#374151";
var BADGE_RESTORED_BG_COLOR = "#1d4ed8";
var BADGE_FLASH_MS = 1e3;
var BADGE_RUNNING_ANIMATION_STEPS = 40;
var BADGE_RUNNING_ANIMATION_STEP_MS = 25;
var runningBadgeTextAnimation = createBadgeTextColorAnimation({
  startColor: BADGE_RUNNING_TEXT_COLOR_WHITE,
  midColor: BADGE_RUNNING_TEXT_COLOR_YELLOW,
  endColor: BADGE_RUNNING_TEXT_COLOR_RED,
  steps: BADGE_RUNNING_ANIMATION_STEPS,
  stepIntervalMs: BADGE_RUNNING_ANIMATION_STEP_MS,
  mode: "ping-pong",
});
var tabBlockedBadge = /* @__PURE__ */ new Map();
var tabPrefixBadgeShown = /* @__PURE__ */ new Map();
var tabFlashBadge = /* @__PURE__ */ new Map();
var blockedBadgeClearTimers = /* @__PURE__ */ new Map();
var flashBadgeClearTimers = /* @__PURE__ */ new Map();
var runningBadgeAnimationIntervals = /* @__PURE__ */ new Map();
var runningBadgeAnimationFrame = /* @__PURE__ */ new Map();
function clearBlockedBadgeTimer(tabId) {
  const timer = blockedBadgeClearTimers.get(tabId);
  if (timer === void 0) return;
  clearTimeout(timer);
  blockedBadgeClearTimers.delete(tabId);
}
function clearBlockedBadgeState(tabId) {
  clearBlockedBadgeTimer(tabId);
  tabBlockedBadge.set(tabId, false);
}
function clearFlashBadgeTimer(tabId) {
  const timer = flashBadgeClearTimers.get(tabId);
  if (timer === void 0) return;
  clearTimeout(timer);
  flashBadgeClearTimers.delete(tabId);
}
function clearFlashBadgeState(tabId) {
  clearFlashBadgeTimer(tabId);
  tabFlashBadge.delete(tabId);
}
function clearRunningBadgeAnimation(tabId) {
  const interval = runningBadgeAnimationIntervals.get(tabId);
  if (interval !== void 0) {
    clearInterval(interval);
    runningBadgeAnimationIntervals.delete(tabId);
  }
  runningBadgeAnimationFrame.delete(tabId);
}
function ensureRunningBadgeAnimation(tabId) {
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
function scheduleClearFlashBadge(tabId) {
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
function onBlockedNoticeDismissed(tabId) {
  if (!tabBlockedBadge.get(tabId)) return;
  clearBlockedBadgeState(tabId);
  void syncToolbarBadge(tabId);
}
function scheduleClearBlockedBadge(tabId, dismissMs) {
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
async function showBlockedPageFeedback(tabId, windowId) {
  tabBlockedBadge.set(tabId, true);
  await syncToolbarBadge(tabId);
  const dismissMs = await getRestrictedNoticeDismissMs();
  await showRestrictedNotice(tabId, windowId);
  scheduleClearBlockedBadge(tabId, dismissMs);
}
async function setToolbarBadge(tabId, visuals) {
  try {
    if (visuals.text) {
      await ext.action.setBadgeBackgroundColor({
        tabId,
        color: visuals.backgroundColor ?? DELETER_ACTIVE_COLOR,
      });
      const setBadgeTextColor = ext.action.setBadgeTextColor;
      await setBadgeTextColor?.({
        tabId,
        color: visuals.textColor ?? BADGE_TEXT_COLOR,
      });
    }
    await ext.action.setBadgeText({ tabId, text: visuals.text });
  } catch (err) {
    console.warn("[Element Deleter] setBadgeText failed:", err);
  }
}
async function syncToolbarBadge(tabId) {
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
async function injectContent(tabId, frameId) {
  try {
    const target =
      frameId !== void 0 && frameId !== 0
        ? { tabId, frameIds: [frameId] }
        : { tabId, allFrames: true };
    const results = await ext.scripting.executeScript({
      target,
      files: [
        "lib/our/all-elements-fill/css.js",
        "lib/our/all-elements-style-inject.js",
        "lib/our/all-elements-fill/lifecycle.js",
        "lib/our/all-elements-outline/css.js",
        "lib/our/all-elements-outline/lifecycle.js",
        "app/all-elements-page.js",
        "lib/our/api.js",
        "app/hotkeys/commands.js",
        "lib/our/hotkeys/prefix-hint-messages.js",
        "lib/our/hotkeys/prefix-hint-content.js",
        "lib/our/hotkeys/platform.js",
        "lib/our/hotkeys/keys.js",
        "lib/our/hotkeys/prefix-mode.js",
        "lib/our/hotkeys/registry.js",
        "lib/our/hotkeys/prefix-content.js",
        "lib/our/page-operability/probe.js",
        "lib/our/hotkeys/prefix-operability.js",
        "lib/our/hotkeys/suppress.js",
        "lib/our/hotkeys/settings.js",
        "app/messages.js",
        "app/hotkeys/settings.js",
        "app/hotkeys/background.js",
        "app/hotkeys/keys.js",
        "app/hotkeys/registry.js",
        "app/hotkeys/deleter-content.js",
        "lib/our/i18n/locale-code.js",
        "lib/our/i18n/detect.js",
        "app/i18n/detect.js",
        "lib/our/i18n/rtl.js",
        "app/i18n/strings.js",
        "app/i18n/types.js",
        "app/settings/selection-caption-style.js",
        "app/storage.js",
        "app/highlight/delete-restore-visual.js",
        "app/restore.js",
        "lib/our/element-under-cursor.js",
        "lib/our/copy/selector.js",
        "lib/our/copy/xpath.js",
        "app/selection-caption.js",
        "lib/our/highlight/classes.js",
        "lib/our/highlight/page-styles.js",
        "lib/our/highlight/visual.js",
        "lib/our/highlight/selector.js",
        "app/highlight/deleter-page-styles.js",
        "app/highlight/page-styles.js",
        "lib/our/icons/lucide.js",
        "lib/our/icons/index.js",
        "lib/our/icons/md2it.js",
        "lib/our/icons/extension-logos.js",
        "app/icons.js",
        "lib/our/toast/stack.js",
        "lib/our/toast/index.js",
        "app/ui-config.js",
        "app/toast/deleter.js",
        "app/ui.js",
        "lib/our/page-operability/content-probe.js",
        "app/panel-popup/constants.js",
        "lib/our/panel-header/header.js",
        "lib/our/panel-shell/shadow-host.js",
        "lib/our/support-survey/logic.js",
        "app/support-survey/constants.js",
        "app/support-survey/state.js",
        "app/about.js",
        "app/brand.js",
        "app/panel-popup/panel-menu.js",
        "app/panel-popup/build-panel-surface.js",
        "app/panel-popup/panel-body.js",
        "app/panel-popup/panel-settings.js",
        "app/panel-popup/window.js",
        "app/panel-popup/mount-panel-surface.js",
        "app/panel-popup/mount.js",
        "lib/our/panel-popup/page-path.js",
        "lib/our/panel-popup/resolve-tab.js",
        "lib/our/panel-tab/index.js",
        "app/panel-tab/constants.js",
        "app/panel-popup/page.js",
        "app/panel-tab/layout.js",
        "app/panel-tab/mount.js",
        "app/panel-tab/bootstrap.js",
        "app/content.js",
      ],
    });
    return results.length > 0;
  } catch (err) {
    console.warn("[Element Deleter] injectContent failed:", err);
    return false;
  }
}
function isActivationSuccess(message, response) {
  if (message.type === "SET_ACTIVE" && message.active) {
    return response?.ok === true;
  }
  return true;
}
async function sendToTab(tabId, message, frameId) {
  try {
    const response =
      frameId !== void 0 && frameId !== 0
        ? await ext.tabs.sendMessage(tabId, message, { frameId })
        : await ext.tabs.sendMessage(tabId, message);
    return isActivationSuccess(message, response);
  } catch (err) {
    console.warn("[Element Deleter] sendToTab failed:", err);
    return false;
  }
}
async function loadAllSettings() {
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
function settingsUpdatedMessage(settings) {
  return { type: "SETTINGS_UPDATED", ...settings };
}
async function sendWithInject(tabId, message, frameId) {
  if (await sendToTab(tabId, message, frameId)) return true;
  if (!(await injectContent(tabId, frameId))) return false;
  return sendToTab(tabId, message, frameId);
}
async function setTabActive(tabId, active, windowId) {
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
async function toggleTab(tabId, windowId) {
  const now = Date.now();
  if (tabId === lastToggleTabId && now - lastToggleAt < TOGGLE_DEBOUNCE_MS) {
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
var CONTEXT_MENU_SETTINGS = "element-deleter-settings";
var CONTEXT_MENU_SHORTCUTS = "element-deleter-shortcuts";
var CONTEXT_MENU_ABOUT = "element-deleter-about";
var CONTEXT_MENU_DELETE = "element-deleter-delete-element";
function getActiveCommandTab() {
  return new Promise((resolve) => {
    ext.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.id !== void 0) {
        resolve(tab);
        return;
      }
      ext.tabs.query({ active: true, currentWindow: true }, (fallback) => {
        resolve(fallback[0]);
      });
    });
  });
}
var PAGE_CONTEXT_MENU_CONTEXTS = [
  "page",
  "frame",
  "selection",
  "link",
  "editable",
  "image",
  "video",
  "audio",
];
var ACTION_MENU_EMOJI = {
  settings: "⚙️",
  shortcuts: "⌨️",
  about: "ℹ️",
};
var ensureContextMenuChain = Promise.resolve();
async function createContextMenuItem(props) {
  try {
    await ext.contextMenus.create(props);
  } catch (err) {
    console.error("[Element Deleter] contextMenus.create failed:", err, props);
  }
}
function actionMenuTitle(title, emoji, locale) {
  return isRtlLocale(locale) ? `${title} ${emoji}` : `${emoji} ${title}`;
}
async function ensureContextMenu() {
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
      title: actionMenuTitle(
        strings.titleSettings,
        ACTION_MENU_EMOJI.settings,
        locale,
      ),
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
      title: actionMenuTitle(
        strings.titleAbout,
        ACTION_MENU_EMOJI.about,
        locale,
      ),
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
async function pushSettingsToActiveTabs() {
  const settings = await loadAllSettings();
  const message = settingsUpdatedMessage(settings);
  const activeTabIds = [];
  forEachActiveTabId((tabId) => {
    activeTabIds.push(tabId);
  });
  for (const tabId of activeTabIds) {
    await sendToTab(tabId, message);
  }
}
ext.action.onClicked.addListener(async (tab) => {
  if (tab.id === void 0) return;
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
      if (tabId === void 0) return;
      const frameId = info.frameId ?? 0;
      if (!(await canOperateOnTab(tabId, frameId))) {
        await showBlockedPageFeedback(tabId, tab?.windowId);
        return;
      }
      const ok = await sendWithInject(
        tabId,
        { type: "DELETE_CONTEXT_ELEMENT" },
        frameId,
      );
      if (!ok) {
        await showBlockedPageFeedback(tabId, tab?.windowId);
      }
    })();
  }
});
ext.runtime.onMessage.addListener((message, sender) => {
  if (isBlockedNoticeDismissedMessage(message)) {
    onBlockedNoticeDismissed(message.tabId);
    return;
  }
  const contentMessage = message;
  if (contentMessage.type === "ACTIVE_CHANGED" && sender.tab?.id !== void 0) {
    const tabId = sender.tab.id;
    onContentActiveChanged2(tabId, contentMessage.active);
    if (!contentMessage.active) {
      clearBlockedBadgeState(tabId);
      clearFlashBadgeState(tabId);
      clearRunningBadgeAnimation(tabId);
    }
    void syncToolbarBadge(tabId);
  }
  if (contentMessage.type === "BADGE_FLASH" && sender.tab?.id !== void 0) {
    const tabId = sender.tab.id;
    tabFlashBadge.set(tabId, contentMessage.variant);
    scheduleClearFlashBadge(tabId);
    void syncToolbarBadge(tabId);
  }
  if (contentMessage.type === "OPEN_PANEL") {
    openPanelFromSender(contentMessage.tab, sender.tab);
  }
  if (contentMessage.type === "WATCH_PIN_STATUS" && sender.tab?.id !== void 0) {
    watchWelcomePinStatus2(sender.tab.id);
  }
  if (contentMessage.type === "SCENARIO_COMPLETE") {
    void handleSupportSurveyScenarioComplete(
      sender.tab?.id,
      sender.tab?.windowId,
    );
  }
  if (contentMessage.type === "SUPPORT_SURVEY_ACTION") {
    void recordSupportSurveyAction();
  }
});
ext.tabs.onRemoved.addListener((tabId) => {
  stopWelcomePinWatcher2(tabId);
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
    if (tabId === void 0) return;
    tabPrefixBadgeShown.set(tabId, true);
  },
  onHide: (tabId) => {
    if (tabId === void 0) return;
    tabPrefixBadgeShown.set(tabId, false);
    void syncToolbarBadge(tabId);
  },
});
registerExtensionIconStateListeners2();
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
var onBootstrap = async () => {
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
