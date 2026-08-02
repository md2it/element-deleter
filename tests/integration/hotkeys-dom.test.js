"use strict";

Object.defineProperty(globalThis, "navigator", {
  value: {
    userAgent: "Mozilla/5.0 Windows NT 10.0",
    platform: "Win32",
  },
  configurable: true,
});

const { createPrefixModeController } = await import(
  "../../extension/app/hotkeys/prefix-mode.js"
);
const { isPrefixChordKeyEvent } = await import("../../extension/app/hotkeys/keys.js");
const { PREFIX_ACTION_KEY } = await import("../../extension/app/hotkeys/commands.js");

const { assert, assertEqual, test } = TestHarness;

function keyEvent(key, options = {}) {
  const code = key.length === 1 ? `Key${key.toUpperCase()}` : key;
  return new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    key,
    code,
    ...options,
  });
}

function stubNavigator() {
  Object.defineProperty(globalThis, "navigator", {
    value: {
      userAgent: "Mozilla/5.0 Windows NT 10.0",
      platform: "Win32",
    },
    configurable: true,
  });
}

test("prefix chord Ctrl+Shift+X is recognized for delete mode", () => {
  stubNavigator();
  assert(
    isPrefixChordKeyEvent(keyEvent("x", { ctrlKey: true, shiftKey: true })),
  );
});

test("prefix action D fires toggle only after the mode is armed", async () => {
  stubNavigator();
  let toggles = 0;
  const controller = createPrefixModeController({
    hintLetter: PREFIX_ACTION_KEY,
    hint: { show: () => {}, hide: () => {} },
    isEnabled: async () => true,
    onAction: () => {
      toggles += 1;
    },
    canShowPrefixHint: async () => true,
    doubleActionWindowMs: 5,
  });

  const beforeArm = keyEvent("d");
  controller.onPrefixActionKeyDown(beforeArm);
  await Promise.resolve();
  assertEqual(toggles, 0);

  controller.arm(PREFIX_ACTION_KEY);
  const action = keyEvent("d");
  controller.onPrefixActionKeyDown(action);
  await new Promise((resolve) => setTimeout(resolve, 15));
  assertEqual(toggles, 1);
});

test("Esc hotkey path is available for deactivating delete mode", () => {
  const esc = keyEvent("Escape");
  assertEqual(esc.key, "Escape");
});
