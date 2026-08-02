"use strict";

Object.defineProperty(globalThis, "navigator", {
  value: {
    userAgent: "Mozilla/5.0 Windows NT 10.0",
    platform: "Win32",
  },
  configurable: true,
});

const {
  isEscHotkeyEvent,
  isUndoHotkeyEvent,
  SHORTCUTS_PREFIX_CHORD_WIN_DISPLAY,
  SHORTCUTS_UNDO_WIN_DISPLAY,
} = await import("../../extension/app/hotkeys/keys.js");
const {
  getStartHotkeyEnabled,
  getEscHotkeyEnabled,
  getUndoHotkeyEnabled,
} = await import("../../extension/app/hotkeys/settings.js");
const { PREFIX_ACTION_KEY } = await import("../../extension/app/hotkeys/commands.js");

const { assert, assertEqual, test } = TestHarness;

function keyEvent(type, key, options = {}) {
  return new KeyboardEvent(type, {
    bubbles: true,
    cancelable: true,
    key,
    ...options,
  });
}

test("hidden hotkeys use documented Esc and Ctrl+Z chords", () => {
  Object.defineProperty(globalThis, "navigator", {
    value: {
      userAgent: "Mozilla/5.0 Windows NT 10.0",
      platform: "Win32",
    },
    configurable: true,
  });
  assert(isEscHotkeyEvent(keyEvent("keydown", "Escape")));
  assert(isUndoHotkeyEvent(keyEvent("keydown", "z", { ctrlKey: true })));
  assertEqual(SHORTCUTS_PREFIX_CHORD_WIN_DISPLAY, "Ctrl+Shift+X");
  assertEqual(SHORTCUTS_UNDO_WIN_DISPLAY, "Ctrl+Z");
  assertEqual(PREFIX_ACTION_KEY, "D");
});

test("deleter hotkeys stay always enabled without storage toggles", async () => {
  assert(await getStartHotkeyEnabled());
  assert(await getEscHotkeyEnabled());
  assert(await getUndoHotkeyEnabled());
});
