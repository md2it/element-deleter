"use strict";
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

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.getStartHotkeyEnabled = getStartHotkeyEnabled;
globalThis.setStartHotkeyEnabled = setStartHotkeyEnabled;
globalThis.getEscHotkeyEnabled = getEscHotkeyEnabled;
globalThis.setEscHotkeyEnabled = setEscHotkeyEnabled;
globalThis.getUndoHotkeyEnabled = getUndoHotkeyEnabled;
globalThis.setUndoHotkeyEnabled = setUndoHotkeyEnabled;
