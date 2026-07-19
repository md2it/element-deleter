import { registerContentHotkey, unregisterContentHotkey } from "../../lib/our/hotkeys/registry.js";

var HOTKEY_NAMESPACE = "elementDeleter";
function registerContentHotkey2(slot, handler) {
  registerContentHotkey(HOTKEY_NAMESPACE, slot, handler);
}
function unregisterContentHotkey2(slot) {
  unregisterContentHotkey(HOTKEY_NAMESPACE, slot);
}

export { HOTKEY_NAMESPACE, registerContentHotkey2, unregisterContentHotkey2 };
