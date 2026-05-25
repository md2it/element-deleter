import {
  ESCAPE_KEY_LABEL,
  formatModifierKeyLabel,
  formatModifierShiftKeyLabel,
  isEditableKeyboardTarget,
  isEscapeKeyEvent,
  isModifierKeyEvent,
  isModifierShiftKeyEvent,
} from "../../../SHARED/src/hotkeys";

export const ESC_HOTKEY_LABEL = ESCAPE_KEY_LABEL;

/** Display label for the start shortcut (README: Mac vs Win/Linux/unknown). */
export function getStartHotkeyLabel(): string {
  return formatModifierShiftKeyLabel("X");
}

/** Ctrl/Cmd+Shift+X — fallback when the browser does not route the manifest command. */
export function isStartHotkeyEvent(e: KeyboardEvent): boolean {
  return isModifierShiftKeyEvent(e, "x");
}

/** Escape — exit delete mode (README: second completion hotkey). */
export function isEscHotkeyEvent(e: KeyboardEvent): boolean {
  return isEscapeKeyEvent(e);
}

/** Display label for undo restore (README: Mac vs Win/Linux). */
export function getUndoHotkeyLabel(): string {
  return formatModifierKeyLabel("Z");
}

/** Ctrl/Cmd+Z — restore last deleted element (README: undo hotkey). */
export function isUndoHotkeyEvent(e: KeyboardEvent): boolean {
  return isModifierKeyEvent(e, "z");
}

export { isEditableKeyboardTarget };
