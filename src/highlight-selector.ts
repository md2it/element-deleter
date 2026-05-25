import { pickElementUnderCursor } from "./element-under-cursor";
import {
  ElementHighlightVisual,
  ensurePageHighlightStyles,
  removePageHighlightStyles,
  type ElementHighlightHost,
} from "./highlight-visual";

export { ensurePageHighlightStyles } from "./highlight-visual";

export type HighlightHost = ElementHighlightHost;

export class HighlightSystem {
  private highlighted: Element | null = null;
  private readonly visual: ElementHighlightVisual;
  private readonly host: HighlightHost;
  private domMutationObserver: MutationObserver | null = null;
  private lastPointerX = -1;
  private lastPointerY = -1;
  private highlightRefreshRaf = 0;

  private readonly boundMove: (e: MouseEvent) => void;
  private readonly boundPointerMove: (e: PointerEvent) => void;
  private readonly boundScroll: () => void;
  private readonly boundResize: () => void;

  constructor(host: HighlightHost) {
    this.host = host;
    this.visual = new ElementHighlightVisual(host);
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
    this.visual.bindExistingElements(elementLabelEl, highlightFrameEl);
  }

  activate(): void {
    this.visual.installPageStyles();
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
    if (this.highlighted) {
      this.visual.removeTargetClass(this.highlighted);
      this.highlighted = null;
    }
    this.visual.clear();
  }

  clearIfTarget(target: Element): void {
    if (this.highlighted === target) {
      this.clear();
    }
  }

  syncElementLabel(): void {
    this.visual.syncElementLabel(this.highlighted);
  }

  updateHighlightAt(x: number, y: number): void {
    this.lastPointerX = x;
    this.lastPointerY = y;
    const el = pickElementUnderCursor(x, y, {
      isOurNode: (node) => this.host.isOurNode(node),
    });
    if (!el) {
      this.clear();
      return;
    }
    this.setHighlighted(el);
  }

  private scheduleHighlightRefresh(): void {
    if (this.highlightRefreshRaf) return;
    this.highlightRefreshRaf = requestAnimationFrame(() => {
      this.highlightRefreshRaf = 0;
      if (this.lastPointerX < 0) return;
      this.updateHighlightAt(this.lastPointerX, this.lastPointerY);
    });
  }

  private setHighlighted(el: Element | null): void {
    if (this.highlighted === el) {
      if (el) this.visual.refresh(el);
      return;
    }

    const prev = this.highlighted;

    if (!el) {
      if (prev) this.visual.removeTargetClass(prev);
      this.highlighted = null;
      this.visual.clear();
      return;
    }

    if (prev) this.visual.removeTargetClass(prev);
    this.highlighted = el;
    this.visual.render(el, {
      animateFrom: prev,
      isStillTarget: (target) => this.highlighted === target,
    });
  }
}
