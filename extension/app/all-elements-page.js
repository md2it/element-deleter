import { disableAllElementsOutline, enableAllElementsOutline } from "./all-elements-outline/lifecycle.js";

var ALL_ELEMENTS_OUTLINE_STYLE_ID = "element-deleter-all-elements-outline";
var OUTLINE_RGBA = "rgba(185, 28, 28, 0.48)";
function removeAllElementsPageStyles() {
  applyAllElementsPageStyles({ outline: false });
}
function applyAllElementsPageStyles(options) {
  if (options.outline) {
    enableAllElementsOutline({
      styleId: ALL_ELEMENTS_OUTLINE_STYLE_ID,
      rgba: OUTLINE_RGBA,
      outlineStyle: "dashed",
    });
  } else {
    disableAllElementsOutline(ALL_ELEMENTS_OUTLINE_STYLE_ID);
  }
}

export { ALL_ELEMENTS_OUTLINE_STYLE_ID, OUTLINE_RGBA, removeAllElementsPageStyles, applyAllElementsPageStyles };
