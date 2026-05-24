import { isRtlLocale, type Locale } from "./i18n";
import { createPanelDivider, createPanelHeader } from "./panel-header";
import type { buildWelcomeData } from "./welcome-data";

const ext: typeof chrome = typeof browser !== "undefined" ? browser : chrome;

const LOCALE_STORAGE_KEY = "locale";
const LOCALE_USER_SELECTED_KEY = "localeUserSelected";
const WELCOME_BODY_MIN_VAR = "--welcome-body-min";
const WELCOME_PROBE_WIDTH = "360px";

type WelcomeData = ReturnType<typeof buildWelcomeData>;

let welcomeHeaderEl: HTMLElement | null = null;
let welcomeBodyMinPx: number | null = null;
let welcomePinHintRtl = false;

function stepIcon(iconHtml: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = "step-icon";
  span.innerHTML = iconHtml;
  span.setAttribute("aria-hidden", "true");
  return span;
}

function stepWithIcon(text: string, iconHtml: string): HTMLLIElement {
  const li = document.createElement("li");
  li.append(document.createTextNode(`${text} `), stepIcon(iconHtml));
  return li;
}

function stepWithExtension(
  text: string,
  iconSvg: string | undefined,
  iconUrl: string | undefined,
  name: string,
): HTMLLIElement {
  const li = document.createElement("li");
  const icon = document.createElement("span");
  icon.className = "step-icon step-icon--ext";
  icon.setAttribute("aria-hidden", "true");

  if (iconSvg) {
    icon.innerHTML = iconSvg;
  } else if (iconUrl) {
    const img = document.createElement("img");
    img.className = "ext-icon";
    img.src = iconUrl;
    img.alt = "";
    img.width = 16;
    img.height = 16;
    icon.append(img);
  }

  li.append(document.createTextNode(`${text} `), icon, document.createTextNode(` ${name}`));
  return li;
}

function fillActionButton(button: HTMLButtonElement, label: string, iconHtml: string): void {
  const icon = document.createElement("span");
  icon.className = "button-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = iconHtml;

  const text = document.createElement("span");
  text.className = "button-text";
  text.textContent = label;

  button.replaceChildren(icon, text);
}

function createAboutItem(item: WelcomeData["aboutItems"][number]): HTMLLIElement {
  const li = document.createElement("li");
  li.className = `about-item about-item--${item.iconKind}`;

  const mark = document.createElement("span");
  mark.className = item.iconKind === "toolbar" ? "about-icon about-icon--toolbar" : "about-icon";
  mark.setAttribute("aria-hidden", "true");
  mark.innerHTML = item.iconHtml;

  const label = document.createElement("span");
  label.className = "about-text";
  label.textContent = item.text;

  li.append(mark, label);
  return li;
}

function mergeWelcomeLocale(base: WelcomeData, localeCode: Locale): WelcomeData {
  const localePayload = base.perLocale?.[localeCode];
  if (!localePayload) return base;
  return { ...base, ...localePayload, locale: localeCode };
}

function mountWelcomeHeader(data: WelcomeData): void {
  const mount = document.getElementById("welcome-header-mount");
  if (!mount) return;

  if (!welcomeHeaderEl) {
    welcomeHeaderEl = createPanelHeader({
      title: data.headerTitle,
      subtitle: data.headerSubtitle,
    });
    mount.replaceWith(welcomeHeaderEl, createPanelDivider());
    return;
  }

  welcomeHeaderEl.querySelector(".dd-panel-title")!.textContent = data.headerTitle;
  welcomeHeaderEl.querySelector(".dd-panel-subtitle")!.textContent = data.headerSubtitle;
}

function fillLangRow(
  langRow: HTMLElement,
  data: WelcomeData,
  onSelect?: (code: Locale) => void,
): void {
  if (!data.hasLocales || !Array.isArray(data.locales)) return;

  langRow.setAttribute("aria-label", data.langAriaLabel ?? "");
  langRow.replaceChildren();

  for (const code of data.locales) {
    const langBtn = document.createElement("button");
    langBtn.type = "button";
    langBtn.className = "dd-chip dd-lang-btn";
    langBtn.textContent = data.localeLabels?.[code] ?? code;
    langBtn.classList.toggle("is-active", code === data.locale);
    if (onSelect) {
      langBtn.addEventListener("click", () => {
        onSelect(code);
      });
    }
    langRow.appendChild(langBtn);
  }
}

