import { ext } from "../../lib/our/api.js";
import { SELECTION_CAPTION_STYLE_KEY } from "../messages.js";

var DEFAULT_SELECTION_CAPTION_STYLE = "click-to-delete";
var SELECTION_CAPTION_STYLES = [
  "none",
  "click-to-delete",
  "tag-id-class",
  "selector",
  "full-xpath",
];
function normalizeSelectionCaptionStyle(raw) {
  if (raw === "click-to-copy") return "click-to-delete";
  return SELECTION_CAPTION_STYLES.includes(raw)
    ? raw
    : DEFAULT_SELECTION_CAPTION_STYLE;
}
async function getSelectionCaptionStyle() {
  const data = await ext.storage.local.get(SELECTION_CAPTION_STYLE_KEY);
  return normalizeSelectionCaptionStyle(data[SELECTION_CAPTION_STYLE_KEY]);
}
async function setSelectionCaptionStyle(style) {
  await ext.storage.local.set({ [SELECTION_CAPTION_STYLE_KEY]: style });
}

export { DEFAULT_SELECTION_CAPTION_STYLE, SELECTION_CAPTION_STYLES, normalizeSelectionCaptionStyle, getSelectionCaptionStyle, setSelectionCaptionStyle };
