import { ext } from "../../lib/our/api.js";
import { SUPPORT_SURVEY_PAGE } from "./constants.js";
import { readSupportSurveyState, recordSupportSurveyActions, shouldShowSupportSurvey } from "./state.js";

var supportSurveyActionQueue = Promise.resolve();
export async function openSupportSurveyPopup(tabId, windowId) {
  const popup = SUPPORT_SURVEY_PAGE;
  const setPopupDetails =
    Number.isInteger(tabId) ? { tabId, popup } : { popup };
  const clearPopupDetails =
    Number.isInteger(tabId) ? { tabId, popup: "" } : { popup: "" };
  await ext.action.setPopup(setPopupDetails);
  try {
    const openPopup = ext.action.openPopup;
    if (!openPopup) throw new Error("action.openPopup unavailable");
    await openPopup(windowId !== void 0 ? { windowId } : {});
  } catch (err) {
    console.warn("[Element Deleter] support survey openPopup failed:", err);
    throw err;
  } finally {
    await ext.action.setPopup(clearPopupDetails);
  }
}
export function recordSupportSurveyAction() {
  supportSurveyActionQueue = supportSurveyActionQueue
    .catch(() => {})
    .then(async () => {
      try {
        await recordSupportSurveyActions(1);
      } catch (err) {
        console.warn("[Element Deleter] support survey action count failed:", err);
      }
    });
  return supportSurveyActionQueue;
}
export async function handleSupportSurveyScenarioComplete(tabId, windowId) {
  try {
    await supportSurveyActionQueue;
    const state = await readSupportSurveyState();
    if (!shouldShowSupportSurvey(state)) return;
    await openSupportSurveyPopup(tabId, windowId);
  } catch (err) {
    console.warn("[Element Deleter] support survey scenario completion failed:", err);
    return;
  }
}
