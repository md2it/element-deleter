import { aboutItemDomClasses, buildAboutListItems } from "../about";
import { PANEL_TITLE } from "../brand";
import {
  CHEVRON_LEFT,
  CHEVRON_RIGHT,
  CHEVRONS_LEFT,
  CHEVRONS_RIGHT,
  toolbarWelcomeIconSvg,
} from "../icons";
import { createPanelFooter } from "../../../SHARED/src/panel-footer";
import { PANEL_FOOTER_CONFIG } from "../ui-config";
import { createPanelDivider, createPanelHeader } from "./header";
import {
  isRtlLocale,
  LOCALE_BUTTON_LABELS,
  LOCALES,
  t,
  type Locale,
  type Strings,
} from "../i18n";
import {
  ESC_HOTKEY_LABEL,
  getStartHotkeyActionLabel,
  getStartHotkeyAriaLabel,
  getStartHotkeyChordLabel,
  getUndoHotkeyLabel,
} from "../hotkeys";
import {
  setAllElementsFillEnabled,
  setAllElementsOutlineEnabled,
  setElementLabelEnabled,
  setEscHotkeyEnabled,
  setLocale,
  setNotificationSeconds,
  setStartHotkeyEnabled,
  setUndoHotkeyEnabled,
} from "../storage";
import type { ToastSystem } from "../toast";

import { PANEL_POPUP_HOST_ATTR } from "./constants";
const PANEL_BODY_MIN_VAR = "--dd-panel-body-min";
const PANEL_PROBE_WIDTH = "20rem";

let panelBodyMinPx: number | null = null;

export type PanelWindowHost = {
  shadow: ShadowRoot;
  surface?: "popup";
  onClose?: () => void;
  getLocale: () => Locale;
  setLocale: (locale: Locale) => void;
  getNotificationSeconds: () => number;
  setNotificationSeconds: (seconds: number) => void;
  getStartHotkeyEnabled: () => boolean;
  setStartHotkeyEnabled: (enabled: boolean) => void;
  getEscHotkeyEnabled: () => boolean;
  setEscHotkeyEnabled: (enabled: boolean) => void;
  getUndoHotkeyEnabled: () => boolean;
  setUndoHotkeyEnabled: (enabled: boolean) => void;
  getElementLabelEnabled: () => boolean;
  setElementLabelEnabled: (enabled: boolean) => void;
  getAllElementsOutlineEnabled: () => boolean;
  setAllElementsOutlineEnabled: (enabled: boolean) => void;
  getAllElementsFillEnabled: () => boolean;
  setAllElementsFillEnabled: (enabled: boolean) => void;
  getStrings: () => Strings;
  isRtl: () => boolean;
  toast: ToastSystem;
};

export class PanelWindowSystem {
  private boundPanelEscapeKey: ((e: KeyboardEvent) => void) | null = null;

  constructor(private readonly host: PanelWindowHost) {}

