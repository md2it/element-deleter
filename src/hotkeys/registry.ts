export type ContentHotkeySlot = "start" | "esc" | "undo";

const WINDOW_HANDLER_KEYS: Record<
  ContentHotkeySlot,
  "__domDeleterStartHotkeyHandler" | "__domDeleterEscHotkeyHandler" | "__domDeleterUndoHotkeyHandler"
> = {
  start: "__domDeleterStartHotkeyHandler",
  esc: "__domDeleterEscHotkeyHandler",
  undo: "__domDeleterUndoHotkeyHandler",
};

type WindowWithHotkeyHandlers = Window & {
  __domDeleterStartHotkeyHandler?: (e: KeyboardEvent) => void;
  __domDeleterEscHotkeyHandler?: (e: KeyboardEvent) => void;
  __domDeleterUndoHotkeyHandler?: (e: KeyboardEvent) => void;
};

/** Replace a capture-phase `keydown` listener on `window` for the given slot. */
export function registerContentHotkey(
  slot: ContentHotkeySlot,
  handler: (e: KeyboardEvent) => void,
): void {
  const win = window as WindowWithHotkeyHandlers;
  const key = WINDOW_HANDLER_KEYS[slot];
  const prev = win[key];
  if (prev) {
    window.removeEventListener("keydown", prev, true);
  }
  win[key] = handler;
  window.addEventListener("keydown", handler, true);
}
