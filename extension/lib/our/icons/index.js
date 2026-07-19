"use strict";
// ../lib/icons/index.ts
function stripComment(svg) {
  return svg.replace(/<!--[\s\S]*?-->\s*/g, "").trim();
}
function lucideUiIcon(raw) {
  return stripComment(raw);
}
var ARROW_UP = lucideUiIcon(arrow_up_default);
var CIRCLE_POWER = lucideUiIcon(circle_power_default);
var COG = lucideUiIcon(cog_default);
var COPY = lucideUiIcon(copy_default);
var EXTERNAL_LINK = lucideUiIcon(external_link_default);
var FILE_DOWN = lucideUiIcon(file_down_default);
var FILES = lucideUiIcon(files_default);
var IMAGE_DOWN = lucideUiIcon(image_down_default);
var IMAGES = lucideUiIcon(images_default);
var HEART = lucideUiIcon(heart_default);
var HISTORY = lucideUiIcon(history_default);
var INFO = lucideUiIcon(info_default);
var KEYBOARD = lucideUiIcon(keyboard_default);
var SETTINGS = lucideUiIcon(settings_default);
var SHIELD_CHECK = lucideUiIcon(shield_check_default);
var PIN = lucideUiIcon(pin_default);
var PLAY = lucideUiIcon(play_default);
var PUZZLE = lucideUiIcon(puzzle_default);
var ROTATE_CW = lucideUiIcon(rotate_cw_default);

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.stripComment = stripComment;
globalThis.lucideUiIcon = lucideUiIcon;
globalThis.ARROW_UP = ARROW_UP;
globalThis.CIRCLE_POWER = CIRCLE_POWER;
globalThis.COG = COG;
globalThis.COPY = COPY;
globalThis.EXTERNAL_LINK = EXTERNAL_LINK;
globalThis.FILE_DOWN = FILE_DOWN;
globalThis.FILES = FILES;
globalThis.IMAGE_DOWN = IMAGE_DOWN;
globalThis.IMAGES = IMAGES;
globalThis.HEART = HEART;
globalThis.HISTORY = HISTORY;
globalThis.INFO = INFO;
globalThis.KEYBOARD = KEYBOARD;
globalThis.SETTINGS = SETTINGS;
globalThis.SHIELD_CHECK = SHIELD_CHECK;
globalThis.PIN = PIN;
globalThis.PLAY = PLAY;
globalThis.PUZZLE = PUZZLE;
globalThis.ROTATE_CW = ROTATE_CW;
