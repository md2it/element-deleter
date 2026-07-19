import { isMacPlatform } from "./platform.js";

var ESCAPE_KEY_LABEL = "Esc";
var PREFIX_ACTION_TIMEOUT_MS = 3e3;
var PREFIX_DOUBLE_ACTION_WINDOW_MS = 400;
var PREFIX_CHORD_KEY = "x";
function isEscapeKeyEvent(e) {
  return e.key === "Escape";
}
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
function isModifierShiftKeyEvent(e, key, mac = isMacPlatform()) {
  const modifier = mac ? e.metaKey : e.ctrlKey;
  return modifier && e.shiftKey && isLetterKeyEvent(e, key);
}
function isModifierKeyEvent(e, key, options = {}, mac = isMacPlatform()) {
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
function formatModifierShiftKeyLabel(key, mac = isMacPlatform()) {
  const mod = mac ? "⌘" : "Ctrl";
  return `${mod} + Shift + ${key.toUpperCase()}`;
}
function formatModifierKeyLabel(key, mac = isMacPlatform()) {
  const mod = mac ? "⌘" : "Ctrl";
  return `${mod} + ${key.toUpperCase()}`;
}
function formatPrefixChordLabel(mac = isMacPlatform()) {
  return formatModifierShiftKeyLabel(PREFIX_CHORD_KEY, mac);
}
function isPrefixChordKeyEvent(e, mac = isMacPlatform()) {
  return isModifierShiftKeyEvent(e, PREFIX_CHORD_KEY, mac);
}
function isPrefixChordHeld(e, mac = isMacPlatform()) {
  const modifier = mac ? e.metaKey : e.ctrlKey;
  return modifier && e.shiftKey;
}
function isPrefixActionKeyEvent(e, key) {
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  return isLetterKeyEvent(e, key);
}
function isEditableKeyboardTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return !!target.closest('[contenteditable=""], [contenteditable="true"]');
}

export { ESCAPE_KEY_LABEL, PREFIX_ACTION_TIMEOUT_MS, PREFIX_DOUBLE_ACTION_WINDOW_MS, PREFIX_CHORD_KEY, isEscapeKeyEvent, letterToCode, isLetterKeyEvent, isModifierShiftKeyEvent, isModifierKeyEvent, formatModifierShiftKeyLabel, formatModifierKeyLabel, formatPrefixChordLabel, isPrefixChordKeyEvent, isPrefixChordHeld, isPrefixActionKeyEvent, isEditableKeyboardTarget };
