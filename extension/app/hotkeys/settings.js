import { ext } from "../../lib/our/api.js";
import { readBooleanSetting } from "../../lib/our/hotkeys/settings.js";
import { ESC_HOTKEY_ENABLED_KEY, START_HOTKEY_ENABLED_KEY, UNDO_HOTKEY_ENABLED_KEY } from "../messages.js";

async function getStartHotkeyEnabled() {
  const data = await ext.storage.local.get(START_HOTKEY_ENABLED_KEY);
  return readBooleanSetting(data, START_HOTKEY_ENABLED_KEY);
}
async function setStartHotkeyEnabled(value) {
  await ext.storage.local.set({ [START_HOTKEY_ENABLED_KEY]: value });
}
async function getEscHotkeyEnabled() {
  const data = await ext.storage.local.get(ESC_HOTKEY_ENABLED_KEY);
  return readBooleanSetting(data, ESC_HOTKEY_ENABLED_KEY);
}
async function setEscHotkeyEnabled(value) {
  await ext.storage.local.set({ [ESC_HOTKEY_ENABLED_KEY]: value });
}
async function getUndoHotkeyEnabled() {
  const data = await ext.storage.local.get(UNDO_HOTKEY_ENABLED_KEY);
  return readBooleanSetting(data, UNDO_HOTKEY_ENABLED_KEY);
}
async function setUndoHotkeyEnabled(value) {
  await ext.storage.local.set({ [UNDO_HOTKEY_ENABLED_KEY]: value });
}

export { getStartHotkeyEnabled, setStartHotkeyEnabled, getEscHotkeyEnabled, setEscHotkeyEnabled, getUndoHotkeyEnabled, setUndoHotkeyEnabled };
