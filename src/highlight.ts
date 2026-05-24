import { formatElementLabel } from "./element-label";

const HOST_ATTR = "data-dom-deleter-ui";
const HIGHLIGHT_STYLE_ID = "dom-deleter-highlight-style";
/** Visual gap between target box and highlight outline (see .dd-highlight-frame outline-offset). */
const HIGHLIGHT_FRAME_INSET = 2;
/** Ignore AdSense relay/tracking iframes smaller than this (px on each axis). */
const MIN_IFRAME_PICK_PX = 4;

/** Page styles: cursor; iframe tint (filter). Visual frame lives in shadow overlay. */
const HIGHLIGHT_CSS = `
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
  style.textContent = HIGHLIGHT_CSS;
  document.documentElement.appendChild(style);
}

function removePageHighlightStyles(): void {
  document.getElementById(HIGHLIGHT_STYLE_ID)?.remove();
}

export type HighlightHost = {
  shadow: ShadowRoot;
  isOurNode: (node: Node | null) => boolean;
  getElementLabelEnabled: () => boolean;
};

export class HighlightSystem {
  private highlighted: Element | null = null;
  private elementLabelEl: HTMLElement | null = null;
  private highlightFrameEl: HTMLElement | null = null;
  private highlightTransitionToken = 0;
  private highlightTransitionCleanup: (() => void) | null = null;
  private domMutationObserver: MutationObserver | null = null;
  private lastPointerX = -1;
  private lastPointerY = -1;
  private highlightRefreshRaf = 0;

  private readonly boundMove: (e: MouseEvent) => void;
  private readonly boundPointerMove: (e: PointerEvent) => void;
  private readonly boundScroll: () => void;
  private readonly boundResize: () => void;

  constructor(private readonly host: HighlightHost) {
    this.boundMove = (e) => this.updateHighlightAt(e.clientX, e.clientY);
    this.boundPointerMove = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      this.updateHighlightAt(e.clientX, e.clientY);
    };
    this.boundScroll = () => this.scheduleHighlightRefresh();
    this.boundResize = () => this.scheduleHighlightRefresh();
  }

  bindExistingElements(
    elementLabelEl: HTMLElement | null,
    highlightFrameEl: HTMLElement | null,
  ): void {
    this.elementLabelEl = elementLabelEl;
    this.highlightFrameEl = highlightFrameEl;
  }

  activate(): void {
    ensurePageHighlightStyles();
    this.lastPointerX = -1;
    this.lastPointerY = -1;
    this.domMutationObserver = new MutationObserver(() =>
      this.scheduleHighlightRefresh(),
    );
    this.domMutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "width", "height", "hidden"],
    });
    document.addEventListener("mousemove", this.boundMove, true);
    document.addEventListener("pointermove", this.boundPointerMove, true);
    document.addEventListener("scroll", this.boundScroll, true);
    window.addEventListener("resize", this.boundResize);
  }

  deactivate(): void {
    document.removeEventListener("mousemove", this.boundMove, true);
    document.removeEventListener("pointermove", this.boundPointerMove, true);
    document.removeEventListener("scroll", this.boundScroll, true);
    window.removeEventListener("resize", this.boundResize);
    this.domMutationObserver?.disconnect();
    this.domMutationObserver = null;
    if (this.highlightRefreshRaf) {
      cancelAnimationFrame(this.highlightRefreshRaf);
      this.highlightRefreshRaf = 0;
    }
    this.lastPointerX = -1;
    this.lastPointerY = -1;
    this.clear();
    removePageHighlightStyles();
  }

  getHighlighted(): Element | null {
    return this.highlighted;
  }

  clear(): void {
    this.cancelHighlightTransition();
    if (this.highlighted) {
      this.highlighted.classList.remove("dd-highlight");
      this.highlighted = null;
    }
    this.clearIframeFill();
    this.hideHighlightFrame();
    this.hideElementLabel();
  }

  clearIfTarget(target: Element): void {
    if (this.highlighted === target) {
      this.clear();
    }
  }

  syncElementLabel(): void {
    if (!this.host.getElementLabelEnabled() || !this.highlighted) {
      this.hideElementLabel();
      return;
    }

    const label = this.ensureElementLabel();
    label.textContent = formatElementLabel(this.highlighted);
    label.style.display = "block";
    this.syncElementLabelPosition();
  }

  findIframeAtPoint(x: number, y: number): HTMLIFrameElement | null {
    let best: HTMLIFrameElement | null = null;
    let bestArea = Infinity;

    for (const node of this.listIframesWithin(document)) {
      if (
        this.host.isOurNode(node) ||
        !this.isIframeHitTestable(node) ||
        !this.isSignificantIframe(node) ||
        !this.iframeContainsPoint(node, x, y)
      ) {
        continue;
      }

      const rect = node.getBoundingClientRect();
      const area = rect.width * rect.height;
      if (area < bestArea) {
        bestArea = area;
        best = node;
      }
    }

    return best;
  }

  isPointInElement(el: Element, x: number, y: number): boolean {
    const rect = el.getBoundingClientRect();
    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );
  }

  pickTargetUnderCursor(x: number, y: number): Element | null {
    const iframe = this.findIframeAtPoint(x, y);
    if (iframe) return iframe;

    const stack = document.elementsFromPoint(x, y);
    for (const node of stack) {
      if (!(node instanceof Element)) continue;
      if (this.host.isOurNode(node)) continue;
      if (node === document.documentElement || node === document.body) continue;
      return node;
    }

    return null;
  }

  updateHighlightAt(x: number, y: number): void {
    this.lastPointerX = x;
    this.lastPointerY = y;
    const el = this.pickTargetUnderCursor(x, y);
    if (!el) {
      this.clear();
      return;
    }
    this.setHighlighted(el);
  }

  private listIframesWithin(root: ParentNode): HTMLIFrameElement[] {
    const out: HTMLIFrameElement[] = [];
    const seen = new Set<HTMLIFrameElement>();

    const scan = (node: ParentNode): void => {
      for (const el of Array.from(node.querySelectorAll("iframe"))) {
        if (
          el instanceof HTMLIFrameElement &&
          !seen.has(el) &&
          !this.host.isOurNode(el)
        ) {
          seen.add(el);
          out.push(el);
        }
      }
      for (const el of Array.from(node.querySelectorAll("*"))) {
        if (el instanceof Element && el.shadowRoot) {
          scan(el.shadowRoot);
        }
      }
    };

    scan(root);
    return out;
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
      return this.isIframeHitTestable(target) && this.isSignificantIframe(target)
        ? [target]
        : [];
    }

    const out: HTMLIFrameElement[] = [];
    const targetRect = target.getBoundingClientRect();
    for (const node of this.listIframesWithin(target)) {
      if (!this.isIframeHitTestable(node) || !this.isSignificantIframe(node)) {
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

  private scheduleHighlightRefresh(): void {
    if (this.highlightRefreshRaf) return;
    this.highlightRefreshRaf = requestAnimationFrame(() => {
      this.highlightRefreshRaf = 0;
      if (this.lastPointerX < 0) return;
      this.updateHighlightAt(this.lastPointerX, this.lastPointerY);
    });
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

  private syncHighlightFrame(): void {
    const target = this.highlighted;
    if (!target) return;
    const frame = this.highlightFrameEl;
    if (!frame || frame.style.display === "none") return;
    this.applyHighlightFrame(frame, target);
  }

  private syncHighlightOverlay(): void {
    this.syncHighlightFrame();
    this.syncElementLabelPosition();
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

  private runHighlightTransition(from: Element, to: Element): void {
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
      if (this.highlighted !== to) return;
      done = true;
      this.highlightTransitionCleanup?.();
      this.highlightTransitionCleanup = null;
      this.showHighlightFrameFor(to);
      to.classList.add("dd-highlight");
      this.syncIframeFill(to);
      this.syncElementLabel();
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

  private syncElementLabelPosition(): void {
    const el = this.elementLabelEl;
    const target = this.highlighted;
    if (!el || el.style.display === "none" || !target) return;

    const rect = target.getBoundingClientRect();
    const frameTop = rect.top - HIGHLIGHT_FRAME_INSET;
    const frameLeft = rect.left - HIGHLIGHT_FRAME_INSET;
    el.style.top = `${frameTop}px`;
    el.style.left = `${frameLeft}px`;
  }

  private setHighlighted(el: Element | null): void {
    if (this.highlighted === el) {
      if (el) {
        this.syncIframeFill(el);
        this.syncHighlightOverlay();
        this.syncElementLabel();
      }
      return;
    }

    const prev = this.highlighted;
    this.cancelHighlightTransition();

    if (!el) {
      if (prev) prev.classList.remove("dd-highlight");
      this.highlighted = null;
      this.clearIframeFill();
      this.hideHighlightFrame();
      this.hideElementLabel();
      return;
    }

    const animate =
      prev !== null && prev.isConnected && prev !== el;

    if (prev) prev.classList.remove("dd-highlight");
    this.highlighted = el;
    this.hideElementLabel();

    if (!animate) {
      this.showHighlightFrameFor(el);
      el.classList.add("dd-highlight");
      this.syncIframeFill(el);
      this.syncElementLabel();
      return;
    }

    this.runHighlightTransition(prev!, el);
    this.syncElementLabel();
  }

  private isIframeHitTestable(iframe: HTMLIFrameElement): boolean {
    if (iframe.hasAttribute("hidden")) return false;
    const style = getComputedStyle(iframe);
    if (style.display === "none" || style.visibility === "hidden") return false;
    if (parseFloat(style.opacity) <= 0) return false;
    const rect = iframe.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  private isSignificantIframe(iframe: HTMLIFrameElement): boolean {
    const rect = iframe.getBoundingClientRect();
    return (
      rect.width >= MIN_IFRAME_PICK_PX && rect.height >= MIN_IFRAME_PICK_PX
    );
  }

  private iframeContainsPoint(
    iframe: HTMLIFrameElement,
    x: number,
    y: number,
  ): boolean {
    const rect = iframe.getBoundingClientRect();
    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );
  }
}