  openPanel(tab: "settings" | "info"): void {
    this.close();
    this.host.toast.hide();

    const panelRoot = document.createElement("div");
    panelRoot.className = "dd-panel";
    if (this.host.surface === "popup") {
      panelRoot.classList.add("dd-panel--surface-popup");
    }
    panelRoot.lang = this.host.getLocale();
    panelRoot.dir = this.host.isRtl() ? "rtl" : "ltr";

    const s = this.host.getStrings();

    const header = createPanelHeader({
      title: PANEL_TITLE,
      subtitle: s.panelSubtitle,
      logoSvg: toolbarWelcomeIconSvg(),
    });
    const subtitle = header.querySelector<HTMLElement>(".dd-panel-subtitle")!;

    const tabsBar = document.createElement("div");
    tabsBar.className = "dd-panel-tabs";

    const tabGroup = document.createElement("div");
    tabGroup.className = "dd-tab-group";

    const tabSettings = document.createElement("button");
    tabSettings.type = "button";
    tabSettings.className = "dd-chip dd-tab";
    tabSettings.textContent = s.tabSettings;

    const tabInfo = document.createElement("button");
    tabInfo.type = "button";
    tabInfo.className = "dd-chip dd-tab";
    tabInfo.textContent = s.tabAbout;

    const body = document.createElement("div");
    body.className = "dd-panel-body";

    const settingsPanel = document.createElement("div");
    settingsPanel.className = "dd-tab-panel is-settings";

    const infoPanel = document.createElement("div");
    infoPanel.className = "dd-tab-panel is-about";

    body.append(settingsPanel, infoPanel);

    const footer = createPanelFooter(PANEL_FOOTER_CONFIG);

    let activeTab: "settings" | "info" = tab;

    const setActiveTab = (active: "settings" | "info"): void => {
      activeTab = active;
      const copy = this.host.getStrings();
      tabSettings.textContent = copy.tabSettings;
      tabInfo.textContent = copy.tabAbout;
      tabSettings.classList.toggle("is-active", active === "settings");
      tabInfo.classList.toggle("is-active", active === "info");
      settingsPanel.classList.toggle("is-active", active === "settings");
      infoPanel.classList.toggle("is-active", active === "info");
      settingsPanel.setAttribute(
        "aria-hidden",
        active === "settings" ? "false" : "true",
      );
      infoPanel.setAttribute("aria-hidden", active === "info" ? "false" : "true");
    };

    const refreshPanels = (): void => {
      panelRoot.lang = this.host.getLocale();
      subtitle.textContent = this.host.getStrings().panelSubtitle;
      this.populateSettingsPanel(settingsPanel, panelRoot, refreshPanels);
      this.populateInfoPanel(infoPanel);
      setActiveTab(activeTab);
    };

    tabSettings.addEventListener("click", () => setActiveTab("settings"));
    tabInfo.addEventListener("click", () => setActiveTab("info"));

    tabGroup.append(tabSettings, tabInfo);
    tabsBar.append(tabGroup);
    panelRoot.append(
      header,
      tabsBar,
      createPanelDivider(),
      body,
      createPanelDivider(),
      footer,
    );
    panelRoot.setAttribute(PANEL_POPUP_HOST_ATTR, "true");
    this.host.shadow.appendChild(panelRoot);
    this.applyPanelBodyMinHeight(body);
    this.attachPanelEscapeKeyHandler();
    refreshPanels();
  }

  close(): void {
    const panelRoots = Array.from(
      this.host.shadow.querySelectorAll<HTMLElement>(".dd-panel"),
    );
    if (!panelRoots.length) {
      this.detachPanelEscapeKeyHandler();
      return;
    }

    this.detachPanelEscapeKeyHandler();
    panelRoots.forEach((n) => n.remove());
    this.host.onClose?.();
  }

