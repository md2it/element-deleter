/**
 * Smoke: generic hotkey infra in SHARED + deleter wiring (no browser APIs).
 * Run: node scripts/smoke-hotkeys.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sharedHotkeys = join(root, "../SHARED/src/hotkeys");

/** Mirrors SHARED/src/hotkeys/platform.ts */
function isMacPlatform(ua, platform) {
  return (
    /Mac|iPhone|iPad|iPod/.test(ua) ||
    platform.toUpperCase().includes("MAC")
  );
}

/** Mirrors SHARED/src/hotkeys/keys.ts */
function letterToCode(letter) {
  return `Key${letter.toUpperCase()}`;
}

function isLetterKeyEvent(e, letter) {
  const expectedCode = letterToCode(letter);
  if (typeof e.code === "string" && e.code.length > 0) {
    return e.code === expectedCode;
  }
  return e.key.toLowerCase() === letter.toLowerCase();
}

function isModifierShiftKeyEvent(e, key, mac) {
  const modifier = mac ? e.metaKey : e.ctrlKey;
  return modifier && e.shiftKey && isLetterKeyEvent(e, key);
}

function isPrefixChordKeyEvent(e, mac) {
  return isModifierShiftKeyEvent(e, "x", mac);
}

function isPrefixActionKeyEvent(e, key) {
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  return isLetterKeyEvent(e, key);
}

function isModifierKeyEvent(e, key, options = {}, mac) {
  const modifier = mac ? e.metaKey : e.ctrlKey;
  const shift = options.shift ?? false;
  const alt = options.alt ?? false;
  return (
    modifier &&
    Boolean(e.shiftKey) === shift &&
    Boolean(e.altKey) === alt &&
    isLetterKeyEvent(e, key)
  );
}

function isEscapeKeyEvent(e) {
  return e.key === "Escape";
}

/** Mirrors SHARED/src/hotkeys/suppress.ts */
const DEFAULT_TOGGLE_COMMAND_SUPPRESS_MS = 300;

function shouldSuppressContentToggleAfterToggleCommand(
  lastAt,
  now,
  windowMs = DEFAULT_TOGGLE_COMMAND_SUPPRESS_MS,
) {
  return lastAt > 0 && now - lastAt < windowMs;
}

const ev = (partial) => ({ ...partial, key: partial.key ?? "", code: partial.code ?? "" });

assert.equal(isPrefixChordKeyEvent(ev({ ctrlKey: true, shiftKey: true, code: "KeyX", key: "X" }), false), true);
assert.equal(isPrefixChordKeyEvent(ev({ metaKey: true, shiftKey: true, code: "KeyX", key: "x" }), true), true);
assert.equal(isPrefixChordKeyEvent(ev({ ctrlKey: true, shiftKey: false, code: "KeyX", key: "X" }), false), false);
// RU layout: physical X reports key="ч" but code stays "KeyX".
assert.equal(isPrefixChordKeyEvent(ev({ metaKey: true, shiftKey: true, code: "KeyX", key: "ч" }), true), true);

assert.equal(isPrefixActionKeyEvent(ev({ code: "KeyD", key: "d" }), "D"), true);
assert.equal(isPrefixActionKeyEvent(ev({ ctrlKey: true, code: "KeyD", key: "d" }), "D"), false);
// RU layout: physical D reports key="в" but code stays "KeyD" — must match.
assert.equal(isPrefixActionKeyEvent(ev({ code: "KeyD", key: "в" }), "D"), true);
// Different physical key with key="d" (theoretical RU layout that maps "d" elsewhere) must not match.
assert.equal(isPrefixActionKeyEvent(ev({ code: "KeyL", key: "d" }), "D"), false);
// Fallback: no code (older runtimes) — by key.
assert.equal(isPrefixActionKeyEvent(ev({ key: "d" }), "D"), true);

assert.equal(isModifierKeyEvent(ev({ ctrlKey: true, code: "KeyZ", key: "z" }), "z", {}, false), true);
assert.equal(isModifierKeyEvent(ev({ ctrlKey: true, shiftKey: true, code: "KeyZ", key: "z" }), "z", {}, false), false);
// RU layout undo: physical Z is "я".
assert.equal(isModifierKeyEvent(ev({ metaKey: true, code: "KeyZ", key: "я" }), "z", {}, true), true);

assert.equal(isEscapeKeyEvent(ev({ key: "Escape" })), true);

