"use strict";
(() => {
  // ../lib/our/all-elements-fill/css.ts
  var ALL_ELEMENTS_FILL_CSS = `* { background-color: hsl(150 50% 50% / 0.18) !important; color: #012292 !important; }
*:has(> *) { background-color: hsl(150 50% 50% / 0.18) !important; background-clip: padding-box !important; }
* * { background-color: hsl(175 58.33% 50% / 0.18) !important; }
* *:has(> *) { background-color: hsl(175 58.33% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * { background-color: hsl(200 66.67% 50% / 0.18) !important; }
* * *:has(> *) { background-color: hsl(200 66.67% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * * { background-color: hsl(225 75% 50% / 0.18) !important; }
* * * *:has(> *) { background-color: hsl(225 75% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * * * { background-color: hsl(250 83.33% 50% / 0.18) !important; }
* * * * *:has(> *) { background-color: hsl(250 83.33% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * * * * { background-color: hsl(150 50% 50% / 0.18) !important; }
* * * * * *:has(> *) { background-color: hsl(150 50% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * * * * * { background-color: hsl(175 58.33% 50% / 0.18) !important; }
* * * * * * *:has(> *) { background-color: hsl(175 58.33% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * * * * * * { background-color: hsl(200 66.67% 50% / 0.18) !important; }
* * * * * * * *:has(> *) { background-color: hsl(200 66.67% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * * * * * * * { background-color: hsl(225 75% 50% / 0.18) !important; }
* * * * * * * * *:has(> *) { background-color: hsl(225 75% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * * * * * * * * { background-color: hsl(250 83.33% 50% / 0.18) !important; }
* * * * * * * * * *:has(> *) { background-color: hsl(250 83.33% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * * * * * * * * * { background-color: hsl(150 50% 50% / 0.18) !important; }
* * * * * * * * * * *:has(> *) { background-color: hsl(150 50% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * * * * * * * * * * { background-color: hsl(175 58.33% 50% / 0.18) !important; }
* * * * * * * * * * * *:has(> *) { background-color: hsl(175 58.33% 50% / 0.18) !important; background-clip: padding-box !important; }`;
  function buildAllElementsFillCss(_config) {
    return ALL_ELEMENTS_FILL_CSS;
  }

  // ../lib/our/all-elements-style-inject.ts
  function setAllElementsStyleAtEnd(styleId, css) {
    const existing = document.getElementById(styleId);
    if (existing instanceof HTMLStyleElement) {
      existing.textContent = css;
      return;
    }
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = css;
    const anchor = document.body ?? document.documentElement;
    anchor.appendChild(style);
  }
  function removeAllElementsStyle(styleId) {
    document.getElementById(styleId)?.remove();
  }

  // ../lib/our/all-elements-fill/lifecycle.ts
  function enableAllElementsFill(config) {
    setAllElementsStyleAtEnd(config.styleId, buildAllElementsFillCss(config));
  }
  function disableAllElementsFill(styleId) {
    removeAllElementsStyle(styleId);
  }

  // ../lib/our/all-elements-outline/css.ts
  var DEFAULT_WIDTH_PX = 1;
  var DEFAULT_OFFSET_PX = -1;
  function assertRgba(value, label) {
    const trimmed = value.trim();
    if (!/^rgba\s*\(/i.test(trimmed)) {
      throw new Error(`${label} must be an rgba(...) color, got: ${value}`);
    }
  }
  function buildAllElementsOutlineCss(config) {
    assertRgba(config.rgba, "rgba");
    const width = config.widthPx ?? DEFAULT_WIDTH_PX;
    const offset = config.offsetPx ?? DEFAULT_OFFSET_PX;
    const outlineStyle = config.outlineStyle ?? "solid";
    const color = config.rgba.trim();
    return `
* {
  outline-width: ${width}px !important;
  outline-style: ${outlineStyle} !important;
  outline-color: ${color} !important;
  outline-offset: ${offset}px !important;
}
`.trim();
  }

  // ../lib/our/all-elements-outline/lifecycle.ts
  function enableAllElementsOutline(config) {
    setAllElementsStyleAtEnd(
      config.styleId,
      buildAllElementsOutlineCss(config)
    );
  }
  function disableAllElementsOutline(styleId) {
    removeAllElementsStyle(styleId);
  }

  // src/all-elements-page.ts
  var ALL_ELEMENTS_OUTLINE_STYLE_ID = "element-deleter-all-elements-outline";
  var ALL_ELEMENTS_FILL_STYLE_ID = "element-deleter-all-elements-fill";
  var OUTLINE_RGBA = "rgba(185, 28, 28, 0.48)";
  function removeAllElementsPageStyles() {
    applyAllElementsPageStyles({ outline: false, fill: false });
  }
  function applyAllElementsPageStyles(options) {
    if (options.outline) {
      enableAllElementsOutline({
        styleId: ALL_ELEMENTS_OUTLINE_STYLE_ID,
        rgba: OUTLINE_RGBA,
        outlineStyle: "dashed"
      });
    } else {
      disableAllElementsOutline(ALL_ELEMENTS_OUTLINE_STYLE_ID);
    }
    if (options.fill) {
      enableAllElementsFill({
        styleId: ALL_ELEMENTS_FILL_STYLE_ID
      });
    } else {
      disableAllElementsFill(ALL_ELEMENTS_FILL_STYLE_ID);
    }
  }

  // ../lib/our/api.ts
  var ext = typeof browser !== "undefined" ? browser : chrome;

  // src/hotkeys/commands.ts
  var PREFIX_ACTION_KEY = "D";

  // ../lib/our/hotkeys/prefix-hint-messages.ts
  var PREFIX_HINT_SHOW = "PREFIX_HINT_SHOW";
  var PREFIX_HINT_HIDE = "PREFIX_HINT_HIDE";
  var PREFIX_HINT_BLOCKED = "PREFIX_HINT_BLOCKED";

  // ../lib/our/hotkeys/prefix-hint-content.ts
  function createContentPrefixHintSink() {
    return {
      show(letter) {
        void ext.runtime.sendMessage({ type: PREFIX_HINT_SHOW, letter }).catch(() => {
        });
      },
      hide() {
        void ext.runtime.sendMessage({ type: PREFIX_HINT_HIDE }).catch(() => {
        });
      }
    };
  }

  // ../lib/our/hotkeys/platform.ts
  function isMacPlatform() {
    return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) || navigator.platform.toUpperCase().includes("MAC");
  }

  // ../lib/our/hotkeys/keys.ts
  var ESCAPE_KEY_LABEL = "Esc";
  var PREFIX_ACTION_TIMEOUT_MS = 3e3;
  var PREFIX_DOUBLE_ACTION_WINDOW_MS = 400;
  var PREFIX_CHORD_KEY = "x";
  function isEscapeKeyEvent(e) {
    return e.key === "Escape";
  }
  function letterToCode(letter) {
    return `Key${letter.toUpperCase()}`;
  }
  function isLetterKeyEvent(e, letter) {
    const expectedCode = letterToCode(letter);
    if (typeof e.code === "string" && e.code.length > 0) {
      return e.code === expectedCode;
    }
    return e.key.toLowerCase() === letter.toLowerCase();
  }
  function isModifierShiftKeyEvent(e, key, mac = isMacPlatform()) {
    const modifier = mac ? e.metaKey : e.ctrlKey;
    return modifier && e.shiftKey && isLetterKeyEvent(e, key);
  }
  function isModifierKeyEvent(e, key, options = {}, mac = isMacPlatform()) {
    const modifier = mac ? e.metaKey : e.ctrlKey;
    const shift = options.shift ?? false;
    const alt = options.alt ?? false;
    return modifier && Boolean(e.shiftKey) === shift && Boolean(e.altKey) === alt && isLetterKeyEvent(e, key);
  }
  function formatModifierShiftKeyLabel(key, mac = isMacPlatform()) {
    const mod = mac ? "⌘" : "Ctrl";
    return `${mod} + Shift + ${key.toUpperCase()}`;
  }
  function formatModifierKeyLabel(key, mac = isMacPlatform()) {
    const mod = mac ? "⌘" : "Ctrl";
    return `${mod} + ${key.toUpperCase()}`;
  }
  function formatPrefixChordLabel(mac = isMacPlatform()) {
    return formatModifierShiftKeyLabel(PREFIX_CHORD_KEY, mac);
  }
  function isPrefixChordKeyEvent(e, mac = isMacPlatform()) {
    return isModifierShiftKeyEvent(e, PREFIX_CHORD_KEY, mac);
  }
  function isPrefixChordHeld(e, mac = isMacPlatform()) {
    const modifier = mac ? e.metaKey : e.ctrlKey;
    return modifier && e.shiftKey;
  }
  function isPrefixActionKeyEvent(e, key) {
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    return isLetterKeyEvent(e, key);
  }
  function isEditableKeyboardTarget(target) {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    if (target.isContentEditable) return true;
    return !!target.closest('[contenteditable=""], [contenteditable="true"]');
  }

  // ../lib/our/hotkeys/prefix-mode.ts
  function createPrefixModeController(options) {
    let armed = false;
    let timeoutId;
    let singleActionTimeoutId;
    let chordHeld = false;
    let awaitingRelease = false;
    let firstActionPressAt = 0;
    const doubleActionWindowMs = options.doubleActionWindowMs ?? PREFIX_DOUBLE_ACTION_WINDOW_MS;
    const clearTimeoutIfAny = () => {
      if (timeoutId !== void 0) {
        clearTimeout(timeoutId);
        timeoutId = void 0;
      }
    };
    const clearSingleActionTimeout = () => {
      if (singleActionTimeoutId !== void 0) {
        clearTimeout(singleActionTimeoutId);
        singleActionTimeoutId = void 0;
      }
    };
    const disarm = () => {
      armed = false;
      awaitingRelease = false;
      chordHeld = false;
      firstActionPressAt = 0;
      clearTimeoutIfAny();
      clearSingleActionTimeout();
      options.hint.hide();
    };
    const canOperateOnPage = async () => !options.canShowPrefixHint || await options.canShowPrefixHint();
    const tryArmAfterPrefixRelease = () => {
      void (async () => {
        if (!await options.isEnabled()) {
          options.hint.hide();
          return;
        }
        if (!await canOperateOnPage()) {
          options.hint.hide();
          return;
        }
        arm(options.hintLetter);
      })();
    };
    const arm = (letter) => {
      clearTimeoutIfAny();
      armed = true;
      options.hint.show(letter);
      timeoutId = setTimeout(() => {
        disarm();
      }, PREFIX_ACTION_TIMEOUT_MS);
    };
    const onPrefixChordKeyDown = (e) => {
      if (!isPrefixChordKeyEvent(e)) return;
      chordHeld = true;
    };
    const onPrefixChordKeyUp = (e) => {
      if (!chordHeld && !awaitingRelease) return;
      if (isPrefixChordHeld(e)) return;
      chordHeld = false;
      awaitingRelease = false;
      clearTimeoutIfAny();
      tryArmAfterPrefixRelease();
    };
    const prepareAwaitAction = (_letter = options.hintLetter) => {
      clearTimeoutIfAny();
      armed = false;
      chordHeld = false;
      awaitingRelease = false;
      tryArmAfterPrefixRelease();
    };
    const fireSingleAction = () => {
      clearSingleActionTimeout();
      firstActionPressAt = 0;
      disarm();
      options.onAction();
    };
    const fireDoubleAction = () => {
      clearSingleActionTimeout();
      firstActionPressAt = 0;
      disarm();
      options.onDoubleAction?.();
    };
    const onPrefixActionKeyDown = (e) => {
      if (!isPrefixActionKeyEvent(e, options.hintLetter)) return;
      if (e.repeat) return;
      void (async () => {
        if (!await options.isEnabled()) return;
        const canOperate = await canOperateOnPage();
        if (!armed) {
          if (!canOperate) {
            e.preventDefault();
            e.stopPropagation();
            options.hint.hide();
            options.onPrefixHintBlocked?.();
          }
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (!canOperate) {
          disarm();
          options.onPrefixHintBlocked?.();
          return;
        }
        if (!options.onDoubleAction) {
          disarm();
          options.onAction();
          return;
        }
        const now = Date.now();
        if (firstActionPressAt > 0 && now - firstActionPressAt < doubleActionWindowMs) {
          fireDoubleAction();
          return;
        }
        firstActionPressAt = now;
        clearSingleActionTimeout();
        clearTimeoutIfAny();
        timeoutId = setTimeout(() => {
          disarm();
        }, PREFIX_ACTION_TIMEOUT_MS);
        singleActionTimeoutId = setTimeout(() => {
          singleActionTimeoutId = void 0;
          if (!armed) return;
          fireSingleAction();
        }, doubleActionWindowMs);
      })();
    };
    return {
      onPrefixChordKeyDown,
      onPrefixChordKeyUp,
      onPrefixActionKeyDown,
      prepareAwaitAction,
      arm,
      disarm
    };
  }

  // ../lib/our/hotkeys/registry.ts
  function handlerPropertyKey(namespace, slot) {
    return `__${namespace}HotkeyHandler_${slot}`;
  }
  function registerContentHotkey(namespace, slot, handler) {
    const win = window;
    const key = handlerPropertyKey(namespace, slot);
    const prev = win[key];
    if (prev) {
      window.removeEventListener("keydown", prev, true);
    }
    win[key] = handler;
    window.addEventListener("keydown", handler, true);
  }
  function unregisterContentHotkey(namespace, slot) {
    const win = window;
    const key = handlerPropertyKey(namespace, slot);
    const prev = win[key];
    if (!prev) return;
    window.removeEventListener("keydown", prev, true);
    win[key] = void 0;
  }

  // ../lib/our/hotkeys/prefix-content.ts
  function registerPrefixStartHotkey(options) {
    if (typeof window === "undefined" || window.top !== window) return void 0;
    const controller = createPrefixModeController({
      hintLetter: options.hintLetter,
      hint: createContentPrefixHintSink(),
      isEnabled: options.isEnabled,
      canShowPrefixHint: options.canShowPrefixHint,
      onPrefixHintBlocked: options.onPrefixHintBlocked,
      onAction: options.onAction,
      onDoubleAction: options.onDoubleAction,
      doubleActionWindowMs: options.doubleActionWindowMs
    });
    registerContentHotkey(options.namespace, "prefix-chord", (e) => {
      controller.onPrefixChordKeyDown(e);
    });
    const onKeyUp = (e) => {
      controller.onPrefixChordKeyUp(e);
    };
    const win = window;
    const keyUpProp = `__${options.namespace}_prefixKeyUp`;
    const prev = win[keyUpProp];
    if (prev) window.removeEventListener("keyup", prev, true);
    win[keyUpProp] = onKeyUp;
    window.addEventListener("keyup", onKeyUp, true);
    registerContentHotkey(options.namespace, "prefix-action", (e) => {
      controller.onPrefixActionKeyDown(e);
    });
    return controller;
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
  async function queryPrefixHintCanShowInContent() {
    return probeDocumentOperability();
  }
  function notifyPrefixHintBlockedOnBackground() {
    void ext.runtime.sendMessage({ type: PREFIX_HINT_BLOCKED }).catch(() => {
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

  // src/messages.ts
  var STORAGE_KEY = "notificationSeconds";
  var LOCALE_STORAGE_KEY = "locale";
  var LOCALE_USER_SELECTED_KEY = "localeUserSelected";
  var START_HOTKEY_ENABLED_KEY = "startHotkeyEnabled";
  var ESC_HOTKEY_ENABLED_KEY = "escHotkeyEnabled";
  var UNDO_HOTKEY_ENABLED_KEY = "undoHotkeyEnabled";
  var SELECTION_CAPTION_STYLE_KEY = "selectionCaptionStyle";
  var ALL_ELEMENTS_OUTLINE_ENABLED_KEY = "allElementsOutlineEnabled";
  var ALL_ELEMENTS_FILL_ENABLED_KEY = "allElementsFillEnabled";
  var DEFAULT_NOTIFICATION_SECONDS = 4;

  // src/hotkeys/settings.ts
  async function getStartHotkeyEnabled() {
    const data = await ext.storage.local.get(START_HOTKEY_ENABLED_KEY);
    return readBooleanSetting(data, START_HOTKEY_ENABLED_KEY);
  }
  async function setStartHotkeyEnabled(value) {
    await ext.storage.local.set({ [START_HOTKEY_ENABLED_KEY]: value });
  }
  async function getEscHotkeyEnabled() {
    const data = await ext.storage.local.get(ESC_HOTKEY_ENABLED_KEY);
    return readBooleanSetting(data, ESC_HOTKEY_ENABLED_KEY);
  }
  async function setEscHotkeyEnabled(value) {
    await ext.storage.local.set({ [ESC_HOTKEY_ENABLED_KEY]: value });
  }
  async function getUndoHotkeyEnabled() {
    const data = await ext.storage.local.get(UNDO_HOTKEY_ENABLED_KEY);
    return readBooleanSetting(data, UNDO_HOTKEY_ENABLED_KEY);
  }
  async function setUndoHotkeyEnabled(value) {
    await ext.storage.local.set({ [UNDO_HOTKEY_ENABLED_KEY]: value });
  }

  // src/hotkeys/background.ts
  var toggleCommandSuppress = createToggleCommandSuppressTracker();

  // src/hotkeys/keys.ts
  var ESC_HOTKEY_LABEL = ESCAPE_KEY_LABEL;
  var SHORTCUTS_PREFIX_CHORD_WIN_DISPLAY = "Ctrl+Shift+X";
  var SHORTCUTS_PREFIX_CHORD_MAC_DISPLAY = "Cmd+Shift+X";
  var SHORTCUTS_UNDO_WIN_DISPLAY = "Ctrl+Z";
  var SHORTCUTS_UNDO_MAC_DISPLAY = "⌘Z";
  function compactHotkeyLabel(label) {
    return label.replace(/\s*\+\s*/g, "+");
  }
  function getStartHotkeyChordLabel() {
    return compactHotkeyLabel(formatPrefixChordLabel());
  }
  function getStartHotkeyActionLabel() {
    return PREFIX_ACTION_KEY.toUpperCase();
  }
  function getStartHotkeyAriaLabel() {
    return `${getStartHotkeyChordLabel()} → ${getStartHotkeyActionLabel()}`;
  }
  function isEscHotkeyEvent(e) {
    return isEscapeKeyEvent(e);
  }
  function getUndoHotkeyLabel() {
    const label = formatModifierKeyLabel("Z");
    return label.startsWith("⌘") ? "⌘Z" : label;
  }
  function isUndoHotkeyEvent(e) {
    return isModifierKeyEvent(e, "z");
  }

  // src/hotkeys/registry.ts
  var HOTKEY_NAMESPACE = "elementDeleter";
  function registerContentHotkey2(slot, handler) {
    registerContentHotkey(HOTKEY_NAMESPACE, slot, handler);
  }
  function unregisterContentHotkey2(slot) {
    unregisterContentHotkey(HOTKEY_NAMESPACE, slot);
  }

  // src/hotkeys/deleter-content.ts
  var HOTKEY_NAMESPACE2 = "elementDeleter";
  var contentHotkeysMounted = false;
  function registerDeleterStartHotkey(requestToggle2) {
    registerPrefixStartHotkey({
      namespace: HOTKEY_NAMESPACE2,
      hintLetter: PREFIX_ACTION_KEY,
      isEnabled: getStartHotkeyEnabled,
      canShowPrefixHint: queryPrefixHintCanShowInContent,
      onPrefixHintBlocked: notifyPrefixHintBlockedOnBackground,
      onAction: requestToggle2
    });
  }
  function mountDeleterContentHotkeys(host, slots = ["esc", "undo"]) {
    if (typeof window !== "undefined" && window.top !== window) return;
    if (contentHotkeysMounted) return;
    contentHotkeysMounted = true;
    if (slots.includes("undo")) {
      registerContentHotkey2("undo", (e) => {
        if (!isUndoHotkeyEvent(e)) return;
        if (isEditableKeyboardTarget(e.target)) return;
        if (!host.isActive()) return;
        if (host.hasRestorableUndo()) {
          e.preventDefault();
          e.stopPropagation();
        }
        void (async () => {
          if (!await getUndoHotkeyEnabled()) return;
          const ui = await host.ensureUi();
          if (!ui.canUndo()) return;
          await ui.undoLast();
        })();
      });
    }
    if (slots.includes("esc")) {
      registerContentHotkey2("esc", (e) => {
        if (!isEscHotkeyEvent(e)) return;
        if (!host.isActive()) return;
        void (async () => {
          if (!await getEscHotkeyEnabled()) return;
          e.preventDefault();
          e.stopPropagation();
          host.deactivate();
        })();
      });
    }
  }
  function unmountDeleterContentHotkeys(slots = ["esc", "undo"]) {
    if (!contentHotkeysMounted) return;
    contentHotkeysMounted = false;
    for (const slot of slots) {
      unregisterContentHotkey2(slot);
    }
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
  function localeToHtmlLang(locale) {
    return locale.replace(/_/g, "-");
  }

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
  async function setSelectionCaptionStyle(style) {
    await ext.storage.local.set({ [SELECTION_CAPTION_STYLE_KEY]: style });
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
  async function setNotificationSeconds(value) {
    const clamped = Math.min(10, Math.max(0, Math.round(value)));
    await ext.storage.local.set({ [STORAGE_KEY]: clamped });
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
  async function setLocale(locale) {
    await ext.storage.local.set({
      [LOCALE_STORAGE_KEY]: locale,
      [LOCALE_USER_SELECTED_KEY]: true
    });
  }
  async function getAllElementsOutlineEnabled() {
    const data = await ext.storage.local.get(ALL_ELEMENTS_OUTLINE_ENABLED_KEY);
    return data[ALL_ELEMENTS_OUTLINE_ENABLED_KEY] === true;
  }
  async function setAllElementsOutlineEnabled(value) {
    await ext.storage.local.set({ [ALL_ELEMENTS_OUTLINE_ENABLED_KEY]: value });
  }
  async function getAllElementsFillEnabled() {
    const data = await ext.storage.local.get(ALL_ELEMENTS_FILL_ENABLED_KEY);
    return data[ALL_ELEMENTS_FILL_ENABLED_KEY] === true;
  }
  async function setAllElementsFillEnabled(value) {
    await ext.storage.local.set({ [ALL_ELEMENTS_FILL_ENABLED_KEY]: value });
  }

  // src/highlight/delete-restore-visual.ts
  var DELETE_RESTORE_STYLE_ID = "element-deleter-delete-restore-style";
  var DELETE_RESTORE_PAGE_CSS = `
.dd-delete-anim,
.dd-restore-anim {
  transform-origin: center center;
  outline-style: solid !important;
  outline-width: 0;
  outline-offset: -1px;
  box-shadow: none;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    box-shadow 0.2s ease,
    outline-width 0.2s ease;
}
.dd-delete-anim {
  outline-color: #b91c1c !important;
}
.dd-restore-anim {
  outline-color: #012292 !important;
}
.dd-delete-anim.is-out,
.dd-restore-anim.is-out {
  transform: scale(0.68);
  opacity: 0.15;
}
.dd-delete-anim.is-out {
  outline-width: 3px !important;
  box-shadow:
    0 0 0 3px rgba(185, 28, 28, 0.62),
    0 0 28px 10px rgba(185, 28, 28, 0.68),
    inset 0 0 48px 16px rgba(185, 28, 28, 0.48) !important;
}
.dd-restore-anim.is-out {
  outline-width: 3px !important;
  box-shadow:
    0 0 0 3px rgba(1, 34, 146, 0.62),
    0 0 28px 10px rgba(1, 34, 146, 0.68),
    inset 0 0 48px 16px rgba(1, 34, 146, 0.48) !important;
}
`;
  function ensurePageDeleteRestoreStyles() {
    if (document.getElementById(DELETE_RESTORE_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = DELETE_RESTORE_STYLE_ID;
    style.textContent = DELETE_RESTORE_PAGE_CSS;
    document.documentElement.appendChild(style);
  }
  var ELEMENT_ANIM_MS = 200;
  function runElementTransition(el, out) {
    ensurePageDeleteRestoreStyles();
    const node = el;
    const animClass = out ? "dd-delete-anim" : "dd-restore-anim";
    if (out && node === document.activeElement) {
      node.blur();
    }
    node.classList.add(animClass);
    if (out) {
      void node.offsetWidth;
      node.classList.add("is-out");
    } else {
      void node.offsetWidth;
      node.classList.remove("is-out");
    }
    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        node.removeEventListener("transitionend", onTransitionEnd);
        window.clearTimeout(timeoutId);
        if (!out) {
          node.classList.remove("dd-restore-anim", "is-out");
        }
        resolve();
      };
      const onTransitionEnd = (event) => {
        if (event.target !== node) return;
        if (event.propertyName !== "opacity" && event.propertyName !== "transform") {
          return;
        }
        finish();
      };
      node.addEventListener("transitionend", onTransitionEnd);
      const timeoutId = window.setTimeout(finish, ELEMENT_ANIM_MS + 75);
    });
  }

  // src/restore.ts
  function buildDocumentChildPath(element) {
    const path = [];
    let node = element;
    while (node.parentElement) {
      path.unshift(
        Array.prototype.indexOf.call(node.parentElement.children, node)
      );
      node = node.parentElement;
    }
    return path;
  }
  function findElementByDocumentChildPath(path) {
    if (path.length === 0) return null;
    let node = document.documentElement;
    for (const index of path) {
      if (index < 0 || index >= node.children.length) return null;
      node = node.children[index];
    }
    return node;
  }
  function parentMatchesEntry(el, entry) {
    return el.tagName === entry.parentTagName && el.namespaceURI === entry.parentNs;
  }
  function resolveUndoEntryParent(entry) {
    if (entry.parent.isConnected) return entry.parent;
    const resolved = findElementByDocumentChildPath(entry.parentPath);
    if (resolved?.isConnected && parentMatchesEntry(resolved, entry)) {
      entry.parent = resolved;
      entry.parentPath = buildDocumentChildPath(resolved);
      return resolved;
    }
    return null;
  }
  function getChildIndexPath(ancestor, descendant) {
    const path = [];
    let node = descendant;
    while (node && node !== ancestor) {
      const parent = node.parentElement;
      if (!parent) return null;
      const index = Array.prototype.indexOf.call(parent.children, node);
      if (index < 0) return null;
      path.unshift(index);
      node = parent;
    }
    if (node !== ancestor) return null;
    return path;
  }
  function findElementByChildIndexPath(root, path) {
    let node = root;
    for (const index of path) {
      if (index < 0 || index >= node.children.length) return null;
      node = node.children[index];
    }
    return node;
  }
  function parseElementForInsertion(outerHTML, parent) {
    const svgNS = "http://www.w3.org/2000/svg";
    if (parent.namespaceURI === svgNS) {
      const tmp = document.createElementNS(svgNS, "g");
      tmp.innerHTML = outerHTML;
      return tmp.firstElementChild;
    }
    const wrap = document.createElement("div");
    wrap.innerHTML = outerHTML;
    return wrap.firstElementChild;
  }
  var RestoreSystem = class {
    constructor(host, undo) {
      this.host = host;
      this.undo = undo;
    }
    canUndo() {
      return this.undo.stack.some((entry) => resolveUndoEntryParent(entry) !== null);
    }
    recordDeletion(snapshot) {
      const entry = {
        id: this.undo.allocId(),
        ...snapshot
      };
      this.undo.stack.push(entry);
      return entry.id;
    }
    async undoLast() {
      while (this.undo.stack.length > 0) {
        const entry = this.undo.stack.at(-1);
        if (!resolveUndoEntryParent(entry)) {
          this.undo.stack.pop();
          continue;
        }
        const ok = await this.restoreEntry(entry);
        if (ok) this.undo.stack.pop();
        return ok;
      }
      return false;
    }
    async undoById(id) {
      const index = this.undo.stack.findIndex((entry2) => entry2.id === id);
      if (index === -1) return false;
      const entry = this.undo.stack[index];
      const ok = await this.restoreEntry(entry);
      if (ok) this.undo.stack.splice(index, 1);
      return ok;
    }
    insertRestoredElement(entry, restored) {
      if (entry.nextSibling?.isConnected && entry.nextSibling.parentNode === entry.parent) {
        entry.parent.insertBefore(restored, entry.nextSibling);
        return;
      }
      const { children } = entry.parent;
      if (entry.childIndex >= 0 && entry.childIndex < children.length) {
        entry.parent.insertBefore(restored, children[entry.childIndex] ?? null);
        return;
      }
      entry.parent.appendChild(restored);
    }
    remapSubtreeUndoParents(removedRoot, restoredRoot) {
      for (const other of this.undo.stack) {
        if (other.parent === removedRoot) {
          other.parent = restoredRoot;
          other.parentPath = buildDocumentChildPath(restoredRoot);
          continue;
        }
        if (!removedRoot.contains(other.parent)) continue;
        const path = getChildIndexPath(removedRoot, other.parent);
        if (!path) continue;
        const mapped = findElementByChildIndexPath(restoredRoot, path);
        if (mapped && mapped.tagName === other.parent.tagName && mapped.namespaceURI === other.parent.namespaceURI) {
          other.parent = mapped;
          other.parentPath = buildDocumentChildPath(mapped);
        }
      }
    }
    async restoreEntry(entry) {
      if (!resolveUndoEntryParent(entry)) return false;
      const restored = parseElementForInsertion(entry.outerHTML, entry.parent);
      if (!restored) return false;
      try {
        restored.classList.add("dd-restore-anim", "is-out");
        this.insertRestoredElement(entry, restored);
        this.remapSubtreeUndoParents(entry.removedElement, restored);
        await runElementTransition(restored, false);
        restored.classList.remove("dd-restore-anim", "is-out");
        this.host.onRestored(restored);
        return true;
      } catch {
        restored.classList.remove("dd-restore-anim", "is-out");
        return restored.isConnected;
      }
    }
  };

  // ../lib/our/element-under-cursor.ts
  var MIN_IFRAME_PICK_PX = 4;
  function isPointInElement(el, x, y) {
    const rect = el.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }
  function listIframesWithin(root, isOurNode) {
    const out = [];
    const seen = /* @__PURE__ */ new Set();
    const scan = (node) => {
      for (const el of Array.from(node.querySelectorAll("iframe"))) {
        if (el instanceof HTMLIFrameElement && !seen.has(el) && !isOurNode(el)) {
          seen.add(el);
          out.push(el);
        }
      }
      for (const el of Array.from(node.querySelectorAll("*"))) {
        if (el instanceof Element && el.shadowRoot) {
          scan(el.shadowRoot);
        }
      }
    };
    scan(root);
    return out;
  }
  function isIframeHitTestable(iframe) {
    if (iframe.hasAttribute("hidden")) return false;
    const style = getComputedStyle(iframe);
    if (style.display === "none" || style.visibility === "hidden") return false;
    if (parseFloat(style.opacity) <= 0) return false;
    const rect = iframe.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }
  function isSignificantIframe(iframe) {
    const rect = iframe.getBoundingClientRect();
    return rect.width >= MIN_IFRAME_PICK_PX && rect.height >= MIN_IFRAME_PICK_PX;
  }
  function iframeContainsPoint(iframe, x, y) {
    const rect = iframe.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }
  function findIframeAtPoint(x, y, options) {
    let best = null;
    let bestArea = Infinity;
    for (const node of listIframesWithin(document, options.isOurNode)) {
      if (!isIframeHitTestable(node) || !isSignificantIframe(node) || !iframeContainsPoint(node, x, y)) {
        continue;
      }
      const rect = node.getBoundingClientRect();
      const area = rect.width * rect.height;
      if (area < bestArea) {
        bestArea = area;
        best = node;
      }
    }
    return best;
  }
  function pickElementUnderCursor(x, y, options) {
    const iframe = findIframeAtPoint(x, y, options);
    if (iframe) return iframe;
    const stack = document.elementsFromPoint(x, y);
    for (const node of stack) {
      if (!(node instanceof Element)) continue;
      if (options.isOurNode(node)) continue;
      if (node === document.documentElement || node === document.body) continue;
      return node;
    }
    return null;
  }

  // ../lib/our/copy/selector.ts
  var STABLE_ATTRS = [
    "data-testid",
    "data-test",
    "data-cy",
    "data-qa",
    "name",
    "aria-label"
  ];
  function escapeCssIdent(value) {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
      return CSS.escape(value);
    }
    return value.replace(/([^\w-])/g, "\\$1");
  }
  function escapeCssAttrValue(value) {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }
  function nthChild(element) {
    const parent = element.parentElement;
    if (!parent) return 1;
    return Array.prototype.indexOf.call(parent.children, element) + 1;
  }
  function siblingDisambiguation(element) {
    const parent = element.parentElement;
    if (!parent) return { needsClassNames: false, needsNthChild: false };
    const tag = element.tagName;
    const ownClasses = Array.from(element.classList);
    const sameTagSiblings = Array.from(parent.children).filter(
      (sibling) => sibling !== element && sibling.tagName === tag
    );
    return {
      needsClassNames: sameTagSiblings.length > 0,
      needsNthChild: sameTagSiblings.some(
        (sibling) => ownClasses.length === 0 || ownClasses.every((cls) => sibling.classList.contains(cls))
      )
    };
  }
  function preferredAttribute(element) {
    for (const name of STABLE_ATTRS) {
      const value = element.getAttribute(name);
      if (value) return { name, value };
    }
    return null;
  }
  function matchesOnly(selector, element, doc = element.ownerDocument) {
    try {
      const found = doc.querySelectorAll(selector);
      return found.length === 1 && found[0] === element;
    } catch {
      return false;
    }
  }
  function buildCssSegment(element) {
    if (element.id) {
      return `#${escapeCssIdent(element.id)}`;
    }
    const tag = element.tagName.toLowerCase();
    const attr = preferredAttribute(element);
    if (attr) {
      return `${tag}[${attr.name}="${escapeCssAttrValue(attr.value)}"]`;
    }
    const { needsClassNames, needsNthChild } = siblingDisambiguation(element);
    if (needsNthChild) {
      return `${tag}:nth-child(${nthChild(element)})`;
    }
    if (needsClassNames && element.classList.length > 0) {
      const classPart = Array.from(element.classList).map((name) => `.${escapeCssIdent(name)}`).join("");
      return `${tag}${classPart}`;
    }
    return tag;
  }
  function getCssSelector(element) {
    const doc = element.ownerDocument;
    if (element.id) {
      const byId = `#${escapeCssIdent(element.id)}`;
      if (matchesOnly(byId, element, doc)) return byId;
    }
    const parts = [];
    let node = element;
    while (node && node.nodeType === Node.ELEMENT_NODE) {
      parts.unshift(buildCssSegment(node));
      const candidate = parts.join(" > ");
      const hasIdAnchor = parts.some((part) => part.startsWith("#"));
      if (matchesOnly(candidate, element, doc) && (hasIdAnchor || !node.parentElement)) {
        return candidate;
      }
      node = node.parentElement;
    }
    return parts.join(" > ");
  }

  // ../lib/our/copy/xpath.ts
  function xpathSegment(element) {
    const tag = element.tagName.toLowerCase();
    const parent = element.parentElement;
    if (!parent) return tag;
    let sameTagCount = 0;
    for (const child of parent.children) {
      if (child.tagName === element.tagName) sameTagCount += 1;
    }
    if (sameTagCount <= 1) return tag;
    let index = 1;
    for (const child of parent.children) {
      if (child === element) break;
      if (child.tagName === element.tagName) index += 1;
    }
    return `${tag}[${index}]`;
  }
  function getFullXPath(element) {
    const parts = [];
    let node = element;
    while (node) {
      parts.unshift(xpathSegment(node));
      node = node.parentElement;
    }
    return `/${parts.join("/")}`;
  }

  // src/selection-caption.ts
  function formatTagIdClassCaption(el) {
    const tag = el.tagName.toLowerCase();
    const id = el.id.trim();
    if (id) return `${tag}#${id}`;
    const classes = Array.from(el.classList).map((c) => c.trim()).filter(Boolean);
    if (classes.length > 0) {
      return `${tag}.${classes.slice(0, 3).join(".")}`;
    }
    return tag;
  }
  function formatSelectionCaption(el, style, clickToDeleteLabel) {
    switch (style) {
      case "none":
        return "";
      case "click-to-delete":
        return clickToDeleteLabel;
      case "tag-id-class":
        return formatTagIdClassCaption(el);
      case "selector":
        return getCssSelector(el);
      case "full-xpath":
        return getFullXPath(el);
    }
  }
  function shouldShowSelectionCaption(selectionCaptionStyle) {
    return selectionCaptionStyle !== "none";
  }
  function resolveElementDescriptor(el, options) {
    return formatSelectionCaption(
      el,
      options.selectionCaptionStyle,
      options.clickToDeleteLabel
    );
  }
  var TOAST_RESTORED_DESCRIPTOR = "👍";
  function formatToastDescriptor(el, options) {
    switch (options.selectionCaptionStyle) {
      case "none":
      case "click-to-delete":
        return options.variant === "deleted" ? options.deletedCanBeRestored : TOAST_RESTORED_DESCRIPTOR;
      case "tag-id-class":
        return formatTagIdClassCaption(el);
      case "selector":
        return getCssSelector(el);
      case "full-xpath":
        return getFullXPath(el);
    }
  }

  // ../lib/our/highlight/classes.ts
  function createHighlightUiClasses(prefix) {
    return {
      highlightTarget: `${prefix}-highlight`,
      highlightFill: `${prefix}-highlight-fill`,
      highlightFrame: `${prefix}-highlight-frame`,
      elementLabel: `${prefix}-element-label`
    };
  }

  // ../lib/our/highlight/page-styles.ts
  function buildGenericHighlightPageCss(classes) {
    return `
.${classes.highlightTarget} {
  cursor: crosshair !important;
}
iframe {
  pointer-events: none !important;
  cursor: crosshair !important;
}
iframe.${classes.highlightFill} {
  /* Approximate highlight fill over varied iframe content (not exact rgba). */
  filter: sepia(0.65) saturate(11) hue-rotate(342deg) brightness(0.88) !important;
}
`;
  }
  function ensurePageHighlightStyles(config) {
    if (document.getElementById(config.styleId)) return;
    const style = document.createElement("style");
    style.id = config.styleId;
    style.textContent = config.pageCss;
    document.documentElement.appendChild(style);
  }
  function removePageHighlightStyles(styleId) {
    document.getElementById(styleId)?.remove();
  }

  // ../lib/our/highlight/visual.ts
  var HIGHLIGHT_FRAME_INSET = 2;
  var ElementHighlightVisual = class {
    constructor(host, pageStyles) {
      this.host = host;
      this.pageStyles = pageStyles;
    }
    elementLabelEl = null;
    highlightFrameEl = null;
    highlightTransitionToken = 0;
    highlightTransitionCleanup = null;
    bindExistingElements(elementLabelEl, highlightFrameEl) {
      this.elementLabelEl = elementLabelEl;
      this.highlightFrameEl = highlightFrameEl;
    }
    installPageStyles() {
      ensurePageHighlightStyles(this.pageStyles);
    }
    uninstallPageStyles() {
      removePageHighlightStyles(this.pageStyles.styleId);
    }
    clear() {
      this.cancelHighlightTransition();
      this.clearTargetMarkers();
      this.hideHighlightFrame();
      this.hideElementLabel();
    }
    syncElementLabel(target) {
      if (!this.host.getElementLabelEnabled() || !target) {
        this.hideElementLabel();
        return;
      }
      const label = this.ensureElementLabel();
      label.textContent = this.host.formatElementLabel(target);
      label.style.display = "block";
      this.syncElementLabelPosition(target);
    }
    render(target, options) {
      const { animateFrom } = options;
      const targetClass = this.host.classes.highlightTarget;
      this.cancelHighlightTransition();
      this.hideElementLabel();
      const animate = animateFrom !== null && animateFrom.isConnected && animateFrom !== target;
      if (!animate) {
        this.showHighlightFrameFor(target);
        target.classList.add(targetClass);
        this.syncIframeFill(target);
        this.syncElementLabel(target);
        return;
      }
      this.runHighlightTransition(animateFrom, target, options.isStillTarget);
      this.syncElementLabel(target);
    }
    refresh(target) {
      this.syncIframeFill(target);
      this.syncHighlightOverlay(target);
      this.syncElementLabel(target);
    }
    removeTargetClass(target) {
      target.classList.remove(this.host.classes.highlightTarget);
    }
    clearTargetMarkers() {
      this.clearIframeFill();
    }
    clearIframeFill() {
      const fillClass = this.host.classes.highlightFill;
      for (const node of Array.from(
        document.querySelectorAll(`iframe.${fillClass}`)
      )) {
        node.classList.remove(fillClass);
      }
    }
    rectOverlapArea(a, b) {
      const left = Math.max(a.left, b.left);
      const right = Math.min(a.right, b.right);
      const top = Math.max(a.top, b.top);
      const bottom = Math.min(a.bottom, b.bottom);
      if (right <= left || bottom <= top) return 0;
      return (right - left) * (bottom - top);
    }
    collectIframeFillTargets(target) {
      if (target instanceof HTMLIFrameElement) {
        return isIframeHitTestable(target) && isSignificantIframe(target) ? [target] : [];
      }
      const out = [];
      const targetRect = target.getBoundingClientRect();
      for (const node of listIframesWithin(target, (n) => this.host.isOurNode(n))) {
        if (!isIframeHitTestable(node) || !isSignificantIframe(node)) {
          continue;
        }
        const rect = node.getBoundingClientRect();
        const iframeArea = rect.width * rect.height;
        if (iframeArea <= 0) continue;
        if (this.rectOverlapArea(targetRect, rect) / iframeArea >= 0.5) {
          out.push(node);
        }
      }
      return out;
    }
    syncIframeFill(target) {
      const fillClass = this.host.classes.highlightFill;
      this.clearIframeFill();
      for (const iframe of this.collectIframeFillTargets(target)) {
        iframe.classList.add(fillClass);
      }
    }
    cancelHighlightTransition() {
      this.highlightTransitionToken += 1;
      this.highlightTransitionCleanup?.();
      this.highlightTransitionCleanup = null;
    }
    ensureHighlightFrame() {
      if (!this.highlightFrameEl) {
        const el = document.createElement("div");
        el.className = this.host.classes.highlightFrame;
        el.setAttribute(this.host.hostAttr, "true");
        el.setAttribute("aria-hidden", "true");
        this.host.shadow.insertBefore(el, this.host.shadow.firstChild);
        this.highlightFrameEl = el;
      }
      return this.highlightFrameEl;
    }
    hideHighlightFrame() {
      if (!this.highlightFrameEl) return;
      this.highlightFrameEl.style.display = "none";
    }
    showHighlightFrameFor(target) {
      const frame = this.ensureHighlightFrame();
      frame.style.display = "block";
      this.applyHighlightFrame(frame, target);
    }
    syncHighlightFrame(target) {
      const frame = this.highlightFrameEl;
      if (!frame || frame.style.display === "none") return;
      this.applyHighlightFrame(frame, target);
    }
    syncHighlightOverlay(target) {
      this.syncHighlightFrame(target);
      this.syncElementLabelPosition(target);
    }
    applyHighlightFrame(frame, target) {
      const rect = target.getBoundingClientRect();
      frame.style.top = `${rect.top}px`;
      frame.style.left = `${rect.left}px`;
      frame.style.width = `${rect.width}px`;
      frame.style.height = `${rect.height}px`;
      const style = getComputedStyle(target);
      frame.style.borderRadius = style.borderRadius;
      const clipPath = style.clipPath;
      frame.style.clipPath = clipPath && clipPath !== "none" ? clipPath : "";
    }
    runHighlightTransition(from, to, isStillTarget) {
      const frame = this.ensureHighlightFrame();
      const targetClass = this.host.classes.highlightTarget;
      const token = this.highlightTransitionToken;
      let done = false;
      if (frame.style.display !== "block") {
        frame.classList.add("is-instant");
        frame.style.display = "block";
        this.applyHighlightFrame(frame, from);
        frame.classList.remove("is-instant");
        void frame.offsetWidth;
      } else {
        frame.style.display = "block";
      }
      this.applyHighlightFrame(frame, to);
      const finish = () => {
        if (done) return;
        if (token !== this.highlightTransitionToken) return;
        if (isStillTarget && !isStillTarget(to)) return;
        done = true;
        this.highlightTransitionCleanup?.();
        this.highlightTransitionCleanup = null;
        this.showHighlightFrameFor(to);
        to.classList.add(targetClass);
        this.syncIframeFill(to);
        this.syncElementLabel(to);
      };
      const onTransitionEnd = (event) => {
        if (event.target !== frame) return;
        if (event.propertyName !== "width") return;
        finish();
      };
      frame.addEventListener("transitionend", onTransitionEnd);
      const timeoutId = window.setTimeout(finish, 225);
      this.highlightTransitionCleanup = () => {
        frame.removeEventListener("transitionend", onTransitionEnd);
        window.clearTimeout(timeoutId);
      };
    }
    ensureElementLabel() {
      if (!this.elementLabelEl) {
        const el = document.createElement("div");
        el.className = this.host.classes.elementLabel;
        el.setAttribute(this.host.hostAttr, "true");
        el.setAttribute("aria-hidden", "true");
        this.host.shadow.appendChild(el);
        this.elementLabelEl = el;
      }
      return this.elementLabelEl;
    }
    hideElementLabel() {
      if (!this.elementLabelEl) return;
      this.elementLabelEl.style.display = "none";
    }
    syncElementLabelPosition(target) {
      const el = this.elementLabelEl;
      if (!el || el.style.display === "none") return;
      const rect = target.getBoundingClientRect();
      const frameTop = rect.top - HIGHLIGHT_FRAME_INSET;
      const frameLeft = rect.left - HIGHLIGHT_FRAME_INSET;
      el.style.top = `${frameTop}px`;
      el.style.left = `${frameLeft}px`;
    }
  };

  // ../lib/our/highlight/selector.ts
  var HighlightSystem = class {
    highlighted = null;
    visual;
    host;
    pageStyles;
    domMutationObserver = null;
    lastPointerX = -1;
    lastPointerY = -1;
    highlightRefreshRaf = 0;
    boundMove;
    boundPointerMove;
    boundScroll;
    boundResize;
    constructor(options) {
      this.host = options.host;
      this.pageStyles = options.pageStyles;
      this.visual = new ElementHighlightVisual(this.host, this.pageStyles);
      this.boundMove = (e) => this.updateHighlightAt(e.clientX, e.clientY);
      this.boundPointerMove = (e) => {
        if (e.pointerType && e.pointerType !== "mouse") return;
        this.updateHighlightAt(e.clientX, e.clientY);
      };
      this.boundScroll = () => this.scheduleHighlightRefresh();
      this.boundResize = () => this.scheduleHighlightRefresh();
    }
    bindExistingElements(elementLabelEl, highlightFrameEl) {
      this.visual.bindExistingElements(elementLabelEl, highlightFrameEl);
    }
    activate() {
      this.visual.installPageStyles();
      this.lastPointerX = -1;
      this.lastPointerY = -1;
      this.domMutationObserver = new MutationObserver(
        () => this.scheduleHighlightRefresh()
      );
      this.domMutationObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class", "width", "height", "hidden"]
      });
      document.addEventListener("mousemove", this.boundMove, true);
      document.addEventListener("pointermove", this.boundPointerMove, true);
      document.addEventListener("scroll", this.boundScroll, true);
      window.addEventListener("resize", this.boundResize);
    }
    deactivate() {
      document.removeEventListener("mousemove", this.boundMove, true);
      document.removeEventListener("pointermove", this.boundPointerMove, true);
      document.removeEventListener("scroll", this.boundScroll, true);
      window.removeEventListener("resize", this.boundResize);
      this.domMutationObserver?.disconnect();
      this.domMutationObserver = null;
      if (this.highlightRefreshRaf) {
        cancelAnimationFrame(this.highlightRefreshRaf);
        this.highlightRefreshRaf = 0;
      }
      this.lastPointerX = -1;
      this.lastPointerY = -1;
      this.clear();
      removePageHighlightStyles(this.pageStyles.styleId);
    }
    getHighlighted() {
      return this.highlighted;
    }
    clear() {
      if (this.highlighted) {
        this.visual.removeTargetClass(this.highlighted);
        this.highlighted = null;
      }
      this.visual.clear();
    }
    clearIfTarget(target) {
      if (this.highlighted === target) {
        this.clear();
      }
    }
    syncElementLabel() {
      this.visual.syncElementLabel(this.highlighted);
    }
    updateHighlightAt(x, y) {
      this.lastPointerX = x;
      this.lastPointerY = y;
      const el = pickElementUnderCursor(x, y, {
        isOurNode: (node) => this.host.isOurNode(node)
      });
      if (!el) {
        this.clear();
        return;
      }
      this.setHighlighted(el);
    }
    scheduleHighlightRefresh() {
      if (this.highlightRefreshRaf) return;
      this.highlightRefreshRaf = requestAnimationFrame(() => {
        this.highlightRefreshRaf = 0;
        if (this.lastPointerX < 0) return;
        this.updateHighlightAt(this.lastPointerX, this.lastPointerY);
      });
    }
    setHighlighted(el) {
      if (this.highlighted === el) {
        if (el) this.visual.refresh(el);
        return;
      }
      const prev = this.highlighted;
      if (!el) {
        if (prev) this.visual.removeTargetClass(prev);
        this.highlighted = null;
        this.visual.clear();
        return;
      }
      if (prev) this.visual.removeTargetClass(prev);
      this.highlighted = el;
      this.visual.render(el, {
        animateFrom: prev,
        isStillTarget: (target) => this.highlighted === target
      });
    }
  };

  // src/highlight/deleter-page-styles.ts
  var DELETER_HIGHLIGHT_PAGE_CSS = `
ins.adsbygoogle.dd-highlight,
[id^="aswift_"][id$="_host"].dd-highlight {
  background-color: rgba(185, 28, 28, 0.22) !important;
}
`;

  // src/highlight/page-styles.ts
  var HIGHLIGHT_STYLE_ID = "element-deleter-highlight-style";
  var HIGHLIGHT_UI = createHighlightUiClasses("dd");
  var HIGHLIGHT_PAGE_CSS = buildGenericHighlightPageCss(HIGHLIGHT_UI) + DELETER_HIGHLIGHT_PAGE_CSS;
  var DELETER_HIGHLIGHT_PAGE_STYLE = {
    styleId: HIGHLIGHT_STYLE_ID,
    pageCss: HIGHLIGHT_PAGE_CSS
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
  var TOOLBAR_VIEWBOX = 24;
  var TOOLBAR_RADIUS_RATIO = 0.18;
  var TOOLBAR_PAD_RATIO = 0.1;
  function innerSvgMarkup(svg) {
    const match = svg.match(/<svg[\s\S]*?>([\s\S]*)<\/svg>/i);
    return match ? match[1].trim() : svg;
  }
  var trash2Inner = innerSvgMarkup(stripComment2(trash_2_default));
  function trashMarkGroup(stroke) {
    return `<g fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${trash2Inner}</g>`;
  }
  function extensionMarkSvg(options) {
    switch (options.variant) {
      case "toast":
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">${trashMarkGroup("#ffffff")}</svg>`;
      case "panel":
        return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">${trashMarkGroup("currentColor")}</svg>`;
    }
  }
  var ABOUT_BULLET_ICONS = [
    lucideUiIcon2(trash_2_default),
    lucideUiIcon2(circle_power_default),
    lucideUiIcon2(undo_2_default),
    ROTATE_CW,
    lucideUiIcon2(shield_check_default),
    lucideUiIcon2(shield_check_default)
  ];
  function toolbarWelcomeIconSvg(bg = INACTIVE_BG, size = 16) {
    const r = TOOLBAR_VIEWBOX * TOOLBAR_RADIUS_RATIO;
    const pad = TOOLBAR_VIEWBOX * TOOLBAR_PAD_RATIO;
    const scale = (TOOLBAR_VIEWBOX - pad * 2) / TOOLBAR_VIEWBOX;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${TOOLBAR_VIEWBOX} ${TOOLBAR_VIEWBOX}" aria-hidden="true"><rect width="${TOOLBAR_VIEWBOX}" height="${TOOLBAR_VIEWBOX}" rx="${r}" fill="${bg}"/><g fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(${pad} ${pad}) scale(${scale})">${trash2Inner}</g></svg>`;
  }

  // ../lib/our/toast/stack.ts
  var ToastStack = class {
    constructor(host, config) {
      this.host = host;
      this.config = config;
    }
    hide() {
      const { toast } = this.config.classes;
      this.host.shadow.querySelectorAll(`.${toast}`).forEach((n) => n.remove());
      this.host.shadow.getElementById(this.config.stackId)?.remove();
    }
    createStatusLabel(status, elementLabel) {
      const { toastLabel, toastStatus, toastTarget } = this.config.classes;
      const label = document.createElement("span");
      label.className = toastLabel;
      const statusEl = document.createElement("span");
      statusEl.className = toastStatus;
      statusEl.textContent = `${status}:`;
      const targetEl = document.createElement("span");
      targetEl.className = toastTarget;
      targetEl.textContent = elementLabel;
      if (elementLabel) {
        targetEl.title = elementLabel;
      }
      label.append(statusEl, targetEl);
      return label;
    }
    append(options) {
      const dismissSeconds = this.host.getNotificationSeconds();
      if (dismissSeconds <= 0) {
        return null;
      }
      const { className, markInnerHtml, fill } = options;
      const stack = this.ensureToastStack();
      stack.dir = this.host.isRtl() ? "rtl" : "ltr";
      const { toastLeading, toastMark, toastActions } = this.config.classes;
      const toast = document.createElement("div");
      toast.className = className;
      toast.setAttribute(this.config.hostAttr, "true");
      toast.style.pointerEvents = "auto";
      toast.dir = "ltr";
      const leading = document.createElement("div");
      leading.className = toastLeading;
      const mark = document.createElement("span");
      mark.className = toastMark;
      mark.innerHTML = markInnerHtml;
      leading.appendChild(mark);
      const actions = document.createElement("div");
      actions.className = toastActions;
      toast.append(leading, actions);
      fill({ toast, leading, actions });
      stack.appendChild(toast);
      const timer = setTimeout(() => {
        this.remove(toast);
      }, dismissSeconds * 1e3);
      toast.dataset.timerId = String(timer);
      return toast;
    }
    remove(toast) {
      const id = toast.dataset.timerId;
      if (id) clearTimeout(Number(id));
      toast.remove();
      const stack = this.host.shadow.getElementById(this.config.stackId);
      if (!stack) return;
      if (stack.childElementCount === 0) {
        stack.remove();
      }
    }
    ensureToastStack() {
      const { toastStack } = this.config.classes;
      let stack = this.host.shadow.getElementById(this.config.stackId);
      if (!stack) {
        stack = document.createElement("div");
        stack.id = this.config.stackId;
        stack.className = toastStack;
        stack.setAttribute(this.config.hostAttr, "true");
        stack.style.pointerEvents = "none";
      }
      this.host.shadow.appendChild(stack);
      return stack;
    }
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
  var UI_HOST_ATTR = "data-element-deleter-ui";
  var UI_CLASS_PREFIX = "dd";
  var TOAST_STACK_ID = "dd-toast-stack";
  var toastStructureClasses = createToastUiClasses(UI_CLASS_PREFIX);
  var TOAST_UI = {
    ...toastStructureClasses,
    toastDeleted: toastStructureClasses.toast,
    toastRestored: `${toastStructureClasses.toast} is-restored`,
    iconBtn: `${UI_CLASS_PREFIX}-icon-btn`
  };
  var TOAST_STACK_CONFIG = {
    stackId: TOAST_STACK_ID,
    hostAttr: UI_HOST_ATTR,
    classes: toastStructureClasses
  };
  var PANEL_FOOTER_CONFIG = {
    footerClassName: "dd-panel-footer"
  };

  // src/toast/deleter.ts
  var ToastSystem = class {
    constructor(host) {
      this.host = host;
      this.stack = new ToastStack(host, TOAST_STACK_CONFIG);
    }
    stack;
    showDeletedToast(elementLabel, undoId) {
      const s = this.host.getStrings();
      const markInnerHtml = extensionMarkSvg({ variant: "toast" });
      this.stack.append({
        className: TOAST_UI.toastDeleted,
        markInnerHtml,
        fill: ({ toast, leading, actions }) => {
          leading.append(
            this.stack.createStatusLabel(s.toastDeleted, elementLabel)
          );
          const btnRestore = document.createElement("button");
          btnRestore.type = "button";
          btnRestore.className = TOAST_UI.iconBtn;
          btnRestore.title = s.btnRestore;
          btnRestore.setAttribute("aria-label", s.btnRestore);
          btnRestore.innerHTML = UNDO_2;
          btnRestore.addEventListener("click", (e) => {
            e.stopPropagation();
            this.stack.remove(toast);
            void this.host.undoById(undoId);
          });
          const btnSettings = this.panelTriggerButton(
            "settings",
            COG,
            s.titleSettings
          );
          const btnInfo = this.panelTriggerButton("info", INFO, s.titleAbout);
          actions.append(btnRestore, btnSettings, btnInfo);
        }
      });
    }
    showRestoredToast(elementLabel) {
      const s = this.host.getStrings();
      const markInnerHtml = extensionMarkSvg({ variant: "toast" });
      this.stack.append({
        className: TOAST_UI.toastRestored,
        markInnerHtml,
        fill: ({ leading, actions }) => {
          leading.append(
            this.stack.createStatusLabel(s.toastRestored, elementLabel)
          );
          const btnSettings = this.panelTriggerButton(
            "settings",
            COG,
            s.titleSettings
          );
          const btnInfo = this.panelTriggerButton("info", INFO, s.titleAbout);
          actions.append(btnSettings, btnInfo);
        }
      });
    }
    hide() {
      this.stack.hide();
    }
    panelTriggerButton(tab, icon, title) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = TOAST_UI.iconBtn;
      btn.title = title;
      btn.innerHTML = icon;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.host.openPanel(tab);
      });
      return btn;
    }
  };

  // src/ui.ts
  var ROOT_ID = "element-deleter-root";
  var HOST_ATTR = "data-element-deleter-ui";
  var DeleterUI = class {
    host;
    shadow;
    notificationSeconds = 4;
    locale = "en";
    selectionCaptionStyle = "click-to-delete";
    elementActionInFlight = false;
    onDeactivate;
    toast;
    highlight;
    restore;
    onElementDeleted;
    onElementRestored;
    boundClick;
    constructor(onDeactivate, options) {
      this.onDeactivate = onDeactivate;
      this.onElementDeleted = options.onElementDeleted;
      this.onElementRestored = options.onElementRestored;
      this.boundClick = (e) => this.handleClick(e);
      const existing = document.getElementById(ROOT_ID);
      if (existing) {
        this.host = existing;
        this.shadow = existing.shadowRoot ?? existing.attachShadow({ mode: "open" });
      } else {
        this.host = document.createElement("div");
        this.host.id = ROOT_ID;
        this.host.setAttribute(HOST_ATTR, "true");
        this.host.style.cssText = "position:fixed;inset:0;z-index:2147483645;pointer-events:none;";
        document.documentElement.appendChild(this.host);
        this.shadow = this.host.attachShadow({ mode: "open" });
      }
      let style = this.shadow.querySelector("style");
      if (!style) {
        style = document.createElement("style");
        this.shadow.appendChild(style);
      }
      style.textContent = `.dd-panel-header {
  flex: 0 0 auto;
  padding: 1.125rem 1.125rem 0;
}

.dd-panel-divider {
  flex: 0 0 auto;
  width: 90%;
  height: 1px;
  margin-inline: auto;
  background: #b91c1c;
}

.dd-panel-title-row {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas: "stack";
  align-items: center;
}

.dd-panel-logo,
.dd-panel-heading {
  grid-area: stack;
}

.dd-panel-logo {
  display: flex;
  align-items: stretch;
  align-self: stretch;
  justify-self: start;
  line-height: 0;
  z-index: 1;
}

.dd-panel-logo svg {
  display: block;
  height: 100%;
  width: auto;
  aspect-ratio: 1;
  flex-shrink: 0;
}

.dd-panel-heading {
  justify-self: center;
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.12rem;
  min-width: 0;
  max-width: 100%;
  font-size: 0.82rem;
}

.dd-panel-title {
  margin: 0;
  font-size: inherit;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-align: center;
  text-transform: uppercase;
  color: #012292;
}

.dd-panel-subtitle {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1.2;
  white-space: nowrap;
  text-align: center;
  color: #666666;
}

.dd-panel-footer {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  gap: 0.55rem;
  margin-top: auto;
  padding: 1.125rem;
}

.dd-panel-footer a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: #999;
  border-radius: 0.35rem;
  text-decoration: none;
  background: transparent;
}

.dd-panel-footer a:hover,
.dd-panel-footer a:focus-visible {
  color: #b91c1c;
}

.dd-panel-footer svg {
  display: block;
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
}

:host(.dd-panel-popup) {
  display: flex;
  flex-direction: column;
  position: relative;
  inset: auto;
  width: 100%;
  min-height: 500px;
  height: auto;
  pointer-events: auto;
  z-index: 1;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.3;
  color: #1f2937;
}

:host(.dd-panel-popup) *,
:host(.dd-panel-popup) *::before,
:host(.dd-panel-popup) *::after {
  box-sizing: border-box;
}

:host(.dd-panel-popup) button:focus:not(:focus-visible),
:host(.dd-panel-popup) a:focus:not(:focus-visible) {
  outline: none;
}

:host(.dd-panel-popup) button:focus-visible,
:host(.dd-panel-popup) a:focus-visible,
:host(.dd-panel-popup) input:focus-visible {
  outline: 2px solid #b91c1c;
}

.dd-panel {
  display: flex;
  flex-direction: column;
  width: min(21rem, calc(100vw - 2rem));
  max-height: calc(100dvh - 2rem);
  overflow: hidden;
  color: #1f2937;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px) saturate(1.35);
  -webkit-backdrop-filter: blur(20px) saturate(1.35);
  border: 1px solid rgba(255, 255, 255, 0.78);
  box-shadow:
    0 18px 48px rgba(185, 28, 28, 0.16),
    0 8px 24px rgba(0, 0, 0, 0.22);
}

.dd-panel--surface-popup {
  flex: 1 1 auto;
  width: 100%;
  min-height: 500px;
  max-height: none;
  border-radius: 0;
  border: none;
  box-shadow: none;
}

.dd-panel-main {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
}

.dd-panel--surface-popup > .dd-panel-main {
  align-items: stretch;
  direction: ltr;
}

.dd-panel-menu {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 0.75rem 0 0.75rem 0.75rem;
  padding: 0.35rem;
  border-radius: 0.5rem;
  background: rgba(185, 28, 28, 0.06);
}

.dd-panel--surface-popup .dd-panel-menu {
  --dd-menu-gap: 0.3rem;
  flex: 0 0 2.85rem;
  width: 2.85rem;
  align-self: stretch;
  justify-content: flex-start;
  gap: var(--dd-menu-gap);
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  margin-inline-start: 0.5rem;
  margin-inline-end: 0.3rem;
  padding-block-start: var(--dd-menu-gap);
  padding-inline-end: var(--dd-menu-gap);
  padding-block-end: var(--dd-menu-gap);
  padding-inline-start: var(--dd-menu-gap);
}

.dd-panel-content {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.dd-panel--surface-popup .dd-panel-content {
  flex: 1 1 0;
  min-width: 0;
}

.dd-panel[dir="rtl"] .dd-panel-content {
  direction: rtl;
}

.dd-panel-menu-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 0.4rem;
  background: transparent;
  color: #4b5563;
  cursor: pointer;
}

.dd-panel-menu-btn svg {
  display: block;
  width: 1.15rem;
  height: 1.15rem;
}

.dd-panel-menu-btn:hover,
.dd-panel-menu-btn:focus-visible {
  color: #b91c1c;
  background: rgba(185, 28, 28, 0.08);
}

.dd-panel-menu-btn--active {
  color: #b91c1c;
  background: rgba(185, 28, 28, 0.14);
}

.dd-panel-menu-btn::after {
  content: attr(data-tooltip);
  position: absolute;
  left: calc(100% + 0.45rem);
  top: 50%;
  z-index: 2;
  transform: translateY(-50%);
  padding: 0.28rem 0.5rem;
  border-radius: 0.35rem;
  background: #111827;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0s ease,
    visibility 0s linear 0s;
}

.dd-panel-menu-btn:hover::after,
.dd-panel-menu-btn:focus-visible::after {
  opacity: 1;
  visibility: visible;
}

.dd-panel-page {
  margin: 0;
}

.dd-panel-page-title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #111827;
}

.dd-panel--surface-popup .dd-panel-page-title {
  text-align: center;
}

.dd-panel-page-divider {
  width: 100%;
  margin: 0 0 0.5rem;
}

.dd-panel--surface-popup .dd-panel-body {
  flex: 1 1 auto;
  overflow: visible;
  padding: 1rem 0.95rem;
}

.dd-panel--surface-popup .dd-panel-page--settings {
  text-align: center;
}

.dd-panel--surface-popup > .dd-panel-main > .dd-panel-content > .dd-panel-body:has(.dd-panel-page--about) {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.dd-panel-page--about {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
}

.dd-panel-page--about .dd-panel-page-title {
  width: 100%;
  text-align: center;
}

.dd-about-credit {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: auto;
  padding-top: 0.75rem;
  text-align: center;
  font-size: 0.75rem;
  color: #9ca3af;
}

.dd-about-credit-divider {
  width: 100%;
  margin: 0 0 0.5rem;
}

.dd-about-credit-line {
  margin: 0;
  line-height: 1.35;
}

.dd-panel-page--shortcuts {
  width: 100%;
}

.dd-shortcuts-heading {
  margin: 0.5rem 0 0;
  font-size: 0.84rem;
  line-height: 1.45;
  font-weight: 700;
  color: #374151;
  text-align: left;
}

.dd-shortcuts-undo-block {
  margin: 0;
}

.dd-shortcuts-undo-row {
  margin: 0.12rem 0 0;
  padding-left: 1.15rem;
  font-size: 0.84rem;
  line-height: 1.45;
  color: #374151;
  text-align: left;
}

.dd-shortcuts-safety {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  margin-top: 0.85rem;
}

.dd-shortcuts-note {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.2;
  color: #6b7280;
  text-align: left;
}

.dd-shortcuts-step-release-bold {
  font-weight: 600;
}

.dd-shortcuts-divider {
  margin: 0.55rem 0 0.35rem;
}

.dd-shortcuts-steps {
  margin: 0.2rem 0 0.35rem;
  padding-left: 1.15rem;
  font-size: 0.84rem;
  line-height: 1.45;
  color: #374151;
  text-align: left;
}

.dd-shortcuts-steps li {
  margin-bottom: 0.2rem;
}

.dd-shortcuts-steps li:last-child {
  margin-bottom: 0;
}

.dd-shortcuts-step-press-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 0.35em;
  align-items: start;
}

.dd-shortcuts-step-press-label {
  grid-column: 1;
  grid-row: 1;
}

.dd-shortcuts-step-press-chords {
  grid-column: 2;
  grid-row: 1;
  min-width: 0;
}

.dd-shortcuts-step-press-mac-label {
  grid-column: 1;
  grid-row: 2;
}

.dd-shortcuts-step-press-mac-chords {
  grid-column: 2;
  grid-row: 2;
  min-width: 0;
}

.dd-about-icon {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  line-height: 0;
  color: #6b7280;
}

.dd-about-icon svg {
  display: block;
  width: 1rem;
  height: 1rem;
}

.dd-about-kbd {
  display: inline-block;
  padding: 0.08rem 0.35rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  background: #f9fafb;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8em;
  font-weight: 600;
  line-height: 1.3;
  color: #111827;
}

.dd-panel--surface-popup .dd-about-list {
  width: 100%;
  max-width: 100%;
  margin: 0 0 0.85rem;
}

.dd-panel-tabs {
  flex: 0 0 auto;
  padding: 1.125rem 1.125rem 0;
}

.dd-tab-group {
  display: flex;
  gap: 0.35rem;
  min-width: 0;
}

.dd-chip {
  border: 1px solid rgba(0, 0, 0, 0.07);
  background: #fff;
  color: #1f2937;
  cursor: pointer;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 10px rgba(0, 0, 0, 0.06);
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.dd-chip.is-active {
  background: #b91c1c;
  border-color: #b91c1c;
  color: #fff;
  box-shadow: none;
}

.dd-chip.is-active:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.9);
}

.dd-chip:not(.is-active):hover,
.dd-chip:not(.is-active):focus-visible {
  color: #b91c1c;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06), 0 0 14px rgba(0, 0, 0, 0.09);
}

.dd-lang-btn.is-active:hover,
.dd-lang-btn.is-active:focus-visible {
  color: #fff;
}

.dd-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 0.5rem;
  border-radius: 0.45rem 0.45rem 0 0;
  font-weight: 700;
  font-size: 0.72rem;
  line-height: 1;
  letter-spacing: 0.04em;
  white-space: nowrap;
  text-align: center;
}

.dd-panel:lang(zh-CN) .dd-tab {
  letter-spacing: normal;
}

.dd-tab:not(.is-active) {
  border: 1px solid transparent;
  background: transparent;
  box-shadow: none;
  color: #b91c1c;
}

.dd-tab:not(.is-active):focus-visible {
  outline: 2px solid #b91c1c;
  outline-offset: 2px;
}

.dd-panel-body {
  display: grid;
  flex: 1 1 auto;
  min-height: var(--dd-panel-body-min, 0);
  overflow-y: auto;
  padding: 0 1.125rem;
}

.dd-panel:not(.dd-panel--surface-popup) .dd-panel-body {
  display: grid;
}

.dd-panel--surface-popup > .dd-panel-main > .dd-panel-content > .dd-panel-body {
  display: block;
  min-height: var(--dd-panel-body-min, 0);
}

.dd-tab-panel {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  visibility: hidden;
  pointer-events: none;
  min-width: 0;
  min-height: 100%;
  padding-block: 1.125rem;
}

.dd-tab-panel.is-active {
  visibility: visible;
  pointer-events: auto;
}

.dd-tab-panel.is-settings {
  text-align: center;
  align-items: stretch;
}

.dd-tab-panel.is-about {
  align-items: center;
}

.dd-panel-body p {
  margin: 0 0 0.55rem;
  font-size: 0.84rem;
  line-height: 1.45;
  color: #374151;
  text-align: left;
}

.dd-about-list {
  list-style: none;
  width: fit-content;
  max-width: 100%;
  margin: 0;
  padding: 0;
}

.dd-about-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.35rem;
  font-size: 0.84rem;
  line-height: 1.45;
  color: #374151;
  text-align: left;
}

.dd-about-item:last-child {
  margin-bottom: 0;
}

.dd-about-bool {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  line-height: 0;
  color: #6b7280;
}

.dd-about-bool svg {
  display: block;
  width: 1rem;
  height: 1rem;
}

.dd-panel-body a {
  color: #b91c1c;
  text-decoration: none;
}

.dd-panel-body a:hover,
.dd-panel-body a:focus-visible {
  text-decoration: underline;
}

.dd-panel-body a:focus-visible {
  outline: none;
}

/* ABOUT credit: beats .dd-panel-body p / a on <p> and <a> inside credit */
.dd-panel-body .dd-about-credit {
  margin-top: auto;
  margin-inline: 0;
  margin-bottom: 0;
  font-size: 0.75rem;
  line-height: 1.35;
  color: #9ca3af;
  text-align: center;
}

.dd-panel-body .dd-about-credit .dd-about-credit-line {
  margin: 0;
  font-size: inherit;
  line-height: 1.35;
  color: inherit;
  text-align: center;
}

.dd-panel-body .dd-about-credit a:any-link {
  color: #9ca3af;
  text-decoration: underline;
}

.dd-panel-body .dd-about-credit a:hover,
.dd-panel-body .dd-about-credit a:focus-visible {
  color: #9ca3af;
  text-decoration: underline;
}

.dd-field {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.55rem;
  margin-top: 1.5rem;
}

.dd-field:first-of-type {
  margin-top: 0;
}

.dd-caption-style-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  column-gap: 0.75rem;
  width: 100%;
  min-width: 0;
  margin-top: 1.5rem;
}

.dd-panel-page--settings .dd-caption-style-row {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  gap: 0.75rem;
}

.dd-caption-style-label {
  flex: 1 1 50%;
  min-width: 0;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  color: #1f2937;
  text-align: start;
}

.dd-panel-page--settings .dd-caption-style-label {
  display: flex;
  align-items: center;
}

.dd-caption-style-select {
  flex: 0 0 50%;
  width: 50%;
  min-width: 0;
  padding: 0.45rem 0.55rem;
  padding-inline-end: 1.45rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 0.45rem;
  background: #fff;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.45rem center;
  background-size: 10px 6px;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
  color: #1f2937;
}

.dd-caption-style-select:focus-visible {
  outline: 2px solid #012292;
  outline-offset: 1px;
}

.dd-toggle-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  width: 100%;
  margin-top: 1.5rem;
}

.dd-toggle-label {
  flex: 0 1 auto;
  min-width: 0;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  color: #1f2937;
  text-align: start;
}

.dd-toggle-label kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.76rem;
  font-weight: 600;
  padding: 0.1rem 0.35rem;
  border-radius: 0.25rem;
  background: rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.07);
}

