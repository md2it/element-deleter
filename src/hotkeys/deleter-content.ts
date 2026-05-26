import {
  registerPrefixStartHotkey,
  type PrefixModeController,
} from "../../../lib/src/hotkeys";
import {
  isEditableKeyboardTarget,
  isEscHotkeyEvent,
  isUndoHotkeyEvent,
} from "./keys";
import { PREFIX_ACTION_KEY } from "./commands";
import {
  registerContentHotkey,
  unregisterContentHotkey,
  type ContentHotkeySlot,
} from "./registry";
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

const HOTKEY_NAMESPACE = "elementDeleter";

let prefixController: PrefixModeController | undefined;
let contentHotkeysMounted = false;

/** Ctrl/Cmd+Shift+X → D page fallback (top frame only). */
export function registerDeleterStartHotkey(requestToggle: () => void): void {
  prefixController = registerPrefixStartHotkey({
    namespace: HOTKEY_NAMESPACE,
    hintLetter: PREFIX_ACTION_KEY,
    isEnabled: getStartHotkeyEnabled,
    onAction: requestToggle,
  });
}

/** Wait for prefix release, then arm (manifest chord). */
export function armDeleterPrefixToggle(hint = PREFIX_ACTION_KEY): void {
  prefixController?.prepareAwaitAction(hint);
}

/** Page `keydown` handlers: Esc off, undo restore (top frame, only while active). */
export function mountDeleterContentHotkeys(
  host: DeleterContentHotkeysHost,
  slots: readonly ContentHotkeySlot[] = ["esc", "undo"],
): void {
  if (typeof window !== "undefined" && window.top !== window) return;
  if (contentHotkeysMounted) return;
  contentHotkeysMounted = true;

  if (slots.includes("undo")) {
    registerContentHotkey("undo", (e) => {
      if (!isUndoHotkeyEvent(e)) return;
      if (isEditableKeyboardTarget(e.target)) return;
      if (!host.isActive()) return;
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
      if (!host.isActive()) return;
      void (async () => {
        if (!(await getEscHotkeyEnabled())) return;
        e.preventDefault();
        e.stopPropagation();
        host.deactivate();
      })();
    });
  }
}

export function unmountDeleterContentHotkeys(
  slots: readonly ContentHotkeySlot[] = ["esc", "undo"],
): void {
  if (!contentHotkeysMounted) return;
  contentHotkeysMounted = false;
  for (const slot of slots) {
    unregisterContentHotkey(slot);
  }
}
