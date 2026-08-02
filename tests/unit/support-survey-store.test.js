"use strict";

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
  SUPPORT_SURVEY_CHROME_STORE_URL,
  SUPPORT_SURVEY_FIREFOX_STORE_URL,
} = await import("../../extension/app/support-survey/constants.js");
const {
  getSupportSurveyStoreUrl,
  getSupportSurveyStoreRateLabel,
} = await import("../../extension/app/support-survey/state.js");

const { assertEqual, test } = TestHarness;

test("support survey store URL resolves to Chrome listing on Chromium runtime", () => {
  installRuntimeGlobals({
    getURL: (path) => `chrome-extension://addon-id${path}`,
    userAgent: "Mozilla/5.0 Chrome/126.0.0.0",
  });
  assertEqual(getSupportSurveyStoreUrl(), SUPPORT_SURVEY_CHROME_STORE_URL);
  assertEqual(getSupportSurveyStoreRateLabel(), "Rate in Chrome web store");
});

test("support survey store URL resolves to Firefox listing on Gecko runtime", () => {
  installRuntimeGlobals({
    getURL: (path) => `moz-extension://addon-id${path}`,
    userAgent: "Mozilla/5.0 Firefox/128.0",
  });
  assertEqual(getSupportSurveyStoreUrl(), SUPPORT_SURVEY_FIREFOX_STORE_URL);
  assertEqual(getSupportSurveyStoreRateLabel(), "Rate in Firefox store");
});
