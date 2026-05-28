import { localeToHtmlLang } from "../../../lib/src/i18n/locale-code";
import { isRtlLocale, t, type Locale } from "../i18n";
import { PANEL_POPUP_HOST_ATTR } from "./constants";
import { createPanelMenu, type PanelMenuHandle } from "./panel-menu";

export type PanelSurfaceParts = {
  panelRoot: HTMLDivElement;
  body: HTMLDivElement;
  menu: PanelMenuHandle | null;
};

export function createPanelSurface(
  locale: Locale,
  surface?: "popup",
): PanelSurfaceParts {
  const panelRoot = document.createElement("div");
  panelRoot.className = "dd-panel";
  if (surface === "popup") {
    panelRoot.classList.add("dd-panel--surface-popup");
  }
  panelRoot.lang = localeToHtmlLang(locale);
  panelRoot.dir = isRtlLocale(locale) ? "rtl" : "ltr";

  const body = document.createElement("div");
  body.className = "dd-panel-body";

  let menu: PanelMenuHandle | null = null;

  if (surface === "popup") {
    menu = createPanelMenu(t(locale));
    const main = document.createElement("div");
    main.className = "dd-panel-main";

    const content = document.createElement("div");
    content.className = "dd-panel-content";
    content.append(body);

    main.append(menu.root, content);
    panelRoot.append(main);
  } else {
    panelRoot.append(body);
  }

  panelRoot.setAttribute(PANEL_POPUP_HOST_ATTR, "true");

  return { panelRoot, body, menu };
}
