"use strict";
var toggleCommandSuppress = createToggleCommandSuppressTracker();
function shouldSuppressToolbarClickAfterHotkeyCommand(now = Date.now()) {
  return toggleCommandSuppress.shouldSuppressToolbarClick(now);
}
function registerBackgroundHotkeys(host) {
  registerPrefixBackgroundHotkeys({
    badgeBackgroundColor: DELETER_ACTIVE_COLOR,
    getActiveCommandTab: host.getActiveCommandTab,
    isToggleEnabled: getStartHotkeyEnabled,
    toggleRequestMessageType: "TOGGLE_REQUEST",
    onToggleRequest: (tabId, windowId) => host.toggleTab(tabId, windowId),
    suppress: toggleCommandSuppress,
  });
}

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.toggleCommandSuppress = toggleCommandSuppress;
globalThis.shouldSuppressToolbarClickAfterHotkeyCommand = shouldSuppressToolbarClickAfterHotkeyCommand;
globalThis.registerBackgroundHotkeys = registerBackgroundHotkeys;
