import { ext } from "../api";
import { readBooleanSetting } from "../../../SHARED/src/hotkeys";
import {
  ESC_HOTKEY_ENABLED_KEY,
  START_HOTKEY_ENABLED_KEY,
  UNDO_HOTKEY_ENABLED_KEY,
} from "../messages";

export async function getStartHotkeyEnabled(): Promise<boolean> {
  const data = await ext.storage.local.get(START_HOTKEY_ENABLED_KEY);
  return readBooleanSetting(data, START_HOTKEY_ENABLED_KEY);
}

export async function setStartHotkeyEnabled(value: boolean): Promise<void> {
  await ext.storage.local.set({ [START_HOTKEY_ENABLED_KEY]: value });
}

export async function getEscHotkeyEnabled(): Promise<boolean> {
  const data = await ext.storage.local.get(ESC_HOTKEY_ENABLED_KEY);
  return readBooleanSetting(data, ESC_HOTKEY_ENABLED_KEY);
}

export async function setEscHotkeyEnabled(value: boolean): Promise<void> {
  await ext.storage.local.set({ [ESC_HOTKEY_ENABLED_KEY]: value });
}

export async function getUndoHotkeyEnabled(): Promise<boolean> {
  const data = await ext.storage.local.get(UNDO_HOTKEY_ENABLED_KEY);
  return readBooleanSetting(data, UNDO_HOTKEY_ENABLED_KEY);
}

export async function setUndoHotkeyEnabled(value: boolean): Promise<void> {
  await ext.storage.local.set({ [UNDO_HOTKEY_ENABLED_KEY]: value });
}
