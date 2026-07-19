"use strict";
var SUPPORT_SURVEY_STORAGE_KEY = "supportSurveyState";
var SUPPORT_SURVEY_PAGE = "support-survey-page.html";
var SUPPORT_SURVEY_THRESHOLD = 25;
var SUPPORT_SURVEY_COOLDOWN_MS = 60 * 24 * 60 * 60 * 1e3;
var SUPPORT_SURVEY_GITHUB_URL =
  "https://github.com/md2it/browser-extension-element-deleter";
var SUPPORT_SURVEY_CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/element-deleter/dpgjhjgfbicnenmdknepflmdahmhlbag";
var SUPPORT_SURVEY_FIREFOX_STORE_URL =
  "https://addons.mozilla.org/firefox/addon/md2it-element-deleter/";
var SUPPORT_SURVEY_FEEDBACK_EMAIL = "mailto:contact@md2it.com";

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.SUPPORT_SURVEY_STORAGE_KEY = SUPPORT_SURVEY_STORAGE_KEY;
globalThis.SUPPORT_SURVEY_PAGE = SUPPORT_SURVEY_PAGE;
globalThis.SUPPORT_SURVEY_THRESHOLD = SUPPORT_SURVEY_THRESHOLD;
globalThis.SUPPORT_SURVEY_COOLDOWN_MS = SUPPORT_SURVEY_COOLDOWN_MS;
globalThis.SUPPORT_SURVEY_GITHUB_URL = SUPPORT_SURVEY_GITHUB_URL;
globalThis.SUPPORT_SURVEY_CHROME_STORE_URL = SUPPORT_SURVEY_CHROME_STORE_URL;
globalThis.SUPPORT_SURVEY_FIREFOX_STORE_URL = SUPPORT_SURVEY_FIREFOX_STORE_URL;
globalThis.SUPPORT_SURVEY_FEEDBACK_EMAIL = SUPPORT_SURVEY_FEEDBACK_EMAIL;