function populateWelcomeBody(body: HTMLElement, data: WelcomeData): void {
  const langBlock = document.createElement("div");
  langBlock.className = "lang-block";
  const langRow = document.createElement("div");
  langRow.className = "dd-lang-row";
  langRow.id = "lang-row";
  langRow.setAttribute("role", "group");
  fillLangRow(langRow, data);
  langBlock.appendChild(langRow);

  const pinSep = document.createElement("hr");
  pinSep.className = "welcome-sep";
  pinSep.id = "pin-sep";

  const pinBlock = document.createElement("div");
  pinBlock.className = "pin-block";
  const pinHeading = document.createElement("p");
  pinHeading.className = "pin-heading";
  pinHeading.id = "pin-heading";
  pinHeading.textContent = data.pinHeading;
  const steps = document.createElement("ol");
  steps.className = "pin-steps";
  steps.id = "pin-steps";
  steps.append(
    stepWithIcon(data.pinStep1, data.puzzleIcon),
    stepWithExtension(data.pinStep2, data.iconSvg, undefined, data.extensionName),
    stepWithIcon(data.pinStep3, data.pinIcon),
  );
  pinBlock.append(pinHeading, steps);

  const nodes: Node[] = [langBlock, pinSep, pinBlock];

  const aboutItems = data.aboutItems;
  if (data.hasAbout && Array.isArray(aboutItems) && aboutItems.length > 0) {
    const aboutSep = document.createElement("hr");
    aboutSep.className = "welcome-sep";
    aboutSep.id = "about-sep";

    const aboutHeading = document.createElement("p");
    aboutHeading.className = "about-heading";
    aboutHeading.id = "about-heading";
    aboutHeading.textContent = data.aboutHeading;

    const aboutList = document.createElement("ul");
    aboutList.className = "about-list";
    aboutList.id = "about-list";
    aboutList.append(...aboutItems.map(createAboutItem));

    nodes.push(aboutSep, aboutHeading, aboutList);
  }

  if (data.hasAbout && data.hasSettings) {
    const actionsSep = document.createElement("hr");
    actionsSep.className = "welcome-sep";
    actionsSep.id = "actions-sep";

    const actions = document.createElement("div");
    actions.className = "actions";
    actions.id = "actions";

    const settingsBtn = document.createElement("button");
    settingsBtn.type = "button";
    settingsBtn.id = "btn-settings";
    fillActionButton(settingsBtn, data.settingsLabel, data.settingsIcon);

    const aboutBtn = document.createElement("button");
    aboutBtn.type = "button";
    aboutBtn.id = "btn-about";
    fillActionButton(aboutBtn, data.aboutLabel, data.aboutIcon);

    actions.append(settingsBtn, aboutBtn);
    nodes.push(actionsSep, actions);
  }

  body.replaceChildren(...nodes);
}

function renderWelcomeContent(data: WelcomeData): void {
  document.documentElement.lang = data.locale;
  welcomePinHintRtl = data.dir === "rtl" || isRtlLocale(data.locale);
  document.documentElement.dir = welcomePinHintRtl ? "rtl" : "ltr";

  mountWelcomeHeader(data);

  const body = document.querySelector<HTMLElement>(".welcome-body");
  if (body) populateWelcomeBody(body, data);
}

function syncLangButtons(data: WelcomeData): void {
  const langRow = document.getElementById("lang-row");
  if (!langRow) return;

  fillLangRow(langRow, data, (code) => {
    void switchWelcomeLocale(data, code);
  });
}

async function switchWelcomeLocale(base: WelcomeData, localeCode: Locale): Promise<void> {
  if (localeCode === base.locale) return;

  await ext.storage.local.set({
    [LOCALE_STORAGE_KEY]: localeCode,
    [LOCALE_USER_SELECTED_KEY]: true,
  });

  const next = mergeWelcomeLocale(base, localeCode);
  renderWelcomeContent(next);
  syncLangButtons(next);
  requestAnimationFrame(() => positionPinHint());
}

function measureWelcomeBodyHeight(base: WelcomeData, localeCode: Locale): number {
  const data = mergeWelcomeLocale(base, localeCode);
  const shell = document.createElement("div");
  shell.className = "welcome";
  shell.style.cssText = `position:fixed;left:-9999px;width:${WELCOME_PROBE_WIDTH};visibility:hidden;pointer-events:none;`;
  const body = document.createElement("div");
  body.className = "welcome-body";
  shell.appendChild(body);
  document.body.appendChild(shell);
  populateWelcomeBody(body, data);
  const height = body.getBoundingClientRect().height;
  shell.remove();
  return height;
}

