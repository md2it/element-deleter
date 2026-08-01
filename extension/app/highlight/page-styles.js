import { createHighlightUiClasses } from "./classes.js";
import { DELETER_HIGHLIGHT_PAGE_CSS } from "./deleter-page-styles.js";

function buildGenericHighlightPageCss(classes) {
  return `
.${classes.highlightTarget} {
  cursor: crosshair !important;
}
iframe {
  pointer-events: none !important;
  cursor: crosshair !important;
}
iframe.${classes.highlightFill} {
  /* Approximate highlight fill over varied iframe content (not exact rgba). */
  filter: sepia(0.65) saturate(11) hue-rotate(342deg) brightness(0.88) !important;
}
`;
}
function ensurePageHighlightStyles(config) {
  if (document.getElementById(config.styleId)) return;
  const style = document.createElement("style");
  style.id = config.styleId;
  style.textContent = config.pageCss;
  document.documentElement.appendChild(style);
}
function removePageHighlightStyles(styleId) {
  document.getElementById(styleId)?.remove();
}

var HIGHLIGHT_STYLE_ID = "element-deleter-highlight-style";
var HIGHLIGHT_UI = createHighlightUiClasses("dd");
var HIGHLIGHT_PAGE_CSS =
  buildGenericHighlightPageCss(HIGHLIGHT_UI) + DELETER_HIGHLIGHT_PAGE_CSS;
var DELETER_HIGHLIGHT_PAGE_STYLE = {
  styleId: HIGHLIGHT_STYLE_ID,
  pageCss: HIGHLIGHT_PAGE_CSS,
};

export { buildGenericHighlightPageCss, ensurePageHighlightStyles, removePageHighlightStyles, HIGHLIGHT_STYLE_ID, HIGHLIGHT_UI, HIGHLIGHT_PAGE_CSS, DELETER_HIGHLIGHT_PAGE_STYLE };
