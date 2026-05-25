import {
  findIframeAtPoint,
  isPointInElement,
} from "../../SHARED/src/element-under-cursor";
import { formatElementLabel } from "./element-label";
import {
  HighlightSystem,
  HIGHLIGHT_UI,
  DELETER_HIGHLIGHT_PAGE_STYLE,
} from "./highlight-selector";
import { isRtlLocale, t, type Locale } from "./i18n";
import {
  RestoreSystem,
  runElementTransition,
  buildDocumentChildPath,
  type UndoStackAccess,
} from "./restore";
import {
  getElementLabelEnabled,
  getLocale,
  getNotificationSeconds,
} from "./storage";
import { ToastSystem } from "./toast";

const ROOT_ID = "dom-deleter-root";
const HOST_ATTR = "data-dom-deleter-ui";

type DeactivateFn = () => void;

type DeleterUIOptions = {
  openPanel: (tab: "settings" | "info") => void;
  undo: UndoStackAccess;
};

export class DeleterUI {
  private readonly host: HTMLElement;
  private readonly shadow: ShadowRoot;
  private notificationSeconds = 4;
  private locale: Locale = "en";
  private elementLabelEnabled = false;
  private elementActionInFlight = false;

  private readonly onDeactivate: DeactivateFn;
  private readonly toast: ToastSystem;
  private readonly highlight: HighlightSystem;
  private readonly restore: RestoreSystem;

  private readonly boundClick: (e: MouseEvent) => void;

  constructor(onDeactivate: DeactivateFn, options: DeleterUIOptions) {
    this.onDeactivate = onDeactivate;

    this.boundClick = (e) => this.handleClick(e);

    const existing = document.getElementById(ROOT_ID);
    if (existing) {
      this.host = existing;
      this.shadow =
        existing.shadowRoot ?? existing.attachShadow({ mode: "open" });
    } else {
      this.host = document.createElement("div");
      this.host.id = ROOT_ID;
      this.host.setAttribute(HOST_ATTR, "true");
      this.host.style.cssText =
        "position:fixed;inset:0;z-index:2147483645;pointer-events:none;";
      document.documentElement.appendChild(this.host);
      this.shadow = this.host.attachShadow({ mode: "open" });
    }

    let style = this.shadow.querySelector("style");
    if (!style) {
      style = document.createElement("style");
      this.shadow.appendChild(style);
    }
    style.textContent = process.env.CSS_CONTENT ?? "";

    const existingLabel = this.shadow.querySelector(".dd-element-label");
    const existingFrame = this.shadow.querySelector(".dd-highlight-frame");

    this.toast = new ToastSystem({
      shadow: this.shadow,
      getNotificationSeconds: () => this.notificationSeconds,
      getStrings: () => this.strings(),
      isRtl: () => this.isRtl(),
      openPanel: options.openPanel,
      undoById: (id) => this.undoById(id),
    });

    this.restore = new RestoreSystem(
      {
        onRestored: (elementLabel) => this.toast.showRestoredToast(elementLabel),
      },
      options.undo,
    );

    this.highlight = new HighlightSystem({
      host: {
        shadow: this.shadow,
        isOurNode: (node) => this.isOurNode(node),
        getElementLabelEnabled: () => this.elementLabelEnabled,
        formatElementLabel,
        hostAttr: HOST_ATTR,
        classes: HIGHLIGHT_UI,
      },
      pageStyles: DELETER_HIGHLIGHT_PAGE_STYLE,
    });
    this.highlight.bindExistingElements(
      existingLabel instanceof HTMLElement ? existingLabel : null,
      existingFrame instanceof HTMLElement ? existingFrame : null,
    );
  }

  isOurNode(node: Node | null): boolean {
    if (!node) return true;
    if (node === this.host || this.host.contains(node)) return true;
    return !!(node as Element).closest?.(`[${HOST_ATTR}]`);
  }

  async loadSettings(): Promise<void> {
    const [seconds, locale, elementLabelEnabled] = await Promise.all([
      getNotificationSeconds(),
      getLocale(),
      getElementLabelEnabled(),
    ]);
    this.notificationSeconds = seconds;
    this.locale = locale;
    this.elementLabelEnabled = elementLabelEnabled;
  }

  setElementLabelEnabled(enabled: boolean): void {
    this.elementLabelEnabled = enabled;
    this.highlight.syncElementLabel();
  }

  setNotificationSeconds(seconds: number): void {
    this.notificationSeconds = seconds;
  }

  setLocale(locale: Locale): void {
    this.locale = locale;
  }

  private strings() {
    return t(this.locale);
  }

  private isRtl(): boolean {
    return isRtlLocale(this.locale);
  }

  activate(): void {
    this.highlight.activate();
    document.addEventListener("click", this.boundClick, true);
  }

  deactivate(): void {
    document.removeEventListener("click", this.boundClick, true);
    this.highlight.deactivate();
    this.toast.hide();
  }

  canUndo(): boolean {
    if (this.elementActionInFlight) return false;
    return this.restore.canUndo();
  }

  async undoLast(): Promise<boolean> {
    if (this.elementActionInFlight) return false;
    this.elementActionInFlight = true;
    try {
      return await this.restore.undoLast();
    } finally {
      this.elementActionInFlight = false;
    }
  }

  async undoById(id: number): Promise<boolean> {
    if (this.elementActionInFlight) return false;
    this.elementActionInFlight = true;
    try {
      return await this.restore.undoById(id);
    } finally {
      this.elementActionInFlight = false;
    }
  }

  async deleteContextElement(element: Element): Promise<boolean> {
    return this.deleteElement(element);
  }

  private async handleClick(e: MouseEvent): Promise<void> {
    const pickOptions = { isOurNode: (node: Node | null) => this.isOurNode(node) };
    const iframeAtPoint = findIframeAtPoint(
      e.clientX,
      e.clientY,
      pickOptions,
    );
    const toRemove = iframeAtPoint ?? this.highlight.getHighlighted();
    if (!toRemove) return;

    const hit = e.target;
    if (hit instanceof Element && this.isOurNode(hit)) return;

    const onTarget =
      hit === toRemove ||
      (hit instanceof Element && toRemove.contains(hit)) ||
      isPointInElement(toRemove, e.clientX, e.clientY);

    if (!onTarget) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const deleted = await this.deleteElement(toRemove);
    if (deleted) {
      this.highlight.updateHighlightAt(e.clientX, e.clientY);
    }
  }

  private async deleteElement(toRemove: Element): Promise<boolean> {
    if (this.elementActionInFlight) return false;

    const parent = toRemove.parentElement;
    if (!parent) return false;

    const nextSibling = toRemove.nextSibling;
    const childIndex = Array.prototype.indexOf.call(parent.children, toRemove);
    const outerHTML = toRemove.outerHTML;
    const elementLabel = formatElementLabel(toRemove);

    this.elementActionInFlight = true;
    this.highlight.clearIfTarget(toRemove);

    try {
      await runElementTransition(toRemove, true);
      if (!toRemove.isConnected) return false;
      toRemove.remove();
      const undoId = this.restore.recordDeletion({
        parent,
        parentPath: buildDocumentChildPath(parent),
        parentTagName: parent.tagName,
        parentNs: parent.namespaceURI,
        nextSibling,
        childIndex,
        removedElement: toRemove,
        outerHTML,
        elementLabel,
      });
      this.toast.showDeletedToast(elementLabel, undoId);
      return true;
    } finally {
      this.elementActionInFlight = false;
    }
  }
}
