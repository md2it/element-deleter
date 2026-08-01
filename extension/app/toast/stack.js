var ToastStack = class {
  constructor(host, config) {
    this.host = host;
    this.config = config;
  }
  hide() {
    const { toast } = this.config.classes;
    this.host.shadow.querySelectorAll(`.${toast}`).forEach((n) => n.remove());
    this.host.shadow.getElementById(this.config.stackId)?.remove();
  }
  createStatusLabel(status, elementLabel) {
    const { toastLabel, toastStatus, toastTarget } = this.config.classes;
    const label = document.createElement("span");
    label.className = toastLabel;
    const statusEl = document.createElement("span");
    statusEl.className = toastStatus;
    statusEl.textContent = `${status}:`;
    const targetEl = document.createElement("span");
    targetEl.className = toastTarget;
    targetEl.textContent = elementLabel;
    if (elementLabel) {
      targetEl.title = elementLabel;
    }
    label.append(statusEl, targetEl);
    return label;
  }
  append(options) {
    const dismissSeconds = this.host.getNotificationSeconds();
    if (dismissSeconds <= 0) {
      return null;
    }
    const { className, markInnerHtml, fill } = options;
    const stack = this.ensureToastStack();
    stack.dir = this.host.isRtl() ? "rtl" : "ltr";
    const { toastLeading, toastMark, toastActions } = this.config.classes;
    const toast = document.createElement("div");
    toast.className = className;
    toast.setAttribute(this.config.hostAttr, "true");
    toast.style.pointerEvents = "auto";
    toast.dir = "ltr";
    const leading = document.createElement("div");
    leading.className = toastLeading;
    const mark = document.createElement("span");
    mark.className = toastMark;
    mark.innerHTML = markInnerHtml;
    leading.appendChild(mark);
    const actions = document.createElement("div");
    actions.className = toastActions;
    toast.append(leading, actions);
    fill({ toast, leading, actions });
    stack.appendChild(toast);
    const timer = setTimeout(() => {
      this.remove(toast);
    }, dismissSeconds * 1e3);
    toast.dataset.timerId = String(timer);
    return toast;
  }
  remove(toast) {
    const id = toast.dataset.timerId;
    if (id) clearTimeout(Number(id));
    toast.remove();
    const stack = this.host.shadow.getElementById(this.config.stackId);
    if (!stack) return;
    if (stack.childElementCount === 0) {
      stack.remove();
    }
  }
  ensureToastStack() {
    const { toastStack } = this.config.classes;
    let stack = this.host.shadow.getElementById(this.config.stackId);
    if (!stack) {
      stack = document.createElement("div");
      stack.id = this.config.stackId;
      stack.className = toastStack;
      stack.setAttribute(this.config.hostAttr, "true");
      stack.style.pointerEvents = "none";
    }
    this.host.shadow.appendChild(stack);
    return stack;
  }
};

export { ToastStack };
