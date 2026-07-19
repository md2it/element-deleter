"use strict";
var DEFAULT_TOGGLE_COMMAND_SUPPRESS_MS = 300;
function shouldSuppressContentToggleAfterToggleCommand(
  lastAt,
  now,
  windowMs = DEFAULT_TOGGLE_COMMAND_SUPPRESS_MS,
) {
  return lastAt > 0 && now - lastAt < windowMs;
}
function createToggleCommandSuppressTracker(
  windowMs = DEFAULT_TOGGLE_COMMAND_SUPPRESS_MS,
) {
  let lastToggleCommandAt = 0;
  return {
    stampToggleCommand: () => {
      lastToggleCommandAt = Date.now();
    },
    shouldSuppressContentToggle: (now = Date.now()) =>
      shouldSuppressContentToggleAfterToggleCommand(
        lastToggleCommandAt,
        now,
        windowMs,
      ),
    shouldSuppressToolbarClick: (now = Date.now()) =>
      shouldSuppressContentToggleAfterToggleCommand(
        lastToggleCommandAt,
        now,
        windowMs,
      ),
  };
}

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.DEFAULT_TOGGLE_COMMAND_SUPPRESS_MS = DEFAULT_TOGGLE_COMMAND_SUPPRESS_MS;
globalThis.shouldSuppressContentToggleAfterToggleCommand = shouldSuppressContentToggleAfterToggleCommand;
globalThis.createToggleCommandSuppressTracker = createToggleCommandSuppressTracker;
