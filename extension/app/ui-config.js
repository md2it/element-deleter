import { createToastUiClasses } from "../lib/our/toast/index.js";

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

export { UI_HOST_ATTR, UI_CLASS_PREFIX, TOAST_STACK_ID, toastStructureClasses, TOAST_UI, TOAST_STACK_CONFIG };
