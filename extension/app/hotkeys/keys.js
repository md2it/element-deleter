import { isEscapeKeyEvent, isModifierKeyEvent } from "../../lib/our/hotkeys/keys.js";

var SHORTCUTS_PREFIX_CHORD_WIN_DISPLAY = "Ctrl+Shift+X";
var SHORTCUTS_PREFIX_CHORD_MAC_DISPLAY = "Cmd+Shift+X";
var SHORTCUTS_UNDO_WIN_DISPLAY = "Ctrl+Z";
var SHORTCUTS_UNDO_MAC_DISPLAY = "⌘Z";
function isEscHotkeyEvent(e) {
  return isEscapeKeyEvent(e);
}
function isUndoHotkeyEvent(e) {
  return isModifierKeyEvent(e, "z");
}

export { SHORTCUTS_PREFIX_CHORD_WIN_DISPLAY, SHORTCUTS_PREFIX_CHORD_MAC_DISPLAY, SHORTCUTS_UNDO_WIN_DISPLAY, SHORTCUTS_UNDO_MAC_DISPLAY, isEscHotkeyEvent, isUndoHotkeyEvent };