.dd-toggle {
  position: relative;
  flex: 0 0 auto;
  width: 2.5rem;
  height: 1.4rem;
  padding: 0;
  border: 1px solid rgba(0, 0, 0, 0.07);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.12);
  cursor: pointer;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 10px rgba(0, 0, 0, 0.06);
}

.dd-toggle.is-on {
  background: #b91c1c;
  border-color: #b91c1c;
}

.dd-toggle::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 0.15rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: #fff;
  transform: translateY(-50%);
  transition: left 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.dd-toggle.is-on::after {
  left: calc(100% - 1rem - 0.15rem);
}

.dd-toggle:focus-visible {
  outline: 2px solid #b91c1c;
}

.dd-lang-row {
  display: flex;
  width: 100%;
  gap: 0.3rem;
  /* README: EN | ES | … order is fixed; panel RTL must not mirror this row. */
  direction: ltr;
}

.dd-lang-btn {
  flex: 1 1 0;
  min-width: 0;
  padding: 0.35rem 0.25rem;
  border-radius: 0.4rem;
  font-size: 0.78rem;
  font-weight: 600;
}

.dd-toggle-row--notification {
  position: relative;
  justify-content: stretch;
  gap: 0;
}

.dd-toggle-row--notification .dd-number {
  flex: 1 1 auto;
  width: 100%;
}

