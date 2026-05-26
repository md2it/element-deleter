import {
  buildGenericHighlightPageCss,
  createHighlightUiClasses,
  ensurePageHighlightStyles as ensureLibPageHighlightStyles,
  removePageHighlightStyles as removeLibPageHighlightStyles,
} from "../../../lib/src/highlight";
import { DELETER_HIGHLIGHT_PAGE_CSS } from "./deleter-page-styles";

export const HIGHLIGHT_STYLE_ID = "element-deleter-highlight-style";

export const HIGHLIGHT_UI = createHighlightUiClasses("dd");

const HIGHLIGHT_PAGE_CSS =
  buildGenericHighlightPageCss(HIGHLIGHT_UI) + DELETER_HIGHLIGHT_PAGE_CSS;

export const DELETER_HIGHLIGHT_PAGE_STYLE = {
  styleId: HIGHLIGHT_STYLE_ID,
  pageCss: HIGHLIGHT_PAGE_CSS,
} as const;

export function ensurePageHighlightStyles(): void {
  ensureLibPageHighlightStyles(DELETER_HIGHLIGHT_PAGE_STYLE);
}

export function removePageHighlightStyles(): void {
  removeLibPageHighlightStyles(HIGHLIGHT_STYLE_ID);
}