function measureMaxWelcomeBodyHeight(base: WelcomeData): number {
  let max = 0;
  for (const code of base.locales ?? []) {
    max = Math.max(max, measureWelcomeBodyHeight(base, code));
  }
  return max;
}

function applyWelcomeBodyMinHeight(base: WelcomeData): void {
  const body = document.querySelector<HTMLElement>(".welcome-body");
  if (!body) return;
  if (welcomeBodyMinPx == null) {
    welcomeBodyMinPx = measureMaxWelcomeBodyHeight(base);
  }
  body.style.setProperty(WELCOME_BODY_MIN_VAR, `${welcomeBodyMinPx}px`);
}

function bindActionButtons(): void {
  document.querySelector(".welcome")?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest("#btn-settings")) {
      void ext.runtime.sendMessage({ type: "OPEN_PANEL", tab: "settings" });
      return;
    }

    if (target.closest("#btn-about")) {
      void ext.runtime.sendMessage({ type: "OPEN_PANEL", tab: "info" });
    }
  });
}

const PIN_HINT_EDGE = 24;
const PIN_HINT_EDGE_RATIO = 0.2;

function positionPinHint(): void {
  const hint = document.getElementById("pin-hint");
  const welcome = document.querySelector(".welcome");
  if (!hint || !welcome || hint.hidden || hint.getAttribute("aria-hidden") === "true") return;

  const rect = welcome.getBoundingClientRect();
  const rtl = welcomePinHintRtl;
  const viewportCornerX = rtl ? PIN_HINT_EDGE : window.innerWidth - PIN_HINT_EDGE;
  const gap = rtl
    ? Math.max(0, rect.left - PIN_HINT_EDGE)
    : Math.max(0, viewportCornerX - rect.right);
  const x = rtl
    ? PIN_HINT_EDGE + gap * PIN_HINT_EDGE_RATIO
    : viewportCornerX - gap * PIN_HINT_EDGE_RATIO;

  hint.style.direction = "ltr";
  hint.style.transform = "translateX(-50%)";
  hint.style.left = `${Math.round(x)}px`;
  hint.style.right = "auto";
}

function bindPinHintPosition(): void {
  const welcome = document.querySelector(".welcome");
  if (!welcome) return;

  const reposition = (): void => positionPinHint();
  window.addEventListener("resize", reposition, { passive: true });

  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(reposition);
    observer.observe(welcome);
  }

  requestAnimationFrame(reposition);
}

function syncPinHintVariant(pinned: boolean): void {
  const hint = document.getElementById("pin-hint");
  const guide = document.getElementById("pin-hint-guide");
  const pinnedBlock = document.getElementById("pin-hint-pinned");
  if (!hint || !guide || !pinnedBlock) return;

  hint.hidden = false;
  hint.setAttribute("aria-hidden", "false");
  guide.hidden = pinned;
  pinnedBlock.hidden = !pinned;
  requestAnimationFrame(() => positionPinHint());
}

function setupPinHint(data: WelcomeData): void {
  const arrowEl = document.getElementById("pin-hint-arrow");
  const pinEl = document.getElementById("pin-hint-pin");
  const heartEl = document.getElementById("pin-hint-heart");
  if (arrowEl && data.arrowUpIcon) arrowEl.innerHTML = data.arrowUpIcon;
  if (pinEl && data.pinHintIcon) pinEl.innerHTML = data.pinHintIcon;
  if (heartEl && data.heartIcon) heartEl.innerHTML = data.heartIcon;

  const pinned = data.isPinned === true;
  syncPinHintVariant(pinned);
  bindPinHintPosition();

  ext.runtime.onMessage.addListener((message) => {
    if (message?.type === "PIN_STATUS_CHANGED" && message.pinned) {
      syncPinHintVariant(true);
    }
  });

  if (!pinned) {
    void ext.runtime.sendMessage({ type: "WATCH_PIN_STATUS" });
  }
}

async function main(): Promise<void> {
  const { welcomeData } = await ext.storage.session.get("welcomeData");
  if (!welcomeData?.locale) return;

  const data = welcomeData as WelcomeData;
  renderWelcomeContent(data);
  applyWelcomeBodyMinHeight(data);
  syncLangButtons(data);
  setupPinHint(data);
  bindActionButtons();
}

void main();