.dd-toggle-row--notification .dd-tooltip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 0.35rem);
  z-index: 1;
  max-width: min(16rem, 100%);
  padding: 0.35rem 0.5rem;
  border-radius: 0.35rem;
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.35;
  color: #fff;
  text-align: center;
  white-space: normal;
  background: rgba(0, 0, 0, 0.82);
  transform: translateX(-50%);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 0.12s ease,
    visibility 0.12s ease;
}

.dd-toggle-row--notification:hover .dd-tooltip,
.dd-toggle-row--notification:focus-within .dd-tooltip {
  opacity: 1;
  visibility: visible;
}

.dd-number {
  display: flex;
  align-items: stretch;
  gap: 0;
  padding: 0;
  overflow: hidden;
  width: 100%;
  border-radius: 0.55rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.07);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 10px rgba(0, 0, 0, 0.06);
}

.dd-number-value {
  position: relative;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.dd-number-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  min-width: 0;
  max-width: 100%;
  cursor: text;
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.2;
  color: #1f2937;
}

.dd-number-prefix,
.dd-number-suffix {
  flex: 0 0 auto;
  white-space: nowrap;
}

.dd-number-value input {
  box-sizing: content-box;
  flex: 0 0 auto;
  width: 2.5ch;
  min-width: 2.5ch;
  max-width: 2.5ch;
  margin: 0;
  padding: 0.35rem 0.1rem;
  border: none;
  border-radius: 0;
  background: transparent;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #b91c1c;
  -moz-appearance: textfield;
  appearance: textfield;
}

