import { removeAllElementsStyle, setAllElementsStyleAtEnd } from "../all-elements-style-inject.js";
import { buildAllElementsFillCss } from "./css.js";

function enableAllElementsFill(config) {
  setAllElementsStyleAtEnd(config.styleId, buildAllElementsFillCss(config));
}
function disableAllElementsFill(styleId) {
  removeAllElementsStyle(styleId);
}

export { enableAllElementsFill, disableAllElementsFill };
