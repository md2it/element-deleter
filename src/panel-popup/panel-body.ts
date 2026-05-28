import { buildAboutListItems } from "../about";
import type { Strings } from "../i18n";
import { PANEL_FOOTER_LINKEDIN_URL } from "../../../lib/src/panel-footer/constants";
import { PREFIX_ACTION_KEY } from "../hotkeys/commands";
import {
  SHORTCUTS_PREFIX_CHORD_MAC_DISPLAY,
  SHORTCUTS_PREFIX_CHORD_WIN_DISPLAY,
  SHORTCUTS_UNDO_MAC_DISPLAY,
  SHORTCUTS_UNDO_WIN_DISPLAY,
} from "../hotkeys/keys";

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

function createKbd(text: string): HTMLElement {
  const kbd = document.createElement("kbd");
  kbd.className = "dd-about-kbd";
  kbd.textContent = text;
  return kbd;
}

function createAboutIcon(iconHtml: string): HTMLSpanElement {
  const mark = document.createElement("span");
  mark.className = "dd-about-icon";
  mark.setAttribute("aria-hidden", "true");
  mark.innerHTML = iconHtml;
  return mark;
}

function buildShortcutsSteps(strings: Strings): HTMLOListElement {
  const steps = document.createElement("ol");
  steps.className = "dd-shortcuts-steps";

  const step1 = document.createElement("li");
  step1.className = "dd-shortcuts-step--press";

  const pressGrid = document.createElement("div");
  pressGrid.className = "dd-shortcuts-step-press-grid";

  const pressLabel = document.createElement("span");
  pressLabel.className = "dd-shortcuts-step-press-label";
  pressLabel.textContent = strings.shortcutsStepPress;

  const pressChords = document.createElement("div");
  pressChords.className = "dd-shortcuts-step-press-chords";
  pressChords.append(createKbd(SHORTCUTS_PREFIX_CHORD_WIN_DISPLAY));

  const pressMacLabel = document.createElement("span");
  pressMacLabel.className = "dd-shortcuts-step-press-mac-label";
  pressMacLabel.textContent = strings.shortcutsStepOnMac;

  const pressMacChords = document.createElement("div");
  pressMacChords.className = "dd-shortcuts-step-press-mac-chords";
  pressMacChords.append(createKbd(SHORTCUTS_PREFIX_CHORD_MAC_DISPLAY));

  pressGrid.append(pressLabel, pressChords, pressMacLabel, pressMacChords);
  step1.append(pressGrid);

  const step2 = document.createElement("li");
  step2.textContent = strings.shortcutsStepRelease;

  const step3 = document.createElement("li");
  step3.append(
    document.createTextNode(`${strings.shortcutsStepThenPress} `),
    createKbd(PREFIX_ACTION_KEY.toUpperCase()),
  );

  steps.append(step1, step2, step3);
  return steps;
}

function buildUndoShortcutBlock(strings: Strings): HTMLElement {
  const block = document.createElement("div");
  block.className = "dd-shortcuts-undo-block";

  const heading = document.createElement("p");
  heading.className = "dd-shortcuts-heading";
  heading.append(
    document.createTextNode(`${strings.shortcutsUndoHeading} `),
    createKbd(SHORTCUTS_UNDO_WIN_DISPLAY),
  );

  const macRow = document.createElement("p");
  macRow.className = "dd-shortcuts-undo-mac";
  macRow.append(
    document.createTextNode(`${strings.shortcutsStepOnMac} `),
    createKbd(SHORTCUTS_UNDO_MAC_DISPLAY),
  );

  block.append(heading, macRow);
  return block;
}

function createAboutCredit(strings: Strings): HTMLParagraphElement {
  const credit = document.createElement("p");
  credit.className = "dd-about-credit";

  const link = document.createElement("a");
  link.href = PANEL_FOOTER_LINKEDIN_URL;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = strings.aboutCreditAuthor;
  link.addEventListener("click", (e: MouseEvent) => {
    e.stopPropagation();
  });

  credit.append(strings.aboutCreditPrefix, link);
  return credit;
}

export function buildShortcutsPanelBody(body: HTMLDivElement, strings: Strings): void {
  body.replaceChildren();

  const page = document.createElement("div");
  page.className = "dd-panel-page dd-panel-page--shortcuts";

  const runStopHeading = document.createElement("p");
  runStopHeading.className = "dd-shortcuts-heading";
  runStopHeading.textContent = strings.shortcutsRunStopHeading;

  const stopHeading = document.createElement("p");
  stopHeading.className = "dd-shortcuts-heading";
  stopHeading.append(
    document.createTextNode(`${strings.shortcutsStopHeading} `),
    createKbd("Esc"),
  );

  const divider = document.createElement("div");
  divider.className = "dd-panel-divider dd-shortcuts-divider";

  const safetyLine1 = document.createElement("p");
  safetyLine1.className = "dd-shortcuts-note";
  safetyLine1.textContent = strings.shortcutsSafetyLine1;

  const safetyLine2 = document.createElement("p");
  safetyLine2.className = "dd-shortcuts-note";
  safetyLine2.textContent = strings.shortcutsSafetyLine2;

  page.append(
    createPageTitle(strings.tabShortcuts),
    createPageDivider(),
    runStopHeading,
    buildShortcutsSteps(strings),
    buildUndoShortcutBlock(strings),
    stopHeading,
    divider,
    safetyLine1,
    safetyLine2,
  );
  body.append(page);
}

export function buildAboutPanelBody(body: HTMLDivElement, strings: Strings): void {
  body.replaceChildren();

  const page = document.createElement("div");
  page.className = "dd-panel-page dd-panel-page--about";

  const list = document.createElement("ul");
  list.className = "dd-about-list";
  list.setAttribute("aria-label", strings.tabAbout);

  for (const item of buildAboutListItems(strings)) {
    const li = document.createElement("li");
    li.className = "dd-about-item";

    const label = document.createElement("span");
    label.className = "dd-about-text";
    label.textContent = item.text;

    li.append(createAboutIcon(item.iconHtml), label);
    list.appendChild(li);
  }

  page.append(createPageTitle(strings.tabAbout), createPageDivider(), list, createAboutCredit(strings));
  body.append(page);
}

export function syncAboutPanelBody(body: HTMLDivElement, strings: Strings): void {
  const list = body.querySelector<HTMLUListElement>(".dd-about-list");
  if (!list) {
    buildAboutPanelBody(body, strings);
    return;
  }

  list.setAttribute("aria-label", strings.tabAbout);
  const items = buildAboutListItems(strings);
  const existing = list.querySelectorAll<HTMLLIElement>(".dd-about-item");
  items.forEach((item, index) => {
    const el = existing[index];
    const text = el?.querySelector(".dd-about-text");
    if (text) text.textContent = item.text;
    const mark = el?.querySelector<HTMLElement>(".dd-about-icon");
    if (mark) mark.innerHTML = item.iconHtml;
  });

  const title = body.querySelector<HTMLElement>(".dd-panel-page-title");
  if (title) title.textContent = strings.tabAbout;

  const credit = body.querySelector<HTMLParagraphElement>(".dd-about-credit");
  if (credit) {
    const link = credit.querySelector("a");
    credit.replaceChildren(strings.aboutCreditPrefix);
    if (link) {
      link.textContent = strings.aboutCreditAuthor;
      credit.append(link);
    } else {
      credit.append(createAboutCredit(strings).querySelector("a")!);
    }
  }
}
