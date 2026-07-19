import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ext = join(root, "extension");

function stubExtStorage() {
  return {
    storage: {
      local: {
        async get() {
          return {};
        },
        async set() {},
      },
    },
  };
}

function installRuntimeGlobals({ getURL, userAgent }) {
  const runtime = { getURL };
  globalThis.chrome = { runtime, ...stubExtStorage() };
  globalThis.browser = { runtime, ...stubExtStorage() };
  Object.defineProperty(globalThis, "navigator", {
    value: { userAgent },
    configurable: true,
  });
}

installRuntimeGlobals({
  getURL: (path) => `chrome-extension://addon-id${path}`,
  userAgent: "Mozilla/5.0 Chrome/126.0.0.0",
});

const {
  SUPPORT_SURVEY_THRESHOLD,
  SUPPORT_SURVEY_COOLDOWN_MS,
  SUPPORT_SURVEY_CHROME_STORE_URL,
  SUPPORT_SURVEY_FIREFOX_STORE_URL,
} = await import(
  pathToFileURL(join(ext, "app/support-survey/constants.js")).href
);

const {
  normalizeSupportSurveyState,
  shouldShowSupportSurvey,
  getSupportSurveyStoreUrl,
  getSupportSurveyStoreRateLabel,
} = await import(pathToFileURL(join(ext, "app/support-survey/state.js")).href);

assert.equal(SUPPORT_SURVEY_THRESHOLD, 25);

const empty = normalizeSupportSurveyState(undefined);
assert.equal(empty.actionCount, 0);
assert.equal(empty.actionCountAtLastDeferral, 0);
assert.equal(empty.neverAsk, false);
assert.equal(empty.completed, false);
assert.equal(empty.lastShownAt, null);

const normalized = normalizeSupportSurveyState({
  actionCount: 2.9,
  actionCountAtLastDeferral: 1.9,
  neverAsk: 1,
  completedGithub: "yes",
  lastShownAt: "bad",
});
assert.equal(normalized.actionCount, 2);
assert.equal(normalized.actionCountAtLastDeferral, 1);
assert.equal(normalized.neverAsk, false);
assert.equal(normalized.completed, false);
assert.equal(normalized.lastShownAt, null);

const now = Date.now();
assert.equal(
  shouldShowSupportSurvey({
    actionCount: 25,
    actionCountAtLastDeferral: 0,
    neverAsk: false,
    completed: false,
    lastShownAt: null,
  }),
  true,
);

assert.equal(
  shouldShowSupportSurvey({
    actionCount: 24,
    actionCountAtLastDeferral: 0,
    neverAsk: false,
    completed: false,
    lastShownAt: null,
  }),
  false,
);

assert.equal(
  shouldShowSupportSurvey({
    actionCount: 25,
    actionCountAtLastDeferral: 0,
    neverAsk: true,
    completed: false,
    lastShownAt: null,
  }),
  false,
);

assert.equal(
  shouldShowSupportSurvey({
    actionCount: 25,
    actionCountAtLastDeferral: 0,
    neverAsk: false,
    completed: true,
    lastShownAt: null,
  }),
  false,
);

assert.equal(
  shouldShowSupportSurvey({
    actionCount: 25,
    actionCountAtLastDeferral: 0,
    neverAsk: false,
    completed: false,
    lastShownAt: now - SUPPORT_SURVEY_COOLDOWN_MS + 1e3,
  }),
  false,
);

assert.equal(
  shouldShowSupportSurvey({
    actionCount: 25,
    actionCountAtLastDeferral: 0,
    neverAsk: false,
    completed: false,
    lastShownAt: now - SUPPORT_SURVEY_COOLDOWN_MS - 1e3,
  }),
  true,
);

const manifest = JSON.parse(readFileSync(join(ext, "manifest.json"), "utf8"));
assert.equal(manifest.background.service_worker, "app/background/main.js");
assert.deepEqual(manifest.background.scripts, ["app/background/main.js"]);
assert.equal(manifest.background.type, "module");
assert.deepEqual(manifest.content_scripts[0].js, ["app/content/loader.js"]);
assert.ok(manifest.web_accessible_resources?.length);

const backgroundMain = readFileSync(join(ext, "app/background/main.js"), "utf8");
assert.match(backgroundMain, /import\s+"\.\/logic\.js"/);

const logicSource = readFileSync(join(ext, "app/background/logic.js"), "utf8");
assert.match(logicSource, /from\s+"\.\.\/support-survey\/background\.js"/);
assert.match(logicSource, /SUPPORT_SURVEY_ACTION/);
assert.match(logicSource, /recordSupportSurveyAction\(\)/);
assert.match(logicSource, /handleSupportSurveyScenarioComplete\(/);
assert.match(logicSource, /app\/content\/loader\.js/);

const content = readFileSync(join(ext, "app/content/main.js"), "utf8");
assert.match(content, /SCENARIO_COMPLETE/);
assert.match(content, /SUPPORT_SURVEY_ACTION/);
assert.match(content, /recordSupportSurveyAction/);
assert.match(content, /notifyScenarioComplete\(hadDeletion\)/);

const surveyBackground = readFileSync(
  join(ext, "app/support-survey/background.js"),
  "utf8",
);
assert.match(surveyBackground, /recordSupportSurveyActions\(1\)/);
assert.match(surveyBackground, /await supportSurveyActionQueue/);
assert.match(surveyBackground, /shouldShowSupportSurvey\(state\)/);

const panelHtml = readFileSync(join(ext, "panel-popup-page.html"), "utf8");
assert.match(panelHtml, /type="module"\s+src="app\/content\/main\.js"/);

assert.ok(
  readFileSync(join(ext, "support-survey-page.html"), "utf8").includes(
    "survey-root",
  ),
);
assert.match(
  readFileSync(join(ext, "support-survey-page.html"), "utf8"),
  /type="module"\s+src="app\/support-survey\/page\.js"/,
);

const stateSource = readFileSync(join(ext, "app/support-survey/state.js"), "utf8");
assert.match(stateSource, /moz-extension:/);
assert.match(
  stateSource,
  /from\s+"\.\.\/\.\.\/lib\/our\/support-survey\/logic\.js"/,
);
assert.doesNotMatch(
  stateSource,
  /function getSupportSurveyStoreUrl\(\)\s*\{\s*return typeof browser/,
);

assert.equal(getSupportSurveyStoreUrl(), SUPPORT_SURVEY_CHROME_STORE_URL);
assert.equal(getSupportSurveyStoreRateLabel(), "Rate in Chrome web store");

installRuntimeGlobals({
  getURL: (path) => `moz-extension://addon-id${path}`,
  userAgent: "Mozilla/5.0 Firefox/128.0",
});
assert.equal(getSupportSurveyStoreUrl(), SUPPORT_SURVEY_FIREFOX_STORE_URL);
assert.equal(getSupportSurveyStoreRateLabel(), "Rate in Firefox store");

installRuntimeGlobals({
  getURL: (path) => `chrome-extension://addon-id${path}`,
  userAgent: "Mozilla/5.0 Chrome/126.0.0.0",
});
assert.equal(getSupportSurveyStoreUrl(), SUPPORT_SURVEY_CHROME_STORE_URL);

console.log("support-survey smoke: ok");
