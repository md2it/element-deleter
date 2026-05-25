import { createToastUiClasses } from "../../SHARED/src/toast";

export const UI_HOST_ATTR = "data-dom-deleter-ui";
export const UI_CLASS_PREFIX = "dd";

export const TOAST_STACK_ID = "dd-toast-stack";

const toastStructureClasses = createToastUiClasses(UI_CLASS_PREFIX);

/** DOM-deleter toast classes (variants + action buttons). */
export const TOAST_UI = {
  ...toastStructureClasses,
  toastDeleted: toastStructureClasses.toast,
  toastRestored: `${toastStructureClasses.toast} is-restored`,
  iconBtn: `${UI_CLASS_PREFIX}-icon-btn`,
} as const;

export const TOAST_STACK_CONFIG = {
  stackId: TOAST_STACK_ID,
  hostAttr: UI_HOST_ATTR,
  classes: toastStructureClasses,
} as const;

export const PANEL_FOOTER_CONFIG = {
  footerClassName: "dd-panel-footer",
} as const;
