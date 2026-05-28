import { localeToHtmlLang } from "../../../lib/src/i18n/locale-code";
import {
  CHEVRON_LEFT,
  CHEVRON_RIGHT,
  CHEVRONS_LEFT,
  CHEVRONS_RIGHT,
} from "../icons";
import {
  isRtlLocale,
  LOCALE_BUTTON_LABELS,
  LOCALES,
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

export type PanelSettingsHost = {
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
};

const ELEMENT_LABEL_TOGGLE_ARIA = "tag#id / tag.class";

function createPageDivider(): HTMLDivElement {
  const divider = document.createElement("div");
  divider.className = "dd-panel-divider dd-panel-page-divider";
  return divider;
}

function createPageTitle(text: string): HTMLHeadingElement {
  const title = document.createElement("h2");
  title.className = "dd-panel-page-title";
  title.textContent = text;
  return title;
}

function appendPrefixStartHotkeyMarkup(label: Element): void {
  label.append(document.createTextNode(" "));
  const chord = document.createElement("kbd");
  chord.textContent = getStartHotkeyChordLabel();
  const action = document.createElement("kbd");
  action.textContent = getStartHotkeyActionLabel();
  label.append(chord, document.createTextNode(" → "), action);
}

function createToggleRow(
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

function createElementLabelToggleRow(
  enabled: boolean,
  onChange: (next: boolean) => void,
): HTMLElement {
  const row = createToggleRow(ELEMENT_LABEL_TOGGLE_ARIA, enabled, onChange);
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
    toggle.setAttribute("aria-label", ELEMENT_LABEL_TOGGLE_ARIA);
  }
  return row;
}

function createPrefixStartHotkeyToggleRow(
  labelText: string,
  enabled: boolean,
  onChange: (next: boolean) => void,
): HTMLElement {
  const row = createToggleRow(labelText, enabled, onChange);
  const label = row.querySelector(".dd-toggle-label");
  if (label) appendPrefixStartHotkeyMarkup(label);
  const toggle = row.querySelector(".dd-toggle");
  if (toggle instanceof HTMLButtonElement) {
    toggle.setAttribute("aria-label", `${labelText} ${getStartHotkeyAriaLabel()}`);
  }
  return row;
}

function createHotkeyToggleRow(
  labelText: string,
  hotkeyLabel: string,
  enabled: boolean,
  onChange: (next: boolean) => void,
): HTMLElement {
  const row = createToggleRow(labelText, enabled, onChange);
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

function syncPrefixStartHotkeyToggleRow(row: Element | undefined, labelText: string): void {
  if (!row) return;
  const label = row.querySelector(".dd-toggle-label");
  const toggle = row.querySelector<HTMLButtonElement>(".dd-toggle");
  if (!label) return;
  label.replaceChildren(document.createTextNode(labelText));
  appendPrefixStartHotkeyMarkup(label);
  toggle?.setAttribute("aria-label", `${labelText} ${getStartHotkeyAriaLabel()}`);
}

function syncHotkeyToggleRow(
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

function syncSettingsPanelCopy(host: PanelSettingsHost, panel: HTMLElement): void {
  const copy = host.getStrings();
  panel.querySelector(".dd-lang-row")?.setAttribute("aria-label", copy.tabSettings);
  for (const btn of Array.from(panel.querySelectorAll<HTMLButtonElement>(".dd-lang-btn"))) {
    const code = LOCALES.find((locale) => LOCALE_BUTTON_LABELS[locale] === btn.textContent);
    if (code) btn.classList.toggle("is-active", code === host.getLocale());
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
  syncPrefixStartHotkeyToggleRow(toggles[0], copy.startHotkeyToggleLabel);
  syncHotkeyToggleRow(toggles[1], copy.escHotkeyToggleLabel, ESC_HOTKEY_LABEL);
  syncHotkeyToggleRow(toggles[2], copy.undoHotkeyToggleLabel, getUndoHotkeyLabel());
  const labelRows = panel.querySelectorAll<HTMLElement>(".dd-toggle-label");
  if (labelRows[4]) labelRows[4].textContent = copy.allElementsOutlineToggleLabel;
  if (labelRows[5]) labelRows[5].textContent = copy.allElementsFillToggleLabel;
  toggles[4]
    ?.querySelector<HTMLButtonElement>(".dd-toggle")
    ?.setAttribute("aria-label", copy.allElementsOutlineToggleLabel);
  toggles[5]
    ?.querySelector<HTMLButtonElement>(".dd-toggle")
    ?.setAttribute("aria-label", copy.allElementsFillToggleLabel);
  const title = panel.closest(".dd-panel-page")?.querySelector(".dd-panel-page-title");
  if (title) title.textContent = copy.tabSettings;
}

export function populateSettingsPanel(
  host: PanelSettingsHost,
  panel: HTMLElement,
  panelRoot: HTMLElement,
  onLocaleChange: () => void,
  surfacePopup = false,
): void {
  if (panel.querySelector(".dd-lang-row")) {
    syncSettingsPanelCopy(host, panel);
    return;
  }

  panel.replaceChildren();
  const copy = host.getStrings();

  const settingsMount = surfacePopup ? document.createElement("div") : panel;
  if (surfacePopup) {
    settingsMount.className = "dd-panel-page-settings";
  }

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
    langBtn.classList.toggle("is-active", code === host.getLocale());
    langBtn.addEventListener("click", () => {
      void (async () => {
        host.setLocale(code);
        await setLocale(code);
        panelRoot.lang = localeToHtmlLang(code);
        panelRoot.dir = isRtlLocale(code) ? "rtl" : "ltr";
        onLocaleChange();
      })();
    });
    langRow.appendChild(langBtn);
  }
  langField.appendChild(langRow);

  const startHotkeyRow = createPrefixStartHotkeyToggleRow(
    copy.startHotkeyToggleLabel,
    host.getStartHotkeyEnabled(),
    (next) => {
      void (async () => {
        host.setStartHotkeyEnabled(next);
        await setStartHotkeyEnabled(next);
      })();
    },
  );

  const escHotkeyRow = createHotkeyToggleRow(
    copy.escHotkeyToggleLabel,
    ESC_HOTKEY_LABEL,
    host.getEscHotkeyEnabled(),
    (next) => {
      void (async () => {
        host.setEscHotkeyEnabled(next);
        await setEscHotkeyEnabled(next);
      })();
    },
  );

  const undoHotkeyRow = createHotkeyToggleRow(
    copy.undoHotkeyToggleLabel,
    getUndoHotkeyLabel(),
    host.getUndoHotkeyEnabled(),
    (next) => {
      void (async () => {
        host.setUndoHotkeyEnabled(next);
        await setUndoHotkeyEnabled(next);
      })();
    },
  );

  const elementLabelRow = createElementLabelToggleRow(
    host.getElementLabelEnabled(),
    (next) => {
      void (async () => {
        host.setElementLabelEnabled(next);
        await setElementLabelEnabled(next);
      })();
    },
  );

  const allElementsOutlineRow = createToggleRow(
    copy.allElementsOutlineToggleLabel,
    host.getAllElementsOutlineEnabled(),
    (next) => {
      void (async () => {
        host.setAllElementsOutlineEnabled(next);
        await setAllElementsOutlineEnabled(next);
      })();
    },
  );

  const allElementsFillRow = createToggleRow(
    copy.allElementsFillToggleLabel,
    host.getAllElementsFillEnabled(),
    (next) => {
      void (async () => {
        host.setAllElementsFillEnabled(next);
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
  input.value = String(host.getNotificationSeconds());
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
      : host.getNotificationSeconds();
    const clamped = Math.min(10, Math.max(0, parsed));
    input.value = String(clamped);
    host.setNotificationSeconds(clamped);
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
  settingsMount.append(
    langField,
    notificationRow,
    startHotkeyRow,
    escHotkeyRow,
    undoHotkeyRow,
    elementLabelRow,
    allElementsOutlineRow,
    allElementsFillRow,
  );

  if (surfacePopup) {
    const page = document.createElement("div");
    page.className = "dd-panel-page dd-panel-page--settings";
    page.append(createPageTitle(copy.tabSettings), createPageDivider(), settingsMount);
    panel.append(page);
  }
}

export function measureGermanSettingsBodyHeight(
  host: PanelSettingsHost,
  shadow: ShadowRoot,
): number {
  const probeBody = document.createElement("div");
  probeBody.className = "dd-panel-body";
  probeBody.style.cssText =
    "position:fixed;left:-9999px;width:20rem;visibility:hidden;pointer-events:none;";
  const probePanel = document.createElement("div");
  probePanel.className = "dd-panel-page dd-panel-page--settings";
  probeBody.appendChild(probePanel);
  shadow.appendChild(probeBody);
  populateSettingsPanel(host, probePanel, probePanel, () => {});
  const height = probeBody.getBoundingClientRect().height;
  probeBody.remove();
  return height;
}
