export {
  COMMAND_EXECUTE_ACTION,
  COMMAND_ACTIVATE_DEACTIVATE,
  PREFIX_ACTION_KEY,
} from "./commands";
export { registerBackgroundHotkeys, type BackgroundHotkeysHost } from "./background";
export {
  mountDeleterContentHotkeys,
  registerDeleterStartHotkey,
  unmountDeleterContentHotkeys,
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
export {
  registerContentHotkey,
  unregisterContentHotkey,
  type ContentHotkeySlot,
} from "./registry";
export {
  getEscHotkeyEnabled,
  getStartHotkeyEnabled,
  getUndoHotkeyEnabled,
  setEscHotkeyEnabled,
  setStartHotkeyEnabled,
  setUndoHotkeyEnabled,
} from "./settings";
