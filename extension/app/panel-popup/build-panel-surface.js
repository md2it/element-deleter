import { localeToHtmlLang } from "../../lib/our/i18n/locale-code.js";
import { isRtlLocale } from "../../lib/our/i18n/rtl.js";
import { t } from "../i18n/strings.js";
import { PANEL_POPUP_HOST_ATTR } from "./constants.js";
import { createPanelMenu } from "./panel-menu.js";

function createPanelSurface(locale, surface) {
  const panelRoot = document.createElement("div");
  panelRoot.className = "dd-panel";
  if (surface === "popup") {
    panelRoot.classList.add("dd-panel--surface-popup");
  }
  panelRoot.lang = localeToHtmlLang(locale);
  panelRoot.dir = isRtlLocale(locale) ? "rtl" : "ltr";
  const body = document.createElement("div");
  body.className = "dd-panel-body";
  let menu = null;
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

export { createPanelSurface };
