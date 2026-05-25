/**
 * Smoke: page operability probe + notice assets (no browser APIs).
 * Run: node scripts/smoke-page-operability.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sharedOperability = join(root, "../SHARED/src/page-operability");

/** Mirrors SHARED/src/page-operability/probe.ts */
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
assert.match(constantsSrc, /RESTRICTED_NOTICE_CONFIG/);
assert.match(constantsSrc, /4000/);

const noticeSrc = readFileSync(join(root, "src/page-operability/notice.ts"), "utf8");
assert.match(noticeSrc, /showBlockedNotice/);
assert.doesNotMatch(noticeSrc, /ext\.action\.setPopup/);

const indexSrc = readFileSync(join(root, "src/page-operability/index.ts"), "utf8");
assert.match(indexSrc, /canOperateOnTab/);
assert.match(indexSrc, /showRestrictedNotice/);
assert.match(indexSrc, /probeDocumentOperability/);
assert.match(indexSrc, /showBlockedNotice/);

const sharedIndexSrc = readFileSync(join(sharedOperability, "index.ts"), "utf8");
assert.match(sharedIndexSrc, /showBlockedNotice/);
assert.match(sharedIndexSrc, /probeDocumentOperability/);

const sharedShowSrc = readFileSync(join(sharedOperability, "show-notice.ts"), "utf8");
assert.match(sharedShowSrc, /setPopup/);

const bgSrc = readFileSync(join(root, "src/background.ts"), "utf8");
assert.match(bgSrc, /from "\.\/page-operability"/);
assert.doesNotMatch(bgSrc, /function canOperateOnTab/);
assert.doesNotMatch(bgSrc, /function showRestrictedNotice/);

const noticeHtml = readFileSync(join(root, "blocked-notice.html"), "utf8");
assert.match(noticeHtml, /blocked-notice\.js/);
assert.match(noticeHtml, /id="msg"/);
assert.match(noticeHtml, /data-notice-session-key="restrictedNotice"/);

const shellHtml = readFileSync(
  join(sharedOperability, "blocked-notice-shell.html"),
  "utf8",
);
assert.match(shellHtml, /notice-page--tab/);
assert.match(shellHtml, /id="msg"/);

const noticeJs = readFileSync(join(root, "blocked-notice.js"), "utf8");
assert.match(noticeJs, /noticeSessionKey/);
assert.match(noticeJs, /restrictedNotice/);

const sharedPageJs = readFileSync(
  join(sharedOperability, "blocked-notice-page.js"),
  "utf8",
);
assert.equal(noticeJs, sharedPageJs);

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