.dd-number-value:focus-within {
  box-shadow: inset 0 0 0 2px #b91c1c;
}

.dd-number-value input:focus,
.dd-number-value input:focus-visible {
  outline: none;
}

.dd-number-value input::-webkit-outer-spin-button,
.dd-number-value input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.dd-chevron {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.85rem;
  min-height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: #1f2937;
  border-radius: 0;
  cursor: pointer;
}

:where(.dd-chevron) svg {
  display: block;
  flex-shrink: 0;
}

.dd-chevron svg {
  width: 0.95rem;
  height: 0.95rem;
}

.dd-chevron:hover,
.dd-chevron:focus-visible {
  color: #b91c1c;
}

.dd-toast-stack {
  position: fixed;
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: min(380px, calc(100vw - 2rem));
  pointer-events: none;
}

@media (min-width: 701px) {
  .dd-toast-stack {
    right: 1rem;
    bottom: 1rem;
    left: auto;
    align-items: flex-end;
  }
}

@media (max-width: 700px) {
  .dd-toast-stack {
    left: 50%;
    bottom: 1rem;
    transform: translateX(-50%);
    align-items: center;
  }
}

.dd-toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  flex-wrap: nowrap;
  width: 100%;
  min-height: 1cm;
  padding: 0.06rem 0.5rem;
  color: #fff;
  border-radius: 0.5rem;
  background: rgba(185, 28, 28, 0.66);
  backdrop-filter: blur(14px) saturate(1.25);
  -webkit-backdrop-filter: blur(14px) saturate(1.25);
  border: 1px solid rgba(255, 255, 255, 0.38);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.38);
  pointer-events: auto;
}

.dd-toast.is-restored {
  background: rgba(1, 34, 146, 0.66);
}

.dd-toast-leading,
.dd-toast-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.dd-toast-leading {
  flex: 1 1 auto;
  min-width: 0;
}

.dd-toast-actions {
  flex: 0 0 auto;
}

.dd-toast-mark {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  line-height: 0;
}

.dd-toast-label {
  display: flex;
  align-items: center;
  gap: 0.25em;
  flex: 1 1 auto;
  min-width: 0;
  font-weight: 700;
  font-size: 0.72rem;
  line-height: 1.2;
  overflow: hidden;
}

