import { getCssSelector } from "../../lib/src/copy/selector";
import { getFullXPath } from "../../lib/src/copy/xpath";
import type { SelectionCaptionStyle } from "./settings/selection-caption-style";

/** Short label: tag + id or up to three classes. */
export function formatTagIdClassCaption(el: Element): string {
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

export function formatSelectionCaption(
  el: Element,
  style: SelectionCaptionStyle,
  clickToDeleteLabel: string,
): string {
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

export function shouldShowSelectionCaption(
  selectionCaptionStyle: SelectionCaptionStyle,
): boolean {
  return selectionCaptionStyle !== "none";
}

export function resolveElementDescriptor(
  el: Element,
  options: {
    selectionCaptionStyle: SelectionCaptionStyle;
    clickToDeleteLabel: string;
  },
): string {
  return formatSelectionCaption(
    el,
    options.selectionCaptionStyle,
    options.clickToDeleteLabel,
  );
}

export type ToastDescriptorVariant = "deleted" | "restored";

export const TOAST_RESTORED_DESCRIPTOR = "👍";

/** Descriptor line in delete/restore toasts (see SPEC/ui-toast.md). */
export function formatToastDescriptor(
  el: Element,
  options: {
    variant: ToastDescriptorVariant;
    selectionCaptionStyle: SelectionCaptionStyle;
    deletedCanBeRestored: string;
  },
): string {
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
