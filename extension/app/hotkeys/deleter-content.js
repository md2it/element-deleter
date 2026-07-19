import { isEditableKeyboardTarget } from "../../lib/our/hotkeys/keys.js";
import { registerPrefixStartHotkey } from "../../lib/our/hotkeys/prefix-content.js";
import { notifyPrefixHintBlockedOnBackground, queryPrefixHintCanShowInContent } from "../../lib/our/hotkeys/prefix-operability.js";
import { PREFIX_ACTION_KEY } from "./commands.js";
import { isEscHotkeyEvent, isUndoHotkeyEvent } from "./keys.js";
import { registerContentHotkey2, unregisterContentHotkey2 } from "./registry.js";
import { getEscHotkeyEnabled, getStartHotkeyEnabled, getUndoHotkeyEnabled } from "./settings.js";

var HOTKEY_NAMESPACE2 = "elementDeleter";
var contentHotkeysMounted = false;
function registerDeleterStartHotkey(requestToggle2) {
  registerPrefixStartHotkey({
    namespace: HOTKEY_NAMESPACE2,
    hintLetter: PREFIX_ACTION_KEY,
    isEnabled: getStartHotkeyEnabled,
    canShowPrefixHint: queryPrefixHintCanShowInContent,
    onPrefixHintBlocked: notifyPrefixHintBlockedOnBackground,
    onAction: requestToggle2,
  });
}
function mountDeleterContentHotkeys(host, slots = ["esc", "undo"]) {
  if (typeof window !== "undefined" && window.top !== window) return;
  if (contentHotkeysMounted) return;
  contentHotkeysMounted = true;
  if (slots.includes("undo")) {
    registerContentHotkey2("undo", (e) => {
      if (!isUndoHotkeyEvent(e)) return;
      if (isEditableKeyboardTarget(e.target)) return;
      if (!host.isActive()) return;
      if (host.hasRestorableUndo()) {
        e.preventDefault();
        e.stopPropagation();
      }
      void (async () => {
        if (!(await getUndoHotkeyEnabled())) return;
        const ui = await host.ensureUi();
        if (!ui.canUndo()) return;
        await ui.undoLast();
      })();
    });
  }
  if (slots.includes("esc")) {
    registerContentHotkey2("esc", (e) => {
      if (!isEscHotkeyEvent(e)) return;
      if (!host.isActive()) return;
      void (async () => {
        if (!(await getEscHotkeyEnabled())) return;
        e.preventDefault();
        e.stopPropagation();
        host.deactivate();
      })();
    });
  }
}
function unmountDeleterContentHotkeys(slots = ["esc", "undo"]) {
  if (!contentHotkeysMounted) return;
  contentHotkeysMounted = false;
  for (const slot of slots) {
    unregisterContentHotkey2(slot);
  }
}

export { HOTKEY_NAMESPACE2, contentHotkeysMounted, registerDeleterStartHotkey, mountDeleterContentHotkeys, unmountDeleterContentHotkeys };
