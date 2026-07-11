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
});

const { normalizeSupportSurveyState, shouldShowSupportSurvey } = stateCtx;
const { SUPPORT_SURVEY_THRESHOLD, SUPPORT_SURVEY_COOLDOWN_MS } = constants;

assert.equal(SUPPORT_SURVEY_THRESHOLD, 3);

const empty = normalizeSupportSurveyState(undefined);
assert.equal(empty.counter, 0);
assert.equal(empty.neverAsk, false);
assert.equal(empty.completedGithub, false);
assert.equal(empty.completedStore, false);
assert.equal(empty.lastShownAt, null);

const normalized = normalizeSupportSurveyState({
  counter: 2.9,
  neverAsk: 1,
  completedGithub: "yes",
  lastShownAt: "bad",
});
assert.equal(normalized.counter, 2);
assert.equal(normalized.neverAsk, false);
assert.equal(normalized.completedGithub, false);
assert.equal(normalized.completedStore, false);
assert.equal(normalized.lastShownAt, null);

const now = Date.now();
assert.equal(
  shouldShowSupportSurvey({
    counter: 3,
    neverAsk: false,
    completedGithub: false,
    completedStore: false,
    lastShownAt: null,
  }),
  true,
);

assert.equal(
  shouldShowSupportSurvey({
    counter: 2,
    neverAsk: false,
    completedGithub: false,
    completedStore: false,
    lastShownAt: null,
  }),
  false,
);

assert.equal(
  shouldShowSupportSurvey({
    counter: 3,
    neverAsk: true,
    completedGithub: false,
    completedStore: false,
    lastShownAt: null,
  }),
  false,
);

assert.equal(
  shouldShowSupportSurvey({
    counter: 3,
    neverAsk: false,
    completedGithub: true,
    completedStore: false,
    lastShownAt: null,
  }),
  false,
);

assert.equal(
  shouldShowSupportSurvey({
    counter: 3,
    neverAsk: false,
    completedGithub: false,
    completedStore: false,
    lastShownAt: now - SUPPORT_SURVEY_COOLDOWN_MS + 1e3,
  }),
  false,
);

assert.equal(
  shouldShowSupportSurvey({
    counter: 3,
    neverAsk: false,
    completedGithub: false,
    completedStore: false,
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
assert.ok(readFileSync(join(ext, "support-survey-page.html"), "utf8").includes("survey-root"));

const content = readFileSync(join(ext, "app/content.js"), "utf8");
assert.match(content, /SCENARIO_COMPLETE/);
assert.match(content, /sessionHadDeletion/);

console.log("support-survey smoke: ok");
