import { extensionMarkSvg, COG, INFO, UNDO_2 } from "../icons";
import { type Strings } from "../i18n";
import { TOAST_STACK_CONFIG, TOAST_UI } from "../ui-config";
import { ToastStack, type ToastStackHost } from "../../../SHARED/src/toast";

export type ToastHost = ToastStackHost & {
  getStrings: () => Strings;
  openPanel: (tab: "settings" | "info") => void;
  undoById: (id: number) => Promise<boolean>;
};

/** DOM-deleter delete/restore toasts (strings, undo, panel shortcuts). */
export class ToastSystem {
  private readonly stack: ToastStack;

  constructor(private readonly host: ToastHost) {
    this.stack = new ToastStack(host, TOAST_STACK_CONFIG);
  }

  showDeletedToast(elementLabel: string, undoId: number): void {
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

  showRestoredToast(elementLabel: string): void {
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

  hide(): void {
    this.stack.hide();
  }

  private panelTriggerButton(
    tab: "settings" | "info",
    icon: string,
    title: string,
  ): HTMLButtonElement {
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
}
