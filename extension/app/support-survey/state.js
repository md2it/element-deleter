"use strict";
var SUPPORT_SURVEY_DEFAULT_STATE = {
  counter: 0,
  neverAsk: false,
  completedGithub: false,
  completedStore: false,
  lastShownAt: null,
};
function normalizeSupportSurveyState(raw) {
  if (!raw || typeof raw !== "object") {
    return { ...SUPPORT_SURVEY_DEFAULT_STATE };
  }
  const counter =
    typeof raw.counter === "number" &&
    Number.isFinite(raw.counter) &&
    raw.counter >= 0
      ? Math.floor(raw.counter)
      : 0;
  const lastShownAt =
    typeof raw.lastShownAt === "number" && Number.isFinite(raw.lastShownAt)
      ? raw.lastShownAt
      : null;
  return {
    counter,
    neverAsk: raw.neverAsk === true,
    completedGithub: raw.completedGithub === true,
    completedStore: raw.completedStore === true,
    lastShownAt,
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
function shouldShowSupportSurvey(state, now = Date.now()) {
  if (state.neverAsk) return false;
  if (state.completedGithub) return false;
  if (state.completedStore) return false;
  if (state.counter < SUPPORT_SURVEY_THRESHOLD) return false;
  if (
    state.lastShownAt !== null &&
    now - state.lastShownAt < SUPPORT_SURVEY_COOLDOWN_MS
  ) {
    return false;
  }
  return true;
}
function getSupportSurveyStoreUrl() {
  return typeof browser !== "undefined"
    ? SUPPORT_SURVEY_FIREFOX_STORE_URL
    : SUPPORT_SURVEY_CHROME_STORE_URL;
}
