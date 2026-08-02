"use strict";

import {
  createSafeExtensionApi,
  normalizeSafeExtensionApiIgnoredErrors,
  shouldIgnoreExtensionApiError,
} from "../../extension/app/safe-extension-api.js";
import { SAFE_EXTENSION_API_IGNORED_ERRORS } from "../../extension/app/safe-extension-api-rules.js";

const { assert, assertEqual, test } = TestHarness;

test("ignored errors cover closed-tab races including action.setIcon", () => {
  assert(SAFE_EXTENSION_API_IGNORED_ERRORS["action.setIcon"]);
  assert(
    SAFE_EXTENSION_API_IGNORED_ERRORS["action.setIcon"].messages.includes("No tab with id"),
  );
  assert(SAFE_EXTENSION_API_IGNORED_ERRORS["tabs.sendMessage"]);
  assert(SAFE_EXTENSION_API_IGNORED_ERRORS["action.setBadgeText"]);
});

test("shouldIgnoreExtensionApiError matches No tab with id for setIcon", () => {
  const ignored = normalizeSafeExtensionApiIgnoredErrors(SAFE_EXTENSION_API_IGNORED_ERRORS);
  assert(
    shouldIgnoreExtensionApiError(
      ignored,
      "action.setIcon",
      new Error("No tab with id: 1524190222"),
    ),
  );
  assert(
    !shouldIgnoreExtensionApiError(
      ignored,
      "action.setIcon",
      new Error("Something else failed"),
    ),
  );
});

test("createSafeExtensionApi swallows ignored chrome lastError via callback bridge", async () => {
  let lastErrorMessage = "No tab with id: 42";
  const chromeStub = {
    runtime: {
      get lastError() {
        return lastErrorMessage ? { message: lastErrorMessage } : undefined;
      },
    },
    action: {
      setIcon(_details, callback) {
        callback();
      },
    },
  };
  const previousChrome = globalThis.chrome;
  globalThis.chrome = chromeStub;
  try {
    const ext = createSafeExtensionApi(chromeStub, SAFE_EXTENSION_API_IGNORED_ERRORS);
    const result = await ext.action.setIcon({ tabId: 42, path: "/icon.png" });
    assertEqual(result, undefined);

    lastErrorMessage = "Permission denied";
    let threw = false;
    try {
      await ext.action.setIcon({ tabId: 42, path: "/icon.png" });
    } catch (err) {
      threw = true;
      assertEqual(err.message, "Permission denied");
    }
    assert(threw);
  } finally {
    globalThis.chrome = previousChrome;
  }
});
