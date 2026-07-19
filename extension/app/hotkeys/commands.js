"use strict";
var PREFIX_ACTION_KEY = "D";
var DELETER_ACTIVE_COLOR = "#b91c1c";

/* background-module-bridge */
// Exposes this file's top-level bindings on globalThis so other classic-style
// modules in extension/app/background/main.js's import graph can keep referring
// to them as bare identifiers, exactly as they could when this file was loaded
// via a shared classic script / importScripts context. No-op change for the
// existing classic-script content-script loading of this same file.
globalThis.PREFIX_ACTION_KEY = PREFIX_ACTION_KEY;
globalThis.DELETER_ACTIVE_COLOR = DELETER_ACTIVE_COLOR;
