"use strict";

import { createSupportSurveyLogic } from "../../extension/lib/our/support-survey/logic.js";
import {
  SUPPORT_SURVEY_THRESHOLD,
  SUPPORT_SURVEY_COOLDOWN_MS,
} from "../../extension/app/support-survey/constants.js";

const { assert, assertEqual, test } = TestHarness;

function installRuntimeGlobals({ getURL, userAgent, platform = "Win32" }) {
  const runtime = { getURL };
  const storage = {
    local: {
      async get() {
        return {};
      },
      async set() {},
    },
  };
  globalThis.chrome = { runtime, storage };
  globalThis.browser = { runtime, storage };
  Object.defineProperty(globalThis, "navigator", {
    value: { userAgent, platform },
    configurable: true,
  });
}

installRuntimeGlobals({
  getURL: (path) => `chrome-extension://addon-id${path}`,
  userAgent: "Mozilla/5.0 Chrome/126.0.0.0",
});

const {
  normalizeSupportSurveyState,
  shouldShowSupportSurvey,
} = await import("../../extension/app/support-survey/state.js");

const survey = createSupportSurveyLogic({
  threshold: SUPPORT_SURVEY_THRESHOLD,
  cooldownMs: SUPPORT_SURVEY_COOLDOWN_MS,
});

test("support survey threshold constant matches spec default of 25", () => {
  assertEqual(SUPPORT_SURVEY_THRESHOLD, 25);
});

test("support survey appears on threshold crossing, then respects cooldown and next anchor", () => {
  const now = 1_800_000_000_000;
  const reachedThreshold = survey.addSuccessfulActions(survey.createDefaultState(), 25);
  assert(survey.canShow(reachedThreshold, now));

  const shown = survey.markShown(reachedThreshold, now);
  assert(!survey.canShow(shown, now + 59 * 24 * 60 * 60 * 1000));

  const deferred = survey.defer(shown);
  const beforeNextThreshold = survey.addSuccessfulActions(deferred, 24);
  assert(!survey.canShow(beforeNextThreshold, now + 61 * 24 * 60 * 60 * 1000));
  const nextThreshold = survey.addSuccessfulActions(beforeNextThreshold);
  assert(survey.canShow(nextThreshold, now + 61 * 24 * 60 * 60 * 1000));
});

test("support survey safely normalizes damaged stored state without resurrecting invalid counters", () => {
  const normalized = survey.normalizeState({
    actionCount: -8,
    actionCountAtLastDeferral: 500,
    neverAsk: "yes",
    completed: 1,
    lastShownAt: Infinity,
  });

  assertEqual(normalized.actionCount, 0);
  assertEqual(normalized.actionCountAtLastDeferral, 0);
  assertEqual(normalized.neverAsk, false);
  assertEqual(normalized.completed, false);
  assertEqual(normalized.lastShownAt, null);
});

test("Never ask and completed choices permanently prevent future survey display", () => {
  const eligible = survey.addSuccessfulActions(survey.createDefaultState(), 25);
  assert(!survey.canShow(survey.disableForever(eligible), Date.now()));
  assert(!survey.canShow(survey.markCompleted(eligible), Date.now()));
});

test("element deleter normalizes legacy completed flags into completed survey state", () => {
  const fromGithub = normalizeSupportSurveyState({ completedGithub: true });
  assertEqual(fromGithub.completed, true);

  const fromStore = normalizeSupportSurveyState({ completedStore: true });
  assertEqual(fromStore.completed, true);
});

test("shouldShowSupportSurvey delegates to shared logic with normalized state", () => {
  const now = Date.now();
  assert(
    shouldShowSupportSurvey({
      actionCount: 25,
      actionCountAtLastDeferral: 0,
      neverAsk: false,
      completed: false,
      lastShownAt: null,
    }),
  );
  assertEqual(
    shouldShowSupportSurvey({
      actionCount: 24,
      actionCountAtLastDeferral: 0,
      neverAsk: false,
      completed: false,
      lastShownAt: null,
    }),
    false,
  );
  assertEqual(
    shouldShowSupportSurvey({
      actionCount: 25,
      actionCountAtLastDeferral: 0,
      neverAsk: true,
      completed: false,
      lastShownAt: null,
    }),
    false,
  );
  assertEqual(
    shouldShowSupportSurvey({
      actionCount: 25,
      actionCountAtLastDeferral: 0,
      neverAsk: false,
      completed: false,
      lastShownAt: now - SUPPORT_SURVEY_COOLDOWN_MS + 1000,
    }),
    false,
  );
  assert(
    shouldShowSupportSurvey({
      actionCount: 25,
      actionCountAtLastDeferral: 0,
      neverAsk: false,
      completed: false,
      lastShownAt: now - SUPPORT_SURVEY_COOLDOWN_MS - 1000,
    }),
  );
});
