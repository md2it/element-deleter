/**
 * Smoke: SHARED hotkeys + element-deleter wiring (no browser APIs).
 * Run: node scripts/smoke-hotkeys.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runSmokeHotkeysCore } from "../../SHARED/scripts/smoke-hotkeys-core.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

runSmokeHotkeysCore();

const deleterKeysSrc = readFileSync(join(root, "src/hotkeys/keys.ts"), "utf8");
assert.match(deleterKeysSrc, /formatPrefixChordLabel/);
assert.match(deleterKeysSrc, /getStartHotkeyChordLabel/);
assert.match(deleterKeysSrc, /getStartHotkeyActionLabel/);
assert.match(deleterKeysSrc, /PREFIX_ACTION_KEY/);

const deleterRegistrySrc = readFileSync(join(root, "src/hotkeys/registry.ts"), "utf8");
assert.match(deleterRegistrySrc, /registerSharedContentHotkey/);
assert.match(deleterRegistrySrc, /elementDeleter/);

const deleterBackgroundSrc = readFileSync(join(root, "src/hotkeys/background.ts"), "utf8");
assert.match(deleterBackgroundSrc, /registerPrefixManifestHotkeys/);
assert.match(deleterBackgroundSrc, /prefixCommands:\s*\[COMMAND_TOGGLE_DELETE\]/);
assert.match(deleterBackgroundSrc, /DELETER_ACTIVE_COLOR/);
assert.match(deleterBackgroundSrc, /badgeBackgroundColor/);
assert.match(deleterBackgroundSrc, /PREFIX_ARM_TOGGLE/);
assert.match(deleterBackgroundSrc, /TOGGLE_REQUEST/);
assert.doesNotMatch(deleterBackgroundSrc, /registerManifestCommandHotkeys/);

const commandsSrc = readFileSync(join(root, "src/hotkeys/commands.ts"), "utf8");
assert.match(commandsSrc, /toggle-delete-mode/);
assert.match(commandsSrc, /_execute_action/);
assert.match(commandsSrc, /undo-delete/);

const manifestSrc = readFileSync(join(root, "manifest.json"), "utf8");
assert.match(manifestSrc, /"_execute_action"/);
assert.match(manifestSrc, /"toggle-delete-mode"/);
assert.match(manifestSrc, /Ctrl\+Shift\+X/);

console.log("smoke-hotkeys: ok");
