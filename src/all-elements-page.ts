import {
  disableAllElementsFill,
  enableAllElementsFill,
} from "@shared/all-elements-fill";
import type { AllElementsFillLayers } from "@shared/all-elements-fill";
import {
  disableAllElementsOutline,
  enableAllElementsOutline,
} from "@shared/all-elements-outline";

export const ALL_ELEMENTS_OUTLINE_STYLE_ID = "element-deleter-all-elements-outline";
export const ALL_ELEMENTS_FILL_STYLE_ID = "element-deleter-all-elements-fill";

/** Deleter key color #b91c1c — softer alpha for dotted outline */
const OUTLINE_RGBA = "rgba(185, 28, 28, 0.55)";

/**
 * Brand palette (RULES) — temporary higher alpha for user review:
 * rgba(1, 34, 146, 0.18)
 * rgba(185, 28, 28, 0.18)
 * rgba(245, 197, 24, 0.18)
 * rgba(21, 128, 61, 0.18)
 * rgba(107, 114, 128, 0.18)
 */
const FILL_LAYERS: AllElementsFillLayers = [
  "rgba(1, 34, 146, 0.18)",
  "rgba(185, 28, 28, 0.18)",
  "rgba(245, 197, 24, 0.18)",
  "rgba(21, 128, 61, 0.18)",
  "rgba(107, 114, 128, 0.18)",
];

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
      rgbaLayers: FILL_LAYERS,
    });
  } else {
    disableAllElementsFill(ALL_ELEMENTS_FILL_STYLE_ID);
  }
}
