/**
 * Smoke: page operability probe + notice assets (no browser APIs).
 * Run: node scripts/smoke-page-operability.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Mirrors src/page-operability/probe.ts */
function probeDocumentOperability(document) {
  try {
    const root = document.documentElement ?? document.body;
    if (!root) return false;
    const probe = document.createElement("div");
    probe.style.display = "none";
    root.appendChild(probe);
    const ok = probe.isConnected;
    probe.remove();
    return ok;
  } catch {
    return false;
  }
}

const constantsSrc = readFileSync(
  join(root, "src/page-operability/constants.ts"),
  "utf8",
);
assert.match(constantsSrc, /blocked-notice\.html/);
assert.match(constantsSrc, /restrictedNotice/);
assert.match(constantsSrc, /4000/);

const indexSrc = readFileSync(join(root, "src/page-operability/index.ts"), "utf8");
assert.match(indexSrc, /canOperateOnTab/);
assert.match(indexSrc, /showRestrictedNotice/);
assert.match(indexSrc, /probeDocumentOperability/);

const bgSrc = readFileSync(join(root, "src/background.ts"), "utf8");
assert.match(bgSrc, /from "\.\/page-operability"/);
assert.doesNotMatch(bgSrc, /function canOperateOnTab/);
assert.doesNotMatch(bgSrc, /function showRestrictedNotice/);

const noticeHtml = readFileSync(join(root, "blocked-notice.html"), "utf8");
assert.match(noticeHtml, /blocked-notice\.js/);
assert.match(noticeHtml, /id="msg"/);

const noticeJs = readFileSync(join(root, "blocked-notice.js"), "utf8");
assert.match(noticeJs, /restrictedNotice/);

const docOk = { documentElement: {}, body: null, createElement() {
  return { style: {}, isConnected: true, remove() {} };
} };
docOk.documentElement = docOk.body = {
  appendChild(el) {
    el.isConnected = true;
  },
};
assert.equal(probeDocumentOperability(docOk), true);

const docBlocked = {
  documentElement: {
    appendChild() {
      throw new Error("Permission denied");
    },
  },
  body: null,
  createElement() {
    return { style: {}, isConnected: false, remove() {} };
  },
};
assert.equal(probeDocumentOperability(docBlocked), false);

console.log("smoke-page-operability: ok");
