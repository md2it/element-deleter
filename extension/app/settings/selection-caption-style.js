"use strict";
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

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.DEFAULT_SELECTION_CAPTION_STYLE = DEFAULT_SELECTION_CAPTION_STYLE;
globalThis.SELECTION_CAPTION_STYLES = SELECTION_CAPTION_STYLES;
globalThis.normalizeSelectionCaptionStyle = normalizeSelectionCaptionStyle;
globalThis.getSelectionCaptionStyle = getSelectionCaptionStyle;
globalThis.setSelectionCaptionStyle = setSelectionCaptionStyle;
