function isMacPlatform(): boolean {
  return (
    /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ||
    navigator.platform.toUpperCase().includes("MAC")
  );
}

/** Display label for the start shortcut (README: Mac vs Win/Linux/unknown). */
export function getStartHotkeyLabel(): string {
  return isMacPlatform() ? "⌘ + Shift + X" : "Ctrl + Shift + X";
}

/** Ctrl/Cmd+Shift+X — fallback when the browser does not route the manifest command. */
export function isStartHotkeyEvent(e: KeyboardEvent): boolean {
  const modifier = isMacPlatform() ? e.metaKey : e.ctrlKey;
  return modifier && e.shiftKey && e.key.toLowerCase() === "x";
}

export const ESC_HOTKEY_LABEL = "Esc";

/** Escape — exit delete mode (README: second completion hotkey). */
export function isEscHotkeyEvent(e: KeyboardEvent): boolean {
  return e.key === "Escape";
}

/** Display label for undo restore (README: Mac vs Win/Linux). */
export function getUndoHotkeyLabel(): string {
  return isMacPlatform() ? "⌘ + Z" : "Ctrl + Z";
}

/** Ctrl/Cmd+Z — restore last deleted element (README: undo hotkey). */
export function isUndoHotkeyEvent(e: KeyboardEvent): boolean {
  const modifier = isMacPlatform() ? e.metaKey : e.ctrlKey;
  return (
    modifier &&
    !e.shiftKey &&
    !e.altKey &&
    e.key.toLowerCase() === "z"
  );
}

/** Skip undo hotkey when the user is typing in a field (native Ctrl+Z). */
export function isEditableKeyboardTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return !!target.closest('[contenteditable=""], [contenteditable="true"]');
}
