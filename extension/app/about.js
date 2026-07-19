import { readSupportSurveyState } from "./support-survey/state.js";

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

export { ABOUT_AUTHOR_URL, buildAboutListItems, getSupportSurveyAboutText };
