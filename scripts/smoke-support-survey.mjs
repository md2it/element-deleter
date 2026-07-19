import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createContext, runInContext } from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ext = join(root, "extension");

function loadModule(relativePath, globals = {}) {
  const code = readFileSync(join(ext, relativePath), "utf8");
  const context = createContext({
    console,
    ...globals,
  });
  runInContext(code, context, { filename: relativePath });
  return context;
}

const constants = loadModule("app/support-survey/constants.js");
const logic = loadModule("lib/our/support-survey/logic.js");
const stateCtx = loadModule("app/support-survey/state.js", {
  ext: {
    storage: {
      local: {
        async get() {
          return {};
        },
        async set() {},
      },
    },
  },
  ...constants,
  ...logic,
});

const { normalizeSupportSurveyState, shouldShowSupportSurvey } = stateCtx;
const { SUPPORT_SURVEY_THRESHOLD, SUPPORT_SURVEY_COOLDOWN_MS } = constants;

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

const manifest = JSON.parse(
  readFileSync(join(ext, "manifest.json"), "utf8"),
);
// Background now loads through a single modular entry point (see
// extension/app/background/main.js) instead of a manually-listed
// background.scripts array, for both Chrome (service_worker) and Firefox
// 121+ (scripts fallback). Verify that single entry point still pulls in
// the support-survey background wiring via ES import.
assert.equal(manifest.background.service_worker, "app/background/main.js");
assert.deepEqual(manifest.background.scripts, ["app/background/main.js"]);
assert.equal(manifest.background.type, "module");
const backgroundMain = readFileSync(
  join(ext, "app/background/main.js"),
  "utf8",
);
assert.match(backgroundMain, /import\s+"\.\.\/support-survey\/background\.js";/);
assert.match(
  backgroundMain,
  /import\s+"\.\.\/\.\.\/lib\/our\/support-survey\/logic\.js";/,
);
assert.ok(readFileSync(join(ext, "support-survey-page.html"), "utf8").includes("survey-root"));

const content = readFileSync(join(ext, "app/content.js"), "utf8");
assert.match(content, /SCENARIO_COMPLETE/);
assert.match(content, /SUPPORT_SURVEY_ACTION/);
assert.match(content, /recordSupportSurveyAction/);
assert.match(content, /notifyScenarioComplete\(hadDeletion\)/);

const background = readFileSync(
  join(ext, "app/background/logic.js"),
  "utf8",
);
assert.match(background, /SUPPORT_SURVEY_ACTION/);
assert.match(background, /recordSupportSurveyAction\(\)/);
assert.match(background, /handleSupportSurveyScenarioComplete\(/);
assert.match(
  background,
  /lib\/our\/support-survey\/logic\.js[\s\S]*app\/support-survey\/constants\.js[\s\S]*app\/support-survey\/state\.js[\s\S]*app\/about\.js/,
);

const surveyBackground = readFileSync(
  join(ext, "app/support-survey/background.js"),
  "utf8",
);
assert.match(surveyBackground, /recordSupportSurveyActions\(1\)/);
assert.match(surveyBackground, /await supportSurveyActionQueue/);
assert.match(surveyBackground, /shouldShowSupportSurvey\(state\)/);

const panelHtml = readFileSync(join(ext, "panel-popup-page.html"), "utf8");
assert.match(
  panelHtml,
  /lib\/our\/support-survey\/logic\.js[\s\S]*app\/support-survey\/constants\.js[\s\S]*app\/support-survey\/state\.js[\s\S]*app\/about\.js/,
);

const stateSource = readFileSync(join(ext, "app/support-survey/state.js"), "utf8");
assert.match(stateSource, /moz-extension:/);
assert.doesNotMatch(
  stateSource,
  /function getSupportSurveyStoreUrl\(\)\s*\{\s*return typeof browser/,
);

assert.equal(
  stateCtx.getSupportSurveyStoreUrl(),
  constants.SUPPORT_SURVEY_CHROME_STORE_URL,
);
assert.equal(stateCtx.getSupportSurveyStoreRateLabel(), "Rate in Chrome web store");

const firefoxRuntime = {
  getURL(path) {
    return `moz-extension://addon-id${path}`;
  },
};
const firefoxState = loadModule("app/support-survey/state.js", {
  chrome: { runtime: firefoxRuntime },
  browser: { runtime: firefoxRuntime },
  navigator: { userAgent: "Mozilla/5.0 Firefox/128.0" },
  ext: {
    storage: {
      local: {
        async get() {
          return {};
        },
        async set() {},
      },
    },
  },
  ...constants,
  ...logic,
});
assert.equal(
  firefoxState.getSupportSurveyStoreUrl(),
  constants.SUPPORT_SURVEY_FIREFOX_STORE_URL,
);
assert.equal(firefoxState.getSupportSurveyStoreRateLabel(), "Rate in Firefox store");

const chromeWithBrowserPolyfill = loadModule("app/support-survey/state.js", {
  chrome: {
    runtime: {
      getURL(path) {
        return `chrome-extension://addon-id${path}`;
      },
    },
  },
  browser: {
    runtime: {
      getURL(path) {
        return `chrome-extension://addon-id${path}`;
      },
    },
  },
  navigator: { userAgent: "Mozilla/5.0 Chrome/126.0.0.0" },
  ext: {
    storage: {
      local: {
        async get() {
          return {};
        },
        async set() {},
      },
    },
  },
  ...constants,
  ...logic,
});
assert.equal(
  chromeWithBrowserPolyfill.getSupportSurveyStoreUrl(),
  constants.SUPPORT_SURVEY_CHROME_STORE_URL,
);

console.log("support-survey smoke: ok");
