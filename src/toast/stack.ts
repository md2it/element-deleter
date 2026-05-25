import { HOST_ATTR, TOAST_STACK_ID } from "./constants";
import type {
  ToastAppendOptions,
  ToastFillTargets,
  ToastStackHost,
} from "./types";

export class ToastStack {
  constructor(private readonly host: ToastStackHost) {}

  hide(): void {
    this.host.shadow.querySelectorAll(".dd-toast").forEach((n) => n.remove());
    this.host.shadow.getElementById(TOAST_STACK_ID)?.remove();
  }

  createStatusLabel(status: string, elementLabel: string): HTMLSpanElement {
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

  append(options: ToastAppendOptions): HTMLDivElement | null {
    const dismissSeconds = this.host.getNotificationSeconds();
    if (dismissSeconds <= 0) {
      return null;
    }

    const { variant, markInnerHtml, fill } = options;
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
    mark.innerHTML = markInnerHtml;
    leading.appendChild(mark);

    const actions = document.createElement("div");
    actions.className = "dd-toast-actions";

    toast.append(leading, actions);
    fill({ toast, leading, actions });
    stack.appendChild(toast);

    const timer = setTimeout(() => {
      this.remove(toast);
    }, dismissSeconds * 1000);
    toast.dataset.timerId = String(timer);

    return toast;
  }

  remove(toast: HTMLElement): void {
    const id = toast.dataset.timerId;
    if (id) clearTimeout(Number(id));
    toast.remove();
    const stack = this.host.shadow.getElementById(TOAST_STACK_ID);
    if (!stack) return;
    if (stack.childElementCount === 0) {
      stack.remove();
    }
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
}
