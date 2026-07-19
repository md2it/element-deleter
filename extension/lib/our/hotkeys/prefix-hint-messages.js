"use strict";
var PREFIX_HINT_SHOW = "PREFIX_HINT_SHOW";
var PREFIX_HINT_HIDE = "PREFIX_HINT_HIDE";
var PREFIX_HINT_BLOCKED = "PREFIX_HINT_BLOCKED";
var PREFIX_HINT_CAN_SHOW = "PREFIX_HINT_CAN_SHOW";
function isPrefixHintShowMessage(msg) {
  return msg.type === PREFIX_HINT_SHOW;
}
function isPrefixHintHideMessage(msg) {
  return msg.type === PREFIX_HINT_HIDE;
}

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.PREFIX_HINT_SHOW = PREFIX_HINT_SHOW;
globalThis.PREFIX_HINT_HIDE = PREFIX_HINT_HIDE;
globalThis.PREFIX_HINT_BLOCKED = PREFIX_HINT_BLOCKED;
globalThis.PREFIX_HINT_CAN_SHOW = PREFIX_HINT_CAN_SHOW;
globalThis.isPrefixHintShowMessage = isPrefixHintShowMessage;
globalThis.isPrefixHintHideMessage = isPrefixHintHideMessage;
