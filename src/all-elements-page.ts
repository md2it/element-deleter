import {
  disableAllElementsFill,
  enableAllElementsFill,
} from "@shared/all-elements-fill";
import {
  disableAllElementsOutline,
  enableAllElementsOutline,
} from "@shared/all-elements-outline";

export const ALL_ELEMENTS_OUTLINE_STYLE_ID = "element-deleter-all-elements-outline";
export const ALL_ELEMENTS_FILL_STYLE_ID = "element-deleter-all-elements-fill";

/** Brand red #b91c1c — slightly softer alpha for dotted outline */
const OUTLINE_RGBA = "rgba(185, 28, 28, 0.48)";

export function removeAllElementsPageStyles(): void {
  applyAllElementsPageStyles({ outline: false, fill: false });
}

export function applyAllElementsPageStyles(options: {
  outline: boolean;
  fill: boolean;
}): void {
  if (options.outline) {
    enableAllElementsOutline({
      styleId: ALL_ELEMENTS_OUTLINE_STYLE_ID,
      rgba: OUTLINE_RGBA,
      outlineStyle: "dotted",
    });
  } else {
    disableAllElementsOutline(ALL_ELEMENTS_OUTLINE_STYLE_ID);
  }

  if (options.fill) {
    enableAllElementsFill({
      styleId: ALL_ELEMENTS_FILL_STYLE_ID,
    });
  } else {
    disableAllElementsFill(ALL_ELEMENTS_FILL_STYLE_ID);
  }
}
