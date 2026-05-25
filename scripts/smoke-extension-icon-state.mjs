/**
 * Smoke: extension toolbar icon state (SHARED generic + deleter wiring).
 * Run: node scripts/smoke-extension-icon-state.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sharedRoot = join(root, "../SHARED");

const sharedIndexSrc = readFileSync(
  join(sharedRoot, "src/extension-icon-state/index.ts"),
  "utf8",
);
assert.match(sharedIndexSrc, /createExtensionIconState/);
assert.match(sharedIndexSrc, /getTabActiveState/);
assert.match(sharedIndexSrc, /createIconSync/);
assert.match(sharedIndexSrc, /registerExtensionIconStateListeners/);

const sharedIconSyncSrc = readFileSync(
  join(sharedRoot, "src/extension-icon-state/icon-sync.ts"),
  "utf8",
);
assert.match(sharedIconSyncSrc, /syncedTabIdsStorageKey/);
assert.match(sharedIconSyncSrc, /ext\.action\.setIcon/);
assert.doesNotMatch(sharedIconSyncSrc, /TOOLBAR_ICON_PATHS/);

const sharedListenersSrc = readFileSync(
  join(sharedRoot, "src/extension-icon-state/listeners.ts"),
  "utf8",
);
assert.match(sharedListenersSrc, /onActivated/);
assert.match(sharedListenersSrc, /onUpdated/);
assert.match(sharedListenersSrc, /onRemoved/);

const deleterIndexSrc = readFileSync(
  join(root, "src/extension-icon-state/index.ts"),
  "utf8",
);
assert.match(deleterIndexSrc, /createExtensionIconState/);
assert.match(deleterIndexSrc, /TOOLBAR_ICON_PATHS/);
assert.match(deleterIndexSrc, /ICON_SYNCED_TAB_IDS_KEY/);
assert.match(deleterIndexSrc, /getToolbarIconSets/);
assert.match(deleterIndexSrc, /syncIconForTab/);
assert.match(deleterIndexSrc, /bootstrapToolbarIcons/);

const constantsSrc = readFileSync(
  join(root, "src/extension-icon-state/constants.ts"),
  "utf8",
);
assert.match(constantsSrc, /iconSyncedTabIds/);

const bgSrc = readFileSync(join(root, "src/background.ts"), "utf8");
assert.match(bgSrc, /from "\.\/extension-icon-state"/);
assert.doesNotMatch(bgSrc, /const tabActive/);
assert.doesNotMatch(bgSrc, /function syncTabToolbarIcon/);
assert.doesNotMatch(bgSrc, /TOOLBAR_ICON_PATHS/);
assert.match(bgSrc, /registerExtensionIconStateListeners/);
assert.match(bgSrc, /bootstrapToolbarIcons/);

const toolbarInactive = readFileSync(
  join(root, "icons/toolbar-inactive.svg"),
  "utf8",
);
const toolbarActive = readFileSync(
  join(root, "icons/toolbar-active.svg"),
  "utf8",
);
assert.match(toolbarInactive, /<svg/);
assert.match(toolbarActive, /<svg/);

console.log("smoke-extension-icon-state: ok");
