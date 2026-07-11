"use strict";
async function openSupportSurveyPopup(tabId, windowId) {
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
async function handleSupportSurveyScenarioComplete(tabId, windowId, deletedElementCount) {
  if (!Number.isInteger(deletedElementCount) || deletedElementCount <= 0) return;
  let nextState;
  try {
    nextState = await recordSupportSurveyActions(deletedElementCount);
  } catch (err) {
    console.warn("[Element Deleter] support survey action count failed:", err);
    return;
  }
  if (!shouldShowSupportSurvey(nextState)) return;
  try {
    await openSupportSurveyPopup(tabId, windowId);
  } catch {
    return;
  }
}
