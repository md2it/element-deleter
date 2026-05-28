import {
  ESCAPE_KEY_LABEL,
  formatModifierKeyLabel,
  formatPrefixChordLabel,
  isEditableKeyboardTarget,
  isEscapeKeyEvent,
  isPrefixChordKeyEvent,
  isModifierKeyEvent,
} from "../../../lib/src/hotkeys";
import { PREFIX_ACTION_KEY } from "./commands";

export const ESC_HOTKEY_LABEL = ESCAPE_KEY_LABEL;

/** SHORTCUTS panel: Windows/Linux chord (always shown). */
export const SHORTCUTS_PREFIX_CHORD_WIN_DISPLAY = "Ctrl+Shift+X";

/** SHORTCUTS panel: Mac chord (always shown). */
export const SHORTCUTS_PREFIX_CHORD_MAC_DISPLAY = "Cmd+Shift+X";

/** SHORTCUTS panel: undo on Windows/Linux. */
export const SHORTCUTS_UNDO_WIN_DISPLAY = "Ctrl+Z";

/** SHORTCUTS panel: undo on Mac. */
export const SHORTCUTS_UNDO_MAC_DISPLAY = "⌘Z";

function compactHotkeyLabel(label: string): string {
  return label.replace(/\s*\+\s*/g, "+");
}

/** Prefix chord for settings (`kbd` before `→`). */
export function getStartHotkeyChordLabel(): string {
  return compactHotkeyLabel(formatPrefixChordLabel());
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
  const label = formatModifierKeyLabel("Z");
  return label.startsWith("⌘") ? "⌘Z" : label;
}

/** Ctrl/Cmd+Z — restore last deleted element (README: undo hotkey). */
export function isUndoHotkeyEvent(e: KeyboardEvent): boolean {
  return isModifierKeyEvent(e, "z");
}

export { isEditableKeyboardTarget };