assert.equal(isMacPlatform("Mozilla/5.0 (Macintosh)", "MacIntel"), true);
assert.equal(isMacPlatform("Mozilla/5.0 (Windows NT 10.0)", "Win32"), false);

assert.equal(
  shouldSuppressContentToggleAfterToggleCommand(1000, 1200),
  true,
);
assert.equal(
  shouldSuppressContentToggleAfterToggleCommand(1000, 1400),
  false,
);
assert.equal(shouldSuppressContentToggleAfterToggleCommand(0, 100), false);

const sharedIndexSrc = readFileSync(join(sharedHotkeys, "index.ts"), "utf8");
assert.match(sharedIndexSrc, /registerPrefixManifestHotkeys/);
assert.match(sharedIndexSrc, /registerPrefixStartHotkey/);
assert.match(sharedIndexSrc, /formatPrefixHotkeyLabel/);
assert.match(sharedIndexSrc, /PREFIX_ACTION_TIMEOUT_MS/);
assert.match(sharedIndexSrc, /showPrefixBadge/);
assert.match(sharedIndexSrc, /PREFIX_HINT_SHOW/);

const prefixHintSrc = readFileSync(join(sharedHotkeys, "prefix-hint.ts"), "utf8");
assert.doesNotMatch(prefixHintSrc, /document\./);
assert.doesNotMatch(prefixHintSrc, /data-shared-prefix-hint/);

const prefixHintBadgeSrc = readFileSync(
  join(sharedHotkeys, "prefix-hint-badge.ts"),
  "utf8",
);
assert.match(prefixHintBadgeSrc, /setBadgeText/);
assert.match(prefixHintBadgeSrc, /registerPrefixHintBadgeListeners/);

const deleterKeysSrc = readFileSync(join(root, "src/hotkeys/keys.ts"), "utf8");
assert.match(deleterKeysSrc, /formatPrefixChordLabel/);
assert.match(deleterKeysSrc, /getStartHotkeyChordLabel/);
assert.match(deleterKeysSrc, /getStartHotkeyActionLabel/);
assert.match(deleterKeysSrc, /PREFIX_ACTION_KEY/);

const sharedKeysSrc = readFileSync(join(sharedHotkeys, "keys.ts"), "utf8");
assert.match(sharedKeysSrc, /letterToCode/);
assert.match(sharedKeysSrc, /isLetterKeyEvent/);
assert.match(sharedKeysSrc, /e\.code === expectedCode/);

const prefixBackgroundSrc = readFileSync(
  join(sharedHotkeys, "prefix-background.ts"),
  "utf8",
);
assert.match(prefixBackgroundSrc, /EXECUTE_ACTION_COMMAND/);
assert.match(
  prefixBackgroundSrc,
  /command === EXECUTE_ACTION_COMMAND[\s\S]*stampToggleCommand/,
);
assert.doesNotMatch(
  prefixBackgroundSrc,
  /shouldSuppressContentToggle/,
);

const deleterRegistrySrc = readFileSync(join(root, "src/hotkeys/registry.ts"), "utf8");
assert.match(deleterRegistrySrc, /registerSharedContentHotkey/);
assert.match(deleterRegistrySrc, /elementDeleter/);

const deleterBackgroundSrc = readFileSync(join(root, "src/hotkeys/background.ts"), "utf8");
assert.match(deleterBackgroundSrc, /registerPrefixManifestHotkeys/);
assert.match(deleterBackgroundSrc, /prefixCommands:\s*\[COMMAND_TOGGLE_DELETE\]/);
assert.match(deleterBackgroundSrc, /DELETER_ACTIVE_COLOR/);
assert.match(deleterBackgroundSrc, /badgeBackgroundColor/);
assert.match(deleterBackgroundSrc, /PREFIX_ARM_TOGGLE/);
assert.match(deleterBackgroundSrc, /TOGGLE_REQUEST/);
assert.doesNotMatch(deleterBackgroundSrc, /registerManifestCommandHotkeys/);

const commandsSrc = readFileSync(join(root, "src/hotkeys/commands.ts"), "utf8");
assert.match(commandsSrc, /toggle-delete-mode/);
assert.match(commandsSrc, /_execute_action/);
assert.match(commandsSrc, /undo-delete/);

const manifestSrc = readFileSync(join(root, "manifest.json"), "utf8");
assert.match(manifestSrc, /"_execute_action"/);
assert.match(manifestSrc, /"toggle-delete-mode"/);
assert.match(manifestSrc, /Ctrl\+Shift\+X/);

console.log("smoke-hotkeys: ok");
