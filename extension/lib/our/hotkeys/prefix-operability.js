"use strict";
async function queryPrefixHintCanShowInContent() {
  return probeDocumentOperability();
}
function notifyPrefixHintBlockedOnBackground() {
  void ext.runtime.sendMessage({ type: PREFIX_HINT_BLOCKED }).catch(() => {});
}
var operabilityListenersRegistered = false;
function registerPrefixHintOperabilityListeners(handlers) {
  if (operabilityListenersRegistered) return;
  operabilityListenersRegistered = true;
  ext.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const tabId = sender.tab?.id;
    if (tabId === void 0) return;
    const msg = message;
    if (msg.type === PREFIX_HINT_CAN_SHOW) {
      void handlers.canOperateOnTab(tabId).then((ok) => {
        sendResponse(ok);
      });
      return true;
    }
    if (msg.type === PREFIX_HINT_BLOCKED) {
      void handlers.onBlockedOnTab?.(tabId, sender.tab?.windowId);
    }
  });
}

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.queryPrefixHintCanShowInContent = queryPrefixHintCanShowInContent;
globalThis.notifyPrefixHintBlockedOnBackground = notifyPrefixHintBlockedOnBackground;
globalThis.operabilityListenersRegistered = operabilityListenersRegistered;
globalThis.registerPrefixHintOperabilityListeners = registerPrefixHintOperabilityListeners;
