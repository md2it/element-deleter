export const DELETE_RESTORE_STYLE_ID = "element-deleter-delete-restore-style";

const DELETE_RESTORE_PAGE_CSS = `
.dd-delete-anim,
.dd-restore-anim {
  transform-origin: center center;
  outline-style: solid !important;
  outline-width: 0;
  outline-offset: -1px;
  box-shadow: none;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    box-shadow 0.2s ease,
    outline-width 0.2s ease;
}
.dd-delete-anim {
  outline-color: #b91c1c !important;
}
.dd-restore-anim {
  outline-color: #012292 !important;
}
.dd-delete-anim.is-out,
.dd-restore-anim.is-out {
  transform: scale(0.68);
  opacity: 0.15;
}
.dd-delete-anim.is-out {
  outline-width: 3px !important;
  box-shadow:
    0 0 0 3px rgba(185, 28, 28, 0.62),
    0 0 28px 10px rgba(185, 28, 28, 0.68),
    inset 0 0 48px 16px rgba(185, 28, 28, 0.48) !important;
}
.dd-restore-anim.is-out {
  outline-width: 3px !important;
  box-shadow:
    0 0 0 3px rgba(1, 34, 146, 0.62),
    0 0 28px 10px rgba(1, 34, 146, 0.68),
    inset 0 0 48px 16px rgba(1, 34, 146, 0.48) !important;
}
`;

export function ensurePageDeleteRestoreStyles(): void {
  if (document.getElementById(DELETE_RESTORE_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = DELETE_RESTORE_STYLE_ID;
  style.textContent = DELETE_RESTORE_PAGE_CSS;
  document.documentElement.appendChild(style);
}

export function removePageDeleteRestoreStyles(): void {
  document.getElementById(DELETE_RESTORE_STYLE_ID)?.remove();
}

const ELEMENT_ANIM_MS = 200;

export function runElementTransition(el: Element, out: boolean): Promise<void> {
  ensurePageDeleteRestoreStyles();
  const node = el as HTMLElement;
  const animClass = out ? "dd-delete-anim" : "dd-restore-anim";
  if (out && node === document.activeElement) {
    node.blur();
  }
  node.classList.add(animClass);
  if (out) {
    void node.offsetWidth;
    node.classList.add("is-out");
  } else {
    void node.offsetWidth;
    node.classList.remove("is-out");
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (): void => {
      if (settled) return;
      settled = true;
      node.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(timeoutId);
      if (!out) {
        node.classList.remove("dd-restore-anim", "is-out");
      }
      resolve();
    };

    const onTransitionEnd = (event: TransitionEvent): void => {
      if (event.target !== node) return;
      if (
        event.propertyName !== "opacity" &&
        event.propertyName !== "transform"
      ) {
        return;
      }
      finish();
    };

    node.addEventListener("transitionend", onTransitionEnd);
    const timeoutId = window.setTimeout(finish, ELEMENT_ANIM_MS + 75);
  });
}
