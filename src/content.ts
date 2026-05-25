import { ext } from "./api";
import {
  isEditableKeyboardTarget,
  isEscHotkeyEvent,
  isStartHotkeyEvent,
  isUndoHotkeyEvent,
} from "./hotkeys";
import type { BgToContent, ContentActivationResponse, ContentToBg } from "./messages";
import {
  getEscHotkeyEnabled,
  getStartHotkeyEnabled,
  getUndoHotkeyEnabled,
} from "./storage";
import {
  resolveUndoEntryParent,
  type UndoStackAccess,
} from "./restore";
import { DeleterUI } from "./ui";
import { mountPanelPopup } from "./panel-ui";

type ContentState = {
  active: boolean;
  ui: DeleterUI | null;
  undoStack: UndoStackAccess["stack"];
  nextUndoId: number;
};

declare global {
  interface Window {
    __domDeleterRuntimeId?: string;
    __domDeleterMessageHandler?: (
      message: BgToContent,
      sender: chrome.runtime.MessageSender,
    ) => void;
    __domDeleterStartHotkeyHandler?: (e: KeyboardEvent) => void;
    __domDeleterEscHotkeyHandler?: (e: KeyboardEvent) => void;
    __domDeleterUndoHotkeyHandler?: (e: KeyboardEvent) => void;
    __domDeleterContextMenuHandler?: (e: MouseEvent) => void;
    __domDeleterState?: ContentState;
    __domDeleterContextMenuTarget?: Element | null;
  }
}

function getState(): ContentState {
  if (!window.__domDeleterState) {
    window.__domDeleterState = {
      active: false,
      ui: null,
      undoStack: [],
      nextUndoId: 0,
    };
  }
  const state = window.__domDeleterState;
  state.undoStack ??= [];
  state.nextUndoId ??= 0;
  return state;
}

function createUndoAccess(state: ContentState): UndoStackAccess {
  return {
    stack: state.undoStack,
    allocId: () => state.nextUndoId++,
  };
}

function hasRestorableUndo(state: ContentState): boolean {
  return state.undoStack.some((entry) => resolveUndoEntryParent(entry) !== null);
}

function resetState(state: ContentState): void {
  if (state.active) {
    state.ui?.deactivate();
  }
  state.active = false;
  state.ui = null;
  state.undoStack.length = 0;
  state.nextUndoId = 0;
  document.getElementById("dom-deleter-root")?.remove();
}

function isExtensionNode(node: Node | null): boolean {
  if (!node) return true;
  if (node instanceof Element && node.closest?.('[data-dom-deleter-ui]')) {
    return true;
  }
  return false;
}

function resolveContextMenuTarget(raw: EventTarget | null): Element | null {
  if (!(raw instanceof Element)) return null;
  if (isExtensionNode(raw)) return null;
  if (raw === document.documentElement || raw === document.body) return null;
  return raw;
}

function attachContextMenuTargetListener(): void {
  const prev = window.__domDeleterContextMenuHandler;
  if (prev) {
    document.removeEventListener("contextmenu", prev, true);
  }

  const handler = (e: MouseEvent): void => {
    window.__domDeleterContextMenuTarget = resolveContextMenuTarget(e.target);
  };

  window.__domDeleterContextMenuHandler = handler;
  document.addEventListener("contextmenu", handler, true);
}

function notifyBackgroundActive(isActive: boolean): void {
  const msg: ContentToBg = { type: "ACTIVE_CHANGED", active: isActive };
  void ext.runtime.sendMessage(msg).catch(() => {
    /* extension reloaded */
  });
}

function requestOpenPanel(tab: "settings" | "info"): void {
  const msg: ContentToBg = { type: "OPEN_PANEL", tab };
  void ext.runtime.sendMessage(msg).catch(() => {
    /* extension reloaded */
  });
}

