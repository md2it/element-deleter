import { registerContentHotkey as registerLibContentHotkey } from "../../../lib/src/hotkeys";

const HOTKEY_NAMESPACE = "elementDeleter";

export type ContentHotkeySlot = "esc" | "undo";

/** Replace a capture-phase `keydown` listener on `window` for the given slot. */
export function registerContentHotkey(
  slot: ContentHotkeySlot,
  handler: (e: KeyboardEvent) => void,
): void {
  registerLibContentHotkey(HOTKEY_NAMESPACE, slot, handler);
}
