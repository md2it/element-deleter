"use strict";
var ABOUT_AUTHOR_URL = "https://www.md2it.com/";
function buildAboutListItems(copy) {
  return copy.aboutBullets.map((text, index) => ({
    text,
    href: index === copy.aboutBullets.length - 1
      ? "https://github.com/md2it/browser-extension-element-deleter"
      : undefined,
  }));
}
async function getSupportSurveyAboutText(strings) {
  try {
    const state = await readSupportSurveyState();
    return strings.aboutDeletedElements.replace("{count}", String(state.actionCount));
  } catch {
    return strings.aboutDeletedElements.replace("{count}", "0");
  }
}

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.ABOUT_AUTHOR_URL = ABOUT_AUTHOR_URL;
globalThis.buildAboutListItems = buildAboutListItems;
globalThis.getSupportSurveyAboutText = getSupportSurveyAboutText;