function attachMessageHandler(state: ContentState): void {
  const prev = window.__domDeleterMessageHandler;
  if (prev) {
    try {
      ext.runtime.onMessage.removeListener(prev);
    } catch {
      /* previous extension instance */
    }
  }

  const deactivate = (): void => {
    if (!state.active) return;
    state.active = false;
    state.ui?.deactivate();
    notifyBackgroundActive(false);
  };

  const openPanel = (tab: "settings" | "info"): void => {
    requestOpenPanel(tab);
  };

  let uiInit: Promise<DeleterUI> | null = null;

  const ensureUi = async (): Promise<DeleterUI> => {
    if (state.ui) return state.ui;
    if (!uiInit) {
      uiInit = (async () => {
        const ui = new DeleterUI(deactivate, {
          openPanel,
          undo: createUndoAccess(state),
        });
        await ui.loadSettings();
        state.ui = ui;
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

  const activate = async (): Promise<boolean> => {
    if (state.active) return true;
    try {
      const ui = await ensureUi();
      state.active = true;
      ui.activate();
      const ok = document.getElementById("dom-deleter-root")?.isConnected === true;
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

  const handler = (
    message: BgToContent,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ContentActivationResponse) => void,
  ): boolean | void => {
    if (message.type === "SET_ACTIVE") {
      if (message.active) {
        void activate().then((ok) => sendResponse({ ok }));
        return true;
      }
      deactivate();
      return;
    }
    if (message.type === "SETTINGS_UPDATED" && state.ui) {
      state.ui.setNotificationSeconds(message.notificationSeconds);
      state.ui.setLocale(message.locale);
      state.ui.setElementLabelEnabled(message.elementLabelEnabled);
      return;
    }
    if (message.type === "DELETE_CONTEXT_ELEMENT") {
      void (async () => {
        const target = window.__domDeleterContextMenuTarget;
        window.__domDeleterContextMenuTarget = null;
        if (!target?.isConnected || isExtensionNode(target)) return;

        const ui = await ensureUi();
        await ui.deleteContextElement(target);
      })();
    }
  };

  window.__domDeleterMessageHandler = handler;
  ext.runtime.onMessage.addListener(handler);
  attachEscHotkeyListener(state, deactivate);
  attachUndoHotkeyListener(state, ensureUi);
}

function attachUndoHotkeyListener(
  state: ContentState,
  ensureUi: () => Promise<DeleterUI>,
): void {
  const prev = window.__domDeleterUndoHotkeyHandler;
  if (prev) {
    window.removeEventListener("keydown", prev, true);
  }

  const handler = (e: KeyboardEvent): void => {
    if (!isUndoHotkeyEvent(e)) return;
    if (isEditableKeyboardTarget(e.target)) return;
    if (hasRestorableUndo(state)) {
      e.preventDefault();
      e.stopPropagation();
    }
    void (async () => {
      if (!(await getUndoHotkeyEnabled())) return;
      const ui = await ensureUi();
      if (!ui.canUndo()) return;
      await ui.undoLast();
    })();
  };

  window.__domDeleterUndoHotkeyHandler = handler;
  window.addEventListener("keydown", handler, true);
}

function attachEscHotkeyListener(
  state: ContentState,
  deactivate: () => void,
): void {
  const prev = window.__domDeleterEscHotkeyHandler;
  if (prev) {
    window.removeEventListener("keydown", prev, true);
  }

  const handler = (e: KeyboardEvent): void => {
    if (!isEscHotkeyEvent(e)) return;
    void (async () => {
      if (!(await getEscHotkeyEnabled())) return;
      if (!state.active) return;
      e.preventDefault();
      e.stopPropagation();
      deactivate();
    })();
  };

  window.__domDeleterEscHotkeyHandler = handler;
  window.addEventListener("keydown", handler, true);
}

function attachStartHotkeyListener(): void {
  const prev = window.__domDeleterStartHotkeyHandler;
  if (prev) {
    window.removeEventListener("keydown", prev, true);
  }

  const handler = (e: KeyboardEvent): void => {
    if (!isStartHotkeyEvent(e)) return;
    void (async () => {
      if (!(await getStartHotkeyEnabled())) return;
      e.preventDefault();
      e.stopPropagation();
      const msg: ContentToBg = { type: "TOGGLE_REQUEST" };
      await ext.runtime.sendMessage(msg).catch(() => {
        /* extension reloaded */
      });
    })();
  };

  window.__domDeleterStartHotkeyHandler = handler;
  window.addEventListener("keydown", handler, true);
}

const state = getState();
const runtimeId = ext.runtime.id;

if (
  window.__domDeleterRuntimeId !== undefined &&
  window.__domDeleterRuntimeId !== runtimeId
) {
  resetState(state);
}

window.__domDeleterRuntimeId = runtimeId;
attachContextMenuTargetListener();
attachMessageHandler(state);
attachStartHotkeyListener();

// Action popup page: settings / about panel under the extension icon.
const PANEL_POPUP_SESSION_KEY = "panelPopupTab";
const PANEL_PAGE_URL = ext.runtime.getURL("panel-popup-page.html");
if (location.href.startsWith(PANEL_PAGE_URL)) {
  void (async () => {
    const { panelPopupTab } = await ext.storage.session.get(PANEL_POPUP_SESSION_KEY);
    await ext.storage.session.remove(PANEL_POPUP_SESSION_KEY);
    const tabParam = new URLSearchParams(location.search).get("tab");
    const tab =
      panelPopupTab === "info" || tabParam === "info" ? "info" : "settings";
    await mountPanelPopup(tab);
  })();
}
