"use strict";
function getState() {
  if (!window.__elementDeleterState) {
    window.__elementDeleterState = {
      active: false,
      ui: null,
      undoStack: [],
      nextUndoId: 0,
      sessionHadDeletion: false,
    };
  }
  const state2 = window.__elementDeleterState;
  state2.undoStack ??= [];
  state2.nextUndoId ??= 0;
  state2.sessionHadDeletion ??= false;
  return state2;
}
function createUndoAccess(state2) {
  return {
    stack: state2.undoStack,
    allocId: () => state2.nextUndoId++,
  };
}
function hasRestorableUndo(state2) {
  return state2.undoStack.some(
    (entry) => resolveUndoEntryParent(entry) !== null,
  );
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
  state2.sessionHadDeletion = false;
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
    window.__elementDeleterContextMenuTarget = resolveContextMenuTarget(
      e.target,
    );
  };
  window.__elementDeleterContextMenuHandler = handler;
  document.addEventListener("contextmenu", handler, true);
}
function notifyBackgroundActive(isActive) {
  const msg = { type: "ACTIVE_CHANGED", active: isActive };
  void ext.runtime.sendMessage(msg).catch(() => {});
}
function requestOpenPanel(tab) {
  const msg = { type: "OPEN_PANEL", tab };
  void ext.runtime.sendMessage(msg).catch(() => {});
}
function requestToggle() {
  const msg = { type: "TOGGLE_REQUEST" };
  void ext.runtime.sendMessage(msg).catch(() => {});
}
function requestBadgeFlash(variant) {
  const msg = { type: "BADGE_FLASH", variant };
  void ext.runtime.sendMessage(msg).catch(() => {});
}
function recordSupportSurveyAction() {
  const msg = { type: "SUPPORT_SURVEY_ACTION" };
  void ext.runtime.sendMessage(msg).catch(() => {});
}
function notifyScenarioComplete(hadDeletion) {
  if (!hadDeletion) return;
  const msg = { type: "SCENARIO_COMPLETE" };
  void ext.runtime.sendMessage(msg).catch(() => {});
}
function attachMessageHandler(state2) {
  const prev = window.__elementDeleterMessageHandler;
  if (prev) {
    try {
      ext.runtime.onMessage.removeListener(prev);
    } catch {}
  }
  const deactivate = () => {
    if (!state2.active) return;
    const hadDeletion = state2.sessionHadDeletion;
    state2.active = false;
    state2.sessionHadDeletion = false;
    unmountDeleterContentHotkeys();
    state2.ui?.deactivate();
    removeAllElementsPageStyles();
    notifyBackgroundActive(false);
    notifyScenarioComplete(hadDeletion);
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
          onElementDeleted: () => {
            if (state2.active) state2.sessionHadDeletion = true;
            recordSupportSurveyAction();
            requestBadgeFlash("deleted");
          },
          onElementRestored: () => requestBadgeFlash("restored"),
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
    ensureUi,
  };
  const activate = async () => {
    if (state2.active) return true;
    try {
      const ui = await ensureUi();
      state2.active = true;
      mountDeleterContentHotkeys(hotkeysHost);
      ui.activate();
      const ok =
        document.getElementById("element-deleter-root")?.isConnected === true;
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
          fill: message.allElementsFillEnabled,
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
if (
  window.__elementDeleterRuntimeId !== void 0 &&
  window.__elementDeleterRuntimeId !== runtimeId
) {
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
    getAllElementsFillEnabled(),
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
  const outlineOrFillChanged =
    changes.allElementsOutlineEnabled || changes.allElementsFillEnabled;
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
