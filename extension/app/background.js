"use strict";
(() => {
  // ../lib/our/api.ts
  var ext = typeof browser !== "undefined" ? browser : chrome;

  // ../lib/our/hotkeys/prefix-hint-messages.ts
  var PREFIX_HINT_SHOW = "PREFIX_HINT_SHOW";
  var PREFIX_HINT_HIDE = "PREFIX_HINT_HIDE";
  var PREFIX_HINT_CAN_SHOW = "PREFIX_HINT_CAN_SHOW";
  var PREFIX_HINT_BLOCKED = "PREFIX_HINT_BLOCKED";
  function isPrefixHintShowMessage(msg) {
    return msg.type === PREFIX_HINT_SHOW;
  }
  function isPrefixHintHideMessage(msg) {
    return msg.type === PREFIX_HINT_HIDE;
  }

  // ../lib/our/hotkeys/prefix-hint-badge.ts
  var PREFIX_BADGE_BACKGROUND_COLOR = "#012292";
  var PREFIX_BADGE_TEXT_COLOR = "#ffffff";
  async function showPrefixBadge(letter, tabId, backgroundColor = PREFIX_BADGE_BACKGROUND_COLOR, textColor = PREFIX_BADGE_TEXT_COLOR) {
    const text = letter.toUpperCase().slice(0, 4);
    const tabDetails = tabId !== void 0 ? { tabId } : {};
    try {
      await ext.action.setBadgeBackgroundColor({
        ...tabDetails,
        color: backgroundColor
      });
      const setBadgeTextColor = ext.action.setBadgeTextColor;
      await setBadgeTextColor?.({ ...tabDetails, color: textColor });
      await ext.action.setBadgeText({ ...tabDetails, text });
    } catch (err) {
      console.warn("[prefix-hint] setBadgeText failed:", err);
    }
  }
  async function hidePrefixBadge(tabId) {
    const tabDetails = tabId !== void 0 ? { tabId } : {};
    try {
      await ext.action.setBadgeText({ ...tabDetails, text: "" });
    } catch (err) {
      console.warn("[prefix-hint] clear badge failed:", err);
    }
  }
  var badgeListenersRegistered = false;
  var badgeBackgroundColor = PREFIX_BADGE_BACKGROUND_COLOR;
  var badgeTextColor = PREFIX_BADGE_TEXT_COLOR;
  var canShowPrefixBadgeOnTab;
  var onShowCallbacks = [];
  var onHideCallbacks = [];
  function registerPrefixHintBadgeListeners(options = {}) {
    if (options.badgeBackgroundColor !== void 0) {
      badgeBackgroundColor = options.badgeBackgroundColor;
    }
    if (options.badgeTextColor !== void 0) {
      badgeTextColor = options.badgeTextColor;
    }
    if (options.canShowPrefixBadgeOnTab !== void 0) {
      canShowPrefixBadgeOnTab = options.canShowPrefixBadgeOnTab;
    }
    if (options.onShow) onShowCallbacks.push(options.onShow);
    if (options.onHide) onHideCallbacks.push(options.onHide);
    if (badgeListenersRegistered) return;
    badgeListenersRegistered = true;
    ext.runtime.onMessage.addListener((message, sender) => {
      const tabId = sender.tab?.id;
      if (isPrefixHintShowMessage(message)) {
        void (async () => {
          if (tabId !== void 0 && canShowPrefixBadgeOnTab) {
            if (!await canShowPrefixBadgeOnTab(tabId)) return;
          }
          for (const cb of onShowCallbacks) cb(tabId, message.letter);
          await showPrefixBadge(message.letter, tabId, badgeBackgroundColor, badgeTextColor);
        })();
        return;
      }
      if (isPrefixHintHideMessage(message)) {
        void (async () => {
          await hidePrefixBadge(tabId);
          for (const cb of onHideCallbacks) cb(tabId);
        })();
      }
    });
  }

  // ../lib/our/hotkeys/prefix-background.ts
  var EXECUTE_ACTION_COMMAND = "_execute_action";
  function registerPrefixBackgroundHotkeys(config) {
    registerPrefixHintBadgeListeners({
      badgeBackgroundColor: config.badgeBackgroundColor
    });
    ext.commands.onCommand.addListener((command) => {
      if (command === EXECUTE_ACTION_COMMAND) {
        config.suppress.stampToggleCommand();
        void (async () => {
          const tab = await config.getActiveCommandTab();
          if (tab?.id === void 0) return;
          if (!await config.isToggleEnabled()) return;
          await config.onToggleRequest(tab.id, tab.windowId);
        })();
        return;
      }
      if (!config.undoCommand || command !== config.undoCommand) {
        return;
      }
      void (async () => {
        const tab = await config.getActiveCommandTab();
        if (tab?.id === void 0) return;
        if (config.isUndoCommandEnabled && !await config.isUndoCommandEnabled(tab)) {
          return;
        }
        await config.onUndoCommand?.(tab);
      })();
    });
    ext.runtime.onMessage.addListener((message, sender) => {
      const msg = message;
      if (msg.type !== config.toggleRequestMessageType || sender.tab?.id === void 0) {
        return;
      }
      const tabId = sender.tab.id;
      void (async () => {
        if (!await config.isToggleEnabled()) return;
        await config.onToggleRequest(tabId, sender.tab?.windowId);
      })();
    });
  }

  // ../lib/our/page-operability/probe.ts
  function probeDocumentOperability() {
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
  }

  // ../lib/our/hotkeys/prefix-operability.ts
  var operabilityListenersRegistered = false;
  function registerPrefixHintOperabilityListeners(handlers) {
    if (operabilityListenersRegistered) return;
    operabilityListenersRegistered = true;
    ext.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const tabId = sender.tab?.id;
      if (tabId === void 0) return;
      const msg = message;
      if (msg.type === PREFIX_HINT_CAN_SHOW) {
        void handlers.canOperateOnTab(tabId).then((ok) => {
          sendResponse(ok);
        });
        return true;
      }
      if (msg.type === PREFIX_HINT_BLOCKED) {
        void handlers.onBlockedOnTab?.(tabId, sender.tab?.windowId);
      }
    });
  }

  // ../lib/our/hotkeys/suppress.ts
  var DEFAULT_TOGGLE_COMMAND_SUPPRESS_MS = 300;
  function shouldSuppressContentToggleAfterToggleCommand(lastAt, now, windowMs = DEFAULT_TOGGLE_COMMAND_SUPPRESS_MS) {
    return lastAt > 0 && now - lastAt < windowMs;
  }
  function createToggleCommandSuppressTracker(windowMs = DEFAULT_TOGGLE_COMMAND_SUPPRESS_MS) {
    let lastToggleCommandAt = 0;
    return {
      stampToggleCommand: () => {
        lastToggleCommandAt = Date.now();
      },
      shouldSuppressContentToggle: (now = Date.now()) => shouldSuppressContentToggleAfterToggleCommand(
        lastToggleCommandAt,
        now,
        windowMs
      ),
      shouldSuppressToolbarClick: (now = Date.now()) => shouldSuppressContentToggleAfterToggleCommand(
        lastToggleCommandAt,
        now,
        windowMs
      )
    };
  }

  // ../lib/our/hotkeys/settings.ts
  function readBooleanSetting(data, key) {
    const raw = data[key];
    return raw !== false;
  }

  // src/icon-paths.ts
  var INACTIVE = {
    16: "icons/icon-16.png",
    32: "icons/icon-32.png",
    48: "icons/icon-48.png",
    128: "icons/icon-128.png"
  };
  var ACTIVE = INACTIVE;
  var TOOLBAR_ICON_PATHS = {
    inactive: INACTIVE,
    active: ACTIVE
  };

  // ../lib/icons/lucide/chevron-left.svg
  var chevron_left_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="m15 18-6-6 6-6" />\n</svg>\n';

  // ../lib/icons/lucide/chevron-right.svg
  var chevron_right_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="m9 18 6-6-6-6" />\n</svg>\n';

  // ../lib/icons/lucide/chevrons-left.svg
  var chevrons_left_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="m11 17-5-5 5-5" />\n  <path d="m18 17-5-5 5-5" />\n</svg>\n';

  // ../lib/icons/lucide/chevrons-right.svg
  var chevrons_right_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="m6 17 5-5-5-5" />\n  <path d="m13 17 5-5-5-5" />\n</svg>\n';

  // ../lib/icons/lucide/circle-power.svg
  var circle_power_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <circle cx="12" cy="12" r="10" />\n  <path d="M12 7v4" />\n  <path d="M7.998 9.003a5 5 0 1 0 8-.005" />\n</svg>\n';

  // ../lib/icons/lucide/shield-check.svg
  var shield_check_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />\n  <path d="m9 12 2 2 4-4" />\n</svg>\n';

  // ../lib/icons/lucide/trash-2.svg
  var trash_2_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="M10 11v6" />\n  <path d="M14 11v6" />\n  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />\n  <path d="M3 6h18" />\n  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />\n</svg>\n';

  // ../lib/icons/lucide/undo-2.svg
  var undo_2_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="M9 14 4 9l5-5" />\n  <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />\n</svg>\n';

  // ../lib/icons/lucide/arrow-up.svg
  var arrow_up_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="m5 12 7-7 7 7" />\n  <path d="M12 19V5" />\n</svg>\n';

  // ../lib/icons/lucide/copy.svg
  var copy_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />\n  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />\n</svg>\n';

  // ../lib/icons/lucide/external-link.svg
  var external_link_default = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link-icon lucide-external-link">\n  <path d="M15 3h6v6" />\n  <path d="M10 14 21 3" />\n  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />\n</svg>\n';

  // ../lib/icons/lucide/file-down.svg
  var file_down_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />\n  <path d="M14 2v4a2 2 0 0 0 2 2h4" />\n  <path d="M12 18v-6" />\n  <path d="m9 15 3 3 3-3" />\n</svg>\n';

  // ../lib/icons/lucide/files.svg
  var files_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="M15 2h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />\n  <path d="M16.706 2.706A2.4 2.4 0 0 0 15 2v5a1 1 0 0 0 1 1h5a2.4 2.4 0 0 0-.706-1.706z" />\n  <path d="M5 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 1.732-1" />\n</svg>\n';

  // ../lib/icons/lucide/image-down.svg
  var image_down_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21" />\n  <path d="m14 19 3 3v-5.5" />\n  <path d="m17 22 3-3" />\n  <circle cx="9" cy="9" r="2" />\n</svg>\n';

  // ../lib/icons/lucide/images.svg
  var images_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="M18 22H4a2 2 0 0 1-2-2V6" />\n  <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" />\n  <circle cx="12" cy="8" r="2" />\n  <rect width="16" height="16" x="6" y="2" rx="2" />\n</svg>\n';

  // ../lib/icons/lucide/heart.svg
  var heart_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />\n</svg>\n';

  // ../lib/icons/lucide/history.svg
  var history_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />\n  <path d="M3 3v5h5" />\n  <path d="M12 7v5l4 2" />\n</svg>\n';

  // ../lib/icons/lucide/cog.svg
  var cog_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="M11 10.27 7 3.34" />\n  <path d="m11 13.73-4 6.93" />\n  <path d="M12 22v-2" />\n  <path d="M12 2v2" />\n  <path d="M14 12h8" />\n  <path d="m17 20.66-1-1.73" />\n  <path d="m17 3.34-1 1.73" />\n  <path d="M2 12h2" />\n  <path d="m20.66 17-1.73-1" />\n  <path d="m20.66 7-1.73 1" />\n  <path d="m3.34 17 1.73-1" />\n  <path d="m3.34 7 1.73 1" />\n  <circle cx="12" cy="12" r="2" />\n  <circle cx="12" cy="12" r="8" />\n</svg>\n';

  // ../lib/icons/lucide/info.svg
  var info_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <circle cx="12" cy="12" r="10" />\n  <path d="M12 16v-4" />\n  <path d="M12 8h.01" />\n</svg>\n';

  // ../lib/icons/lucide/keyboard.svg
  var keyboard_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="M10 8h.01" />\n  <path d="M12 12h.01" />\n  <path d="M14 8h.01" />\n  <path d="M16 12h.01" />\n  <path d="M18 8h.01" />\n  <path d="M6 8h.01" />\n  <path d="M7 16h10" />\n  <path d="M8 12h.01" />\n  <rect width="20" height="16" x="2" y="4" rx="2" />\n</svg>\n';

  // ../lib/icons/lucide/pin.svg
  var pin_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="M12 17v5" />\n  <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />\n</svg>\n';

  // ../lib/icons/lucide/play.svg
  var play_default = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>';

  // ../lib/icons/lucide/puzzle.svg
  var puzzle_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z" />\n</svg>\n';

  // ../lib/icons/lucide/rotate-cw.svg
  var rotate_cw_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />\n  <path d="M21 3v5h-5" />\n</svg>\n';

  // ../lib/icons/lucide/settings.svg
  var settings_default = '<svg\n  xmlns="http://www.w3.org/2000/svg"\n  width="24"\n  height="24"\n  viewBox="0 0 24 24"\n  fill="none"\n  stroke="currentColor"\n  stroke-width="2"\n  stroke-linecap="round"\n  stroke-linejoin="round"\n>\n  <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />\n  <circle cx="12" cy="12" r="3" />\n</svg>\n';

  // ../lib/icons/brands/linkedin.svg
  var linkedin_default = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#000000">\n  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>\n</svg>\n';

  // ../lib/icons/index.ts
  function stripComment(svg) {
    return svg.replace(/<!--[\s\S]*?-->\s*/g, "").trim();
  }
  function lucideUiIcon(raw) {
    return stripComment(raw);
  }
  function brandIcon(raw) {
    return stripComment(raw).replace(/fill="#000000"/g, 'fill="currentColor"');
  }
  var ARROW_UP = lucideUiIcon(arrow_up_default);
  var CIRCLE_POWER = lucideUiIcon(circle_power_default);
  var COG = lucideUiIcon(cog_default);
  var COPY = lucideUiIcon(copy_default);
  var EXTERNAL_LINK = lucideUiIcon(external_link_default);
  var FILE_DOWN = lucideUiIcon(file_down_default);
  var FILES = lucideUiIcon(files_default);
  var IMAGE_DOWN = lucideUiIcon(image_down_default);
  var IMAGES = lucideUiIcon(images_default);
  var HEART = lucideUiIcon(heart_default);
  var HISTORY = lucideUiIcon(history_default);
  var INFO = lucideUiIcon(info_default);
  var KEYBOARD = lucideUiIcon(keyboard_default);
  var SETTINGS = lucideUiIcon(settings_default);
  var SHIELD_CHECK = lucideUiIcon(shield_check_default);
  var PIN = lucideUiIcon(pin_default);
  var PLAY = lucideUiIcon(play_default);
  var PUZZLE = lucideUiIcon(puzzle_default);
  var ROTATE_CW = lucideUiIcon(rotate_cw_default);
  var LINKEDIN = brandIcon(linkedin_default);

  // ../lib/icons/md2it.svg
  var md2it_default = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 946.295 947.014" width="24" height="24" fill="#000000">\n  <path fill-rule="evenodd" clip-rule="evenodd" d="M0.294998 230.507V461.014H57.295H114.295L114.321 317.264L114.347 173.514L119.729 182.014C131.242 200.194 138.673 212.076 147.245 226.014C152.15 233.989 159.72 246.139 164.067 253.014C168.414 259.889 177.529 274.514 184.323 285.514C197.987 307.639 211.847 329.833 216.794 337.514C218.566 340.264 223.961 348.814 228.784 356.514C241.803 377.3 252.729 393.981 253.295 393.936C253.57 393.914 256.783 389.31 260.436 383.705C264.088 378.1 274.925 361.589 284.519 347.014C294.112 332.439 306.24 313.989 311.47 306.014C316.7 298.039 328.999 279.364 338.8 264.514C348.602 249.664 364.02 226.264 373.064 212.514C382.107 198.764 391.371 184.711 393.651 181.285L397.795 175.056L398.048 318.035L398.302 461.014H455.298H512.295V230.514V0.0139999H443.011H373.726L371.839 3.264C370.8 5.052 365.368 13.939 359.766 23.014C348.231 41.703 333.55 65.582 322.265 84.014C307.818 107.609 298.029 123.527 291.826 133.514C277.383 156.769 269.295 170.081 269.295 170.6C269.295 170.904 268.002 173.035 266.422 175.334C264.842 177.633 261.224 183.452 258.383 188.264C255.542 193.077 252.898 197.008 252.506 197C252.115 196.992 250.503 194.629 248.925 191.75C245.975 186.369 222.868 148.272 218.758 142.014C217.494 140.089 209.141 126.589 200.195 112.014C166.909 57.782 163.441 52.143 153.136 35.514C147.343 26.164 140.152 14.464 137.158 9.514L131.713 0.514L66.004 0.257L0.294998 0V230.507ZM540.295 230.566V461.117L643.545 460.759C743.253 460.413 747.246 460.328 759.951 458.267C786.579 453.949 808.086 447.481 828.992 437.506C870.648 417.63 901.83 386.413 922.717 343.678C933.069 322.495 939.448 300.945 943.929 272.014C946.675 254.283 946.442 212.457 943.49 193.259C940.647 174.774 938.091 163.449 933.656 149.681C915.674 93.867 880.193 51.134 831.073 26.127C809.507 15.147 790.444 8.876 765.795 4.652C739.813 0.2 734.575 0.0139999 635.189 0.0139999H540.295V230.566ZM739.295 115.392C773.348 120.821 799.25 138.981 813.666 167.534C821.407 182.866 826.068 203.012 826.965 225.014C828.571 264.421 818.637 296.12 797.875 317.843C783.839 332.529 767.977 341.016 744.795 346.244C736.861 348.033 731.265 348.329 697.545 348.742L659.295 349.211V231.779C659.295 167.192 659.632 114.008 660.045 113.593C661.417 112.213 728.97 113.747 739.295 115.392ZM162.295 479.597C123.366 484.23 94.04 494.332 66.795 512.496C52.467 522.048 42.425 531.456 32.459 544.664C14.097 568.999 2.966 601.142 0.685997 636.416L0 647.014H57.602H115.204L115.848 643.264C119.075 624.476 127.082 609.374 139.033 599.535C151.737 589.075 168.073 583.811 187.87 583.798C205.641 583.786 220.085 588.054 232.359 596.946C241.176 603.332 248.391 615.313 250.446 626.979C253.356 643.5 244.67 663.689 228.705 677.514C225.529 680.264 210.3 692.06 194.863 703.727C179.425 715.394 164.095 727.003 160.795 729.525C157.495 732.046 143.041 742.976 128.676 753.812C99.224 776.028 70.868 797.623 45.795 816.933C36.445 824.134 22.399 834.861 14.581 840.77L0.365997 851.514L0.330997 899.264L0.294998 947.014H186.295H372.295V895.019V843.024L278.045 842.769L183.795 842.514L192.295 836.212C196.97 832.746 208.22 824.451 217.295 817.779C226.37 811.106 239.645 801.31 246.795 796.009C253.945 790.709 262.27 784.647 265.295 782.539C271.406 778.282 293.855 761.209 307.165 750.698C317.777 742.317 334.967 725.563 341.175 717.55C356.435 697.853 365.255 678.635 369.948 654.861C372.035 644.285 372.321 615.682 370.446 605.014C367.07 585.803 363.897 575.411 356.997 560.97C346.286 538.552 331.67 522.278 309.037 507.569C286.568 492.967 257.662 483.528 223.295 479.571C206.92 477.685 178.255 477.698 162.295 479.597ZM398.295 717.014V947.014H455.295H512.295V717.014V487.014H455.295H398.295V717.014ZM540.295 543.514V600.014H612.295H684.295V773.514V947.014H745.795H807.295V773.514V600.014H876.795H946.295V543.514V487.014H743.295H540.295V543.514Z"/>\n</svg>\n';

  // src/icons.ts
  function stripComment2(svg) {
    return svg.replace(/<!--[\s\S]*?-->\s*/g, "").trim();
  }
  function lucideUiIcon2(raw) {
    return stripComment2(raw);
  }
  function brandIcon2(raw) {
    return stripComment2(raw).replace(/fill="#000000"/g, 'fill="currentColor"');
  }
  var MD2IT = brandIcon2(md2it_default);
  var UNDO_2 = lucideUiIcon2(undo_2_default);
  var CHEVRON_LEFT = lucideUiIcon2(chevron_left_default);
  var CHEVRON_RIGHT = lucideUiIcon2(chevron_right_default);
  var CHEVRONS_LEFT = lucideUiIcon2(chevrons_left_default);
  var CHEVRONS_RIGHT = lucideUiIcon2(chevrons_right_default);
  var INACTIVE_BG = "#012292";
  var ACTIVE_BG = INACTIVE_BG;
  var TOOLBAR_VIEWBOX = 24;
  var TOOLBAR_RADIUS_RATIO = 0.18;
  var TOOLBAR_PAD_RATIO = 0.1;
  function innerSvgMarkup(svg) {
    const match = svg.match(/<svg[\s\S]*?>([\s\S]*)<\/svg>/i);
    return match ? match[1].trim() : svg;
  }
  function svgAttr(tag, name) {
    const m = tag.match(new RegExp(`${name}="([^"]*)"`));
    return m?.[1];
  }
  function drawInnerSvg(ctx, inner) {
    ctx.fillStyle = "transparent";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const m of inner.matchAll(/<line\b[^>]*\/?>/g)) {
      const tag = m[0];
      const x1 = Number(svgAttr(tag, "x1"));
      const y1 = Number(svgAttr(tag, "y1"));
      const x2 = Number(svgAttr(tag, "x2"));
      const y2 = Number(svgAttr(tag, "y2"));
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    for (const m of inner.matchAll(/<rect\b[^>]*\/?>/g)) {
      const tag = m[0];
      const x = Number(svgAttr(tag, "x") ?? 0);
      const y = Number(svgAttr(tag, "y") ?? 0);
      const w = Number(svgAttr(tag, "width"));
      const h = Number(svgAttr(tag, "height"));
      const rx = Number(svgAttr(tag, "rx") ?? 0);
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, rx);
      ctx.stroke();
    }
    for (const m of inner.matchAll(/<path\b[^>]*\/?>/g)) {
      const d = svgAttr(m[0], "d");
      if (d) ctx.stroke(new Path2D(d));
    }
  }
  var trash2Inner = innerSvgMarkup(stripComment2(trash_2_default));
  var ABOUT_BULLET_ICONS = [
    lucideUiIcon2(trash_2_default),
    lucideUiIcon2(circle_power_default),
    lucideUiIcon2(undo_2_default),
    ROTATE_CW,
    lucideUiIcon2(shield_check_default),
    lucideUiIcon2(shield_check_default)
  ];
  function drawToolbarIcon(size, bg) {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d context unavailable");
    const r = size * TOOLBAR_RADIUS_RATIO;
    const pad = size * TOOLBAR_PAD_RATIO;
    const scale = (size - pad * 2) / TOOLBAR_VIEWBOX;
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, r);
    ctx.fill();
    ctx.save();
    ctx.translate(pad, pad);
    ctx.scale(scale, scale);
    drawInnerSvg(ctx, trash2Inner);
    ctx.restore();
    return ctx.getImageData(0, 0, size, size);
  }
  var toolbarCache = null;
  function getToolbarIconSets() {
    if (toolbarCache) return toolbarCache;
    const sizes = [16, 32, 48, 128];
    const inactive = {};
    const active = {};
    for (const size of sizes) {
      const key = String(size);
      inactive[key] = drawToolbarIcon(size, INACTIVE_BG);
      active[key] = drawToolbarIcon(size, ACTIVE_BG);
    }
    toolbarCache = { inactive, active };
    return toolbarCache;
  }
  function toolbarWelcomeIconSvg(bg = INACTIVE_BG, size = 16) {
    const r = TOOLBAR_VIEWBOX * TOOLBAR_RADIUS_RATIO;
    const pad = TOOLBAR_VIEWBOX * TOOLBAR_PAD_RATIO;
    const scale = (TOOLBAR_VIEWBOX - pad * 2) / TOOLBAR_VIEWBOX;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${TOOLBAR_VIEWBOX} ${TOOLBAR_VIEWBOX}" aria-hidden="true"><rect width="${TOOLBAR_VIEWBOX}" height="${TOOLBAR_VIEWBOX}" rx="${r}" fill="${bg}"/><g fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(${pad} ${pad}) scale(${scale})">${trash2Inner}</g></svg>`;
  }

  // ../lib/our/extension-icon-state/tab-active-state.ts
  var tabActive = /* @__PURE__ */ new Map();
  function getTabActiveState(tabId) {
    return tabActive.get(tabId) ?? false;
  }
  function setTabActiveState(tabId, active) {
    tabActive.set(tabId, active);
  }
  function deleteTabActiveState(tabId) {
    tabActive.delete(tabId);
  }
  function clearTabActiveState(tabId) {
    tabActive.set(tabId, false);
  }
  function forEachActiveTabId(fn) {
    for (const tabId of tabActive.keys()) {
      if (tabActive.get(tabId)) fn(tabId);
    }
  }

  // ../lib/our/extension-icon-state/icon-sync.ts
  function createIconSync(config) {
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
            err
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
        } catch {
        }
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
      bootstrapToolbarIcons: bootstrapToolbarIcons2
    };
  }

  // ../lib/our/extension-icon-state/listeners.ts
  function registerExtensionIconStateListeners(sync) {
    ext.tabs.onRemoved.addListener((tabId) => {
      deleteTabActiveState(tabId);
      void sync.forgetIconSyncedTab(tabId);
    });
    ext.tabs.onActivated.addListener(({ tabId }) => {
      void sync.syncIconForTab(tabId);
    });
    ext.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (changeInfo.status === "loading" || changeInfo.url !== void 0) {
        clearTabActiveState(tabId);
      }
      if (changeInfo.url === void 0 && changeInfo.status !== "complete") {
        return;
      }
      void sync.syncIconForTab(tabId);
    });
  }
  function onContentActiveChanged(sync, tabId, active) {
    setTabActiveState(tabId, active);
    void sync.syncIconForTab(tabId);
  }

  // ../lib/our/extension-icon-state/create.ts
  function createExtensionIconState(config) {
    const sync = createIconSync(config);
    return {
      bootstrapToolbarIcons: sync.bootstrapToolbarIcons,
      forgetIconSyncedTab: sync.forgetIconSyncedTab,
      setGlobalToolbarIcon: sync.setGlobalToolbarIcon,
      syncIconForTab: sync.syncIconForTab,
      registerExtensionIconStateListeners: () => registerExtensionIconStateListeners(sync),
      onContentActiveChanged: (tabId, active) => {
        onContentActiveChanged(sync, tabId, active);
      }
    };
  }

  // src/extension-icon-state/constants.ts
  var ICON_SYNCED_TAB_IDS_KEY = "iconSyncedTabIds";
  var ICON_STATE_LOG_LABEL = "Element Deleter";

  // src/extension-icon-state/index.ts
  var iconState = createExtensionIconState({
    paths: TOOLBAR_ICON_PATHS,
    syncedTabIdsStorageKey: ICON_SYNCED_TAB_IDS_KEY,
    logLabel: ICON_STATE_LOG_LABEL,
    getImageSets: getToolbarIconSets
  });
  var {
    bootstrapToolbarIcons,
    forgetIconSyncedTab,
    onContentActiveChanged: onContentActiveChanged2,
    registerExtensionIconStateListeners: registerExtensionIconStateListeners2,
    setGlobalToolbarIcon,
    syncIconForTab
  } = iconState;

  // ../lib/our/i18n/detect.ts
  function getAcceptLanguageTags() {
    return new Promise((resolve) => {
      const getAccept = ext.i18n?.getAcceptLanguages;
      if (typeof getAccept !== "function") {
        resolve(fallbackLanguageTags());
        return;
      }
      try {
        const maybePromise = getAccept((languages) => {
          resolve(pickLanguageTags(languages));
        });
        if (maybePromise && typeof maybePromise.then === "function") {
          void maybePromise.then((languages) => resolve(pickLanguageTags(languages))).catch(() => resolve(fallbackLanguageTags()));
        }
      } catch {
        resolve(fallbackLanguageTags());
      }
    });
  }
  function pickLanguageTags(languages) {
    if (languages?.length) return [...languages];
    return fallbackLanguageTags();
  }
  function fallbackLanguageTags() {
    if (typeof navigator !== "undefined" && navigator.languages?.length) {
      return [...navigator.languages];
    }
    try {
      const ui = ext.i18n?.getUILanguage?.();
      return ui ? [ui] : [];
    } catch {
      return [];
    }
  }
  async function detectLocale(mapLanguageTag2, fallbackLocale) {
    const tags = await getAcceptLanguageTags();
    const seen = /* @__PURE__ */ new Set();
    for (const tag of tags) {
      const key = tag.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const mapped = mapLanguageTag2(tag);
      if (mapped) return mapped;
    }
    return fallbackLocale;
  }

  // ../lib/our/i18n/locale-code.ts
  var CHINESE_UI_LOCALE = "zh_CN";
  var TRADITIONAL_CHINESE_RE = /^zh-(tw|hk|mo|hant)(-|$)|^zh-hant(-|$)/;
  function mapChineseUiLocale(tag) {
    const lower = tag.trim().toLowerCase().replace(/_/g, "-");
    if (!lower.startsWith("zh")) return null;
    if (TRADITIONAL_CHINESE_RE.test(lower)) return null;
    return CHINESE_UI_LOCALE;
  }
  function normalizeLocaleCode(code) {
    if (code === "zh") return CHINESE_UI_LOCALE;
    return code;
  }

  // src/i18n/detect.ts
  function mapLanguageTag(tag) {
    const chinese = mapChineseUiLocale(tag);
    if (chinese) return chinese;
    const lower = tag.trim().toLowerCase().replace(/_/g, "-");
    const base = lower.split("-")[0];
    const map = {
      en: "en",
      es: "es",
      fr: "fr",
      de: "de",
      ru: "ru",
      ar: "ar"
    };
    return map[base] ?? null;
  }
  function detectLocale2() {
    return detectLocale(mapLanguageTag, "en");
  }

  // ../lib/our/i18n/rtl.ts
  var RTL_LOCALES = /* @__PURE__ */ new Set(["ar"]);
  function isRtlLocale(locale) {
    return RTL_LOCALES.has(locale);
  }

  // src/i18n/strings.ts
  var MESSAGES = {
    en: {
      tabSettings: "SETTINGS",
      tabShortcuts: "SHORTCUTS",
      tabAbout: "ABOUT",
      shortcutsRunStopHeading: "To run / stop the extension:",
      shortcutsUndoHeading: "Undo delete:",
      shortcutsStepPress: "Press:",
      shortcutsStepOnMac: "On Mac:",
      shortcutsStepReleaseBold: "Release",
      shortcutsStepReleaseRest: " the keys",
      shortcutsStepThenPress: "Then press",
      shortcutsUndoWinLinux: "Win / Linux:",
      shortcutsStopHeading: "To stop:",
      shortcutsSafetyLine1: "The 3-step shortcut is not obvious.",
      shortcutsSafetyLine2: "But it is safer and avoids conflicts with other apps.",
      aboutProductName: "Element-Deleter",
      aboutCreditAuthor: "Alex T",
      notificationPeriodPrefix: "Notifications ",
      notificationPeriodSuffix: " sec.",
      notificationPeriodHint: "Set 0 to turn off notifications",
      startHotkeyToggleLabel: "On/Off",
      escHotkeyToggleLabel: "Off",
      undoHotkeyToggleLabel: "Undo delete",
      allElementsOutlineToggleLabel: "Outlines for all elements",
      allElementsFillToggleLabel: "Tint for all elements",
      selectionCaptionStyleLabel: "Frame title",
      selectionCaptionNone: "No title",
      selectionCaptionClickToDelete: "click to delete",
      selectionCaptionTagIdClass: "tag id class",
      selectionCaptionSelector: "selector",
      selectionCaptionFullXPath: "full XPath",
      toastDeleted: "DELETED",
      toastRestored: "RESTORED",
      toastDeletedCanBeRestored: "can be restored",
      btnRestore: "RESTORE",
      panelSubtitle: "browser extension",
      titleSettings: "Settings",
      titleShortcuts: "Shortcuts",
      titleAbout: "About",
      contextMenuDeleteElement: "Delete this element",
      restrictedPageNotice: "Browser extensions don't work on system pages and protected sites. Try another site.",
      welcomePin: "To keep the extension handy:",
      welcomePinStep1: "The top bar has an extensions list",
      welcomePinStep2: "In the list, find:",
      welcomePinStep3: "Click the pin button:",
      aboutBullets: [
        "Removes a page element,",
        "On/Off with one click,",
        "You can restore an element,",
        "Reloading the page restores everything,",
        "Doesn't use the network,",
        "Doesn't collect data."
      ]
    },
    es: {
      tabSettings: "AJUSTES",
      tabShortcuts: "ATAJOS",
      tabAbout: "ACERCA DE",
      shortcutsRunStopHeading: "Para iniciar / detener la extensión:",
      shortcutsUndoHeading: "Deshacer eliminación:",
      shortcutsStepPress: "Pulsa:",
      shortcutsStepOnMac: "En Mac:",
      shortcutsStepReleaseBold: "Suelta",
      shortcutsStepReleaseRest: " las teclas",
      shortcutsStepThenPress: "Luego pulsa",
      shortcutsUndoWinLinux: "Win / Linux:",
      shortcutsStopHeading: "Para detener:",
      shortcutsSafetyLine1: "El atajo de 3 pasos no es obvio.",
      shortcutsSafetyLine2: "Pero es más seguro y evita conflictos con otras apps.",
      aboutProductName: "Element-Deleter",
      aboutCreditAuthor: "Alex T",
      notificationPeriodPrefix: "Avisos ",
      notificationPeriodSuffix: " seg.",
      notificationPeriodHint: "Ponga 0 para desactivar las notificaciones",
      startHotkeyToggleLabel: "Activar/desactivar",
      escHotkeyToggleLabel: "Apagar",
      undoHotkeyToggleLabel: "Deshacer eliminación",
      allElementsOutlineToggleLabel: "Contornos de todos los elementos",
      allElementsFillToggleLabel: "Tinte de todos los elementos",
      selectionCaptionStyleLabel: "Título del marco",
      selectionCaptionNone: "Sin título",
      selectionCaptionClickToDelete: "clic para eliminar",
      selectionCaptionTagIdClass: "tag id class",
      selectionCaptionSelector: "selector",
      selectionCaptionFullXPath: "XPath completo",
      toastDeleted: "ELIMINADO",
      toastRestored: "RESTAURADO",
      toastDeletedCanBeRestored: "se puede restaurar",
      btnRestore: "RESTAURAR",
      panelSubtitle: "extensión de navegador",
      titleSettings: "Ajustes",
      titleShortcuts: "Atajos",
      titleAbout: "Acerca de",
      contextMenuDeleteElement: "Eliminar este elemento",
      restrictedPageNotice: "Las extensiones del navegador no funcionan en páginas del sistema y sitios protegidos. Prueba en otro sitio.",
      welcomePin: "Para tener la extensión siempre a mano:",
      welcomePinStep1: "En la barra superior hay una lista de extensiones",
      welcomePinStep2: "En la lista, busca:",
      welcomePinStep3: "Pulsa el botón de anclar:",
      aboutBullets: [
        "Elimina el elemento de la página,",
        "Activar/desactivar con un clic,",
        "Se puede restaurar un elemento,",
        "Al recargar la página se restaura todo,",
        "No usa la red,",
        "No recopila datos."
      ]
    },
    fr: {
      tabSettings: "PARAMÈTRES",
      tabShortcuts: "RACCOURCIS",
      tabAbout: "À PROPOS",
      shortcutsRunStopHeading: "Pour lancer / arrêter l'extension :",
      shortcutsUndoHeading: "Annuler la suppression :",
      shortcutsStepPress: "Appuyez :",
      shortcutsStepOnMac: "Sur Mac :",
      shortcutsStepReleaseBold: "Relâchez",
      shortcutsStepReleaseRest: " les touches",
      shortcutsStepThenPress: "Puis appuyez sur",
      shortcutsUndoWinLinux: "Win / Linux :",
      shortcutsStopHeading: "Pour arrêter :",
      shortcutsSafetyLine1: "Le raccourci en 3 étapes n'est pas évident.",
      shortcutsSafetyLine2: "Mais il est plus sûr et évite les conflits avec d'autres apps.",
      aboutProductName: "Element-Deleter",
      aboutCreditAuthor: "Alex T",
      notificationPeriodPrefix: "Notifications ",
      notificationPeriodSuffix: " s",
      notificationPeriodHint: "Mettez 0 pour désactiver les notifications",
      startHotkeyToggleLabel: "Activer/désactiver",
      escHotkeyToggleLabel: "Arrêt",
      undoHotkeyToggleLabel: "Annuler la suppression",
      allElementsOutlineToggleLabel: "Contours de tous les éléments",
      allElementsFillToggleLabel: "Teinte de tous les éléments",
      selectionCaptionStyleLabel: "Titre du cadre",
      selectionCaptionNone: "Sans titre",
      selectionCaptionClickToDelete: "cliquer pour supprimer",
      selectionCaptionTagIdClass: "tag id class",
      selectionCaptionSelector: "sélecteur",
      selectionCaptionFullXPath: "XPath complet",
      toastDeleted: "SUPPRIMÉ",
      toastRestored: "RESTAURÉ",
      toastDeletedCanBeRestored: "peut être restauré",
      btnRestore: "RESTAURER",
      panelSubtitle: "extension de navigateur",
      titleSettings: "Paramètres",
      titleShortcuts: "Raccourcis",
      titleAbout: "À propos",
      contextMenuDeleteElement: "Supprimer cet élément",
      restrictedPageNotice: "Les extensions du navigateur ne fonctionnent pas sur les pages système et les sites protégés. Essayez un autre site.",
      welcomePin: "Pour garder l'extension à portée de main :",
      welcomePinStep1: "La barre supérieure contient une liste d'extensions",
      welcomePinStep2: "Dans la liste, trouvez :",
      welcomePinStep3: "Cliquez sur le bouton d'épinglage :",
      aboutBullets: [
        "Supprime l'élément de la page,",
        "Activer/désactiver en un clic,",
        "Un élément peut être restauré,",
        "Le rechargement de la page restaure tout,",
        "N'utilise pas le réseau,",
        "Ne collecte pas de données."
      ]
    },
    de: {
      tabSettings: "EINSTELLUNGEN",
      tabShortcuts: "TASTENKÜRZEL",
      tabAbout: "INFO",
      shortcutsRunStopHeading: "Erweiterung starten / stoppen:",
      shortcutsUndoHeading: "Löschen rückgängig:",
      shortcutsStepPress: "Drücken:",
      shortcutsStepOnMac: "Auf dem Mac:",
      shortcutsStepReleaseBold: "Tasten",
      shortcutsStepReleaseRest: " loslassen",
      shortcutsStepThenPress: "Dann drücken",
      shortcutsUndoWinLinux: "Win / Linux:",
      shortcutsStopHeading: "Zum Stoppen:",
      shortcutsSafetyLine1: "Das 3-Schritte-Kürzel ist nicht offensichtlich.",
      shortcutsSafetyLine2: "Es ist aber sicherer und vermeidet Konflikte mit anderen Apps.",
      aboutProductName: "Element-Deleter",
      aboutCreditAuthor: "Alex T",
      notificationPeriodPrefix: "Hinweise ",
      notificationPeriodSuffix: " Sek.",
      notificationPeriodHint: "0 setzen, um Benachrichtigungen auszuschalten",
      startHotkeyToggleLabel: "Ein/Aus",
      escHotkeyToggleLabel: "Aus",
      undoHotkeyToggleLabel: "Löschen rückgängig",
      allElementsOutlineToggleLabel: "Umrisse aller Elemente",
      allElementsFillToggleLabel: "Färbung aller Elemente",
      selectionCaptionStyleLabel: "Rahmentitel",
      selectionCaptionNone: "Kein Titel",
      selectionCaptionClickToDelete: "klicken zum Löschen",
      selectionCaptionTagIdClass: "tag id class",
      selectionCaptionSelector: "Selektor",
      selectionCaptionFullXPath: "vollständiger XPath",
      toastDeleted: "GELÖSCHT",
      toastRestored: "WIEDERHERGESTELLT",
      toastDeletedCanBeRestored: "kann wiederhergestellt werden",
      btnRestore: "WIEDERHERSTELLEN",
      panelSubtitle: "Browser-Erweiterung",
      titleSettings: "Einstellungen",
      titleShortcuts: "Tastenkürzel",
      titleAbout: "Info",
      contextMenuDeleteElement: "Dieses Element löschen",
      restrictedPageNotice: "Browser-Erweiterungen funktionieren auf Systemseiten und geschützten Websites nicht. Versuche es auf einer anderen Website.",
      welcomePin: "Damit die Erweiterung immer griffbereit ist:",
      welcomePinStep1: "In der oberen Leiste gibt es eine Erweiterungsliste",
      welcomePinStep2: "In der Liste finde:",
      welcomePinStep3: "Klicke auf die Anheften-Schaltfläche:",
      aboutBullets: [
        "Entfernt das Seitenelement,",
        "Ein/Aus mit einem Klick,",
        "Elemente können wiederhergestellt werden,",
        "Beim Neuladen der Seite wird alles wiederhergestellt,",
        "Nutzt kein Netzwerk,",
        "Sammelt keine Daten."
      ]
    },
    ru: {
      tabSettings: "НАСТРОЙКИ",
      tabShortcuts: "ГОРЯЧИЕ КЛАВИШИ",
      tabAbout: "О РАСШИРЕНИИ",
      shortcutsRunStopHeading: "Запуск / остановка расширения:",
      shortcutsUndoHeading: "Отменить удаление:",
      shortcutsStepPress: "Нажмите:",
      shortcutsStepOnMac: "На Mac:",
      shortcutsStepReleaseBold: "Отпустите",
      shortcutsStepReleaseRest: " клавиши",
      shortcutsStepThenPress: "Затем нажмите",
      shortcutsUndoWinLinux: "Win / Linux:",
      shortcutsStopHeading: "Остановка:",
      shortcutsSafetyLine1: "Трёхшаговое сочетание неочевидно.",
      shortcutsSafetyLine2: "Но оно безопаснее и реже конфликтует с другими приложениями.",
      aboutProductName: "Element-Deleter",
      aboutCreditAuthor: "Alex T",
      notificationPeriodPrefix: "Уведомления ",
      notificationPeriodSuffix: " сек",
      notificationPeriodHint: "Установите 0 для выключения уведомлений",
      startHotkeyToggleLabel: "Вкл/выкл",
      escHotkeyToggleLabel: "Выкл",
      undoHotkeyToggleLabel: "Отменить удаление",
      allElementsOutlineToggleLabel: "Контуры всех элементов",
      allElementsFillToggleLabel: "Подкраска всех элементов",
      selectionCaptionStyleLabel: "Заголовок рамки",
      selectionCaptionNone: "Без подписи",
      selectionCaptionClickToDelete: "нажмите, чтобы удалить",
      selectionCaptionTagIdClass: "tag id class",
      selectionCaptionSelector: "селектор",
      selectionCaptionFullXPath: "полный XPath",
      toastDeleted: "УДАЛЕНО",
      toastRestored: "ВОССТАНОВЛЕНО",
      toastDeletedCanBeRestored: "можно восстановить",
      btnRestore: "ВОССТАНОВИТЬ",
      panelSubtitle: "браузерное расширение",
      titleSettings: "Настройки",
      titleShortcuts: "Горячие клавиши",
      titleAbout: "О расширении",
      contextMenuDeleteElement: "Удалить этот элемент",
      restrictedPageNotice: "На системных страницах и защищённых сайтах браузерные расширения не работают. Попробуй на другом сайте",
      welcomePin: "Чтобы расширение было всегда под рукой:",
      welcomePinStep1: "В верхней панели есть список расширений",
      welcomePinStep2: "В списке найди:",
      welcomePinStep3: "Нажми канцелярскую кнопку:",
      aboutBullets: [
        "Удаляет элемент страницы,",
        "Вкл/выкл в один клик,",
        "Можно восстановить элемент,",
        "Перезагрузка страницы восстановит всё,",
        "Не использует сеть,",
        "Не собирает данные."
      ]
    },
    zh_CN: {
      tabSettings: "设置",
      tabShortcuts: "快捷键",
      tabAbout: "关于",
      shortcutsRunStopHeading: "运行 / 停止扩展：",
      shortcutsUndoHeading: "撤销删除：",
      shortcutsStepPress: "按下：",
      shortcutsStepOnMac: "在 Mac 上：",
      shortcutsStepReleaseBold: "松开",
      shortcutsStepReleaseRest: "按键",
      shortcutsStepThenPress: "然后按",
      shortcutsUndoWinLinux: "Win / Linux：",
      shortcutsStopHeading: "停止：",
      shortcutsSafetyLine1: "三步快捷键并不直观。",
      shortcutsSafetyLine2: "但它更安全，且较少与其他应用冲突。",
      aboutProductName: "Element-Deleter",
      aboutCreditAuthor: "Alex T",
      notificationPeriodPrefix: "通知 ",
      notificationPeriodSuffix: " 秒",
      notificationPeriodHint: "设为 0 可关闭通知",
      startHotkeyToggleLabel: "开/关",
      escHotkeyToggleLabel: "关闭",
      undoHotkeyToggleLabel: "撤销删除",
      allElementsOutlineToggleLabel: "所有元素轮廓",
      allElementsFillToggleLabel: "所有元素着色",
      selectionCaptionStyleLabel: "框标题",
      selectionCaptionNone: "无标题",
      selectionCaptionClickToDelete: "点击删除",
      selectionCaptionTagIdClass: "tag id class",
      selectionCaptionSelector: "选择器",
      selectionCaptionFullXPath: "完整 XPath",
      toastDeleted: "已删除",
      toastRestored: "已恢复",
      toastDeletedCanBeRestored: "可以恢复",
      btnRestore: "恢复",
      panelSubtitle: "浏览器扩展",
      titleSettings: "设置",
      titleShortcuts: "快捷键",
      titleAbout: "关于",
      contextMenuDeleteElement: "删除此元素",
      restrictedPageNotice: "浏览器扩展无法在系统页面和受保护网站上运行。请尝试其他网站。",
      welcomePin: "让扩展随时触手可及：",
      welcomePinStep1: "顶部栏有扩展程序列表",
      welcomePinStep2: "在列表中找到：",
      welcomePinStep3: "点击图钉按钮：",
      aboutBullets: [
        "删除页面元素，",
        "一键开/关，",
        "可恢复元素，",
        "重新加载页面可恢复一切，",
        "不使用网络，",
        "不收集数据。"
      ]
    },
    ar: {
      tabSettings: "الإعدادات",
      tabShortcuts: "اختصارات",
      tabAbout: "حول",
      shortcutsRunStopHeading: "لتشغيل / إيقاف الإضافة:",
      shortcutsUndoHeading: "تراجع عن الحذف:",
      shortcutsStepPress: "اضغط:",
      shortcutsStepOnMac: "على Mac:",
      shortcutsStepReleaseBold: "أفلت",
      shortcutsStepReleaseRest: " المفاتيح",
      shortcutsStepThenPress: "ثم اضغط",
      shortcutsUndoWinLinux: "Win / Linux:",
      shortcutsStopHeading: "للإيقاف:",
      shortcutsSafetyLine1: "الاختصار من 3 خطوات ليس واضحًا.",
      shortcutsSafetyLine2: "لكنه أكثر أمانًا ويتجنب التعارض مع التطبيقات الأخرى.",
      aboutProductName: "Element-Deleter",
      aboutCreditAuthor: "Alex T",
      notificationPeriodPrefix: "إشعار ",
      notificationPeriodSuffix: " ث",
      notificationPeriodHint: "اضبط على 0 لإيقاف الإشعارات",
      startHotkeyToggleLabel: "تشغيل/إيقاف",
      escHotkeyToggleLabel: "إيقاف",
      undoHotkeyToggleLabel: "تراجع عن الحذف",
      allElementsOutlineToggleLabel: "حدود جميع العناصر",
      allElementsFillToggleLabel: "تلوين جميع العناصر",
      selectionCaptionStyleLabel: "عنوان الإطار",
      selectionCaptionNone: "بدون عنوان",
      selectionCaptionClickToDelete: "انقر للحذف",
      selectionCaptionTagIdClass: "tag id class",
      selectionCaptionSelector: "مُحدِّد",
      selectionCaptionFullXPath: "XPath الكامل",
      toastDeleted: "تم الحذف",
      toastRestored: "تم الاستعادة",
      toastDeletedCanBeRestored: "يمكن استعادته",
      btnRestore: "استعادة",
      panelSubtitle: "امتداد المتصفح",
      titleSettings: "الإعدادات",
      titleShortcuts: "اختصارات",
      titleAbout: "حول",
      contextMenuDeleteElement: "حذف هذا العنصر",
      restrictedPageNotice: "لا تعمل إضافات المتصفح على صفحات النظام والمواقع المحمية. جرّب موقعًا آخر.",
      welcomePin: "لتبقى الإضافة دائمًا في متناول اليد:",
      welcomePinStep1: "في الشريط العلوي قائمة الإضافات",
      welcomePinStep2: "في القائمة، ابحث عن:",
      welcomePinStep3: "انقر زر التثبيت:",
      aboutBullets: [
        "يحذف عنصر الصفحة،",
        "تشغيل/إيقاف بنقرة واحدة،",
        "يمكن استعادة العنصر،",
        "إعادة تحميل الصفحة تستعيد كل شيء،",
        "لا تستخدم الشبكة،",
        "لا تجمع البيانات."
      ]
    }
  };
  function t(locale) {
    return MESSAGES[locale];
  }

  // src/i18n/types.ts
  var LOCALES = [
    "en",
    "es",
    "fr",
    "de",
    "ru",
    "zh_CN",
    "ar"
  ];
  var LOCALE_BUTTON_LABELS = {
    en: "EN",
    es: "ES",
    fr: "FR",
    de: "DE",
    ru: "RU",
    zh_CN: "中文",
    ar: "عربي"
  };
  function isLocale(value) {
    return typeof value === "string" && LOCALES.includes(value);
  }

  // src/hotkeys/commands.ts
  var DELETER_ACTIVE_COLOR = "#b91c1c";

  // src/messages.ts
  var STORAGE_KEY = "notificationSeconds";
  var LOCALE_STORAGE_KEY = "locale";
  var LOCALE_USER_SELECTED_KEY = "localeUserSelected";
  var LOCALE_DETECT_VERSION_KEY = "localeDetectVersion";
  var LOCALE_DETECT_VERSION = 5;
  var START_HOTKEY_ENABLED_KEY = "startHotkeyEnabled";
  var SELECTION_CAPTION_STYLE_KEY = "selectionCaptionStyle";
  var ALL_ELEMENTS_OUTLINE_ENABLED_KEY = "allElementsOutlineEnabled";
  var ALL_ELEMENTS_FILL_ENABLED_KEY = "allElementsFillEnabled";
  var DEFAULT_NOTIFICATION_SECONDS = 4;

  // src/hotkeys/settings.ts
  async function getStartHotkeyEnabled() {
    const data = await ext.storage.local.get(START_HOTKEY_ENABLED_KEY);
    return readBooleanSetting(data, START_HOTKEY_ENABLED_KEY);
  }

  // src/hotkeys/background.ts
  var toggleCommandSuppress = createToggleCommandSuppressTracker();
  function shouldSuppressToolbarClickAfterHotkeyCommand(now = Date.now()) {
    return toggleCommandSuppress.shouldSuppressToolbarClick(now);
  }
  function registerBackgroundHotkeys(host) {
    registerPrefixBackgroundHotkeys({
      badgeBackgroundColor: DELETER_ACTIVE_COLOR,
      getActiveCommandTab: host.getActiveCommandTab,
      isToggleEnabled: getStartHotkeyEnabled,
      toggleRequestMessageType: "TOGGLE_REQUEST",
      onToggleRequest: (tabId, windowId) => host.toggleTab(tabId, windowId),
      suppress: toggleCommandSuppress
    });
  }

  // ../lib/our/badge/text-color-animation.ts
  function toHex(value) {
    return value.toString(16).padStart(2, "0");
  }
  function mixColor(from, to, ratio) {
    const normalizedRatio = Math.max(0, Math.min(1, ratio));
    const r = Math.round(from[0] + (to[0] - from[0]) * normalizedRatio);
    const g = Math.round(from[1] + (to[1] - from[1]) * normalizedRatio);
    const b = Math.round(from[2] + (to[2] - from[2]) * normalizedRatio);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  function normalizeFrame(frame, totalFrames) {
    return (frame % totalFrames + totalFrames) % totalFrames;
  }
  function resolveStep(frame, steps, mode) {
    const totalFrames = mode === "ping-pong" ? steps * 2 : steps;
    const normalizedFrame = normalizeFrame(frame, totalFrames);
    if (mode === "loop") return normalizedFrame + 1;
    if (normalizedFrame < steps) return normalizedFrame + 1;
    return totalFrames - normalizedFrame;
  }
  function createBadgeTextColorAnimation(options) {
    const steps = Math.max(2, Math.floor(options.steps));
    const mode = options.mode ?? "ping-pong";
    const totalFrames = mode === "ping-pong" ? steps * 2 : steps;
    const hasMidColor = "midColor" in options;
    const midStep = hasMidColor ? Math.min(steps - 1, Math.max(1, Math.floor(steps / 2))) : 1;
    const firstSpan = Math.max(1, midStep - 1);
    const secondSpan = Math.max(1, steps - midStep);
    return {
      totalFrames,
      stepIntervalMs: Math.max(1, Math.floor(options.stepIntervalMs)),
      nextFrame: (frame) => (normalizeFrame(frame, totalFrames) + 1) % totalFrames,
      getColor: (frame) => {
        const step = resolveStep(frame, steps, mode);
        if (!hasMidColor) {
          const ratio2 = (step - 1) / Math.max(1, steps - 1);
          return mixColor(options.startColor, options.endColor, ratio2);
        }
        if (step <= midStep) {
          const ratio2 = (step - 1) / firstSpan;
          return mixColor(options.startColor, options.midColor, ratio2);
        }
        const ratio = (step - midStep) / secondSpan;
        return mixColor(options.midColor, options.endColor, ratio);
      }
    };
  }

  // src/settings/selection-caption-style.ts
  var DEFAULT_SELECTION_CAPTION_STYLE = "click-to-delete";
  var SELECTION_CAPTION_STYLES = [
    "none",
    "click-to-delete",
    "tag-id-class",
    "selector",
    "full-xpath"
  ];
  function normalizeSelectionCaptionStyle(raw) {
    if (raw === "click-to-copy") return "click-to-delete";
    return SELECTION_CAPTION_STYLES.includes(raw) ? raw : DEFAULT_SELECTION_CAPTION_STYLE;
  }
  async function getSelectionCaptionStyle() {
    const data = await ext.storage.local.get(SELECTION_CAPTION_STYLE_KEY);
    return normalizeSelectionCaptionStyle(data[SELECTION_CAPTION_STYLE_KEY]);
  }

  // src/storage.ts
  async function getNotificationSeconds() {
    const data = await ext.storage.local.get(STORAGE_KEY);
    const raw = data[STORAGE_KEY];
    if (typeof raw !== "number" || !Number.isInteger(raw) || raw < 0 || raw > 10) {
      return DEFAULT_NOTIFICATION_SECONDS;
    }
    return raw;
  }
  async function getLocale() {
    const data = await ext.storage.local.get(LOCALE_STORAGE_KEY);
    const raw = data[LOCALE_STORAGE_KEY];
    if (typeof raw === "string") {
      const normalized = normalizeLocaleCode(raw);
      if (isLocale(normalized)) {
        if (normalized !== raw) {
          await ext.storage.local.set({ [LOCALE_STORAGE_KEY]: normalized });
        }
        return normalized;
      }
    }
    return await detectLocale2();
  }
  async function ensureLocaleInStorage() {
    const data = await ext.storage.local.get([
      LOCALE_STORAGE_KEY,
      LOCALE_USER_SELECTED_KEY,
      LOCALE_DETECT_VERSION_KEY
    ]);
    if (data[LOCALE_USER_SELECTED_KEY] && isLocale(data[LOCALE_STORAGE_KEY])) {
      return;
    }
    const version = data[LOCALE_DETECT_VERSION_KEY];
    if (version === LOCALE_DETECT_VERSION && isLocale(data[LOCALE_STORAGE_KEY])) {
      return;
    }
    const detected = await detectLocale2();
    await ext.storage.local.set({
      [LOCALE_STORAGE_KEY]: detected,
      [LOCALE_DETECT_VERSION_KEY]: LOCALE_DETECT_VERSION
    });
  }
  async function getAllElementsOutlineEnabled() {
    const data = await ext.storage.local.get(ALL_ELEMENTS_OUTLINE_ENABLED_KEY);
    return data[ALL_ELEMENTS_OUTLINE_ENABLED_KEY] === true;
  }
  async function getAllElementsFillEnabled() {
    const data = await ext.storage.local.get(ALL_ELEMENTS_FILL_ENABLED_KEY);
    return data[ALL_ELEMENTS_FILL_ENABLED_KEY] === true;
  }

  // src/panel-popup/constants.ts
  var PANEL_POPUP_PAGE = "panel-popup-page.html";
  var PANEL_POPUP_SESSION_TAB_KEY = "panelPopupTab";
  var PANEL_PAGE_CONFIG = {
    pageHtml: PANEL_POPUP_PAGE,
    sessionTabKey: PANEL_POPUP_SESSION_TAB_KEY,
    logLabel: "Element Deleter"
  };

  // ../lib/our/toast/index.ts
  function createToastUiClasses(prefix) {
    return {
      toast: `${prefix}-toast`,
      toastLabel: `${prefix}-toast-label`,
      toastStatus: `${prefix}-toast-status`,
      toastTarget: `${prefix}-toast-target`,
      toastLeading: `${prefix}-toast-leading`,
      toastMark: `${prefix}-toast-mark`,
      toastActions: `${prefix}-toast-actions`,
      toastStack: `${prefix}-toast-stack`
    };
  }

  // src/ui-config.ts
  var UI_CLASS_PREFIX = "dd";
  var toastStructureClasses = createToastUiClasses(UI_CLASS_PREFIX);
  var TOAST_UI = {
    ...toastStructureClasses,
    toastDeleted: toastStructureClasses.toast,
    toastRestored: `${toastStructureClasses.toast} is-restored`,
    iconBtn: `${UI_CLASS_PREFIX}-icon-btn`
  };

  // src/about.ts
  function buildAboutListItems(copy) {
    return copy.aboutBullets.map((text, index) => ({
      iconKind: "feature",
      iconHtml: ABOUT_BULLET_ICONS[index] ?? ABOUT_BULLET_ICONS[0],
      text
    }));
  }

  // src/brand.ts
  var PANEL_TITLE = "ELEMENT DELETER";

  // ../lib/our/icons.ts
  function stripComment3(svg) {
    return svg.replace(/<!--[\s\S]*?-->\s*/g, "").trim();
  }
  function inlineSvg(raw) {
    return stripComment3(raw).replace(/fill="#000000"/g, 'fill="currentColor"');
  }
  var MD2IT2 = inlineSvg(md2it_default);

  // ../lib/our/panel-popup/page-path.ts
  function panelPagePath(pageHtml, panelTab, extraParams, tabQueryParam = "tab") {
    const params = new URLSearchParams({ [tabQueryParam]: panelTab, ...extraParams });
    return `${pageHtml}?${params.toString()}`;
  }

  // ../lib/our/panel-popup/open-action-popup.ts
  function openPanelInActionPopup(config, panelTab, target, fallbackOpenInTab, extraParams) {
    const { tabId, windowId } = target;
    const popup = panelPagePath(
      config.pageHtml,
      panelTab,
      extraParams,
      config.tabQueryParam
    );
    const setPopupDetails = tabId !== void 0 ? { tabId, popup } : { popup };
    const clearPopupDetails = tabId !== void 0 ? { tabId, popup: "" } : { popup: "" };
    void (async () => {
      await ext.action.setPopup(setPopupDetails);
      try {
        const openPopup = ext.action.openPopup;
        if (!openPopup) throw new Error("action.openPopup unavailable");
        await openPopup({ windowId });
      } catch (err) {
        console.warn(`[${config.logLabel}] openPopup panel failed, using tab:`, err);
        await fallbackOpenInTab(panelTab);
      } finally {
        await ext.action.setPopup(clearPopupDetails);
      }
    })();
  }

  // ../lib/our/panel-tab/index.ts
  var PANEL_TAB_MODE_PARAM = "mode";
  var PANEL_TAB_MODE_VALUE = "tab";
  function panelTabPath(pageHtml, panelTab, modeParam = PANEL_TAB_MODE_PARAM, modeValue = PANEL_TAB_MODE_VALUE, tabQueryParam = "tab") {
    const params = new URLSearchParams({
      [tabQueryParam]: panelTab,
      [modeParam]: modeValue
    });
    return `${pageHtml}?${params.toString()}`;
  }
  async function openPanelPageInTab(panelTabPathValue, logLabel) {
    try {
      await ext.tabs.create({
        url: ext.runtime.getURL(panelTabPathValue),
        active: true
      });
    } catch (err) {
      console.error(`[${logLabel}] panel tab failed:`, err);
    }
  }

  // src/panel-tab/open.ts
  function panelTabPath2(panelTab) {
    return panelTabPath(PANEL_PAGE_CONFIG.pageHtml, panelTab);
  }
  async function openPanelInTab(panelTab) {
    await openPanelPageInTab(panelTabPath2(panelTab), PANEL_PAGE_CONFIG.logLabel);
  }

  // src/panel-popup/open.ts
  function openPanelInActionPopup2(panelTab, target) {
    openPanelInActionPopup(
      PANEL_PAGE_CONFIG,
      panelTab,
      target,
      openPanelInTab
    );
  }
  function openPanelFromSender(panelTab, senderTab) {
    openPanelInActionPopup2(panelTab, {
      tabId: senderTab?.id,
      windowId: senderTab?.windowId
    });
  }

  // src/page-operability/constants.ts
  var RESTRICTED_NOTICE_POPUP = "blocked-notice.html";
  var RESTRICTED_NOTICE_MIN_MS = 4e3;
  var RESTRICTED_NOTICE_SESSION_KEY = "restrictedNotice";
  var RESTRICTED_NOTICE_CONFIG = {
    popupHtml: RESTRICTED_NOTICE_POPUP,
    sessionKey: RESTRICTED_NOTICE_SESSION_KEY,
    logLabel: "Element Deleter"
  };

  // ../lib/our/page-operability/content-probe.ts
  var PROBE_DOCUMENT_OPERABILITY = "PROBE_DOCUMENT_OPERABILITY";

  // ../lib/our/page-operability/can-operate.ts
  function scriptingTarget(tabId, frameId) {
    return frameId !== void 0 && frameId !== 0 ? { tabId, frameIds: [frameId] } : { tabId };
  }
  function messageOptions(frameId) {
    return frameId !== void 0 && frameId !== 0 ? { frameId } : void 0;
  }
  async function canOperateOnTab(tabId, frameId) {
    try {
      const response = await ext.tabs.sendMessage(
        tabId,
        { type: PROBE_DOCUMENT_OPERABILITY },
        messageOptions(frameId)
      );
      if (response === true) return true;
      if (response === false) return false;
    } catch {
    }
    try {
      const [result] = await ext.scripting.executeScript({
        target: scriptingTarget(tabId, frameId),
        func: probeDocumentOperability
      });
      return result?.result === true;
    } catch {
      return false;
    }
  }

  // ../lib/our/page-operability/show-notice.ts
  async function showBlockedNotice(tabId, config, payload, windowId) {
    const { popupHtml, sessionKey, logLabel } = config;
    void ext.storage.session.set({
      [sessionKey]: { ...payload, tabId }
    });
    const noticeUrl = ext.runtime.getURL(popupHtml);
    let winId = windowId;
    if (winId === void 0) {
      try {
        const tab = await ext.tabs.get(tabId);
        winId = tab.windowId;
      } catch {
      }
    }
    try {
      await ext.action.setPopup({ tabId, popup: popupHtml });
      const openPopup = ext.action.openPopup;
      if (openPopup && winId !== void 0) {
        await openPopup({ windowId: winId });
        return;
      }
      throw new Error("action.openPopup unavailable");
    } catch (err) {
      console.warn(`[${logLabel}] openPopup notice failed, using tab:`, err);
      try {
        await ext.tabs.create({
          url: `${noticeUrl}?mode=tab`,
          active: true
        });
      } catch (err2) {
        console.error(`[${logLabel}] blocked notice tab failed:`, err2);
      }
    } finally {
      await ext.action.setPopup({ tabId, popup: "" });
    }
  }

  // ../lib/our/page-operability/messages.ts
  var BLOCKED_NOTICE_DISMISSED = "BLOCKED_NOTICE_DISMISSED";
  function isBlockedNoticeDismissedMessage(message) {
    if (typeof message !== "object" || message === null) return false;
    const m = message;
    return m.type === BLOCKED_NOTICE_DISMISSED && typeof m.tabId === "number";
  }

  // src/page-operability/notice.ts
  var restrictedNoticeCache = null;
  async function restrictedNoticeDismissMs() {
    const seconds = await getNotificationSeconds();
    if (seconds <= 0) return RESTRICTED_NOTICE_MIN_MS;
    return seconds * 1e3;
  }
  async function getRestrictedNoticeDismissMs() {
    return restrictedNoticeDismissMs();
  }
  async function refreshRestrictedNoticeCache() {
    const [locale, dismissMs] = await Promise.all([
      getLocale(),
      restrictedNoticeDismissMs()
    ]);
    restrictedNoticeCache = { text: t(locale).restrictedPageNotice, dismissMs };
  }
  async function showRestrictedNotice(tabId, windowId) {
    if (!restrictedNoticeCache) {
      await refreshRestrictedNoticeCache();
    }
    await showBlockedNotice(
      tabId,
      RESTRICTED_NOTICE_CONFIG,
      restrictedNoticeCache,
      windowId
    );
  }

  // ../lib/our/pin.ts
  async function isActionOnToolbar(action) {
    if (typeof action.getUserSettings !== "function") return null;
    try {
      const settings = await action.getUserSettings();
      return settings.isOnToolbar === true;
    } catch {
      return null;
    }
  }
  function onActionToolbarChanged(action, listener) {
    const handler = (change) => {
      if (typeof change.isOnToolbar === "boolean") {
        listener(change.isOnToolbar);
      }
    };
    if (typeof action.onUserSettingsChanged?.addListener === "function") {
      action.onUserSettingsChanged.addListener(handler);
      return () => {
        action.onUserSettingsChanged?.removeListener(handler);
      };
    }
    let stopped = false;
    const poll = async () => {
      while (!stopped) {
        const pinned = await isActionOnToolbar(action);
        if (pinned === true) {
          listener(true);
          return;
        }
        await new Promise((resolve) => globalThis.setTimeout(resolve, 750));
      }
    };
    void poll();
    return () => {
      stopped = true;
    };
  }

  // ../lib/our/welcome/background.ts
  var welcomePinWatchers = /* @__PURE__ */ new Map();
  function stopWelcomePinWatcher(tabId) {
    welcomePinWatchers.get(tabId)?.();
    welcomePinWatchers.delete(tabId);
  }
  function notifyWelcomePinned(tabId, messageType) {
    void ext.tabs.sendMessage(tabId, { type: messageType, pinned: true }).catch(() => {
    });
    stopWelcomePinWatcher(tabId);
  }
  function watchWelcomePinStatus(tabId, config) {
    stopWelcomePinWatcher(tabId);
    void isActionOnToolbar(ext.action).then((pinned) => {
      if (pinned === true) notifyWelcomePinned(tabId, config.pinStatusChangedMessageType);
    });
    const stop = onActionToolbarChanged(ext.action, (pinned) => {
      if (!pinned) return;
      notifyWelcomePinned(tabId, config.pinStatusChangedMessageType);
    });
    welcomePinWatchers.set(tabId, stop);
  }
  async function openWelcomeTab(config, data) {
    await ext.storage.session.set({
      [config.sessionDataKey]: data
    });
    try {
      await ext.tabs.create({
        url: ext.runtime.getURL(config.pageHtml),
        active: true
      });
    } catch (err) {
      console.error(`[${config.logLabel}] welcome tab failed:`, err);
    }
  }

  // ../lib/our/welcome/step-icon.ts
  function welcomeStepIcon(raw, size = 14) {
    return raw.replace("<svg ", `<svg width="${size}" height="${size}" `);
  }

  // src/welcome/constants.ts
  var WELCOME_PAGE = "welcome.html";
  var WELCOME_SESSION_DATA_KEY = "welcomeData";
  var WELCOME_TAB_CONFIG = {
    pageHtml: WELCOME_PAGE,
    sessionDataKey: WELCOME_SESSION_DATA_KEY,
    logLabel: "Element Deleter"
  };
  var WELCOME_PIN_WATCH_CONFIG = {
    pinStatusChangedMessageType: "PIN_STATUS_CHANGED"
  };

  // src/welcome/data.ts
  function buildWelcomeLocalePayload(locale, extensionName) {
    const strings = t(locale);
    return {
      locale,
      dir: isRtlLocale(locale) ? "rtl" : "ltr",
      headerSubtitle: strings.panelSubtitle,
      pinHeading: strings.welcomePin,
      pinStep1: strings.welcomePinStep1,
      pinStep2: strings.welcomePinStep2,
      pinStep3: strings.welcomePinStep3,
      aboutHeading: strings.tabAbout,
      aboutItems: buildAboutListItems(strings),
      langAriaLabel: strings.tabSettings
    };
  }
  function buildWelcomeData(locale, extensionName, options) {
    const isPinned = options?.isPinned === true;
    const perLocale = Object.fromEntries(
      LOCALES.map((code) => [code, buildWelcomeLocalePayload(code, extensionName)])
    );
    const current = perLocale[locale];
    return {
      extensionName,
      locale,
      dir: current.dir,
      headerLogoSvg: toolbarWelcomeIconSvg(),
      headerTitle: PANEL_TITLE,
      headerSubtitle: current.headerSubtitle,
      iconSvg: toolbarWelcomeIconSvg(),
      pinHeading: current.pinHeading,
      pinStep1: current.pinStep1,
      pinStep2: current.pinStep2,
      pinStep3: current.pinStep3,
      puzzleIcon: welcomeStepIcon(PUZZLE),
      pinIcon: welcomeStepIcon(PIN),
      arrowUpIcon: welcomeStepIcon(ARROW_UP, 28),
      pinHintIcon: welcomeStepIcon(PIN, 16),
      heartIcon: welcomeStepIcon(HEART, 56),
      isPinned,
      aboutHeading: current.aboutHeading,
      aboutItems: current.aboutItems,
      hasAbout: true,
      hasLocales: true,
      locales: [...LOCALES],
      localeLabels: LOCALE_BUTTON_LABELS,
      langAriaLabel: current.langAriaLabel,
      perLocale
    };
  }

  // src/welcome/background.ts
  function stopWelcomePinWatcher2(tabId) {
    stopWelcomePinWatcher(tabId);
  }
  function watchWelcomePinStatus2(tabId) {
    watchWelcomePinStatus(tabId, WELCOME_PIN_WATCH_CONFIG);
  }
  async function showWelcome() {
    const locale = await getLocale();
    const manifest = ext.runtime.getManifest();
    const isPinned = await isActionOnToolbar(ext.action);
    await openWelcomeTab(
      WELCOME_TAB_CONFIG,
      buildWelcomeData(locale, manifest.name, { isPinned })
    );
  }

  // src/background.ts
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
    mode: "ping-pong"
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
          runningBadgeTextAnimation.nextFrame(currentFrame)
        );
        void syncToolbarBadge(tabId);
      }, runningBadgeTextAnimation.stepIntervalMs)
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
      }, BADGE_FLASH_MS)
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
      }, dismissMs)
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
          color: visuals.backgroundColor ?? DELETER_ACTIVE_COLOR
        });
        const setBadgeTextColor = ext.action.setBadgeTextColor;
        await setBadgeTextColor?.({ tabId, color: visuals.textColor ?? BADGE_TEXT_COLOR });
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
        backgroundColor: BADGE_RESTORED_BG_COLOR
      });
      return;
    }
    if (tabBlockedBadge.get(tabId)) {
      clearRunningBadgeAnimation(tabId);
      await setToolbarBadge(tabId, {
        text: BADGE_BLOCKED_TEXT,
        backgroundColor: BADGE_BLOCKED_BG_COLOR,
        textColor: BADGE_BLOCKED_TEXT_COLOR
      });
      return;
    }
    if (getTabActiveState(tabId)) {
      ensureRunningBadgeAnimation(tabId);
      const frame = runningBadgeAnimationFrame.get(tabId) ?? 0;
      await setToolbarBadge(tabId, {
        text: BADGE_RUNNING_TEXT,
        backgroundColor: BADGE_RUNNING_BG_COLOR,
        textColor: runningBadgeTextAnimation.getColor(frame)
      });
      return;
    }
    clearRunningBadgeAnimation(tabId);
    await setToolbarBadge(tabId, { text: "" });
  }
  async function injectContent(tabId, frameId) {
    try {
      const target = frameId !== void 0 && frameId !== 0 ? { tabId, frameIds: [frameId] } : { tabId, allFrames: true };
      await ext.scripting.executeScript({
        target,
        files: ["app/content.js"]
      });
      return true;
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
      const response = frameId !== void 0 && frameId !== 0 ? await ext.tabs.sendMessage(tabId, message, { frameId }) : await ext.tabs.sendMessage(tabId, message);
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
      allElementsFillEnabled
    ] = await Promise.all([
      getNotificationSeconds(),
      getLocale(),
      getSelectionCaptionStyle(),
      getAllElementsOutlineEnabled(),
      getAllElementsFillEnabled()
    ]);
    return {
      notificationSeconds,
      locale,
      selectionCaptionStyle,
      allElementsOutlineEnabled,
      allElementsFillEnabled
    };
  }
  function settingsUpdatedMessage(settings) {
    return { type: "SETTINGS_UPDATED", ...settings };
  }
  async function sendWithInject(tabId, message, frameId) {
    if (await sendToTab(tabId, message, frameId)) return true;
    if (!await injectContent(tabId, frameId)) return false;
    return sendToTab(tabId, message, frameId);
  }
  async function setTabActive(tabId, active, windowId) {
    if (active && !await canOperateOnTab(tabId)) {
      setTabActiveState(tabId, false);
      await syncIconForTab(tabId);
      await showBlockedPageFeedback(tabId, windowId);
      return;
    }
    const reached = active ? await sendWithInject(tabId, { type: "SET_ACTIVE", active: true }) : await sendToTab(tabId, { type: "SET_ACTIVE", active: false });
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
    if (!await canOperateOnTab(tabId)) {
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
    "audio"
  ];
  var ACTION_MENU_EMOJI = {
    settings: "⚙️",
    shortcuts: "⌨️",
    about: "ℹ️"
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
        title: actionMenuTitle(strings.titleSettings, ACTION_MENU_EMOJI.settings, locale),
        contexts: ["action"]
      });
      await createContextMenuItem({
        id: CONTEXT_MENU_SHORTCUTS,
        title: actionMenuTitle(
          strings.titleShortcuts,
          ACTION_MENU_EMOJI.shortcuts,
          locale
        ),
        contexts: ["action"]
      });
      await createContextMenuItem({
        id: CONTEXT_MENU_ABOUT,
        title: actionMenuTitle(strings.titleAbout, ACTION_MENU_EMOJI.about, locale),
        contexts: ["action"]
      });
      await createContextMenuItem({
        id: CONTEXT_MENU_DELETE,
        title: strings.contextMenuDeleteElement,
        contexts: [...PAGE_CONTEXT_MENU_CONTEXTS]
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
    toggleTab
  });
  registerPrefixHintOperabilityListeners({
    canOperateOnTab,
    onBlockedOnTab: showBlockedPageFeedback
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
        if (!await canOperateOnTab(tabId, frameId)) {
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
    (message, sender) => {
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
    }
  );
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
    }
  });
  registerExtensionIconStateListeners2();
  ext.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    const secondsChange = changes.notificationSeconds;
    const localeChange = changes.locale;
    const selectionCaptionChange = changes.selectionCaptionStyle;
    const outlineChange = changes.allElementsOutlineEnabled;
    const fillChange = changes.allElementsFillEnabled;
    if (!secondsChange && !localeChange && !selectionCaptionChange && !outlineChange && !fillChange) {
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
})();
