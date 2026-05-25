export { COMMAND_TOGGLE_DELETE, COMMAND_UNDO } from "./commands";
export { registerBackgroundHotkeys, type BackgroundHotkeysHost } from "./background";
export {
  registerDeleterContentHotkeys,
  registerDeleterStartHotkey,
  type DeleterContentHotkeysHost,
  type DeleterUndoUi,
} from "./deleter-content";
export {
  ESC_HOTKEY_LABEL,
  getStartHotkeyLabel,
  getUndoHotkeyLabel,
  isEditableKeyboardTarget,
  isEscHotkeyEvent,
  isStartHotkeyEvent,
  isUndoHotkeyEvent,
} from "./keys";
export { registerContentHotkey, type ContentHotkeySlot } from "./registry";
export {
  getEscHotkeyEnabled,
  getStartHotkeyEnabled,
  getUndoHotkeyEnabled,
  setEscHotkeyEnabled,
  setStartHotkeyEnabled,
  setUndoHotkeyEnabled,
} from "./settings";
