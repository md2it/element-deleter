import { createHighlightUiClasses } from "../../lib/our/highlight/classes.js";
import { buildGenericHighlightPageCss } from "../../lib/our/highlight/page-styles.js";
import { DELETER_HIGHLIGHT_PAGE_CSS } from "./deleter-page-styles.js";

var HIGHLIGHT_STYLE_ID = "element-deleter-highlight-style";
var HIGHLIGHT_UI = createHighlightUiClasses("dd");
var HIGHLIGHT_PAGE_CSS =
  buildGenericHighlightPageCss(HIGHLIGHT_UI) + DELETER_HIGHLIGHT_PAGE_CSS;
var DELETER_HIGHLIGHT_PAGE_STYLE = {
  styleId: HIGHLIGHT_STYLE_ID,
  pageCss: HIGHLIGHT_PAGE_CSS,
};

export { HIGHLIGHT_STYLE_ID, HIGHLIGHT_UI, HIGHLIGHT_PAGE_CSS, DELETER_HIGHLIGHT_PAGE_STYLE };
