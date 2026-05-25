/**
 * Smoke: extension toolbar icon state module (structure, no browser APIs).
 * Run: node scripts/smoke-extension-icon-state.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const indexSrc = readFileSync(
  join(root, "src/extension-icon-state/index.ts"),
  "utf8",
);
assert.match(indexSrc, /getTabActiveState/);
assert.match(indexSrc, /setTabActiveState/);
assert.match(indexSrc, /syncIconForTab/);
assert.match(indexSrc, /bootstrapToolbarIcons/);
assert.match(indexSrc, /registerExtensionIconStateListeners/);
assert.match(indexSrc, /onContentActiveChanged/);

const iconSyncSrc = readFileSync(
  join(root, "src/extension-icon-state/icon-sync.ts"),
  "utf8",
);
assert.match(iconSyncSrc, /TOOLBAR_ICON_PATHS/);
assert.match(iconSyncSrc, /getToolbarIconSets/);
assert.match(iconSyncSrc, /iconSyncedTabIds/);

const listenersSrc = readFileSync(
  join(root, "src/extension-icon-state/listeners.ts"),
  "utf8",
);
assert.match(listenersSrc, /onActivated/);
assert.match(listenersSrc, /onUpdated/);
assert.match(listenersSrc, /onRemoved/);

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
const toolbarActive = readFileSync(join(root, "icons/toolbar-active.svg"), "utf8");
assert.match(toolbarInactive, /<svg/);
assert.match(toolbarActive, /<svg/);

console.log("smoke-extension-icon-state: ok");
