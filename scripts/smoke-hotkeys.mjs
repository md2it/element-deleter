/**
 * Smoke: lib hotkeys + element-deleter wiring (no browser APIs).
 * Run: node scripts/smoke-hotkeys.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runSmokeHotkeysCore } from "../../lib/scripts/smoke-hotkeys-core.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

runSmokeHotkeysCore();

const deleterKeysSrc = readFileSync(join(root, "src/hotkeys/keys.ts"), "utf8");
assert.match(deleterKeysSrc, /formatPrefixChordLabel/);
assert.match(deleterKeysSrc, /getStartHotkeyChordLabel/);
assert.match(deleterKeysSrc, /getStartHotkeyActionLabel/);
assert.match(deleterKeysSrc, /PREFIX_ACTION_KEY/);

const deleterRegistrySrc = readFileSync(join(root, "src/hotkeys/registry.ts"), "utf8");
assert.match(deleterRegistrySrc, /registerLibContentHotkey/);
assert.match(deleterRegistrySrc, /unregisterLibContentHotkey/);
assert.match(deleterRegistrySrc, /elementDeleter/);

const libRegistrySrc = readFileSync(
  join(root, "../lib/src/hotkeys/registry.ts"),
  "utf8",
);
assert.match(libRegistrySrc, /unregisterContentHotkey/);

const deleterBackgroundSrc = readFileSync(join(root, "src/hotkeys/background.ts"), "utf8");
assert.match(deleterBackgroundSrc, /registerPrefixBackgroundHotkeys/);
assert.doesNotMatch(deleterBackgroundSrc, /prefixCommands/);
assert.doesNotMatch(deleterBackgroundSrc, /PREFIX_ARM_TOGGLE/);
assert.match(deleterBackgroundSrc, /DELETER_ACTIVE_COLOR/);
assert.match(deleterBackgroundSrc, /badgeBackgroundColor/);
assert.match(deleterBackgroundSrc, /TOGGLE_REQUEST/);
assert.doesNotMatch(deleterBackgroundSrc, /undoCommand/);
assert.doesNotMatch(deleterBackgroundSrc, /isUndoCommandEnabled/);
assert.doesNotMatch(deleterBackgroundSrc, /registerManifestCommandHotkeys/);

const deleterBgSrc = readFileSync(join(root, "src/background.ts"), "utf8");
assert.match(deleterBgSrc, /registerPrefixHintOperabilityListeners/);
assert.match(deleterBgSrc, /canShowPrefixBadgeOnTab/);
assert.doesNotMatch(deleterBgSrc, /registerBackgroundHotkeys\([\s\S]*canShowPrefixHintOnTab/);

const prefixBackgroundSrc = readFileSync(
  join(root, "../lib/src/hotkeys/prefix-background.ts"),
  "utf8",
);
assert.match(prefixBackgroundSrc, /registerPrefixBackgroundHotkeys/);
assert.doesNotMatch(prefixBackgroundSrc, /prefixCommands/);
assert.match(prefixBackgroundSrc, /isUndoCommandEnabled/);

const deleterContentSrc = readFileSync(join(root, "src/hotkeys/deleter-content.ts"), "utf8");
assert.match(deleterContentSrc, /registerPrefixStartHotkey/);
assert.match(deleterContentSrc, /queryPrefixHintCanShowInContent/);
assert.doesNotMatch(deleterContentSrc, /queryPrefixHintCanShowFromBackground/);
assert.doesNotMatch(deleterContentSrc, /armDeleterPrefixToggle/);
assert.match(deleterContentSrc, /if \(!host\.isActive\(\)\) return/);
assert.match(deleterContentSrc, /mountDeleterContentHotkeys/);
assert.match(deleterContentSrc, /unmountDeleterContentHotkeys/);
assert.match(deleterContentSrc, /window\.top !== window/);

const contentSrc = readFileSync(join(root, "src/content.ts"), "utf8");
assert.match(contentSrc, /mountDeleterContentHotkeys/);
assert.match(contentSrc, /unmountDeleterContentHotkeys/);
assert.doesNotMatch(contentSrc, /PREFIX_ARM_TOGGLE/);

const commandsSrc = readFileSync(join(root, "src/hotkeys/commands.ts"), "utf8");
assert.match(commandsSrc, /activate-deactivate/);
assert.match(commandsSrc, /_execute_action/);
assert.doesNotMatch(commandsSrc, /undo-delete/);

const manifestSrc = readFileSync(join(root, "manifest.json"), "utf8");
assert.match(manifestSrc, /"_execute_action"/);
assert.match(manifestSrc, /"activate-deactivate"/);
assert.match(manifestSrc, /__MSG_commandToggleDelete__/);
assert.match(manifestSrc, /"undo-delete"/);
assert.match(manifestSrc, /__MSG_commandUndoDelete__/);
const undoDeleteBlock = manifestSrc.match(/"undo-delete"\s*:\s*\{([^}]*)\}/);
assert.ok(undoDeleteBlock, "undo-delete command block");
assert.doesNotMatch(undoDeleteBlock[1], /suggested_key/);
assert.doesNotMatch(manifestSrc, /Ctrl\+Z/);
assert.doesNotMatch(manifestSrc, /Command\+Z/);
assert.doesNotMatch(manifestSrc, /suggested_key/);

console.log("smoke-hotkeys: ok");
