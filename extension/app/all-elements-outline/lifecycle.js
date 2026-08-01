import { removeAllElementsStyle, setAllElementsStyleAtEnd } from "../all-elements-style-inject.js";
import { buildAllElementsOutlineCss } from "./css.js";

function enableAllElementsOutline(config) {
  setAllElementsStyleAtEnd(config.styleId, buildAllElementsOutlineCss(config));
}
function disableAllElementsOutline(styleId) {
  removeAllElementsStyle(styleId);
}

export { enableAllElementsOutline, disableAllElementsOutline };
