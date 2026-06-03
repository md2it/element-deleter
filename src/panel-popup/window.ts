import { buildAboutListItems } from "../about";
import { PANEL_TITLE } from "../brand";
import { toolbarWelcomeIconSvg } from "../icons";
import { createPanelFooter } from "@lib/panel-footer";
import { localeToHtmlLang } from "../../../lib/our/i18n/locale-code";
import { PANEL_FOOTER_CONFIG } from "../ui-config";
import type { ToastSystem } from "../toast";
import type { Locale } from "../i18n";
import { createPanelSurface } from "./build-panel-surface";
import {
  buildAboutPanelBody,
  buildShortcutsPanelBody,
} from "./panel-body";
import type { PanelMenuHandle } from "./panel-menu";
import { createPanelDivider, createPanelHeader } from "./header";
import {
  measureGermanSettingsBodyHeight,
  populateSettingsPanel,
  type PanelSettingsHost,
} from "./panel-settings";
import { PANEL_POPUP_HOST_ATTR, type PanelPopupTab } from "./constants";

const PANEL_BODY_MIN_VAR = "--dd-panel-body-min";
const PANEL_PROBE_WIDTH = "20rem";

let panelBodyMinPx: number | null = null;

export type PanelWindowHost = PanelSettingsHost & {
  shadow: ShadowRoot;
  surface?: "popup";
  onClose?: () => void;
  isRtl: () => boolean;
  toast: ToastSystem;
};

export class PanelWindowSystem {
  private boundPanelEscapeKey: ((e: KeyboardEvent) => void) | null = null;
  private panelRoot: HTMLDivElement | null = null;
  private body: HTMLDivElement | null = null;
  private menu: PanelMenuHandle | null = null;
  private activeTab: PanelPopupTab = "settings";

  private settingsPanel: HTMLElement | null = null;
  private infoPanel: HTMLElement | null = null;

  constructor(private readonly host: PanelWindowHost) {}

  openPanel(tab: PanelPopupTab): void {
    this.close();
    this.host.toast.hide();
    this.activeTab = tab;

    if (this.host.surface === "popup") {
      this.openPopupPanel(tab);
      return;
    }

    this.openOverlayPanel(tab);
  }

  private openPopupPanel(tab: PanelPopupTab): void {
    const locale = this.host.getLocale();
    const { panelRoot, body, menu } = createPanelSurface(locale, "popup");

    this.panelRoot = panelRoot;
    this.body = body;
    this.menu = menu;

    if (menu) {
      menu.onSelect = (nextTab) => this.showTab(nextTab);
    }

    this.host.shadow.appendChild(panelRoot);
    this.applyPanelBodyMinHeight(body);
    this.attachPanelEscapeKeyHandler();
    this.showTab(tab);
  }

  private openOverlayPanel(tab: PanelPopupTab): void {
    const panelRoot = document.createElement("div");
    panelRoot.className = "dd-panel";
    panelRoot.lang = localeToHtmlLang(this.host.getLocale());
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

    const setActiveTab = (active: PanelPopupTab): void => {
      if (active === "shortcuts") return;
      this.activeTab = active;
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
      panelRoot.lang = localeToHtmlLang(this.host.getLocale());
      subtitle.textContent = this.host.getStrings().panelSubtitle;
      populateSettingsPanel(this.host, settingsPanel, panelRoot, refreshPanels, false);
      this.populateOverlayInfoPanel(infoPanel);
      setActiveTab(this.activeTab === "shortcuts" ? "settings" : this.activeTab);
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

    this.panelRoot = panelRoot;
    this.body = body;
    this.settingsPanel = settingsPanel;
    this.infoPanel = infoPanel;

    this.host.shadow.appendChild(panelRoot);
    this.applyPanelBodyMinHeight(body);
    this.attachPanelEscapeKeyHandler();
    refreshPanels();
    setActiveTab(tab === "shortcuts" ? "settings" : tab);
  }

  showTab(tab: PanelPopupTab): void {
    if (!this.body) return;
    this.activeTab = tab;

    const strings = this.host.getStrings();
    this.panelRoot!.lang = localeToHtmlLang(this.host.getLocale());
    this.panelRoot!.dir = this.host.isRtl() ? "rtl" : "ltr";

    switch (tab) {
      case "settings":
        populateSettingsPanel(this.host, this.body, this.panelRoot!, () => this.refreshPopup(), true);
        break;
      case "shortcuts":
        buildShortcutsPanelBody(this.body, strings);
        break;
      case "info":
        buildAboutPanelBody(this.body, strings);
        break;
    }

    this.menu?.setActive(tab);
  }

  private refreshPopup(): void {
    if (!this.body || this.host.surface !== "popup") return;
    this.showTab(this.activeTab);
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
    this.panelRoot = null;
    this.body = null;
    this.menu = null;
    this.settingsPanel = null;
    this.infoPanel = null;
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

  private applyPanelBodyMinHeight(body: HTMLElement): void {
    if (panelBodyMinPx == null) {
      panelBodyMinPx = measureGermanSettingsBodyHeight(this.host, this.host.shadow);
    }
    body.style.setProperty(PANEL_BODY_MIN_VAR, `${panelBodyMinPx}px`);
  }

  private populateOverlayInfoPanel(panel: HTMLElement, copy = this.host.getStrings()): void {
    const items = buildAboutListItems(copy);

    let list = panel.querySelector<HTMLUListElement>(".dd-about-list");
    if (list) {
      list.setAttribute("aria-label", copy.tabAbout);
      const existing = list.querySelectorAll<HTMLLIElement>(".dd-about-item");
      items.forEach((item, index) => {
        const el = existing[index];
        const text = el?.querySelector(".dd-about-text");
        if (text) text.textContent = item.text;
        const mark = el?.querySelector<HTMLElement>(".dd-about-bool");
        if (mark) mark.innerHTML = item.iconHtml;
      });
      return;
    }

    panel.replaceChildren();
    list = document.createElement("ul");
    list.className = "dd-about-list";
    list.setAttribute("aria-label", copy.tabAbout);

    for (const item of items) {
      list.appendChild(this.createOverlayAboutItem(item.iconHtml, item.text));
    }
    panel.append(list);
  }

  private createOverlayAboutItem(iconHtml: string, text: string): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "dd-about-item dd-about-item--bool";

    const mark = document.createElement("span");
    mark.className = "dd-about-bool";
    mark.setAttribute("aria-hidden", "true");
    mark.innerHTML = iconHtml;

    const label = document.createElement("span");
    label.className = "dd-about-text";
    label.textContent = text;

    li.append(mark, label);
    return li;
  }
}