.dd-toast-status {
  flex: 0 0 auto;
  white-space: nowrap;
}

.dd-toast-target {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dd-toast .dd-icon-btn {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  min-height: 1.36rem;
  padding: 0.28rem;
  border: none;
  background: rgba(0, 0, 0, 0.22);
  color: #fff;
  border-radius: 0.35rem;
  cursor: pointer;
  box-shadow: none;
}

.dd-toast .dd-icon-btn:hover,
.dd-toast .dd-icon-btn:focus-visible {
  background: rgba(0, 0, 0, 0.3);
  color: #fef9c3;
}

.dd-toast .dd-icon-btn:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.9);
}

.dd-toast-mark svg {
  display: block;
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
}

.dd-toast .dd-icon-btn svg {
  width: 0.8rem;
  height: 0.8rem;
}

:host:not(.dd-panel-popup) {
  all: initial;
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2147483645;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.3;
  color: #fff;
}


*,
*::before,
*::after {
  box-sizing: border-box;
}

button:focus:not(:focus-visible),
a:focus:not(:focus-visible) {
  outline: none;
}

button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid #b91c1c;
}

@keyframes dd-highlight-pulse {
  0%,
  100% {
    outline-color: rgba(245, 197, 24, 0.95);
    box-shadow:
      0 0 10px 2px rgba(245, 197, 24, 0.45),
      0 0 20px 6px rgba(185, 28, 28, 0.22);
  }
  50% {
    outline-color: rgba(185, 28, 28, 0.9);
    box-shadow:
      0 0 14px 4px rgba(185, 28, 28, 0.55),
      0 0 28px 10px rgba(185, 28, 28, 0.38);
  }
}

.dd-highlight-frame {
  position: absolute;
  z-index: 0;
  display: none;
  pointer-events: none;
  box-sizing: border-box;
  background: rgba(185, 28, 28, 0.22);
  outline-width: 1px;
  outline-style: solid;
  outline-offset: 2px;
  box-shadow:
    0 0 10px 2px rgba(245, 197, 24, 0.45),
    0 0 20px 6px rgba(185, 28, 28, 0.22);
  animation: dd-highlight-pulse 2s ease-in-out infinite;
  transition:
    top 0.15s ease,
    left 0.15s ease,
    width 0.15s ease,
    height 0.15s ease,
    border-radius 0.15s ease;
}

.dd-highlight-frame.is-instant {
  transition: none;
}