  private attachPanelEscapeKeyHandler(): void {
    if (this.boundPanelEscapeKey) return;
    this.boundPanelEscapeKey = (e) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      this.close();
    };
    document.addEventListener("keydown", this.boundPanelEscapeKey, true);
  }

  private detachPanelEscapeKeyHandler(): void {
    if (!this.boundPanelEscapeKey) return;
    document.removeEventListener("keydown", this.boundPanelEscapeKey, true);
    this.boundPanelEscapeKey = null;
  }

  private populateSettingsPanel(
    panel: HTMLElement,
    panelRoot: HTMLElement,
    refreshPanels: () => void,
  ): void {
    if (panel.querySelector(".dd-lang-row")) {
      this.syncSettingsPanelCopy(panel);
      return;
    }
    panel.replaceChildren();
    const copy = this.host.getStrings();

    const langField = document.createElement("div");
    langField.className = "dd-field";
    const langRow = document.createElement("div");
    langRow.className = "dd-lang-row";
    langRow.dir = "ltr";
    langRow.setAttribute("role", "group");
    langRow.setAttribute("aria-label", copy.tabSettings);

    for (const code of LOCALES) {
      const langBtn = document.createElement("button");
      langBtn.type = "button";
      langBtn.className = "dd-chip dd-lang-btn";
      langBtn.textContent = LOCALE_BUTTON_LABELS[code];
      langBtn.classList.toggle("is-active", code === this.host.getLocale());
      langBtn.addEventListener("click", () => {
        void (async () => {
          this.host.setLocale(code);
          await setLocale(code);
          panelRoot.lang = code;
          panelRoot.dir = isRtlLocale(code) ? "rtl" : "ltr";
          refreshPanels();
        })();
      });
      langRow.appendChild(langBtn);
    }
    langField.appendChild(langRow);

    const startHotkeyRow = this.createPrefixStartHotkeyToggleRow(
      copy.startHotkeyToggleLabel,
      this.host.getStartHotkeyEnabled(),
      (next) => {
        void (async () => {
          this.host.setStartHotkeyEnabled(next);
          await setStartHotkeyEnabled(next);
        })();
      },
    );

    const escHotkeyRow = this.createHotkeyToggleRow(
      copy.escHotkeyToggleLabel,
      ESC_HOTKEY_LABEL,
      this.host.getEscHotkeyEnabled(),
      (next) => {
        void (async () => {
          this.host.setEscHotkeyEnabled(next);
          await setEscHotkeyEnabled(next);
        })();
      },
    );

    const undoHotkeyRow = this.createHotkeyToggleRow(
      copy.undoHotkeyToggleLabel,
      getUndoHotkeyLabel(),
      this.host.getUndoHotkeyEnabled(),
      (next) => {
        void (async () => {
          this.host.setUndoHotkeyEnabled(next);
          await setUndoHotkeyEnabled(next);
        })();
      },
    );

    const elementLabelRow = this.createElementLabelToggleRow(
      this.host.getElementLabelEnabled(),
      (next) => {
        void (async () => {
          this.host.setElementLabelEnabled(next);
          await setElementLabelEnabled(next);
        })();
      },
    );

    const allElementsOutlineRow = this.createToggleRow(
      copy.allElementsOutlineToggleLabel,
      this.host.getAllElementsOutlineEnabled(),
      (next) => {
        void (async () => {
          this.host.setAllElementsOutlineEnabled(next);
          await setAllElementsOutlineEnabled(next);
        })();
      },
    );

    const allElementsFillRow = this.createToggleRow(
      copy.allElementsFillToggleLabel,
      this.host.getAllElementsFillEnabled(),
      (next) => {
        void (async () => {
          this.host.setAllElementsFillEnabled(next);
          await setAllElementsFillEnabled(next);
        })();
      },
    );

    const notificationRow = document.createElement("div");
    notificationRow.className = "dd-toggle-row dd-toggle-row--notification";

    const tooltipId = "dd-notification-tooltip";
    const tooltip = document.createElement("span");
    tooltip.id = tooltipId;
    tooltip.className = "dd-tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.textContent = copy.notificationPeriodHint;
    notificationRow.setAttribute("aria-describedby", tooltipId);

    const inputId = "dd-notification-seconds";

    const row = document.createElement("div");
    row.className = "dd-number";

    const toMin = document.createElement("button");
    toMin.type = "button";
    toMin.className = "dd-chevron";
    toMin.setAttribute("aria-label", "Minimum (0)");
    toMin.innerHTML = CHEVRONS_LEFT;

    const dec = document.createElement("button");
    dec.type = "button";
    dec.className = "dd-chevron";
    dec.setAttribute("aria-label", "Decrease");
    dec.innerHTML = CHEVRON_LEFT;

    const valueWrap = document.createElement("div");
    valueWrap.className = "dd-number-value";

    const valueLabel = document.createElement("label");
    valueLabel.className = "dd-number-label";
    valueLabel.htmlFor = inputId;

    const prefix = document.createElement("span");
    prefix.className = "dd-number-prefix";
    prefix.textContent = copy.notificationPeriodPrefix;

    const input = document.createElement("input");
    input.id = inputId;
    input.type = "number";
    input.min = "0";
    input.max = "10";
    input.step = "1";
    input.inputMode = "numeric";
    input.value = String(this.host.getNotificationSeconds());
    input.setAttribute(
      "aria-label",
      `${copy.notificationPeriodPrefix}${copy.notificationPeriodSuffix}`.trim(),
    );

    const suffix = document.createElement("span");
    suffix.className = "dd-number-suffix";
    suffix.textContent = copy.notificationPeriodSuffix;
    if (!copy.notificationPeriodSuffix) {
      suffix.setAttribute("aria-hidden", "true");
    }

    const inc = document.createElement("button");
    inc.type = "button";
    inc.className = "dd-chevron";
    inc.setAttribute("aria-label", "Increase");
    inc.innerHTML = CHEVRON_RIGHT;

    const toMax = document.createElement("button");
    toMax.type = "button";
    toMax.className = "dd-chevron";
    toMax.setAttribute("aria-label", "Maximum (10)");
    toMax.innerHTML = CHEVRONS_RIGHT;

    const apply = async (v: number) => {
      const parsed = Number.isFinite(v)
        ? Math.round(v)
        : this.host.getNotificationSeconds();
      const clamped = Math.min(10, Math.max(0, parsed));
      input.value = String(clamped);
      this.host.setNotificationSeconds(clamped);
      await setNotificationSeconds(clamped);
    };

    toMin.addEventListener("click", () => {
      void apply(0);
    });
    dec.addEventListener("click", () => {
      void apply(Number(input.value) - 1);
    });
    inc.addEventListener("click", () => {
      void apply(Number(input.value) + 1);
    });
    toMax.addEventListener("click", () => {
      void apply(10);
    });
    input.addEventListener("input", () => {
      const raw = input.value.trim();
      if (raw === "" || raw === "-") return;
      const n = Number(raw);
      if (!Number.isFinite(n)) return;
      if (n > 10) input.value = "10";
      else if (n < 0) input.value = "0";
    });
    input.addEventListener("change", () => {
      void apply(Number(input.value));
    });
    input.addEventListener("blur", () => {
      void apply(Number(input.value));
    });

    valueLabel.append(prefix, input, suffix);
    valueWrap.append(valueLabel);
    row.append(toMin, dec, valueWrap, inc, toMax);

    notificationRow.append(row, tooltip);
    panel.append(
      langField,
      notificationRow,
      startHotkeyRow,
      escHotkeyRow,
      undoHotkeyRow,
      elementLabelRow,
      allElementsOutlineRow,
      allElementsFillRow,
    );
  }

  private syncSettingsPanelCopy(panel: HTMLElement): void {
    const copy = this.host.getStrings();
    panel.querySelector(".dd-lang-row")?.setAttribute("aria-label", copy.tabSettings);
    for (const btn of Array.from(
      panel.querySelectorAll<HTMLButtonElement>(".dd-lang-btn"),
    )) {
      const code = LOCALES.find((locale) => LOCALE_BUTTON_LABELS[locale] === btn.textContent);
      if (code) btn.classList.toggle("is-active", code === this.host.getLocale());
    }
    panel.querySelector(".dd-tooltip")!.textContent = copy.notificationPeriodHint;
    panel.querySelector(".dd-number-prefix")!.textContent = copy.notificationPeriodPrefix;
    const suffix = panel.querySelector<HTMLElement>(".dd-number-suffix")!;
    suffix.textContent = copy.notificationPeriodSuffix;
    suffix.toggleAttribute("aria-hidden", !copy.notificationPeriodSuffix);
    panel
      .querySelector<HTMLInputElement>("#dd-notification-seconds")
      ?.setAttribute(
        "aria-label",
        `${copy.notificationPeriodPrefix}${copy.notificationPeriodSuffix}`.trim(),
      );
    const toggles = panel.querySelectorAll<HTMLElement>(
      ".dd-toggle-row:not(.dd-toggle-row--notification)",
    );
    this.syncPrefixStartHotkeyToggleRow(toggles[0], copy.startHotkeyToggleLabel);
    this.syncHotkeyToggleRow(toggles[1], copy.escHotkeyToggleLabel, ESC_HOTKEY_LABEL);
    this.syncHotkeyToggleRow(toggles[2], copy.undoHotkeyToggleLabel, getUndoHotkeyLabel());
    const labelRows = panel.querySelectorAll<HTMLElement>(".dd-toggle-label");
    if (labelRows[4]) labelRows[4].textContent = copy.allElementsOutlineToggleLabel;
    if (labelRows[5]) labelRows[5].textContent = copy.allElementsFillToggleLabel;
    toggles[4]
      ?.querySelector<HTMLButtonElement>(".dd-toggle")
      ?.setAttribute("aria-label", copy.allElementsOutlineToggleLabel);
    toggles[5]
      ?.querySelector<HTMLButtonElement>(".dd-toggle")
      ?.setAttribute("aria-label", copy.allElementsFillToggleLabel);
  }

  private syncPrefixStartHotkeyToggleRow(
    row: Element | undefined,
    labelText: string,
  ): void {
    if (!row) return;
    const label = row.querySelector(".dd-toggle-label");
    const toggle = row.querySelector<HTMLButtonElement>(".dd-toggle");
    if (!label) return;
    label.replaceChildren(document.createTextNode(labelText));
    this.appendPrefixStartHotkeyMarkup(label);
    toggle?.setAttribute("aria-label", `${labelText} ${getStartHotkeyAriaLabel()}`);
  }

  private syncHotkeyToggleRow(
    row: Element | undefined,
    labelText: string,
    hotkeyLabel: string,
  ): void {
    if (!row) return;
    const label = row.querySelector(".dd-toggle-label");
    const toggle = row.querySelector<HTMLButtonElement>(".dd-toggle");
    if (!label) return;
    label.replaceChildren(document.createTextNode(labelText));
    label.append(document.createTextNode(" "));
    const kbd = document.createElement("kbd");
    kbd.textContent = hotkeyLabel;
    label.append(kbd);
    toggle?.setAttribute("aria-label", `${labelText} ${hotkeyLabel}`);
  }

  private applyPanelBodyMinHeight(body: HTMLElement): void {
    if (panelBodyMinPx == null) {
      panelBodyMinPx = this.measureGermanAboutBodyHeight();
    }
    body.style.setProperty(PANEL_BODY_MIN_VAR, `${panelBodyMinPx}px`);
  }

  private measureGermanAboutBodyHeight(): number {
    const probeBody = document.createElement("div");
    probeBody.className = "dd-panel-body";
    probeBody.style.cssText = `position:fixed;left:-9999px;width:${PANEL_PROBE_WIDTH};visibility:hidden;pointer-events:none;`;
    const probePanel = document.createElement("div");
    probePanel.className = "dd-tab-panel is-about is-active";
    probeBody.appendChild(probePanel);
    this.host.shadow.appendChild(probeBody);
    this.populateInfoPanel(probePanel, t("de"));
    const height = probeBody.getBoundingClientRect().height;
    probeBody.remove();
    return height;
  }

  private populateInfoPanel(panel: HTMLElement, copy = this.host.getStrings()): void {
    const items = buildAboutListItems(copy);

    let list = panel.querySelector<HTMLUListElement>(".dd-about-list");
    if (list) {
      list.setAttribute("aria-label", copy.tabAbout);
      const existing = list.querySelectorAll<HTMLLIElement>(".dd-about-item");
      items.forEach((item, index) => {
        const el = existing[index];
        const text = el?.querySelector(".dd-about-text");
        if (text) text.textContent = item.text;
        const mark = el?.querySelector<HTMLElement>(".dd-about-bool, .dd-about-toolbar-icon");
        if (mark) mark.innerHTML = item.iconHtml;
      });
      return;
    }

    panel.replaceChildren();
    list = document.createElement("ul");
    list.className = "dd-about-list";
    list.setAttribute("aria-label", copy.tabAbout);

    for (const item of items) {
      const { itemCls, iconCls } = aboutItemDomClasses(item.iconKind);
      list.appendChild(this.createAboutItem(item.iconHtml, itemCls, iconCls, item.text));
    }
    panel.append(list);
  }

  private createAboutItem(iconHtml: string, itemCls: string, iconCls: string, text: string): HTMLLIElement {
    const li = document.createElement("li");
    li.className = `dd-about-item ${itemCls}`;

    const mark = document.createElement("span");
    mark.className = iconCls;
    mark.setAttribute("aria-hidden", "true");
    mark.innerHTML = iconHtml;

    const label = document.createElement("span");
    label.className = "dd-about-text";
    label.textContent = text;

    li.append(mark, label);
    return li;
  }

  private static readonly ELEMENT_LABEL_TOGGLE_ARIA = "tag#id / tag.class";

  private createElementLabelToggleRow(
    enabled: boolean,
    onChange: (next: boolean) => void,
  ): HTMLElement {
    const row = this.createToggleRow(
      PanelWindowSystem.ELEMENT_LABEL_TOGGLE_ARIA,
      enabled,
      onChange,
    );
    const label = row.querySelector(".dd-toggle-label");
    if (label) {
      label.replaceChildren();
      const tagId = document.createElement("kbd");
      tagId.textContent = "tag#id";
      const tagClass = document.createElement("kbd");
      tagClass.textContent = "tag.class";
      label.append(tagId, document.createTextNode(" / "), tagClass);
    }
    const toggle = row.querySelector(".dd-toggle");
    if (toggle instanceof HTMLButtonElement) {
      toggle.setAttribute("aria-label", PanelWindowSystem.ELEMENT_LABEL_TOGGLE_ARIA);
    }
    return row;
  }

  private appendPrefixStartHotkeyMarkup(label: Element): void {
    label.append(document.createTextNode(" "));
    const chord = document.createElement("kbd");
    chord.textContent = getStartHotkeyChordLabel();
    const action = document.createElement("kbd");
    action.textContent = getStartHotkeyActionLabel();
    label.append(chord, document.createTextNode(" → "), action);
  }

  private createPrefixStartHotkeyToggleRow(
    labelText: string,
    enabled: boolean,
    onChange: (next: boolean) => void,
  ): HTMLElement {
    const row = this.createToggleRow(labelText, enabled, onChange);
    const label = row.querySelector(".dd-toggle-label");
    if (label) {
      this.appendPrefixStartHotkeyMarkup(label);
    }
    const toggle = row.querySelector(".dd-toggle");
    if (toggle instanceof HTMLButtonElement) {
      toggle.setAttribute("aria-label", `${labelText} ${getStartHotkeyAriaLabel()}`);
    }
    return row;
  }

  private createHotkeyToggleRow(
    labelText: string,
    hotkeyLabel: string,
    enabled: boolean,
    onChange: (next: boolean) => void,
  ): HTMLElement {
    const row = this.createToggleRow(labelText, enabled, onChange);
    const label = row.querySelector(".dd-toggle-label");
    if (label) {
      label.append(document.createTextNode(" "));
      const kbd = document.createElement("kbd");
      kbd.textContent = hotkeyLabel;
      label.append(kbd);
    }
    const toggle = row.querySelector(".dd-toggle");
    if (toggle instanceof HTMLButtonElement) {
      toggle.setAttribute("aria-label", `${labelText} ${hotkeyLabel}`);
    }
    return row;
  }

  private createToggleRow(
    labelText: string,
    enabled: boolean,
    onChange: (next: boolean) => void,
  ): HTMLElement {
    const row = document.createElement("div");
    row.className = "dd-toggle-row";

    const label = document.createElement("span");
    label.className = "dd-toggle-label";
    label.textContent = labelText;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "dd-toggle";
    toggle.setAttribute("role", "switch");
    toggle.setAttribute("aria-checked", enabled ? "true" : "false");
    toggle.setAttribute("aria-label", labelText);

    const sync = (on: boolean): void => {
      toggle.classList.toggle("is-on", on);
      toggle.setAttribute("aria-checked", on ? "true" : "false");
    };

    sync(enabled);
    toggle.addEventListener("click", () => {
      const next = !toggle.classList.contains("is-on");
      sync(next);
      onChange(next);
    });

    row.append(toggle, label);
    return row;
  }
}
