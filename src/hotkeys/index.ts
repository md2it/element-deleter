export {
  COMMAND_EXECUTE_ACTION,
  COMMAND_TOGGLE_DELETE,
  COMMAND_UNDO,
  PREFIX_ACTION_KEY,
} from "./commands";
export { registerBackgroundHotkeys, type BackgroundHotkeysHost } from "./background";
export {
  armDeleterPrefixToggle,
  registerDeleterContentHotkeys,
  registerDeleterStartHotkey,
  type DeleterContentHotkeysHost,
  type DeleterUndoUi,
} from "./deleter-content";
export {
  ESC_HOTKEY_LABEL,
  getStartHotkeyActionLabel,
  getStartHotkeyAriaLabel,
  getStartHotkeyChordLabel,
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
