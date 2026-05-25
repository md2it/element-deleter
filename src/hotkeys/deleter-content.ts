import {
  isEditableKeyboardTarget,
  isEscHotkeyEvent,
  isStartHotkeyEvent,
  isUndoHotkeyEvent,
} from "./keys";
import { registerContentHotkey, type ContentHotkeySlot } from "./registry";
import {
  getEscHotkeyEnabled,
  getStartHotkeyEnabled,
  getUndoHotkeyEnabled,
} from "./settings";

export type DeleterUndoUi = {
  canUndo: () => boolean;
  undoLast: () => Promise<boolean>;
};

export type DeleterContentHotkeysHost = {
  isActive: () => boolean;
  deactivate: () => void;
  requestToggle: () => void;
  hasRestorableUndo: () => boolean;
  ensureUi: () => Promise<DeleterUndoUi>;
};

/** Ctrl/Cmd+Shift+X page fallback → background toggle (top frame only). */
export function registerDeleterStartHotkey(requestToggle: () => void): void {
  if (window.top !== window) return;

  registerContentHotkey("start", (e) => {
    if (!isStartHotkeyEvent(e)) return;
    if (isEditableKeyboardTarget(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    void (async () => {
      if (!(await getStartHotkeyEnabled())) return;
      requestToggle();
    })();
  });
}

/** Page `keydown` handlers: toggle mode, Esc off, undo restore. */
export function registerDeleterContentHotkeys(
  host: DeleterContentHotkeysHost,
  slots: readonly ContentHotkeySlot[] = ["start", "esc", "undo"],
): void {
  if (slots.includes("start")) {
    registerDeleterStartHotkey(host.requestToggle);
  }

  if (slots.includes("undo")) {
  registerContentHotkey("undo", (e) => {
    if (!isUndoHotkeyEvent(e)) return;
    if (isEditableKeyboardTarget(e.target)) return;
    if (host.hasRestorableUndo()) {
      e.preventDefault();
      e.stopPropagation();
    }
    void (async () => {
      if (!(await getUndoHotkeyEnabled())) return;
      const ui = await host.ensureUi();
      if (!ui.canUndo()) return;
      await ui.undoLast();
    })();
  });
  }

  if (slots.includes("esc")) {
  registerContentHotkey("esc", (e) => {
    if (!isEscHotkeyEvent(e)) return;
    void (async () => {
      if (!(await getEscHotkeyEnabled())) return;
      if (!host.isActive()) return;
      e.preventDefault();
      e.stopPropagation();
      host.deactivate();
    })();
  });
  }
}
