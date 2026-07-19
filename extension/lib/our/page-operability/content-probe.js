"use strict";
var PROBE_DOCUMENT_OPERABILITY = "PROBE_DOCUMENT_OPERABILITY";
function isProbeDocumentOperabilityMessage(message) {
  if (typeof message !== "object" || message === null) return false;
  return message.type === PROBE_DOCUMENT_OPERABILITY;
}
var probeListenerRegistered = false;
function registerDocumentOperabilityProbeListener() {
  if (probeListenerRegistered) return;
  probeListenerRegistered = true;
  ext.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!isProbeDocumentOperabilityMessage(message)) return;
    sendResponse(probeDocumentOperability());
    return true;
  });
}

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.PROBE_DOCUMENT_OPERABILITY = PROBE_DOCUMENT_OPERABILITY;
globalThis.isProbeDocumentOperabilityMessage = isProbeDocumentOperabilityMessage;
globalThis.probeListenerRegistered = probeListenerRegistered;
globalThis.registerDocumentOperabilityProbeListener = registerDocumentOperabilityProbeListener;
