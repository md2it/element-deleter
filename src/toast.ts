import { extensionMarkSvg, COG, INFO, UNDO_2 } from "./icons";
import { type Strings } from "./i18n";

const TOAST_STACK_ID = "dd-toast-stack";
const HOST_ATTR = "data-dom-deleter-ui";

type ToastVariant = "deleted" | "restored";

type ToastFillTargets = {
  toast: HTMLDivElement;
  leading: HTMLDivElement;
  actions: HTMLDivElement;
};

export type ToastHost = {
  shadow: ShadowRoot;
  getNotificationSeconds: () => number;
  getStrings: () => Strings;
  isRtl: () => boolean;
  openPanel: (tab: "settings" | "info") => void;
  undoById: (id: number) => Promise<boolean>;
};

export class ToastSystem {
  constructor(private readonly host: ToastHost) {}

  showDeletedToast(elementLabel: string, undoId: number): void {
    const s = this.host.getStrings();
    this.appendToast("deleted", ({ toast, leading, actions }) => {
      leading.append(this.createToastStatusLabel(s.toastDeleted, elementLabel));

      const btnRestore = document.createElement("button");
      btnRestore.type = "button";
      btnRestore.className = "dd-icon-btn";
      btnRestore.title = s.btnRestore;
      btnRestore.setAttribute("aria-label", s.btnRestore);
      btnRestore.innerHTML = UNDO_2;
      btnRestore.addEventListener("click", (e) => {
        e.stopPropagation();
        this.removeToast(toast);
        void this.host.undoById(undoId);
      });

      const btnSettings = this.panelTriggerButton(
        "settings",
        COG,
        s.titleSettings,
      );
      const btnInfo = this.panelTriggerButton("info", INFO, s.titleAbout);

      actions.append(btnRestore, btnSettings, btnInfo);
    });
  }

  showRestoredToast(elementLabel: string): void {
    const s = this.host.getStrings();
    this.appendToast("restored", ({ leading, actions }) => {
      leading.append(this.createToastStatusLabel(s.toastRestored, elementLabel));

      const btnSettings = this.panelTriggerButton(
        "settings",
        COG,
        s.titleSettings,
      );
      const btnInfo = this.panelTriggerButton("info", INFO, s.titleAbout);

      actions.append(btnSettings, btnInfo);
    });
  }

  hide(): void {
    this.host.shadow.querySelectorAll(".dd-toast").forEach((n) => n.remove());
    this.host.shadow.getElementById(TOAST_STACK_ID)?.remove();
  }

  private createToastStatusLabel(
    status: string,
    elementLabel: string,
  ): HTMLSpanElement {
    const label = document.createElement("span");
    label.className = "dd-toast-label";

    const statusEl = document.createElement("span");
    statusEl.className = "dd-toast-status";
    statusEl.textContent = `${status}:`;

    const targetEl = document.createElement("span");
    targetEl.className = "dd-toast-target";
    targetEl.textContent = elementLabel;
    if (elementLabel) {
      targetEl.title = elementLabel;
    }

    label.append(statusEl, targetEl);
    return label;
  }

  private panelTriggerButton(
    tab: "settings" | "info",
    icon: string,
    title: string,
  ): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dd-icon-btn";
    btn.title = title;
    btn.innerHTML = icon;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.host.openPanel(tab);
    });
    return btn;
  }

  private ensureToastStack(): HTMLElement {
    let stack = this.host.shadow.getElementById(TOAST_STACK_ID);
    if (!stack) {
      stack = document.createElement("div");
      stack.id = TOAST_STACK_ID;
      stack.className = "dd-toast-stack";
      stack.setAttribute(HOST_ATTR, "true");
      stack.style.pointerEvents = "none";
    }
    this.host.shadow.appendChild(stack);
    return stack;
  }

  private appendToast(
    variant: ToastVariant,
    fill: (targets: ToastFillTargets) => void,
  ): void {
    if (this.host.getNotificationSeconds() <= 0) {
      return;
    }

    const stack = this.ensureToastStack();
    stack.dir = this.host.isRtl() ? "rtl" : "ltr";
    const toast = document.createElement("div");
    toast.className =
      variant === "restored" ? "dd-toast is-restored" : "dd-toast";
    toast.setAttribute(HOST_ATTR, "true");
    toast.style.pointerEvents = "auto";
    toast.dir = "ltr";

    const leading = document.createElement("div");
    leading.className = "dd-toast-leading";

    const mark = document.createElement("span");
    mark.className = "dd-toast-mark";
    mark.innerHTML = extensionMarkSvg({ variant: "toast" });
    leading.appendChild(mark);

    const actions = document.createElement("div");
    actions.className = "dd-toast-actions";

    toast.append(leading, actions);
    fill({ toast, leading, actions });
    stack.appendChild(toast);

    const dismissSeconds = this.host.getNotificationSeconds();
    if (dismissSeconds > 0) {
      const timer = setTimeout(() => {
        this.removeToast(toast);
      }, dismissSeconds * 1000);
      toast.dataset.timerId = String(timer);
    }
  }

  private removeToast(toast: HTMLElement): void {
    const id = toast.dataset.timerId;
    if (id) clearTimeout(Number(id));
    toast.remove();
    const stack = this.host.shadow.getElementById(TOAST_STACK_ID);
    if (!stack) return;
    if (stack.childElementCount === 0) {
      stack.remove();
    }
  }
}
