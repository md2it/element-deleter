"use strict";
function createToastUiClasses(prefix) {
  return {
    toast: `${prefix}-toast`,
    toastLabel: `${prefix}-toast-label`,
    toastStatus: `${prefix}-toast-status`,
    toastTarget: `${prefix}-toast-target`,
    toastLeading: `${prefix}-toast-leading`,
    toastMark: `${prefix}-toast-mark`,
    toastActions: `${prefix}-toast-actions`,
    toastStack: `${prefix}-toast-stack`,
  };
}

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.createToastUiClasses = createToastUiClasses;
