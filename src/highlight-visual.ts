import {
  isIframeHitTestable,
  isSignificantIframe,
  listIframesWithin,
} from "./element-under-cursor";
import { formatElementLabel } from "./element-label";

const HOST_ATTR = "data-dom-deleter-ui";
const HIGHLIGHT_STYLE_ID = "dom-deleter-highlight-style";
/** Visual gap between target box and highlight outline (see .dd-highlight-frame outline-offset). */
export const HIGHLIGHT_FRAME_INSET = 2;

/** Page styles: cursor; iframe tint (filter). Visual frame lives in shadow overlay. */
const HIGHLIGHT_PAGE_CSS = `
.dd-highlight {
  cursor: crosshair !important;
}
iframe {
  pointer-events: none !important;
  cursor: crosshair !important;
}
iframe.dd-highlight-fill {
  /* Approximate --dd-highlight-fill over varied iframe content (not exact rgba). */
  filter: sepia(0.65) saturate(11) hue-rotate(342deg) brightness(0.88) !important;
}
ins.adsbygoogle.dd-highlight,
[id^="aswift_"][id$="_host"].dd-highlight {
  background-color: rgba(185, 28, 28, 0.22) !important;
}
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

export function ensurePageHighlightStyles(): void {
  if (document.getElementById(HIGHLIGHT_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = HIGHLIGHT_STYLE_ID;
  style.textContent = HIGHLIGHT_PAGE_CSS;
  document.documentElement.appendChild(style);
}

export function removePageHighlightStyles(): void {
  document.getElementById(HIGHLIGHT_STYLE_ID)?.remove();
}

export type ElementHighlightHost = {
  shadow: ShadowRoot;
  isOurNode: (node: Node | null) => boolean;
  getElementLabelEnabled: () => boolean;
};

export type HighlightRenderOptions = {
  /** Previous target when switching with frame transition. */
  animateFrom: Element | null;
  /** Abort transition if the logical target changed (e.g. pointer moved). */
  isStillTarget?: (target: Element) => boolean;
};

/**
 * Shadow overlay (frame, label), page classes (dd-highlight, dd-highlight-fill),
 * and highlight-mode page CSS. No pointer/pick logic.
 */
export class ElementHighlightVisual {
  private elementLabelEl: HTMLElement | null = null;
  private highlightFrameEl: HTMLElement | null = null;
  private highlightTransitionToken = 0;
  private highlightTransitionCleanup: (() => void) | null = null;

  constructor(private readonly host: ElementHighlightHost) {}

  bindExistingElements(
    elementLabelEl: HTMLElement | null,
    highlightFrameEl: HTMLElement | null,
  ): void {
    this.elementLabelEl = elementLabelEl;
    this.highlightFrameEl = highlightFrameEl;
  }

  installPageStyles(): void {
    ensurePageHighlightStyles();
  }

  uninstallPageStyles(): void {
    removePageHighlightStyles();
  }

  clear(): void {
    this.cancelHighlightTransition();
    this.clearTargetMarkers();
    this.hideHighlightFrame();
    this.hideElementLabel();
  }

  syncElementLabel(target: Element | null): void {
    if (!this.host.getElementLabelEnabled() || !target) {
      this.hideElementLabel();
      return;
    }

    const label = this.ensureElementLabel();
    label.textContent = formatElementLabel(target);
    label.style.display = "block";
    this.syncElementLabelPosition(target);
  }

  /** Full render for a new or updated target. */
  render(target: Element, options: HighlightRenderOptions): void {
    const { animateFrom } = options;
    this.cancelHighlightTransition();
    this.hideElementLabel();

    const animate =
      animateFrom !== null &&
      animateFrom.isConnected &&
      animateFrom !== target;

    if (!animate) {
      this.showHighlightFrameFor(target);
      target.classList.add("dd-highlight");
      this.syncIframeFill(target);
      this.syncElementLabel(target);
      return;
    }

    this.runHighlightTransition(animateFrom, target, options.isStillTarget);
    this.syncElementLabel(target);
  }

  /** Refresh overlay/iframe fill/label when target is unchanged. */
  refresh(target: Element): void {
    this.syncIframeFill(target);
    this.syncHighlightOverlay(target);
    this.syncElementLabel(target);
  }

  removeTargetClass(target: Element): void {
    target.classList.remove("dd-highlight");
  }

  private clearTargetMarkers(): void {
    this.clearIframeFill();
  }

  private clearIframeFill(): void {
    for (const node of Array.from(
      document.querySelectorAll("iframe.dd-highlight-fill"),
    )) {
      node.classList.remove("dd-highlight-fill");
    }
  }

  private rectOverlapArea(a: DOMRect, b: DOMRect): number {
    const left = Math.max(a.left, b.left);
    const right = Math.min(a.right, b.right);
    const top = Math.max(a.top, b.top);
    const bottom = Math.min(a.bottom, b.bottom);
    if (right <= left || bottom <= top) return 0;
    return (right - left) * (bottom - top);
  }

  private collectIframeFillTargets(target: Element): HTMLIFrameElement[] {
    if (target instanceof HTMLIFrameElement) {
      return isIframeHitTestable(target) && isSignificantIframe(target)
        ? [target]
        : [];
    }

    const out: HTMLIFrameElement[] = [];
    const targetRect = target.getBoundingClientRect();
    for (const node of listIframesWithin(target, (n) => this.host.isOurNode(n))) {
      if (!isIframeHitTestable(node) || !isSignificantIframe(node)) {
        continue;
      }
      const rect = node.getBoundingClientRect();
      const iframeArea = rect.width * rect.height;
      if (iframeArea <= 0) continue;
      if (this.rectOverlapArea(targetRect, rect) / iframeArea >= 0.5) {
        out.push(node);
      }
    }
    return out;
  }

  private syncIframeFill(target: Element): void {
    this.clearIframeFill();
    for (const iframe of this.collectIframeFillTargets(target)) {
      iframe.classList.add("dd-highlight-fill");
    }
  }

  private cancelHighlightTransition(): void {
    this.highlightTransitionToken += 1;
    this.highlightTransitionCleanup?.();
    this.highlightTransitionCleanup = null;
  }

  private ensureHighlightFrame(): HTMLElement {
    if (!this.highlightFrameEl) {
      const el = document.createElement("div");
      el.className = "dd-highlight-frame";
      el.setAttribute(HOST_ATTR, "true");
      el.setAttribute("aria-hidden", "true");
      this.host.shadow.insertBefore(el, this.host.shadow.firstChild);
      this.highlightFrameEl = el;
    }
    return this.highlightFrameEl;
  }

  private hideHighlightFrame(): void {
    if (!this.highlightFrameEl) return;
    this.highlightFrameEl.style.display = "none";
  }

  private showHighlightFrameFor(target: Element): void {
    const frame = this.ensureHighlightFrame();
    frame.style.display = "block";
    this.applyHighlightFrame(frame, target);
  }

  private syncHighlightFrame(target: Element): void {
    const frame = this.highlightFrameEl;
    if (!frame || frame.style.display === "none") return;
    this.applyHighlightFrame(frame, target);
  }

  private syncHighlightOverlay(target: Element): void {
    this.syncHighlightFrame(target);
    this.syncElementLabelPosition(target);
  }

  private applyHighlightFrame(frame: HTMLElement, target: Element): void {
    const rect = target.getBoundingClientRect();
    frame.style.top = `${rect.top}px`;
    frame.style.left = `${rect.left}px`;
    frame.style.width = `${rect.width}px`;
    frame.style.height = `${rect.height}px`;

    const style = getComputedStyle(target);
    frame.style.borderRadius = style.borderRadius;
    const clipPath = style.clipPath;
    frame.style.clipPath =
      clipPath && clipPath !== "none" ? clipPath : "";
  }

  private runHighlightTransition(
    from: Element,
    to: Element,
    isStillTarget?: (target: Element) => boolean,
  ): void {
    const frame = this.ensureHighlightFrame();
    const token = this.highlightTransitionToken;
    let done = false;

    if (frame.style.display !== "block") {
      frame.classList.add("is-instant");
      frame.style.display = "block";
      this.applyHighlightFrame(frame, from);
      frame.classList.remove("is-instant");
      void frame.offsetWidth;
    } else {
      frame.style.display = "block";
    }
    this.applyHighlightFrame(frame, to);

    const finish = (): void => {
      if (done) return;
      if (token !== this.highlightTransitionToken) return;
      if (isStillTarget && !isStillTarget(to)) return;
      done = true;
      this.highlightTransitionCleanup?.();
      this.highlightTransitionCleanup = null;
      this.showHighlightFrameFor(to);
      to.classList.add("dd-highlight");
      this.syncIframeFill(to);
      this.syncElementLabel(to);
    };

    const onTransitionEnd = (event: TransitionEvent): void => {
      if (event.target !== frame) return;
      if (event.propertyName !== "width") return;
      finish();
    };

    frame.addEventListener("transitionend", onTransitionEnd);
    const timeoutId = window.setTimeout(finish, 225);
    this.highlightTransitionCleanup = () => {
      frame.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(timeoutId);
    };
  }

  private ensureElementLabel(): HTMLElement {
    if (!this.elementLabelEl) {
      const el = document.createElement("div");
      el.className = "dd-element-label";
      el.setAttribute(HOST_ATTR, "true");
      el.setAttribute("aria-hidden", "true");
      this.host.shadow.appendChild(el);
      this.elementLabelEl = el;
    }
    return this.elementLabelEl;
  }

  private hideElementLabel(): void {
    if (!this.elementLabelEl) return;
    this.elementLabelEl.style.display = "none";
  }

  private syncElementLabelPosition(target: Element): void {
    const el = this.elementLabelEl;
    if (!el || el.style.display === "none") return;

    const rect = target.getBoundingClientRect();
    const frameTop = rect.top - HIGHLIGHT_FRAME_INSET;
    const frameLeft = rect.left - HIGHLIGHT_FRAME_INSET;
    el.style.top = `${frameTop}px`;
    el.style.left = `${frameLeft}px`;
  }
}
