import { createSupportSurveyLogic } from "../../lib/our/support-survey/logic.js";
import { ext } from "../../lib/our/api.js";
import { SUPPORT_SURVEY_CHROME_STORE_URL, SUPPORT_SURVEY_COOLDOWN_MS, SUPPORT_SURVEY_FIREFOX_STORE_URL, SUPPORT_SURVEY_STORAGE_KEY, SUPPORT_SURVEY_THRESHOLD } from "./constants.js";

var supportSurveyLogic = createSupportSurveyLogic({
  threshold: SUPPORT_SURVEY_THRESHOLD,
  cooldownMs: SUPPORT_SURVEY_COOLDOWN_MS,
});
function normalizeSupportSurveyState(raw) {
  const normalized = supportSurveyLogic.normalizeState(raw);
  return {
    ...normalized,
    completed:
      normalized.completed ||
      raw?.completedGithub === true ||
      raw?.completedStore === true,
  };
}
async function readSupportSurveyState() {
  const data = await ext.storage.local.get(SUPPORT_SURVEY_STORAGE_KEY);
  return normalizeSupportSurveyState(data[SUPPORT_SURVEY_STORAGE_KEY]);
}
async function writeSupportSurveyState(state) {
  await ext.storage.local.set({
    [SUPPORT_SURVEY_STORAGE_KEY]: normalizeSupportSurveyState(state),
  });
}
async function recordSupportSurveyActions(amount) {
  const state = await readSupportSurveyState();
  const nextState = supportSurveyLogic.addSuccessfulActions(state, amount);
  await writeSupportSurveyState(nextState);
  return nextState;
}
function shouldShowSupportSurvey(state, now = Date.now()) {
  return supportSurveyLogic.canShow(state, now);
}
function markSupportSurveyShown(state) {
  return supportSurveyLogic.markShown(state);
}
function deferSupportSurvey(state) {
  return supportSurveyLogic.defer(state);
}
function disableSupportSurveyForever(state) {
  return supportSurveyLogic.disableForever(state);
}
function markSupportSurveyCompleted(state) {
  return supportSurveyLogic.markCompleted(state);
}
/** True for Firefox/Gecko extension runtime; not fooled by a `browser` polyfill on Chromium. */
function isFirefoxExtensionRuntime() {
  try {
    const runtime =
      (typeof chrome !== "undefined" && chrome && chrome.runtime) ||
      (typeof browser !== "undefined" && browser && browser.runtime) ||
      null;
    if (runtime && typeof runtime.getURL === "function") {
      return String(runtime.getURL("/")).startsWith("moz-extension:");
    }
  } catch (_) {}
  return typeof navigator !== "undefined" && /Firefox\//.test(String(navigator.userAgent || ""));
}
function getSupportSurveyStoreUrl() {
  return isFirefoxExtensionRuntime()
    ? SUPPORT_SURVEY_FIREFOX_STORE_URL
    : SUPPORT_SURVEY_CHROME_STORE_URL;
}
function getSupportSurveyStoreRateLabel() {
  return isFirefoxExtensionRuntime()
    ? "Rate in Firefox store"
    : "Rate in Chrome web store";
}

export { supportSurveyLogic, normalizeSupportSurveyState, readSupportSurveyState, writeSupportSurveyState, recordSupportSurveyActions, shouldShowSupportSurvey, markSupportSurveyShown, deferSupportSurvey, disableSupportSurveyForever, markSupportSurveyCompleted, isFirefoxExtensionRuntime, getSupportSurveyStoreUrl, getSupportSurveyStoreRateLabel };
