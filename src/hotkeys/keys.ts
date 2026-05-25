import {
  ESCAPE_KEY_LABEL,
  formatModifierKeyLabel,
  formatPrefixChordLabel,
  isEditableKeyboardTarget,
  isEscapeKeyEvent,
  isPrefixChordKeyEvent,
  isModifierKeyEvent,
} from "../../../SHARED/src/hotkeys";
import { PREFIX_ACTION_KEY } from "./commands";

export const ESC_HOTKEY_LABEL = ESCAPE_KEY_LABEL;

/** Prefix chord for settings (`kbd` before `→`). */
export function getStartHotkeyChordLabel(): string {
  return formatPrefixChordLabel();
}

/** Action letter for settings (`kbd` after `→`). */
export function getStartHotkeyActionLabel(): string {
  return PREFIX_ACTION_KEY.toUpperCase();
}

/** Full label for aria (chord + arrow + letter, no markup). */
export function getStartHotkeyAriaLabel(): string {
  return `${getStartHotkeyChordLabel()} → ${getStartHotkeyActionLabel()}`;
}

/** Ctrl/Cmd+Shift+X — prefix chord (page fallback). */
export function isStartHotkeyEvent(e: KeyboardEvent): boolean {
  return isPrefixChordKeyEvent(e);
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
