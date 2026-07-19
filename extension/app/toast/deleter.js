import { COG, INFO } from "../../lib/vendor/icons/index.js";
import { ToastStack } from "../../lib/our/toast/stack.js";
import { extensionMarkSvg, UNDO_2 } from "../icons.js";
import { TOAST_STACK_CONFIG, TOAST_UI } from "../ui-config.js";

var ToastSystem = class {
  constructor(host) {
    this.host = host;
    this.stack = new ToastStack(host, TOAST_STACK_CONFIG);
  }
  stack;
  showDeletedToast(elementLabel, undoId) {
    const s = this.host.getStrings();
    const markInnerHtml = extensionMarkSvg({ variant: "toast" });
    this.stack.append({
      className: TOAST_UI.toastDeleted,
      markInnerHtml,
      fill: ({ toast, leading, actions }) => {
        leading.append(
          this.stack.createStatusLabel(s.toastDeleted, elementLabel),
        );
        const btnRestore = document.createElement("button");
        btnRestore.type = "button";
        btnRestore.className = TOAST_UI.iconBtn;
        btnRestore.title = s.btnRestore;
        btnRestore.setAttribute("aria-label", s.btnRestore);
        btnRestore.innerHTML = UNDO_2;
        btnRestore.addEventListener("click", (e) => {
          e.stopPropagation();
          this.stack.remove(toast);
          void this.host.undoById(undoId);
        });
        const btnSettings = this.panelTriggerButton(
          "settings",
          COG,
          s.titleSettings,
        );
        const btnInfo = this.panelTriggerButton("info", INFO, s.titleAbout);
        actions.append(btnRestore, btnSettings, btnInfo);
      },
    });
  }
  showRestoredToast(elementLabel) {
    const s = this.host.getStrings();
    const markInnerHtml = extensionMarkSvg({ variant: "toast" });
    this.stack.append({
      className: TOAST_UI.toastRestored,
      markInnerHtml,
      fill: ({ leading, actions }) => {
        leading.append(
          this.stack.createStatusLabel(s.toastRestored, elementLabel),
        );
        const btnSettings = this.panelTriggerButton(
          "settings",
          COG,
          s.titleSettings,
        );
        const btnInfo = this.panelTriggerButton("info", INFO, s.titleAbout);
        actions.append(btnSettings, btnInfo);
      },
    });
  }
  hide() {
    this.stack.hide();
  }
  panelTriggerButton(tab, icon, title) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = TOAST_UI.iconBtn;
    btn.title = title;
    btn.innerHTML = icon;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.host.openPanel(tab);
    });
    return btn;
  }
};

export { ToastSystem };
