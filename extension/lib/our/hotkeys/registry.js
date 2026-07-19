function handlerPropertyKey(namespace, slot) {
  return `__${namespace}HotkeyHandler_${slot}`;
}
function registerContentHotkey(namespace, slot, handler) {
  const win = window;
  const key = handlerPropertyKey(namespace, slot);
  const prev = win[key];
  if (prev) {
    window.removeEventListener("keydown", prev, true);
  }
  win[key] = handler;
  window.addEventListener("keydown", handler, true);
}
function unregisterContentHotkey(namespace, slot) {
  const win = window;
  const key = handlerPropertyKey(namespace, slot);
  const prev = win[key];
  if (!prev) return;
  window.removeEventListener("keydown", prev, true);
  win[key] = void 0;
}

export { handlerPropertyKey, registerContentHotkey, unregisterContentHotkey };
