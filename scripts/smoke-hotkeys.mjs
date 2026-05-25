/**
 * Smoke: generic hotkey matchers (no browser APIs).
 * Run: node scripts/smoke-hotkeys.mjs
 */
import assert from "node:assert/strict";

function isMacPlatform(ua, platform) {
  return (
    /Mac|iPhone|iPad|iPod/.test(ua) ||
    platform.toUpperCase().includes("MAC")
  );
}

function isStartHotkeyEvent(e, mac) {
  const modifier = mac ? e.metaKey : e.ctrlKey;
  return modifier && e.shiftKey && e.key.toLowerCase() === "x";
}

function isUndoHotkeyEvent(e, mac) {
  const modifier = mac ? e.metaKey : e.ctrlKey;
  return modifier && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "z";
}

function isEscHotkeyEvent(e) {
  return e.key === "Escape";
}

const ev = (partial) => ({ ...partial, key: partial.key ?? "" });

assert.equal(isStartHotkeyEvent(ev({ ctrlKey: true, shiftKey: true, key: "X" }), false), true);
assert.equal(isStartHotkeyEvent(ev({ metaKey: true, shiftKey: true, key: "x" }), true), true);
assert.equal(isStartHotkeyEvent(ev({ ctrlKey: true, shiftKey: false, key: "X" }), false), false);

assert.equal(isUndoHotkeyEvent(ev({ ctrlKey: true, key: "z" }), false), true);
assert.equal(isUndoHotkeyEvent(ev({ ctrlKey: true, shiftKey: true, key: "z" }), false), false);

assert.equal(isEscHotkeyEvent(ev({ key: "Escape" })), true);

assert.equal(isMacPlatform("Mozilla/5.0 (Macintosh)", "MacIntel"), true);
assert.equal(isMacPlatform("Mozilla/5.0 (Windows NT 10.0)", "Win32"), false);

// Keep in sync with src/hotkeys/background.ts (manifest toggle + content fallback).
const TOGGLE_COMMAND_SUPPRESS_MS = 300;

function shouldSuppressContentToggleAfterToggleCommand(
  lastAt,
  now,
  windowMs = TOGGLE_COMMAND_SUPPRESS_MS,
) {
  return lastAt > 0 && now - lastAt < windowMs;
}

function shouldHandleToggleDeleteCommand(startHotkeyEnabled) {
  return startHotkeyEnabled;
}

assert.equal(
  shouldSuppressContentToggleAfterToggleCommand(1000, 1200),
  true,
);
assert.equal(
  shouldSuppressContentToggleAfterToggleCommand(1000, 1400),
  false,
);
assert.equal(shouldSuppressContentToggleAfterToggleCommand(0, 100), false);

assert.equal(shouldHandleToggleDeleteCommand(true), true);
assert.equal(shouldHandleToggleDeleteCommand(false), false);

console.log("smoke-hotkeys: ok");
