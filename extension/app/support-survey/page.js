import { localeToHtmlLang } from "../../lib/our/i18n/locale-code.js";
import { isRtlLocale } from "../../lib/our/i18n/rtl.js";
import { createPanelDivider, createPanelHeader } from "../../lib/our/panel-header/header.js";
import { PANEL_TITLE } from "../brand.js";
import { t } from "../i18n/strings.js";
import { extensionMarkSvg } from "../icons.js";
import { getLocale } from "../storage.js";
import { SUPPORT_SURVEY_FEEDBACK_EMAIL, SUPPORT_SURVEY_GITHUB_URL } from "./constants.js";
import {
  deferSupportSurvey,
  disableSupportSurveyForever,
  getSupportSurveyStoreRateLabel,
  getSupportSurveyStoreUrl,
  markSupportSurveyCompleted,
  markSupportSurveyShown,
  readSupportSurveyState,
  writeSupportSurveyState,
} from "./state.js";

var SUPPORT_SURVEY_SCREENS = ["useful", "support", "feedback"];
function surveyScreenFromQuery() {
  const screen = new URLSearchParams(location.search).get("screen");
  return SUPPORT_SURVEY_SCREENS.includes(screen) ? screen : "useful";
}
function surveyButton(label, action, variant) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = variant
    ? `survey-btn survey-btn--${variant}`
    : "survey-btn";
  btn.textContent = label;
  btn.dataset.action = action;
  return btn;
}
function surveyActionsRow(buttons) {
  const row = document.createElement("div");
  row.className = "survey-actions";
  for (const btn of buttons) {
    row.append(btn);
  }
  return row;
}
function surveyScreenEl(id, title, buttons) {
  const section = document.createElement("section");
  section.className = "survey-screen";
  section.id = id;
  section.dataset.screen = id.replace("survey-", "");
  const heading = document.createElement("h2");
  heading.className = "survey-title";
  heading.style.whiteSpace = "pre-line";
  heading.textContent = title;
  section.append(heading, surveyActionsRow(buttons));
  return section;
}
function setSurveyScreen(root, screen) {
  for (const section of root.querySelectorAll(".survey-screen")) {
    const active = section.dataset.screen === screen;
    section.hidden = !active;
  }
}
async function recordSupportSurveyShown() {
  try {
    const state = await readSupportSurveyState();
    await writeSupportSurveyState({
      ...markSupportSurveyShown(state),
    });
  } catch (err) {
    console.warn("[Element Deleter] support survey shown mark failed:", err);
  }
}
async function applySupportSurveyAction(action) {
  try {
    const state = await readSupportSurveyState();
    if (action === "askLater" || action === "later") {
      await writeSupportSurveyState({
        ...deferSupportSurvey(state),
      });
      window.close();
      return;
    }
    if (action === "neverAsk") {
      await writeSupportSurveyState({
        ...disableSupportSurveyForever(state),
      });
      window.close();
      return;
    }
    if (action === "starGithub") {
      await writeSupportSurveyState({
        ...markSupportSurveyCompleted(state),
      });
      window.open(SUPPORT_SURVEY_GITHUB_URL, "_blank", "noopener,noreferrer");
      window.close();
      return;
    }
    if (action === "rateStore") {
      await writeSupportSurveyState({
        ...markSupportSurveyCompleted(state),
      });
      window.open(getSupportSurveyStoreUrl(), "_blank", "noopener,noreferrer");
      window.close();
      return;
    }
    if (action === "sendEmail") {
      window.open(SUPPORT_SURVEY_FEEDBACK_EMAIL, "_blank", "noopener,noreferrer");
      return;
    }
    if (action === "yes") {
      setSurveyScreen(document.getElementById("survey-root"), "support");
      return;
    }
    if (action === "no") {
      setSurveyScreen(document.getElementById("survey-root"), "feedback");
      return;
    }
  } catch (err) {
    console.warn("[Element Deleter] support survey action failed:", err);
    window.close();
  }
}
function mountSupportSurveyPage() {
  const root = document.getElementById("survey-root");
  const headerMount = document.getElementById("survey-header-mount");
  if (!root || !headerMount) return;
  void (async () => {
    const locale = await getLocale();
    const strings = t(locale);
    document.documentElement.lang = localeToHtmlLang(locale);
    document.documentElement.dir = isRtlLocale(locale) ? "rtl" : "ltr";
    headerMount.append(
      createPanelHeader({
        title: PANEL_TITLE,
        subtitle: strings.panelSubtitle,
        logoSvg: extensionMarkSvg({ variant: "panel" }),
      }),
      createPanelDivider(),
    );
    root.append(
      surveyScreenEl(
        "survey-useful",
        strings.surveyUsefulTitle,
        [
          surveyButton(strings.surveyAskLater, "askLater"),
          surveyButton(strings.surveyNeverAsk, "neverAsk", "ghost"),
          surveyButton(strings.surveyNo, "no", "ghost"),
          surveyButton(strings.surveyYes, "yes", "primary"),
        ],
      ),
      surveyScreenEl(
        "survey-support",
        strings.surveySupportTitle,
        [
          surveyButton(strings.surveyLater, "later"),
          surveyButton(strings.surveyStarGithub, "starGithub", "primary"),
          surveyButton(getSupportSurveyStoreRateLabel(), "rateStore", "primary"),
        ],
      ),
      surveyScreenEl(
        "survey-feedback",
        strings.surveyFeedbackTitle,
        [
          surveyButton(strings.surveySendEmail, "sendEmail", "primary"),
          surveyButton(strings.surveyLater, "later"),
          surveyButton(strings.surveyNeverAsk, "neverAsk", "ghost"),
        ],
      ),
    );
    setSurveyScreen(root, surveyScreenFromQuery());
    root.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const action = target.closest("[data-action]")?.dataset.action;
      if (!action) return;
      void applySupportSurveyAction(action);
    });
    await recordSupportSurveyShown();
  })();
}
mountSupportSurveyPage();