.dd-element-label {
  position: absolute;
  z-index: 1;
  display: none;
  pointer-events: none;
  margin: 0;
  padding: 0.15rem 0.35rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.68rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  color: #fff;
  border-radius: 0.25rem;
  background: rgba(185, 28, 28, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.38);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.18);
  transform: translateY(-100%);
}
`;
      const existingLabel = this.shadow.querySelector(".dd-element-label");
      const existingFrame = this.shadow.querySelector(".dd-highlight-frame");
      this.toast = new ToastSystem({
        shadow: this.shadow,
        getNotificationSeconds: () => this.notificationSeconds,
        getStrings: () => this.strings(),
        isRtl: () => this.isRtl(),
        openPanel: options.openPanel,
        undoById: (id) => this.undoById(id)
      });
      this.restore = new RestoreSystem(
        {
          onRestored: (restoredElement) => {
            this.toast.showRestoredToast(
              this.formatRestoredToastDescriptorText(restoredElement)
            );
            this.onElementRestored?.();
          }
        },
        options.undo
      );
      this.highlight = new HighlightSystem({
        host: {
          shadow: this.shadow,
          isOurNode: (node) => this.isOurNode(node),
          getElementLabelEnabled: () => shouldShowSelectionCaption(this.selectionCaptionStyle),
          formatElementLabel: (target) => this.formatSelectionCaptionText(target),
          hostAttr: HOST_ATTR,
          classes: HIGHLIGHT_UI
        },
        pageStyles: DELETER_HIGHLIGHT_PAGE_STYLE
      });
      this.highlight.bindExistingElements(
        existingLabel instanceof HTMLElement ? existingLabel : null,
        existingFrame instanceof HTMLElement ? existingFrame : null
      );
    }
    isOurNode(node) {
      if (!node) return true;
      if (node === this.host || this.host.contains(node)) return true;
      return !!node.closest?.(`[${HOST_ATTR}]`);
    }
    async loadSettings() {
      const [seconds, locale, selectionCaptionStyle] = await Promise.all([
        getNotificationSeconds(),
        getLocale(),
        getSelectionCaptionStyle()
      ]);
      this.notificationSeconds = seconds;
      this.locale = locale;
      this.selectionCaptionStyle = selectionCaptionStyle;
    }
    setSelectionCaptionStyle(style) {
      this.selectionCaptionStyle = style;
      this.highlight.syncElementLabel();
    }
    formatSelectionCaptionText(target) {
      return resolveElementDescriptor(target, {
        selectionCaptionStyle: this.selectionCaptionStyle,
        clickToDeleteLabel: this.strings().selectionCaptionClickToDelete
      });
    }
    formatDeletedToastDescriptor(target) {
      const s = this.strings();
      return formatToastDescriptor(target, {
        variant: "deleted",
        selectionCaptionStyle: this.selectionCaptionStyle,
        deletedCanBeRestored: s.toastDeletedCanBeRestored
      });
    }
    formatRestoredToastDescriptorText(target) {
      const s = this.strings();
      return formatToastDescriptor(target, {
        variant: "restored",
        selectionCaptionStyle: this.selectionCaptionStyle,
        deletedCanBeRestored: s.toastDeletedCanBeRestored
      });
    }
    setNotificationSeconds(seconds) {
      this.notificationSeconds = seconds;
    }
    setLocale(locale) {
      this.locale = locale;
      this.highlight.syncElementLabel();
    }
    strings() {
      return t(this.locale);
    }
    isRtl() {
      return isRtlLocale(this.locale);
    }
    activate() {
      this.highlight.activate();
      document.addEventListener("click", this.boundClick, true);
    }
    deactivate() {
      document.removeEventListener("click", this.boundClick, true);
      this.highlight.deactivate();
      this.toast.hide();
    }
    canUndo() {
      if (this.elementActionInFlight) return false;
      return this.restore.canUndo();
    }
    async undoLast() {
      if (this.elementActionInFlight) return false;
      this.elementActionInFlight = true;
      try {
        return await this.restore.undoLast();
      } finally {
        this.elementActionInFlight = false;
      }
    }
    async undoById(id) {
      if (this.elementActionInFlight) return false;
      this.elementActionInFlight = true;
      try {
        return await this.restore.undoById(id);
      } finally {
        this.elementActionInFlight = false;
      }
    }
    async deleteContextElement(element) {
      return this.deleteElement(element);
    }
    async handleClick(e) {
      const pickOptions = { isOurNode: (node) => this.isOurNode(node) };
      const iframeAtPoint = findIframeAtPoint(
        e.clientX,
        e.clientY,
        pickOptions
      );
      const toRemove = iframeAtPoint ?? this.highlight.getHighlighted();
      if (!toRemove) return;
      const hit = e.target;
      if (hit instanceof Element && this.isOurNode(hit)) return;
      const onTarget = hit === toRemove || hit instanceof Element && toRemove.contains(hit) || isPointInElement(toRemove, e.clientX, e.clientY);
      if (!onTarget) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const deleted = await this.deleteElement(toRemove);
      if (deleted) {
        this.highlight.updateHighlightAt(e.clientX, e.clientY);
      }
    }
    async deleteElement(toRemove) {
      if (this.elementActionInFlight) return false;
      const parent = toRemove.parentElement;
      if (!parent) return false;
      const nextSibling = toRemove.nextSibling;
      const childIndex = Array.prototype.indexOf.call(parent.children, toRemove);
      const outerHTML = toRemove.outerHTML;
      const toastDescriptor = this.formatDeletedToastDescriptor(toRemove);
      this.elementActionInFlight = true;
      this.highlight.clearIfTarget(toRemove);
      try {
        await runElementTransition(toRemove, true);
        if (!toRemove.isConnected) return false;
        toRemove.remove();
        const undoId = this.restore.recordDeletion({
          parent,
          parentPath: buildDocumentChildPath(parent),
          parentTagName: parent.tagName,
          parentNs: parent.namespaceURI,
          nextSibling,
          childIndex,
          removedElement: toRemove,
          outerHTML,
          elementLabel: toastDescriptor
        });
        this.toast.showDeletedToast(toastDescriptor, undoId);
        this.onElementDeleted?.();
        return true;
      } finally {
        this.elementActionInFlight = false;
      }
    }
  };

  // ../lib/our/page-operability/content-probe.ts
  var PROBE_DOCUMENT_OPERABILITY = "PROBE_DOCUMENT_OPERABILITY";
  function isProbeDocumentOperabilityMessage(message) {
    if (typeof message !== "object" || message === null) return false;
    return message.type === PROBE_DOCUMENT_OPERABILITY;
  }
  var probeListenerRegistered = false;
  function registerDocumentOperabilityProbeListener() {
    if (probeListenerRegistered) return;
    probeListenerRegistered = true;
    ext.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (!isProbeDocumentOperabilityMessage(message)) return;
      sendResponse(probeDocumentOperability());
      return true;
    });
  }

  // src/panel-popup/constants.ts
  var PANEL_POPUP_PAGE = "panel-popup-page.html";
  var PANEL_POPUP_ROOT_ID = "element-deleter-root";
  var PANEL_POPUP_HOST_ATTR = "data-element-deleter-ui";
  var PANEL_POPUP_SESSION_TAB_KEY = "panelPopupTab";
  var PANEL_POPUP_TABS = [
    "settings",
    "shortcuts",
    "info"
  ];
  var PANEL_PAGE_CONFIG = {
    pageHtml: PANEL_POPUP_PAGE,
    sessionTabKey: PANEL_POPUP_SESSION_TAB_KEY,
    logLabel: "Element Deleter"
  };

  // ../lib/our/panel-header/header.ts
  function createPanelDivider() {
    const divider = document.createElement("div");
    divider.className = "dd-panel-divider";
    divider.setAttribute("aria-hidden", "true");
    return divider;
  }
  function createPanelHeader(options) {
    const header = document.createElement("div");
    header.className = "dd-panel-header";
    const titleRow = document.createElement("div");
    titleRow.className = "dd-panel-title-row";
    const logo = document.createElement("span");
    logo.className = "dd-panel-logo";
    logo.setAttribute("aria-hidden", "true");
    if (options.logoSvg) {
      logo.innerHTML = options.logoSvg;
    }
    const heading = document.createElement("div");
    heading.className = "dd-panel-heading";
    const title = document.createElement("p");
    title.className = "dd-panel-title";
    title.textContent = options.title;
    const subtitle = document.createElement("p");
    subtitle.className = "dd-panel-subtitle";
    subtitle.textContent = options.subtitle;
    heading.append(title, subtitle);
    titleRow.append(logo, heading);
    header.append(titleRow);
    return header;
  }

  // ../lib/our/panel-shell/shadow-host.ts
  function mountPanelShadowHost(options) {
    const host = document.createElement("div");
    host.id = options.rootId;
    host.className = options.hostClassName;
    host.setAttribute(options.hostAttr, "true");
    host.style.cssText = options.hostStyle;
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = options.cssContent;
    shadow.appendChild(style);
    return { host, shadow };
  }

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

  // ../lib/our/panel-footer/constants.ts
  var PANEL_FOOTER_LINKEDIN_URL = "https://www.linkedin.com/in/alex-terekhov/";
  var PANEL_FOOTER_MD2IT_URL = "https://md2it.com";

  // ../lib/our/icons.ts
  function stripComment3(svg) {
    return svg.replace(/<!--[\s\S]*?-->\s*/g, "").trim();
  }
  function inlineSvg(raw) {
    return stripComment3(raw).replace(/fill="#000000"/g, 'fill="currentColor"');
  }
  var MD2IT2 = inlineSvg(md2it_default);

  // ../lib/our/panel-footer/footer.ts
  var PANEL_FOOTER_LINKS = [
    { href: PANEL_FOOTER_LINKEDIN_URL, title: "LinkedIn", iconHtml: LINKEDIN },
    { href: PANEL_FOOTER_MD2IT_URL, title: "MD2IT", iconHtml: MD2IT2 }
  ];
  function createFooterLink(link) {
    const anchor = document.createElement("a");
    anchor.href = link.href;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.title = link.title;
    anchor.innerHTML = link.iconHtml;
    return anchor;
  }
  function attachPanelFooterLinks(footer) {
    for (const anchor of Array.from(
      footer.querySelectorAll("a[href]")
    )) {
      anchor.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }
  }
  function createPanelFooter(config) {
    const footer = document.createElement("div");
    footer.className = config.footerClassName;
    for (const link of PANEL_FOOTER_LINKS) {
      footer.appendChild(createFooterLink(link));
    }
    attachPanelFooterLinks(footer);
    return footer;
  }

  // src/panel-popup/panel-menu.ts
  var MENU_ITEMS = [
    { tab: "settings", iconSvg: SETTINGS, label: (s) => s.tabSettings },
    { tab: "shortcuts", iconSvg: KEYBOARD, label: (s) => s.tabShortcuts },
    { tab: "info", iconSvg: INFO, label: (s) => s.tabAbout }
  ];
  function createPanelMenu(strings) {
    const nav = document.createElement("nav");
    nav.className = "dd-panel-menu";
    nav.setAttribute("aria-label", "Panel pages");
    const buttons = /* @__PURE__ */ new Map();
    for (const item of MENU_ITEMS) {
      const label = item.label(strings);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dd-panel-menu-btn";
      button.innerHTML = item.iconSvg;
      button.setAttribute("aria-label", label);
      button.dataset.tooltip = label;
      buttons.set(item.tab, button);
      nav.append(button);
    }
    const handle = {
      root: nav,
      setActive(tab) {
        for (const [menuTab, button] of buttons) {
          const active = tab !== null && menuTab === tab;
          button.classList.toggle("dd-panel-menu-btn--active", active);
          button.setAttribute("aria-current", active ? "page" : "false");
        }
      },
      onSelect: () => {
      }
    };
    nav.addEventListener("click", (event) => {
      const target = event.target?.closest(
        ".dd-panel-menu-btn"
      );
      if (!target) return;
      for (const [tab, button] of buttons) {
        if (button === target) {
          handle.onSelect(tab);
          return;
        }
      }
    });
    return handle;
  }

  // src/panel-popup/build-panel-surface.ts
  function createPanelSurface(locale, surface) {
    const panelRoot = document.createElement("div");
    panelRoot.className = "dd-panel";
    if (surface === "popup") {
      panelRoot.classList.add("dd-panel--surface-popup");
    }
    panelRoot.lang = localeToHtmlLang(locale);
    panelRoot.dir = isRtlLocale(locale) ? "rtl" : "ltr";
    const body = document.createElement("div");
    body.className = "dd-panel-body";
    let menu = null;
    if (surface === "popup") {
      menu = createPanelMenu(t(locale));
      const main = document.createElement("div");
      main.className = "dd-panel-main";
      const content = document.createElement("div");
      content.className = "dd-panel-content";
      content.append(body);
      main.append(menu.root, content);
      panelRoot.append(main);
    } else {
      panelRoot.append(body);
    }
    panelRoot.setAttribute(PANEL_POPUP_HOST_ATTR, "true");
    return { panelRoot, body, menu };
  }

  // src/panel-popup/panel-body.ts
  function createPageDivider() {
    const divider = document.createElement("div");
    divider.className = "dd-panel-divider dd-panel-page-divider";
    return divider;
  }
  function createPageTitle(text) {
    const title = document.createElement("h2");
    title.className = "dd-panel-page-title";
    title.textContent = text;
    return title;
  }
  function createKbd(text) {
    const kbd = document.createElement("kbd");
    kbd.className = "dd-about-kbd";
    kbd.textContent = text;
    return kbd;
  }
  function createSectionDivider() {
    const divider = document.createElement("div");
    divider.className = "dd-panel-divider dd-shortcuts-divider";
    return divider;
  }
  function createAboutIcon(iconHtml) {
    const mark = document.createElement("span");
    mark.className = "dd-about-icon";
    mark.setAttribute("aria-hidden", "true");
    mark.innerHTML = iconHtml;
    return mark;
  }
  function buildShortcutsSteps(strings) {
    const steps = document.createElement("ol");
    steps.className = "dd-shortcuts-steps";
    const step1 = document.createElement("li");
    step1.className = "dd-shortcuts-step--press";
    const pressGrid = document.createElement("div");
    pressGrid.className = "dd-shortcuts-step-press-grid";
    const pressLabel = document.createElement("span");
    pressLabel.className = "dd-shortcuts-step-press-label";
    pressLabel.textContent = strings.shortcutsStepPress;
    const pressChords = document.createElement("div");
    pressChords.className = "dd-shortcuts-step-press-chords";
    pressChords.append(createKbd(SHORTCUTS_PREFIX_CHORD_WIN_DISPLAY));
    const pressMacLabel = document.createElement("span");
    pressMacLabel.className = "dd-shortcuts-step-press-mac-label";
    pressMacLabel.textContent = strings.shortcutsStepOnMac;
    const pressMacChords = document.createElement("div");
    pressMacChords.className = "dd-shortcuts-step-press-mac-chords";
    pressMacChords.append(createKbd(SHORTCUTS_PREFIX_CHORD_MAC_DISPLAY));
    pressGrid.append(pressLabel, pressChords, pressMacLabel, pressMacChords);
    step1.append(pressGrid);
    const step2 = document.createElement("li");
    const releaseBold = document.createElement("strong");
    releaseBold.className = "dd-shortcuts-step-release-bold";
    releaseBold.textContent = strings.shortcutsStepReleaseBold;
    step2.append(releaseBold, document.createTextNode(strings.shortcutsStepReleaseRest));
    const step3 = document.createElement("li");
    step3.append(
      document.createTextNode(`${strings.shortcutsStepThenPress} `),
      createKbd(PREFIX_ACTION_KEY.toUpperCase())
    );
    steps.append(step1, step2, step3);
    return steps;
  }
  function buildUndoShortcutBlock(strings) {
    const block = document.createElement("div");
    block.className = "dd-shortcuts-undo-block";
    const heading = document.createElement("p");
    heading.className = "dd-shortcuts-heading";
    heading.textContent = strings.shortcutsUndoHeading;
    const winRow = document.createElement("p");
    winRow.className = "dd-shortcuts-undo-row";
    winRow.append(
      document.createTextNode(`${strings.shortcutsUndoWinLinux} `),
      createKbd(SHORTCUTS_UNDO_WIN_DISPLAY)
    );
    const macRow = document.createElement("p");
    macRow.className = "dd-shortcuts-undo-row";
    macRow.append(
      document.createTextNode(`${strings.shortcutsStepOnMac} `),
      createKbd(SHORTCUTS_UNDO_MAC_DISPLAY)
    );
    block.append(heading, winRow, macRow);
    return block;
  }
  function createAboutCredit(strings) {
    const credit = document.createElement("div");
    credit.className = "dd-about-credit";
    const divider = document.createElement("div");
    divider.className = "dd-panel-divider dd-about-credit-divider";
    divider.setAttribute("aria-hidden", "true");
    const productLine = document.createElement("p");
    productLine.className = "dd-about-credit-line";
    productLine.textContent = strings.aboutProductName;
    const copyrightLine = document.createElement("p");
    copyrightLine.className = "dd-about-credit-line";
    const link = document.createElement("a");
    link.href = PANEL_FOOTER_LINKEDIN_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = strings.aboutCreditAuthor;
    link.addEventListener("click", (e) => {
      e.stopPropagation();
    });
    copyrightLine.append("© ", link);
    credit.append(divider, productLine, copyrightLine);
    return credit;
  }
  function buildShortcutsPanelBody(body, strings) {
    body.replaceChildren();
    const page = document.createElement("div");
    page.className = "dd-panel-page dd-panel-page--shortcuts";
    const runStopHeading = document.createElement("p");
    runStopHeading.className = "dd-shortcuts-heading";
    runStopHeading.textContent = strings.shortcutsRunStopHeading;
    const safety = document.createElement("div");
    safety.className = "dd-shortcuts-safety";
    const safetyLine1 = document.createElement("p");
    safetyLine1.className = "dd-shortcuts-note";
    safetyLine1.textContent = strings.shortcutsSafetyLine1;
    const safetyLine2 = document.createElement("p");
    safetyLine2.className = "dd-shortcuts-note";
    safetyLine2.textContent = strings.shortcutsSafetyLine2;
    safety.append(safetyLine1, safetyLine2);
    const stopHeading = document.createElement("p");
    stopHeading.className = "dd-shortcuts-heading";
    stopHeading.append(
      document.createTextNode(`${strings.shortcutsStopHeading} `),
      createKbd("Esc")
    );
    page.append(
      createPageTitle(strings.tabShortcuts),
      createPageDivider(),
      runStopHeading,
      buildShortcutsSteps(strings),
      safety,
      createSectionDivider(),
      buildUndoShortcutBlock(strings),
      createSectionDivider(),
      stopHeading,
      createSectionDivider()
    );
    body.append(page);
  }
  function buildAboutPanelBody(body, strings) {
    body.replaceChildren();
    const page = document.createElement("div");
    page.className = "dd-panel-page dd-panel-page--about";
    const list = document.createElement("ul");
    list.className = "dd-about-list";
    list.setAttribute("aria-label", strings.tabAbout);
    for (const item of buildAboutListItems(strings)) {
      const li = document.createElement("li");
      li.className = "dd-about-item";
      const label = document.createElement("span");
      label.className = "dd-about-text";
      label.textContent = item.text;
      li.append(createAboutIcon(item.iconHtml), label);
      list.appendChild(li);
    }
    page.append(createPageTitle(strings.tabAbout), createPageDivider(), list, createAboutCredit(strings));
    body.append(page);
  }

  // src/panel-popup/panel-settings.ts
  var SELECTION_CAPTION_SELECT_ID = "dd-selection-caption-style";
  function selectionCaptionOptionLabel(style, strings) {
    switch (style) {
      case "none":
        return strings.selectionCaptionNone;
      case "click-to-delete":
        return strings.selectionCaptionClickToDelete;
      case "tag-id-class":
        return strings.selectionCaptionTagIdClass;
      case "selector":
        return strings.selectionCaptionSelector;
      case "full-xpath":
        return strings.selectionCaptionFullXPath;
    }
  }
  function createSelectionCaptionStyleRow(host, strings) {
    const row = document.createElement("div");
    row.className = "dd-caption-style-row";
    const label = document.createElement("label");
    label.className = "dd-caption-style-label";
    label.htmlFor = SELECTION_CAPTION_SELECT_ID;
    label.textContent = strings.selectionCaptionStyleLabel;
    const select = document.createElement("select");
    select.id = SELECTION_CAPTION_SELECT_ID;
    select.className = "dd-caption-style-select";
    for (const style of SELECTION_CAPTION_STYLES) {
      const option = document.createElement("option");
      option.value = style;
      option.textContent = selectionCaptionOptionLabel(style, strings);
      option.selected = style === host.getSelectionCaptionStyle();
      select.append(option);
    }
    select.addEventListener("change", () => {
      const next = select.value;
      host.setSelectionCaptionStyle(next);
      void setSelectionCaptionStyle(next);
    });
    row.append(label, select);
    return row;
  }
  function syncSelectionCaptionStyleRow(panel, strings) {
    const label = panel.querySelector(".dd-caption-style-label");
    if (label) label.textContent = strings.selectionCaptionStyleLabel;
    const select = panel.querySelector(`#${SELECTION_CAPTION_SELECT_ID}`);
    if (!select) return;
    for (const option of Array.from(select.options)) {
      option.textContent = selectionCaptionOptionLabel(
        option.value,
        strings
      );
    }
  }
  function createPageDivider2() {
    const divider = document.createElement("div");
    divider.className = "dd-panel-divider dd-panel-page-divider";
    return divider;
  }
  function createPageTitle2(text) {
    const title = document.createElement("h2");
    title.className = "dd-panel-page-title";
    title.textContent = text;
    return title;
  }
  function appendPrefixStartHotkeyMarkup(label) {
    label.append(document.createTextNode(" "));
    const chord = document.createElement("kbd");
    chord.textContent = getStartHotkeyChordLabel();
    const action = document.createElement("kbd");
    action.textContent = getStartHotkeyActionLabel();
    label.append(chord, document.createTextNode(" → "), action);
  }
  function createToggleRow(labelText, enabled, onChange) {
    const row = document.createElement("div");
    row.className = "dd-toggle-row";
    const label = document.createElement("span");
    label.className = "dd-toggle-label";
    label.textContent = labelText;
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "dd-toggle";
    toggle.setAttribute("role", "switch");
    toggle.setAttribute("aria-checked", enabled ? "true" : "false");
    toggle.setAttribute("aria-label", labelText);
    const sync = (on) => {
      toggle.classList.toggle("is-on", on);
      toggle.setAttribute("aria-checked", on ? "true" : "false");
    };
    sync(enabled);
    toggle.addEventListener("click", () => {
      const next = !toggle.classList.contains("is-on");
      sync(next);
      onChange(next);
    });
    row.append(toggle, label);
    return row;
  }
  function createPrefixStartHotkeyToggleRow(labelText, enabled, onChange) {
    const row = createToggleRow(labelText, enabled, onChange);
    const label = row.querySelector(".dd-toggle-label");
    if (label) appendPrefixStartHotkeyMarkup(label);
    const toggle = row.querySelector(".dd-toggle");
    if (toggle instanceof HTMLButtonElement) {
      toggle.setAttribute("aria-label", `${labelText} ${getStartHotkeyAriaLabel()}`);
    }
    return row;
  }
  function createHotkeyToggleRow(labelText, hotkeyLabel, enabled, onChange) {
    const row = createToggleRow(labelText, enabled, onChange);
    const label = row.querySelector(".dd-toggle-label");
    if (label) {
      label.append(document.createTextNode(" "));
      const kbd = document.createElement("kbd");
      kbd.textContent = hotkeyLabel;
      label.append(kbd);
    }
    const toggle = row.querySelector(".dd-toggle");
    if (toggle instanceof HTMLButtonElement) {
      toggle.setAttribute("aria-label", `${labelText} ${hotkeyLabel}`);
    }
    return row;
  }
  function syncPrefixStartHotkeyToggleRow(row, labelText) {
    if (!row) return;
    const label = row.querySelector(".dd-toggle-label");
    const toggle = row.querySelector(".dd-toggle");
    if (!label) return;
    label.replaceChildren(document.createTextNode(labelText));
    appendPrefixStartHotkeyMarkup(label);
    toggle?.setAttribute("aria-label", `${labelText} ${getStartHotkeyAriaLabel()}`);
  }
  function syncHotkeyToggleRow(row, labelText, hotkeyLabel) {
    if (!row) return;
    const label = row.querySelector(".dd-toggle-label");
    const toggle = row.querySelector(".dd-toggle");
    if (!label) return;
    label.replaceChildren(document.createTextNode(labelText));
    label.append(document.createTextNode(" "));
    const kbd = document.createElement("kbd");
    kbd.textContent = hotkeyLabel;
    label.append(kbd);
    toggle?.setAttribute("aria-label", `${labelText} ${hotkeyLabel}`);
  }
  function syncSettingsPanelCopy(host, panel) {
    const copy = host.getStrings();
    panel.querySelector(".dd-lang-row")?.setAttribute("aria-label", copy.tabSettings);
    for (const btn of Array.from(panel.querySelectorAll(".dd-lang-btn"))) {
      const code = LOCALES.find((locale) => LOCALE_BUTTON_LABELS[locale] === btn.textContent);
      if (code) btn.classList.toggle("is-active", code === host.getLocale());
    }
    panel.querySelector(".dd-tooltip").textContent = copy.notificationPeriodHint;
    panel.querySelector(".dd-number-prefix").textContent = copy.notificationPeriodPrefix;
    const suffix = panel.querySelector(".dd-number-suffix");
    suffix.textContent = copy.notificationPeriodSuffix;
    suffix.toggleAttribute("aria-hidden", !copy.notificationPeriodSuffix);
    panel.querySelector("#dd-notification-seconds")?.setAttribute(
      "aria-label",
      `${copy.notificationPeriodPrefix}${copy.notificationPeriodSuffix}`.trim()
    );
    syncSelectionCaptionStyleRow(panel, copy);
    const toggles = panel.querySelectorAll(
      ".dd-toggle-row:not(.dd-toggle-row--notification)"
    );
    syncPrefixStartHotkeyToggleRow(toggles[0], copy.startHotkeyToggleLabel);
    syncHotkeyToggleRow(toggles[1], copy.escHotkeyToggleLabel, ESC_HOTKEY_LABEL);
    syncHotkeyToggleRow(toggles[2], copy.undoHotkeyToggleLabel, getUndoHotkeyLabel());
    const labelRows = panel.querySelectorAll(".dd-toggle-label");
    if (labelRows[3]) labelRows[3].textContent = copy.allElementsOutlineToggleLabel;
    if (labelRows[4]) labelRows[4].textContent = copy.allElementsFillToggleLabel;
    toggles[3]?.querySelector(".dd-toggle")?.setAttribute("aria-label", copy.allElementsOutlineToggleLabel);
    toggles[4]?.querySelector(".dd-toggle")?.setAttribute("aria-label", copy.allElementsFillToggleLabel);
    const title = panel.closest(".dd-panel-page")?.querySelector(".dd-panel-page-title");
    if (title) title.textContent = copy.tabSettings;
  }
  function populateSettingsPanel(host, panel, panelRoot, onLocaleChange, surfacePopup = false) {
    if (panel.querySelector(".dd-lang-row")) {
      syncSettingsPanelCopy(host, panel);
      return;
    }
    panel.replaceChildren();
    const copy = host.getStrings();
    const settingsMount = surfacePopup ? document.createElement("div") : panel;
    if (surfacePopup) {
      settingsMount.className = "dd-panel-page-settings";
    }
    const langField = document.createElement("div");
    langField.className = "dd-field";
    const langRow = document.createElement("div");
    langRow.className = "dd-lang-row";
    langRow.dir = "ltr";
    langRow.setAttribute("role", "group");
    langRow.setAttribute("aria-label", copy.tabSettings);
    for (const code of LOCALES) {
      const langBtn = document.createElement("button");
      langBtn.type = "button";
      langBtn.className = "dd-chip dd-lang-btn";
      langBtn.textContent = LOCALE_BUTTON_LABELS[code];
      langBtn.classList.toggle("is-active", code === host.getLocale());
      langBtn.addEventListener("click", () => {
        void (async () => {
          host.setLocale(code);
          await setLocale(code);
          panelRoot.lang = localeToHtmlLang(code);
          panelRoot.dir = isRtlLocale(code) ? "rtl" : "ltr";
          onLocaleChange();
        })();
      });
      langRow.appendChild(langBtn);
    }
    langField.appendChild(langRow);
    const startHotkeyRow = createPrefixStartHotkeyToggleRow(
      copy.startHotkeyToggleLabel,
      host.getStartHotkeyEnabled(),
      (next) => {
        void (async () => {
          host.setStartHotkeyEnabled(next);
          await setStartHotkeyEnabled(next);
        })();
      }
    );
    const escHotkeyRow = createHotkeyToggleRow(
      copy.escHotkeyToggleLabel,
      ESC_HOTKEY_LABEL,
      host.getEscHotkeyEnabled(),
      (next) => {
        void (async () => {
          host.setEscHotkeyEnabled(next);
          await setEscHotkeyEnabled(next);
        })();
      }
    );
    const undoHotkeyRow = createHotkeyToggleRow(
      copy.undoHotkeyToggleLabel,
      getUndoHotkeyLabel(),
      host.getUndoHotkeyEnabled(),
      (next) => {
        void (async () => {
          host.setUndoHotkeyEnabled(next);
          await setUndoHotkeyEnabled(next);
        })();
      }
    );
    const allElementsOutlineRow = createToggleRow(
      copy.allElementsOutlineToggleLabel,
      host.getAllElementsOutlineEnabled(),
      (next) => {
        void (async () => {
          host.setAllElementsOutlineEnabled(next);
          await setAllElementsOutlineEnabled(next);
        })();
      }
    );
    const allElementsFillRow = createToggleRow(
      copy.allElementsFillToggleLabel,
      host.getAllElementsFillEnabled(),
      (next) => {
        void (async () => {
          host.setAllElementsFillEnabled(next);
          await setAllElementsFillEnabled(next);
        })();
      }
    );
    const notificationRow = document.createElement("div");
    notificationRow.className = "dd-toggle-row dd-toggle-row--notification";
    const tooltipId = "dd-notification-tooltip";
    const tooltip = document.createElement("span");
    tooltip.id = tooltipId;
    tooltip.className = "dd-tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.textContent = copy.notificationPeriodHint;
    notificationRow.setAttribute("aria-describedby", tooltipId);
    const inputId = "dd-notification-seconds";
    const row = document.createElement("div");
    row.className = "dd-number";
    const toMin = document.createElement("button");
    toMin.type = "button";
    toMin.className = "dd-chevron";
    toMin.setAttribute("aria-label", "Minimum (0)");
    toMin.innerHTML = CHEVRONS_LEFT;
    const dec = document.createElement("button");
    dec.type = "button";
    dec.className = "dd-chevron";
    dec.setAttribute("aria-label", "Decrease");
    dec.innerHTML = CHEVRON_LEFT;
    const valueWrap = document.createElement("div");
    valueWrap.className = "dd-number-value";
    const valueLabel = document.createElement("label");
    valueLabel.className = "dd-number-label";
    valueLabel.htmlFor = inputId;
    const prefix = document.createElement("span");
    prefix.className = "dd-number-prefix";
    prefix.textContent = copy.notificationPeriodPrefix;
    const input = document.createElement("input");
    input.id = inputId;
    input.type = "number";
    input.min = "0";
    input.max = "10";
    input.step = "1";
    input.inputMode = "numeric";
    input.value = String(host.getNotificationSeconds());
    input.setAttribute(
      "aria-label",
      `${copy.notificationPeriodPrefix}${copy.notificationPeriodSuffix}`.trim()
    );
    const suffix = document.createElement("span");
    suffix.className = "dd-number-suffix";
    suffix.textContent = copy.notificationPeriodSuffix;
    if (!copy.notificationPeriodSuffix) {
      suffix.setAttribute("aria-hidden", "true");
    }
    const inc = document.createElement("button");
    inc.type = "button";
    inc.className = "dd-chevron";
    inc.setAttribute("aria-label", "Increase");
    inc.innerHTML = CHEVRON_RIGHT;
    const toMax = document.createElement("button");
    toMax.type = "button";
    toMax.className = "dd-chevron";
    toMax.setAttribute("aria-label", "Maximum (10)");
    toMax.innerHTML = CHEVRONS_RIGHT;
    const apply = async (v) => {
      const parsed = Number.isFinite(v) ? Math.round(v) : host.getNotificationSeconds();
      const clamped = Math.min(10, Math.max(0, parsed));
      input.value = String(clamped);
      host.setNotificationSeconds(clamped);
      await setNotificationSeconds(clamped);
    };
    toMin.addEventListener("click", () => {
      void apply(0);
    });
    dec.addEventListener("click", () => {
      void apply(Number(input.value) - 1);
    });
    inc.addEventListener("click", () => {
      void apply(Number(input.value) + 1);
    });
    toMax.addEventListener("click", () => {
      void apply(10);
    });
    input.addEventListener("input", () => {
      const raw = input.value.trim();
      if (raw === "" || raw === "-") return;
      const n = Number(raw);
      if (!Number.isFinite(n)) return;
      if (n > 10) input.value = "10";
      else if (n < 0) input.value = "0";
    });
    input.addEventListener("change", () => {
      void apply(Number(input.value));
    });
    input.addEventListener("blur", () => {
      void apply(Number(input.value));
    });
    valueLabel.append(prefix, input, suffix);
    valueWrap.append(valueLabel);
    row.append(toMin, dec, valueWrap, inc, toMax);
    notificationRow.append(row, tooltip);
    const captionStyleRow = createSelectionCaptionStyleRow(host, copy);
    settingsMount.append(
      langField,
      notificationRow,
      captionStyleRow,
      startHotkeyRow,
      escHotkeyRow,
      undoHotkeyRow,
      allElementsOutlineRow,
      allElementsFillRow
    );
    if (surfacePopup) {
      const page = document.createElement("div");
      page.className = "dd-panel-page dd-panel-page--settings";
      page.append(createPageTitle2(copy.tabSettings), createPageDivider2(), settingsMount);
      panel.append(page);
    }
  }
  function measureGermanSettingsBodyHeight(host, shadow) {
    const probeBody = document.createElement("div");
    probeBody.className = "dd-panel-body";
    probeBody.style.cssText = "position:fixed;left:-9999px;width:21rem;visibility:hidden;pointer-events:none;";
    const probePanel = document.createElement("div");
    probePanel.className = "dd-panel-page dd-panel-page--settings";
    probeBody.appendChild(probePanel);
    shadow.appendChild(probeBody);
    populateSettingsPanel(host, probePanel, probePanel, () => {
    });
    const height = probeBody.getBoundingClientRect().height;
    probeBody.remove();
    return height;
  }

  // src/panel-popup/window.ts
  var PANEL_BODY_MIN_VAR = "--dd-panel-body-min";
  var panelBodyMinPx = null;
  var PanelWindowSystem = class {
    constructor(host) {
      this.host = host;
    }
    boundPanelEscapeKey = null;
    panelRoot = null;
    body = null;
    menu = null;
    activeTab = "settings";
    settingsPanel = null;
    infoPanel = null;
    openPanel(tab) {
      this.close();
      this.host.toast.hide();
      this.activeTab = tab;
      if (this.host.surface === "popup") {
        this.openPopupPanel(tab);
        return;
      }
      this.openOverlayPanel(tab);
    }
    openPopupPanel(tab) {
      const locale = this.host.getLocale();
      const { panelRoot, body, menu } = createPanelSurface(locale, "popup");
      this.panelRoot = panelRoot;
      this.body = body;
      this.menu = menu;
      if (menu) {
        menu.onSelect = (nextTab) => this.showTab(nextTab);
      }
      this.host.shadow.appendChild(panelRoot);
      this.applyPanelBodyMinHeight(body);
      this.attachPanelEscapeKeyHandler();
      this.showTab(tab);
    }
    openOverlayPanel(tab) {
      const panelRoot = document.createElement("div");
      panelRoot.className = "dd-panel";
      panelRoot.lang = localeToHtmlLang(this.host.getLocale());
      panelRoot.dir = this.host.isRtl() ? "rtl" : "ltr";
      const s = this.host.getStrings();
      const header = createPanelHeader({
        title: PANEL_TITLE,
        subtitle: s.panelSubtitle,
        logoSvg: toolbarWelcomeIconSvg()
      });
      const subtitle = header.querySelector(".dd-panel-subtitle");
      const tabsBar = document.createElement("div");
      tabsBar.className = "dd-panel-tabs";
      const tabGroup = document.createElement("div");
      tabGroup.className = "dd-tab-group";
      const tabSettings = document.createElement("button");
      tabSettings.type = "button";
      tabSettings.className = "dd-chip dd-tab";
      tabSettings.textContent = s.tabSettings;
      const tabInfo = document.createElement("button");
      tabInfo.type = "button";
      tabInfo.className = "dd-chip dd-tab";
      tabInfo.textContent = s.tabAbout;
      const body = document.createElement("div");
      body.className = "dd-panel-body";
      const settingsPanel = document.createElement("div");
      settingsPanel.className = "dd-tab-panel is-settings";
      const infoPanel = document.createElement("div");
      infoPanel.className = "dd-tab-panel is-about";
      body.append(settingsPanel, infoPanel);
      const footer = createPanelFooter(PANEL_FOOTER_CONFIG);
      const setActiveTab = (active) => {
        if (active === "shortcuts") return;
        this.activeTab = active;
        const copy = this.host.getStrings();
        tabSettings.textContent = copy.tabSettings;
        tabInfo.textContent = copy.tabAbout;
        tabSettings.classList.toggle("is-active", active === "settings");
        tabInfo.classList.toggle("is-active", active === "info");
        settingsPanel.classList.toggle("is-active", active === "settings");
        infoPanel.classList.toggle("is-active", active === "info");
        settingsPanel.setAttribute(
          "aria-hidden",
          active === "settings" ? "false" : "true"
        );
        infoPanel.setAttribute("aria-hidden", active === "info" ? "false" : "true");
      };
      const refreshPanels = () => {
        panelRoot.lang = localeToHtmlLang(this.host.getLocale());
        subtitle.textContent = this.host.getStrings().panelSubtitle;
        populateSettingsPanel(this.host, settingsPanel, panelRoot, refreshPanels, false);
        this.populateOverlayInfoPanel(infoPanel);
        setActiveTab(this.activeTab === "shortcuts" ? "settings" : this.activeTab);
      };
      tabSettings.addEventListener("click", () => setActiveTab("settings"));
      tabInfo.addEventListener("click", () => setActiveTab("info"));
      tabGroup.append(tabSettings, tabInfo);
      tabsBar.append(tabGroup);
      panelRoot.append(
        header,
        tabsBar,
        createPanelDivider(),
        body,
        createPanelDivider(),
        footer
      );
      panelRoot.setAttribute(PANEL_POPUP_HOST_ATTR, "true");
      this.panelRoot = panelRoot;
      this.body = body;
      this.settingsPanel = settingsPanel;
      this.infoPanel = infoPanel;
      this.host.shadow.appendChild(panelRoot);
      this.applyPanelBodyMinHeight(body);
      this.attachPanelEscapeKeyHandler();
      refreshPanels();
      setActiveTab(tab === "shortcuts" ? "settings" : tab);
    }
    showTab(tab) {
      if (!this.body) return;
      this.activeTab = tab;
      const strings = this.host.getStrings();
      this.panelRoot.lang = localeToHtmlLang(this.host.getLocale());
      this.panelRoot.dir = this.host.isRtl() ? "rtl" : "ltr";
      switch (tab) {
        case "settings":
          populateSettingsPanel(this.host, this.body, this.panelRoot, () => this.refreshPopup(), true);
          break;
        case "shortcuts":
          buildShortcutsPanelBody(this.body, strings);
          break;
        case "info":
          buildAboutPanelBody(this.body, strings);
          break;
      }
      this.menu?.setActive(tab);
    }
    refreshPopup() {
      if (!this.body || this.host.surface !== "popup") return;
      this.showTab(this.activeTab);
    }
    close() {
      const panelRoots = Array.from(
        this.host.shadow.querySelectorAll(".dd-panel")
      );
      if (!panelRoots.length) {
        this.detachPanelEscapeKeyHandler();
        return;
      }
      this.detachPanelEscapeKeyHandler();
      panelRoots.forEach((n) => n.remove());
      this.panelRoot = null;
      this.body = null;
      this.menu = null;
      this.settingsPanel = null;
      this.infoPanel = null;
      this.host.onClose?.();
    }
    attachPanelEscapeKeyHandler() {
      if (this.boundPanelEscapeKey) return;
      this.boundPanelEscapeKey = (e) => {
        if (e.key !== "Escape") return;
        e.preventDefault();
        e.stopPropagation();
        this.close();
      };
      document.addEventListener("keydown", this.boundPanelEscapeKey, true);
    }
    detachPanelEscapeKeyHandler() {
      if (!this.boundPanelEscapeKey) return;
      document.removeEventListener("keydown", this.boundPanelEscapeKey, true);
      this.boundPanelEscapeKey = null;
    }
    applyPanelBodyMinHeight(body) {
      if (panelBodyMinPx == null) {
        panelBodyMinPx = measureGermanSettingsBodyHeight(this.host, this.host.shadow);
      }
      body.style.setProperty(PANEL_BODY_MIN_VAR, `${panelBodyMinPx}px`);
    }
    populateOverlayInfoPanel(panel, copy = this.host.getStrings()) {
      const items = buildAboutListItems(copy);
      let list = panel.querySelector(".dd-about-list");
      if (list) {
        list.setAttribute("aria-label", copy.tabAbout);
        const existing = list.querySelectorAll(".dd-about-item");
        items.forEach((item, index) => {
          const el = existing[index];
          const text = el?.querySelector(".dd-about-text");
          if (text) text.textContent = item.text;
          const mark = el?.querySelector(".dd-about-bool");
          if (mark) mark.innerHTML = item.iconHtml;
        });
        return;
      }
      panel.replaceChildren();
      list = document.createElement("ul");
      list.className = "dd-about-list";
      list.setAttribute("aria-label", copy.tabAbout);
      for (const item of items) {
        list.appendChild(this.createOverlayAboutItem(item.iconHtml, item.text));
      }
      panel.append(list);
    }
    createOverlayAboutItem(iconHtml, text) {
      const li = document.createElement("li");
      li.className = "dd-about-item dd-about-item--bool";
      const mark = document.createElement("span");
      mark.className = "dd-about-bool";
      mark.setAttribute("aria-hidden", "true");
      mark.innerHTML = iconHtml;
      const label = document.createElement("span");
      label.className = "dd-about-text";
      label.textContent = text;
      li.append(mark, label);
      return li;
    }
  };

  // src/panel-popup/mount-panel-surface.ts
  async function mountPanelSurface(initialTab, { hostStyle, surface }) {
    let locale = "en";
    let notificationSeconds = 4;
    let startHotkeyEnabled = true;
    let escHotkeyEnabled = true;
    let undoHotkeyEnabled = true;
    let selectionCaptionStyle = "click-to-delete";
    let allElementsOutlineEnabled = false;
    let allElementsFillEnabled = false;
    const { shadow } = mountPanelShadowHost({
      rootId: PANEL_POPUP_ROOT_ID,
      hostClassName: "dd-panel-popup",
      hostAttr: PANEL_POPUP_HOST_ATTR,
      hostStyle,
      cssContent: `.dd-panel-header {
  flex: 0 0 auto;
  padding: 1.125rem 1.125rem 0;
}

.dd-panel-divider {
  flex: 0 0 auto;
  width: 90%;
  height: 1px;
  margin-inline: auto;
  background: #b91c1c;
}

.dd-panel-title-row {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas: "stack";
  align-items: center;
}

.dd-panel-logo,
.dd-panel-heading {
  grid-area: stack;
}

.dd-panel-logo {
  display: flex;
  align-items: stretch;
  align-self: stretch;
  justify-self: start;
  line-height: 0;
  z-index: 1;
}

.dd-panel-logo svg {
  display: block;
  height: 100%;
  width: auto;
  aspect-ratio: 1;
  flex-shrink: 0;
}

.dd-panel-heading {
  justify-self: center;
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.12rem;
  min-width: 0;
  max-width: 100%;
  font-size: 0.82rem;
}

.dd-panel-title {
  margin: 0;
  font-size: inherit;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-align: center;
  text-transform: uppercase;
  color: #012292;
}

.dd-panel-subtitle {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1.2;
  white-space: nowrap;
  text-align: center;
  color: #666666;
}

.dd-panel-footer {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  gap: 0.55rem;
  margin-top: auto;
  padding: 1.125rem;
}

.dd-panel-footer a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: #999;
  border-radius: 0.35rem;
  text-decoration: none;
  background: transparent;
}

.dd-panel-footer a:hover,
.dd-panel-footer a:focus-visible {
  color: #b91c1c;
}

.dd-panel-footer svg {
  display: block;
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
}

:host(.dd-panel-popup) {
  display: flex;
  flex-direction: column;
  position: relative;
  inset: auto;
  width: 100%;
  min-height: 500px;
  height: auto;
  pointer-events: auto;
  z-index: 1;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.3;
  color: #1f2937;
}

:host(.dd-panel-popup) *,
:host(.dd-panel-popup) *::before,
:host(.dd-panel-popup) *::after {
  box-sizing: border-box;
}

:host(.dd-panel-popup) button:focus:not(:focus-visible),
:host(.dd-panel-popup) a:focus:not(:focus-visible) {
  outline: none;
}

:host(.dd-panel-popup) button:focus-visible,
:host(.dd-panel-popup) a:focus-visible,
:host(.dd-panel-popup) input:focus-visible {
  outline: 2px solid #b91c1c;
}

.dd-panel {
  display: flex;
  flex-direction: column;
  width: min(21rem, calc(100vw - 2rem));
  max-height: calc(100dvh - 2rem);
  overflow: hidden;
  color: #1f2937;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px) saturate(1.35);
  -webkit-backdrop-filter: blur(20px) saturate(1.35);
  border: 1px solid rgba(255, 255, 255, 0.78);
  box-shadow:
    0 18px 48px rgba(185, 28, 28, 0.16),
    0 8px 24px rgba(0, 0, 0, 0.22);
}

.dd-panel--surface-popup {
  flex: 1 1 auto;
  width: 100%;
  min-height: 500px;
  max-height: none;
  border-radius: 0;
  border: none;
  box-shadow: none;
}

.dd-panel-main {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
}

.dd-panel--surface-popup > .dd-panel-main {
  align-items: stretch;
  direction: ltr;
}

.dd-panel-menu {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 0.75rem 0 0.75rem 0.75rem;
  padding: 0.35rem;
  border-radius: 0.5rem;
  background: rgba(185, 28, 28, 0.06);
}

.dd-panel--surface-popup .dd-panel-menu {
  --dd-menu-gap: 0.3rem;
  flex: 0 0 2.85rem;
  width: 2.85rem;
  align-self: stretch;
  justify-content: flex-start;
  gap: var(--dd-menu-gap);
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  margin-inline-start: 0.5rem;
  margin-inline-end: 0.3rem;
  padding-block-start: var(--dd-menu-gap);
  padding-inline-end: var(--dd-menu-gap);
  padding-block-end: var(--dd-menu-gap);
  padding-inline-start: var(--dd-menu-gap);
}

.dd-panel-content {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.dd-panel--surface-popup .dd-panel-content {
  flex: 1 1 0;
  min-width: 0;
}

.dd-panel[dir="rtl"] .dd-panel-content {
  direction: rtl;
}

.dd-panel-menu-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 0.4rem;
  background: transparent;
  color: #4b5563;
  cursor: pointer;
}

.dd-panel-menu-btn svg {
  display: block;
  width: 1.15rem;
  height: 1.15rem;
}

.dd-panel-menu-btn:hover,
.dd-panel-menu-btn:focus-visible {
  color: #b91c1c;
  background: rgba(185, 28, 28, 0.08);
}

.dd-panel-menu-btn--active {
  color: #b91c1c;
  background: rgba(185, 28, 28, 0.14);
}

.dd-panel-menu-btn::after {
  content: attr(data-tooltip);
  position: absolute;
  left: calc(100% + 0.45rem);
  top: 50%;
  z-index: 2;
  transform: translateY(-50%);
  padding: 0.28rem 0.5rem;
  border-radius: 0.35rem;
  background: #111827;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0s ease,
    visibility 0s linear 0s;
}

.dd-panel-menu-btn:hover::after,
.dd-panel-menu-btn:focus-visible::after {
  opacity: 1;
  visibility: visible;
}

.dd-panel-page {
  margin: 0;
}

.dd-panel-page-title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #111827;
}

.dd-panel--surface-popup .dd-panel-page-title {
  text-align: center;
}

.dd-panel-page-divider {
  width: 100%;
  margin: 0 0 0.5rem;
}

.dd-panel--surface-popup .dd-panel-body {
  flex: 1 1 auto;
  overflow: visible;
  padding: 1rem 0.95rem;
}

.dd-panel--surface-popup .dd-panel-page--settings {
  text-align: center;
}

.dd-panel--surface-popup > .dd-panel-main > .dd-panel-content > .dd-panel-body:has(.dd-panel-page--about) {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.dd-panel-page--about {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
}

.dd-panel-page--about .dd-panel-page-title {
  width: 100%;
  text-align: center;
}

.dd-about-credit {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: auto;
  padding-top: 0.75rem;
  text-align: center;
  font-size: 0.75rem;
  color: #9ca3af;
}

.dd-about-credit-divider {
  width: 100%;
  margin: 0 0 0.5rem;
}

.dd-about-credit-line {
  margin: 0;
  line-height: 1.35;
}

.dd-panel-page--shortcuts {
  width: 100%;
}

.dd-shortcuts-heading {
  margin: 0.5rem 0 0;
  font-size: 0.84rem;
  line-height: 1.45;
  font-weight: 700;
  color: #374151;
  text-align: left;
}

.dd-shortcuts-undo-block {
  margin: 0;
}

.dd-shortcuts-undo-row {
  margin: 0.12rem 0 0;
  padding-left: 1.15rem;
  font-size: 0.84rem;
  line-height: 1.45;
  color: #374151;
  text-align: left;
}

.dd-shortcuts-safety {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  margin-top: 0.85rem;
}

.dd-shortcuts-note {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.2;
  color: #6b7280;
  text-align: left;
}

.dd-shortcuts-step-release-bold {
  font-weight: 600;
}

.dd-shortcuts-divider {
  margin: 0.55rem 0 0.35rem;
}

.dd-shortcuts-steps {
  margin: 0.2rem 0 0.35rem;
  padding-left: 1.15rem;
  font-size: 0.84rem;
  line-height: 1.45;
  color: #374151;
  text-align: left;
}

.dd-shortcuts-steps li {
  margin-bottom: 0.2rem;
}

.dd-shortcuts-steps li:last-child {
  margin-bottom: 0;
}

.dd-shortcuts-step-press-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 0.35em;
  align-items: start;
}

.dd-shortcuts-step-press-label {
  grid-column: 1;
  grid-row: 1;
}

.dd-shortcuts-step-press-chords {
  grid-column: 2;
  grid-row: 1;
  min-width: 0;
}

.dd-shortcuts-step-press-mac-label {
  grid-column: 1;
  grid-row: 2;
}

.dd-shortcuts-step-press-mac-chords {
  grid-column: 2;
  grid-row: 2;
  min-width: 0;
}

.dd-about-icon {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  line-height: 0;
  color: #6b7280;
}

.dd-about-icon svg {
  display: block;
  width: 1rem;
  height: 1rem;
}

.dd-about-kbd {
  display: inline-block;
  padding: 0.08rem 0.35rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  background: #f9fafb;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8em;
  font-weight: 600;
  line-height: 1.3;
  color: #111827;
}

.dd-panel--surface-popup .dd-about-list {
  width: 100%;
  max-width: 100%;
  margin: 0 0 0.85rem;
}

.dd-panel-tabs {
  flex: 0 0 auto;
  padding: 1.125rem 1.125rem 0;
}

.dd-tab-group {
  display: flex;
  gap: 0.35rem;
  min-width: 0;
}

.dd-chip {
  border: 1px solid rgba(0, 0, 0, 0.07);
  background: #fff;
  color: #1f2937;
  cursor: pointer;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 10px rgba(0, 0, 0, 0.06);
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.dd-chip.is-active {
  background: #b91c1c;
  border-color: #b91c1c;
  color: #fff;
  box-shadow: none;
}

.dd-chip.is-active:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.9);
}

.dd-chip:not(.is-active):hover,
.dd-chip:not(.is-active):focus-visible {
  color: #b91c1c;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06), 0 0 14px rgba(0, 0, 0, 0.09);
}

.dd-lang-btn.is-active:hover,
.dd-lang-btn.is-active:focus-visible {
  color: #fff;
}

.dd-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 0.5rem;
  border-radius: 0.45rem 0.45rem 0 0;
  font-weight: 700;
  font-size: 0.72rem;
  line-height: 1;
  letter-spacing: 0.04em;
  white-space: nowrap;
  text-align: center;
}

.dd-panel:lang(zh-CN) .dd-tab {
  letter-spacing: normal;
}

.dd-tab:not(.is-active) {
  border: 1px solid transparent;
  background: transparent;
  box-shadow: none;
  color: #b91c1c;
}

.dd-tab:not(.is-active):focus-visible {
  outline: 2px solid #b91c1c;
  outline-offset: 2px;
}

.dd-panel-body {
  display: grid;
  flex: 1 1 auto;
  min-height: var(--dd-panel-body-min, 0);
  overflow-y: auto;
  padding: 0 1.125rem;
}

.dd-panel:not(.dd-panel--surface-popup) .dd-panel-body {
  display: grid;
}

.dd-panel--surface-popup > .dd-panel-main > .dd-panel-content > .dd-panel-body {
  display: block;
  min-height: var(--dd-panel-body-min, 0);
}

.dd-tab-panel {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  visibility: hidden;
  pointer-events: none;
  min-width: 0;
  min-height: 100%;
  padding-block: 1.125rem;
}

.dd-tab-panel.is-active {
  visibility: visible;
  pointer-events: auto;
}

.dd-tab-panel.is-settings {
  text-align: center;
  align-items: stretch;
}

.dd-tab-panel.is-about {
  align-items: center;
}

.dd-panel-body p {
  margin: 0 0 0.55rem;
  font-size: 0.84rem;
  line-height: 1.45;
  color: #374151;
  text-align: left;
}

.dd-about-list {
  list-style: none;
  width: fit-content;
  max-width: 100%;
  margin: 0;
  padding: 0;
}

.dd-about-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.35rem;
  font-size: 0.84rem;
  line-height: 1.45;
  color: #374151;
  text-align: left;
}

.dd-about-item:last-child {
  margin-bottom: 0;
}

.dd-about-bool {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  line-height: 0;
  color: #6b7280;
}

.dd-about-bool svg {
  display: block;
  width: 1rem;
  height: 1rem;
}

.dd-panel-body a {
  color: #b91c1c;
  text-decoration: none;
}

.dd-panel-body a:hover,
.dd-panel-body a:focus-visible {
  text-decoration: underline;
}

.dd-panel-body a:focus-visible {
  outline: none;
}

/* ABOUT credit: beats .dd-panel-body p / a on <p> and <a> inside credit */
.dd-panel-body .dd-about-credit {
  margin-top: auto;
  margin-inline: 0;
  margin-bottom: 0;
  font-size: 0.75rem;
  line-height: 1.35;
  color: #9ca3af;
  text-align: center;
}

.dd-panel-body .dd-about-credit .dd-about-credit-line {
  margin: 0;
  font-size: inherit;
  line-height: 1.35;
  color: inherit;
  text-align: center;
}

.dd-panel-body .dd-about-credit a:any-link {
  color: #9ca3af;
  text-decoration: underline;
}

.dd-panel-body .dd-about-credit a:hover,
.dd-panel-body .dd-about-credit a:focus-visible {
  color: #9ca3af;
  text-decoration: underline;
}

.dd-field {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.55rem;
  margin-top: 1.5rem;
}

.dd-field:first-of-type {
  margin-top: 0;
}

.dd-caption-style-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  column-gap: 0.75rem;
  width: 100%;
  min-width: 0;
  margin-top: 1.5rem;
}

.dd-panel-page--settings .dd-caption-style-row {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  gap: 0.75rem;
}

.dd-caption-style-label {
  flex: 1 1 50%;
  min-width: 0;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  color: #1f2937;
  text-align: start;
}

.dd-panel-page--settings .dd-caption-style-label {
  display: flex;
  align-items: center;
}

.dd-caption-style-select {
  flex: 0 0 50%;
  width: 50%;
  min-width: 0;
  padding: 0.45rem 0.55rem;
  padding-inline-end: 1.45rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 0.45rem;
  background: #fff;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.45rem center;
  background-size: 10px 6px;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
  color: #1f2937;
}

.dd-caption-style-select:focus-visible {
  outline: 2px solid #012292;
  outline-offset: 1px;
}

.dd-toggle-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  width: 100%;
  margin-top: 1.5rem;
}

.dd-toggle-label {
  flex: 0 1 auto;
  min-width: 0;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  color: #1f2937;
  text-align: start;
}

.dd-toggle-label kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.76rem;
  font-weight: 600;
  padding: 0.1rem 0.35rem;
  border-radius: 0.25rem;
  background: rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.07);
}

.dd-toggle {
  position: relative;
  flex: 0 0 auto;
  width: 2.5rem;
  height: 1.4rem;
  padding: 0;
  border: 1px solid rgba(0, 0, 0, 0.07);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.12);
  cursor: pointer;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 10px rgba(0, 0, 0, 0.06);
}

.dd-toggle.is-on {
  background: #b91c1c;
  border-color: #b91c1c;
}

.dd-toggle::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 0.15rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: #fff;
  transform: translateY(-50%);
  transition: left 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.dd-toggle.is-on::after {
  left: calc(100% - 1rem - 0.15rem);
}

.dd-toggle:focus-visible {
  outline: 2px solid #b91c1c;
}

.dd-lang-row {
  display: flex;
  width: 100%;
  gap: 0.3rem;
  /* README: EN | ES | … order is fixed; panel RTL must not mirror this row. */
  direction: ltr;
}

.dd-lang-btn {
  flex: 1 1 0;
  min-width: 0;
  padding: 0.35rem 0.25rem;
  border-radius: 0.4rem;
  font-size: 0.78rem;
  font-weight: 600;
}

.dd-toggle-row--notification {
  position: relative;
  justify-content: stretch;
  gap: 0;
}

.dd-toggle-row--notification .dd-number {
  flex: 1 1 auto;
  width: 100%;
}

.dd-toggle-row--notification .dd-tooltip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 0.35rem);
  z-index: 1;
  max-width: min(16rem, 100%);
  padding: 0.35rem 0.5rem;
  border-radius: 0.35rem;
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.35;
  color: #fff;
  text-align: center;
  white-space: normal;
  background: rgba(0, 0, 0, 0.82);
  transform: translateX(-50%);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 0.12s ease,
    visibility 0.12s ease;
}

.dd-toggle-row--notification:hover .dd-tooltip,
.dd-toggle-row--notification:focus-within .dd-tooltip {
  opacity: 1;
  visibility: visible;
}

.dd-number {
  display: flex;
  align-items: stretch;
  gap: 0;
  padding: 0;
  overflow: hidden;
  width: 100%;
  border-radius: 0.55rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.07);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 10px rgba(0, 0, 0, 0.06);
}

.dd-number-value {
  position: relative;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.dd-number-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  min-width: 0;
  max-width: 100%;
  cursor: text;
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.2;
  color: #1f2937;
}

.dd-number-prefix,
.dd-number-suffix {
  flex: 0 0 auto;
  white-space: nowrap;
}

.dd-number-value input {
  box-sizing: content-box;
  flex: 0 0 auto;
  width: 2.5ch;
  min-width: 2.5ch;
  max-width: 2.5ch;
  margin: 0;
  padding: 0.35rem 0.1rem;
  border: none;
  border-radius: 0;
  background: transparent;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #b91c1c;
  -moz-appearance: textfield;
  appearance: textfield;
}

.dd-number-value:focus-within {
  box-shadow: inset 0 0 0 2px #b91c1c;
}

.dd-number-value input:focus,
.dd-number-value input:focus-visible {
  outline: none;
}

.dd-number-value input::-webkit-outer-spin-button,
.dd-number-value input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.dd-chevron {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.85rem;
  min-height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: #1f2937;
  border-radius: 0;
  cursor: pointer;
}

:where(.dd-chevron) svg {
  display: block;
  flex-shrink: 0;
}

.dd-chevron svg {
  width: 0.95rem;
  height: 0.95rem;
}

.dd-chevron:hover,
.dd-chevron:focus-visible {
  color: #b91c1c;
}

.dd-toast-stack {
  position: fixed;
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: min(380px, calc(100vw - 2rem));
  pointer-events: none;
}

@media (min-width: 701px) {
  .dd-toast-stack {
    right: 1rem;
    bottom: 1rem;
    left: auto;
    align-items: flex-end;
  }
}

@media (max-width: 700px) {
  .dd-toast-stack {
    left: 50%;
    bottom: 1rem;
    transform: translateX(-50%);
    align-items: center;
  }
}

.dd-toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  flex-wrap: nowrap;
  width: 100%;
  min-height: 1cm;
  padding: 0.06rem 0.5rem;
  color: #fff;
  border-radius: 0.5rem;
  background: rgba(185, 28, 28, 0.66);
  backdrop-filter: blur(14px) saturate(1.25);
  -webkit-backdrop-filter: blur(14px) saturate(1.25);
  border: 1px solid rgba(255, 255, 255, 0.38);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.38);
  pointer-events: auto;
}

.dd-toast.is-restored {
  background: rgba(1, 34, 146, 0.66);
}

.dd-toast-leading,
.dd-toast-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.dd-toast-leading {
  flex: 1 1 auto;
  min-width: 0;
}

.dd-toast-actions {
  flex: 0 0 auto;
}

.dd-toast-mark {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  line-height: 0;
}

.dd-toast-label {
  display: flex;
  align-items: center;
  gap: 0.25em;
  flex: 1 1 auto;
  min-width: 0;
  font-weight: 700;
  font-size: 0.72rem;
  line-height: 1.2;
  overflow: hidden;
}

.dd-toast-status {
  flex: 0 0 auto;
  white-space: nowrap;
}

.dd-toast-target {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dd-toast .dd-icon-btn {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  min-height: 1.36rem;
  padding: 0.28rem;
  border: none;
  background: rgba(0, 0, 0, 0.22);
  color: #fff;
  border-radius: 0.35rem;
  cursor: pointer;
  box-shadow: none;
}

.dd-toast .dd-icon-btn:hover,
.dd-toast .dd-icon-btn:focus-visible {
  background: rgba(0, 0, 0, 0.3);
  color: #fef9c3;
}

.dd-toast .dd-icon-btn:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.9);
}

.dd-toast-mark svg {
  display: block;
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
}

.dd-toast .dd-icon-btn svg {
  width: 0.8rem;
  height: 0.8rem;
}
`
    });
    [
      notificationSeconds,
      locale,
      startHotkeyEnabled,
      escHotkeyEnabled,
      undoHotkeyEnabled,
      selectionCaptionStyle,
      allElementsOutlineEnabled,
      allElementsFillEnabled
    ] = await Promise.all([
      getNotificationSeconds(),
      getLocale(),
      getStartHotkeyEnabled(),
      getEscHotkeyEnabled(),
      getUndoHotkeyEnabled(),
      getSelectionCaptionStyle(),
      getAllElementsOutlineEnabled(),
      getAllElementsFillEnabled()
    ]);
    let panelWindow;
    const toast = new ToastSystem({
      shadow,
      getNotificationSeconds: () => notificationSeconds,
      getStrings: () => t(locale),
      isRtl: () => isRtlLocale(locale),
      openPanel: (tab) => panelWindow.openPanel(tab),
      undoById: async () => false
    });
    panelWindow = new PanelWindowSystem({
      shadow,
      surface,
      onClose: () => window.close(),
      getLocale: () => locale,
      setLocale: (next) => {
        locale = next;
      },
      getNotificationSeconds: () => notificationSeconds,
      setNotificationSeconds: (seconds) => {
        notificationSeconds = seconds;
      },
      getStartHotkeyEnabled: () => startHotkeyEnabled,
      setStartHotkeyEnabled: (enabled) => {
        startHotkeyEnabled = enabled;
      },
      getEscHotkeyEnabled: () => escHotkeyEnabled,
      setEscHotkeyEnabled: (enabled) => {
        escHotkeyEnabled = enabled;
      },
      getUndoHotkeyEnabled: () => undoHotkeyEnabled,
      setUndoHotkeyEnabled: (enabled) => {
        undoHotkeyEnabled = enabled;
      },
      getSelectionCaptionStyle: () => selectionCaptionStyle,
      setSelectionCaptionStyle: (style) => {
        selectionCaptionStyle = style;
      },
      getAllElementsOutlineEnabled: () => allElementsOutlineEnabled,
      setAllElementsOutlineEnabled: (enabled) => {
        allElementsOutlineEnabled = enabled;
      },
      getAllElementsFillEnabled: () => allElementsFillEnabled,
      setAllElementsFillEnabled: (enabled) => {
        allElementsFillEnabled = enabled;
      },
      getStrings: () => t(locale),
      isRtl: () => isRtlLocale(locale),
      toast
    });
    panelWindow.openPanel(initialTab);
  }

  // src/panel-popup/mount.ts
  var PANEL_POPUP_HOST_STYLE = "display:block;width:372px;min-height:500px;position:relative;pointer-events:auto;";
  async function mountPanelPopup(initialTab) {
    await mountPanelSurface(initialTab, {
      hostStyle: PANEL_POPUP_HOST_STYLE,
      surface: "popup"
    });
  }

  // ../lib/our/panel-popup/page-path.ts
  function getPanelPageUrl(pageHtml) {
    return ext.runtime.getURL(pageHtml);
  }
  function isPanelPage(href, pageHtml) {
    return href.startsWith(getPanelPageUrl(pageHtml));
  }

  // ../lib/our/panel-popup/resolve-tab.ts
  function resolveInitialPanelTab(sessionTab, queryTab, defaultTab, validTabs) {
    if (typeof sessionTab === "string" && validTabs.includes(sessionTab)) {
      return sessionTab;
    }
    if (typeof queryTab === "string" && validTabs.includes(queryTab)) {
      return queryTab;
    }
    return defaultTab;
  }
  async function resolvePanelPageInitialTab(config) {
    const { [config.sessionTabKey]: sessionTab } = await ext.storage.session.get(
      config.sessionTabKey
    );
    await ext.storage.session.remove(config.sessionTabKey);
    const tabParam = new URLSearchParams(location.search).get(
      config.tabQueryParam ?? "tab"
    );
    return resolveInitialPanelTab(sessionTab, tabParam, config.defaultTab, config.validTabs);
  }

  // ../lib/our/panel-tab/index.ts
  var PANEL_TAB_MODE_PARAM = "mode";
  var PANEL_TAB_MODE_VALUE = "tab";
  function isPanelTabMode(modeParam = PANEL_TAB_MODE_PARAM, modeValue = PANEL_TAB_MODE_VALUE, search = location.search) {
    return new URLSearchParams(search).get(modeParam) === modeValue;
  }
  function applyPanelTabPageLayout(pageClass) {
    document.documentElement.classList.add(pageClass);
  }

  // src/panel-tab/constants.ts
  var PANEL_TAB_PAGE_CLASS = "dd-panel-page--tab";
  var PANEL_TAB_HOST_STYLE = "display:block;width:100%;max-width:360px;min-height:520px;position:relative;pointer-events:auto;";

  // src/panel-popup/page.ts
  function isPanelPopupPage(href) {
    return isPanelPage(href, PANEL_POPUP_PAGE);
  }
  async function resolvePanelPageInitialTab2() {
    return resolvePanelPageInitialTab({
      sessionTabKey: PANEL_PAGE_CONFIG.sessionTabKey,
      defaultTab: "settings",
      validTabs: PANEL_POPUP_TABS
    });
  }
  async function bootstrapPanelPopupPageIfNeeded() {
    if (!isPanelPopupPage(location.href)) return;
    if (isPanelTabMode()) return;
    const tab = await resolvePanelPageInitialTab2();
    await mountPanelPopup(tab);
  }

  // src/panel-tab/layout.ts
  function applyPanelTabPageLayout2() {
    applyPanelTabPageLayout(PANEL_TAB_PAGE_CLASS);
  }

  // src/panel-tab/mount.ts
  async function mountPanelTab(initialTab) {
    applyPanelTabPageLayout2();
    await mountPanelSurface(initialTab, { hostStyle: PANEL_TAB_HOST_STYLE });
  }

  // src/panel-tab/bootstrap.ts
  async function bootstrapPanelTabPageIfNeeded() {
    if (!isPanelPopupPage(location.href)) return;
    if (!isPanelTabMode()) return;
    const tab = await resolvePanelPageInitialTab2();
    await mountPanelTab(tab);
  }

  // src/content.ts
  function getState() {
    if (!window.__elementDeleterState) {
      window.__elementDeleterState = {
        active: false,
        ui: null,
        undoStack: [],
        nextUndoId: 0
      };
    }
    const state2 = window.__elementDeleterState;
    state2.undoStack ??= [];
    state2.nextUndoId ??= 0;
    return state2;
  }
  function createUndoAccess(state2) {
    return {
      stack: state2.undoStack,
      allocId: () => state2.nextUndoId++
    };
  }
  function hasRestorableUndo(state2) {
    return state2.undoStack.some((entry) => resolveUndoEntryParent(entry) !== null);
  }
  function resetState(state2) {
    if (state2.active) {
      state2.ui?.deactivate();
      removeAllElementsPageStyles();
    }
    unmountDeleterContentHotkeys();
    state2.active = false;
    state2.ui = null;
    state2.undoStack.length = 0;
    state2.nextUndoId = 0;
    document.getElementById("element-deleter-root")?.remove();
  }
  function isExtensionNode(node) {
    if (!node) return true;
    if (node instanceof Element && node.closest?.("[data-element-deleter-ui]")) {
      return true;
    }
    return false;
  }
  function resolveContextMenuTarget(raw) {
    if (!(raw instanceof Element)) return null;
    if (isExtensionNode(raw)) return null;
    if (raw === document.documentElement || raw === document.body) return null;
    return raw;
  }
  function attachContextMenuTargetListener() {
    const prev = window.__elementDeleterContextMenuHandler;
    if (prev) {
      document.removeEventListener("contextmenu", prev, true);
    }
    const handler = (e) => {
      window.__elementDeleterContextMenuTarget = resolveContextMenuTarget(e.target);
    };
    window.__elementDeleterContextMenuHandler = handler;
    document.addEventListener("contextmenu", handler, true);
  }
  function notifyBackgroundActive(isActive) {
    const msg = { type: "ACTIVE_CHANGED", active: isActive };
    void ext.runtime.sendMessage(msg).catch(() => {
    });
  }
  function requestOpenPanel(tab) {
    const msg = { type: "OPEN_PANEL", tab };
    void ext.runtime.sendMessage(msg).catch(() => {
    });
  }
  function requestToggle() {
    const msg = { type: "TOGGLE_REQUEST" };
    void ext.runtime.sendMessage(msg).catch(() => {
    });
  }
  function requestBadgeFlash(variant) {
    const msg = { type: "BADGE_FLASH", variant };
    void ext.runtime.sendMessage(msg).catch(() => {
    });
  }
  function attachMessageHandler(state2) {
    const prev = window.__elementDeleterMessageHandler;
    if (prev) {
      try {
        ext.runtime.onMessage.removeListener(prev);
      } catch {
      }
    }
    const deactivate = () => {
      if (!state2.active) return;
      state2.active = false;
      unmountDeleterContentHotkeys();
      state2.ui?.deactivate();
      removeAllElementsPageStyles();
      notifyBackgroundActive(false);
    };
    const openPanel = (tab) => {
      requestOpenPanel(tab);
    };
    let uiInit = null;
    const ensureUi = async () => {
      if (state2.ui) return state2.ui;
      if (!uiInit) {
        uiInit = (async () => {
          const ui = new DeleterUI(deactivate, {
            openPanel,
            undo: createUndoAccess(state2),
            onElementDeleted: () => requestBadgeFlash("deleted"),
            onElementRestored: () => requestBadgeFlash("restored")
          });
          await ui.loadSettings();
          state2.ui = ui;
          return ui;
        })();
      }
      try {
        return await uiInit;
      } catch (error) {
        uiInit = null;
        throw error;
      }
    };
    const hotkeysHost = {
      isActive: () => state2.active,
      deactivate,
      requestToggle,
      hasRestorableUndo: () => hasRestorableUndo(state2),
      ensureUi
    };
    const activate = async () => {
      if (state2.active) return true;
      try {
        const ui = await ensureUi();
        state2.active = true;
        mountDeleterContentHotkeys(hotkeysHost);
        ui.activate();
        const ok = document.getElementById("element-deleter-root")?.isConnected === true;
        if (!ok) {
          deactivate();
          return false;
        }
        notifyBackgroundActive(true);
        return true;
      } catch {
        deactivate();
        return false;
      }
    };
    const handler = (message, _sender, sendResponse) => {
      if (message.type === "SET_ACTIVE") {
        if (message.active) {
          void activate().then((ok) => sendResponse({ ok }));
          return true;
        }
        deactivate();
        return;
      }
      if (message.type === "SETTINGS_UPDATED") {
        if (state2.active) {
          applyAllElementsPageStyles({
            outline: message.allElementsOutlineEnabled,
            fill: message.allElementsFillEnabled
          });
        }
        if (state2.ui) {
          state2.ui.setNotificationSeconds(message.notificationSeconds);
          state2.ui.setLocale(message.locale);
          state2.ui.setSelectionCaptionStyle(message.selectionCaptionStyle);
        }
        return;
      }
      if (message.type === "DELETE_CONTEXT_ELEMENT") {
        void (async () => {
          const target = window.__elementDeleterContextMenuTarget;
          window.__elementDeleterContextMenuTarget = null;
          if (!target?.isConnected || isExtensionNode(target)) return;
          const ui = await ensureUi();
          await ui.deleteContextElement(target);
        })();
        return;
      }
    };
    window.__elementDeleterMessageHandler = handler;
    ext.runtime.onMessage.addListener(handler);
  }
  var state = getState();
  var runtimeId = ext.runtime.id;
  if (window.__elementDeleterRuntimeId !== void 0 && window.__elementDeleterRuntimeId !== runtimeId) {
    resetState(state);
  }
  window.__elementDeleterRuntimeId = runtimeId;
  registerDocumentOperabilityProbeListener();
  attachContextMenuTargetListener();
  attachMessageHandler(state);
  registerDeleterStartHotkey(requestToggle);
  void bootstrapPanelTabPageIfNeeded();
  void bootstrapPanelPopupPageIfNeeded();
  async function syncAllElementsPageStylesFromStorage(state2) {
    if (!state2.active) return;
    const [outline, fill] = await Promise.all([
      getAllElementsOutlineEnabled(),
      getAllElementsFillEnabled()
    ]);
    applyAllElementsPageStyles({ outline, fill });
  }
  async function syncSelectionCaptionFromStorage(state2) {
    if (!state2.ui) return;
    const selectionCaptionStyle = await getSelectionCaptionStyle();
    state2.ui.setSelectionCaptionStyle(selectionCaptionStyle);
  }
  ext.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    const outlineOrFillChanged = changes.allElementsOutlineEnabled || changes.allElementsFillEnabled;
    if (!outlineOrFillChanged && !changes.selectionCaptionStyle) {
      return;
    }
    if (outlineOrFillChanged) {
      void syncAllElementsPageStylesFromStorage(state);
    }
    if (changes.selectionCaptionStyle) {
      void syncSelectionCaptionFromStorage(state);
    }
  });
})();
