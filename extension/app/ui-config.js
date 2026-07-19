"use strict";
var UI_HOST_ATTR = "data-element-deleter-ui";
var UI_CLASS_PREFIX = "dd";
var TOAST_STACK_ID = "dd-toast-stack";
var toastStructureClasses = createToastUiClasses(UI_CLASS_PREFIX);
var TOAST_UI = {
  ...toastStructureClasses,
  toastDeleted: toastStructureClasses.toast,
  toastRestored: `${toastStructureClasses.toast} is-restored`,
  iconBtn: `${UI_CLASS_PREFIX}-icon-btn`,
};
var TOAST_STACK_CONFIG = {
  stackId: TOAST_STACK_ID,
  hostAttr: UI_HOST_ATTR,
  classes: toastStructureClasses,
};

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.UI_HOST_ATTR = UI_HOST_ATTR;
globalThis.UI_CLASS_PREFIX = UI_CLASS_PREFIX;
globalThis.TOAST_STACK_ID = TOAST_STACK_ID;
globalThis.toastStructureClasses = toastStructureClasses;
globalThis.TOAST_UI = TOAST_UI;
globalThis.TOAST_STACK_CONFIG = TOAST_STACK_CONFIG;
