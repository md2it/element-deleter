"use strict";
function createPageDivider() {
  const divider = document.createElement("div");
  divider.className = "dd-panel-divider dd-panel-page-divider";
  return divider;
}
function createPageTitle(text) {
  const title = document.createElement("h2");
  title.className = "dd-panel-page-title";
  title.textContent = text;
  return title;
}
function createKbd(text) {
  const kbd = document.createElement("kbd");
  kbd.className = "dd-about-kbd";
  kbd.textContent = text;
  return kbd;
}
function createSectionDivider() {
  const divider = document.createElement("div");
  divider.className = "dd-panel-divider dd-shortcuts-divider";
  return divider;
}
function createAboutIcon(iconHtml) {
  const mark = document.createElement("span");
  mark.className = "dd-about-icon";
  mark.setAttribute("aria-hidden", "true");
  mark.innerHTML = iconHtml;
  return mark;
}
function buildShortcutsSteps(strings) {
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
  const releaseBold = document.createElement("strong");
  releaseBold.className = "dd-shortcuts-step-release-bold";
  releaseBold.textContent = strings.shortcutsStepReleaseBold;
  step2.append(
    releaseBold,
    document.createTextNode(strings.shortcutsStepReleaseRest),
  );
  const step3 = document.createElement("li");
  step3.append(
    document.createTextNode(`${strings.shortcutsStepThenPress} `),
    createKbd(PREFIX_ACTION_KEY.toUpperCase()),
  );
  steps.append(step1, step2, step3);
  return steps;
}
function buildUndoShortcutBlock(strings) {
  const block = document.createElement("div");
  block.className = "dd-shortcuts-undo-block";
  const heading = document.createElement("p");
  heading.className = "dd-shortcuts-heading";
  heading.textContent = strings.shortcutsUndoHeading;
  const winRow = document.createElement("p");
  winRow.className = "dd-shortcuts-undo-row";
  winRow.append(
    document.createTextNode(`${strings.shortcutsUndoWinLinux} `),
    createKbd(SHORTCUTS_UNDO_WIN_DISPLAY),
  );
  const macRow = document.createElement("p");
  macRow.className = "dd-shortcuts-undo-row";
  macRow.append(
    document.createTextNode(`${strings.shortcutsStepOnMac} `),
    createKbd(SHORTCUTS_UNDO_MAC_DISPLAY),
  );
  block.append(heading, winRow, macRow);
  return block;
}
function createAboutCredit(strings) {
  const credit = document.createElement("div");
  credit.className = "dd-about-credit";
  const divider = document.createElement("div");
  divider.className = "dd-panel-divider dd-about-credit-divider";
  divider.setAttribute("aria-hidden", "true");
  const productLine = document.createElement("p");
  productLine.className = "dd-about-credit-line";
  productLine.textContent = strings.aboutProductName;
  const copyrightLine = document.createElement("p");
  copyrightLine.className = "dd-about-credit-line";
  const link = document.createElement("a");
  link.href = ABOUT_AUTHOR_URL;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = strings.aboutCreditAuthor;
  link.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  copyrightLine.append("© ", link);
  credit.append(divider, productLine, copyrightLine);
  return credit;
}
function buildShortcutsPanelBody(body, strings) {
  body.replaceChildren();
  const page = document.createElement("div");
  page.className = "dd-panel-page dd-panel-page--shortcuts";
  const runStopHeading = document.createElement("p");
  runStopHeading.className = "dd-shortcuts-heading";
  runStopHeading.textContent = strings.shortcutsRunStopHeading;
  const safety = document.createElement("div");
  safety.className = "dd-shortcuts-safety";
  const safetyLine1 = document.createElement("p");
  safetyLine1.className = "dd-shortcuts-note";
  safetyLine1.textContent = strings.shortcutsSafetyLine1;
  const safetyLine2 = document.createElement("p");
  safetyLine2.className = "dd-shortcuts-note";
  safetyLine2.textContent = strings.shortcutsSafetyLine2;
  safety.append(safetyLine1, safetyLine2);
  const stopHeading = document.createElement("p");
  stopHeading.className = "dd-shortcuts-heading";
  stopHeading.append(
    document.createTextNode(`${strings.shortcutsStopHeading} `),
    createKbd("Esc"),
  );
  page.append(
    createPageTitle(strings.tabShortcuts),
    createPageDivider(),
    runStopHeading,
    buildShortcutsSteps(strings),
    safety,
    createSectionDivider(),
    buildUndoShortcutBlock(strings),
    createSectionDivider(),
    stopHeading,
    createSectionDivider(),
  );
  body.append(page);
}
function buildAboutPanelBody(body, strings) {
  body.replaceChildren();
  const page = document.createElement("div");
  page.className = "dd-panel-page dd-panel-page--about";
  const list = document.createElement("ul");
  list.className = "dd-about-list";
  list.setAttribute("aria-label", strings.tabAbout);
  for (const item of buildAboutListItems(strings)) {
    const li = document.createElement("li");
    li.className = "dd-about-item";
    const label = document.createElement(item.href ? "a" : "span");
    label.className = "dd-about-text";
    label.textContent = item.text;
    if (item.href) {
      label.href = item.href;
      label.target = "_blank";
      label.rel = "noopener noreferrer";
      label.style.color = "inherit";
      label.addEventListener("click", (e) => e.stopPropagation());
    }
    li.append(createAboutIcon(item.iconHtml), label);
    list.appendChild(li);
  }
  const statistic = document.createElement("p");
  statistic.className = "dd-about-item";
  const statisticLabel = document.createElement("span");
  statisticLabel.className = "dd-about-text";
  statisticLabel.textContent = `${strings.aboutYourActivity}: ${strings.aboutDeletedElements.replace("{count}", "0")}`;
  statistic.append(createAboutIcon(ABOUT_BULLET_ICONS[0]), statisticLabel);
  void getSupportSurveyAboutText(strings).then((text) => {
    statisticLabel.textContent = `${strings.aboutYourActivity}: ${text}`;
  });
  page.append(
    createPageTitle(strings.tabAbout),
    createPageDivider(),
    statistic,
    createPageDivider(),
    list,
    createAboutCredit(strings),
  );
  body.append(page);
}
