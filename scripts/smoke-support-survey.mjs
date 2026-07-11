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
assert.ok(
  manifest.background.scripts.includes("app/support-survey/background.js"),
);
assert.ok(
  manifest.background.scripts.includes("lib/our/support-survey/logic.js"),
);
assert.ok(readFileSync(join(ext, "support-survey-page.html"), "utf8").includes("survey-root"));

const content = readFileSync(join(ext, "app/content.js"), "utf8");
assert.match(content, /SCENARIO_COMPLETE/);
assert.match(content, /sessionDeletedElementCount/);

console.log("support-survey smoke: ok");
