"use strict";
async function openSupportSurveyPopup(windowId) {
  const popup = SUPPORT_SURVEY_PAGE;
  const setPopupDetails =
    windowId !== void 0 ? { windowId, popup } : { popup };
  const clearPopupDetails =
    windowId !== void 0 ? { windowId, popup: "" } : { popup: "" };
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
async function handleSupportSurveyScenarioComplete(windowId, hadDeletions) {
  if (!hadDeletions) return;
  let state;
  try {
    state = await readSupportSurveyState();
  } catch (err) {
    console.warn("[Element Deleter] support survey read failed:", err);
    return;
  }
  const nextState = {
    ...state,
    counter: state.counter + 1,
  };
  try {
    await writeSupportSurveyState(nextState);
  } catch (err) {
    console.warn("[Element Deleter] support survey write failed:", err);
    return;
  }
  if (!shouldShowSupportSurvey(nextState)) return;
  try {
    await openSupportSurveyPopup(windowId);
  } catch {
    return;
  }
}
