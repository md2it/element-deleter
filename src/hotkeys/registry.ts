import { registerContentHotkey as registerSharedContentHotkey } from "../../../SHARED/src/hotkeys";

const HOTKEY_NAMESPACE = "domDeleter";

export type ContentHotkeySlot = "start" | "esc" | "undo";

/** Replace a capture-phase `keydown` listener on `window` for the given slot. */
export function registerContentHotkey(
  slot: ContentHotkeySlot,
  handler: (e: KeyboardEvent) => void,
): void {
  registerSharedContentHotkey(HOTKEY_NAMESPACE, slot, handler);
}
