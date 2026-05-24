const PSEUDO_CLASS_CHECKS: readonly { selector: string; name: string }[] = [
  { selector: ":disabled", name: "disabled" },
  { selector: ":checked", name: "checked" },
  { selector: ":open", name: "open" },
  { selector: ":required", name: "required" },
  { selector: ":invalid", name: "invalid" },
  { selector: ":read-only", name: "read-only" },
  { selector: ":empty", name: "empty" },
  { selector: ":focus-visible", name: "focus-visible" },
  { selector: ":focus", name: "focus" },
];

/** First matching CSS pseudo-class name (e.g. `disabled`). */
function getPseudoClass(el: Element): string | null {
  if (!(el instanceof HTMLElement)) return null;

  for (const { selector, name } of PSEUDO_CLASS_CHECKS) {
    try {
      if (el.matches(selector)) return name;
    } catch {
      // Unsupported selector on this element type.
    }
  }
  return null;
}

function classSelectorSuffix(el: Element): string {
  const classes = Array.from(el.classList)
    .map((c) => c.trim())
    .filter(Boolean);
  if (classes.length === 0) return "";
  return classes.map((c) => `.${c}`).join("");
}

/** Label for highlight overlay and delete/restore toasts. */
export function formatElementLabel(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id.trim();
  const pseudo = getPseudoClass(el);
  const classes = classSelectorSuffix(el);

  if (id) {
    return pseudo ? `${tag}#${id}:${pseudo}` : `${tag}#${id}`;
  }
  if (classes) {
    return pseudo ? `${tag}${classes}:${pseudo}` : `${tag}${classes}`;
  }
  return tag;
}
