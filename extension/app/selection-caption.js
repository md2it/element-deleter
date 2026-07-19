import { getCssSelector } from "../lib/our/copy/selector.js";
import { getFullXPath } from "../lib/our/copy/xpath.js";

function formatTagIdClassCaption(el) {
  const tag = el.tagName.toLowerCase();
  const id = el.id.trim();
  if (id) return `${tag}#${id}`;
  const classes = Array.from(el.classList)
    .map((c) => c.trim())
    .filter(Boolean);
  if (classes.length > 0) {
    return `${tag}.${classes.slice(0, 3).join(".")}`;
  }
  return tag;
}
function formatSelectionCaption(el, style, clickToDeleteLabel) {
  switch (style) {
    case "none":
      return "";
    case "click-to-delete":
      return clickToDeleteLabel;
    case "tag-id-class":
      return formatTagIdClassCaption(el);
    case "selector":
      return getCssSelector(el);
    case "full-xpath":
      return getFullXPath(el);
  }
}
function shouldShowSelectionCaption(selectionCaptionStyle) {
  return selectionCaptionStyle !== "none";
}
function resolveElementDescriptor(el, options) {
  return formatSelectionCaption(
    el,
    options.selectionCaptionStyle,
    options.clickToDeleteLabel,
  );
}
var TOAST_RESTORED_DESCRIPTOR = "👍";
function formatToastDescriptor(el, options) {
  switch (options.selectionCaptionStyle) {
    case "none":
    case "click-to-delete":
      return options.variant === "deleted"
        ? options.deletedCanBeRestored
        : TOAST_RESTORED_DESCRIPTOR;
    case "tag-id-class":
      return formatTagIdClassCaption(el);
    case "selector":
      return getCssSelector(el);
    case "full-xpath":
      return getFullXPath(el);
  }
}

export { formatTagIdClassCaption, formatSelectionCaption, shouldShowSelectionCaption, resolveElementDescriptor, TOAST_RESTORED_DESCRIPTOR, formatToastDescriptor };
