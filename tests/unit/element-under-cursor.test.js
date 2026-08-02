"use strict";

import { pickElementUnderCursor } from "../../extension/app/element-under-cursor.js";

const { assert, assertEqual, test } = TestHarness;

function forceLayout(element) {
  void element.offsetHeight;
  return element.getBoundingClientRect();
}

function mountFixture() {
  const fixture = document.createElement("div");
  fixture.id = "cursor-fixture";
  fixture.style.cssText =
    "position:fixed;left:0;top:0;width:320px;height:240px;margin:0;padding:0;z-index:1;";
  fixture.innerHTML = `
    <div id="parent" style="position:absolute;inset:0;">
      <span id="child" style="display:block;position:absolute;left:40px;top:40px;width:80px;height:40px;background:rgb(200,200,200);">Child</span>
    </div>
  `;
  document.body.append(fixture);
  forceLayout(fixture);
  return fixture;
}

function centerOf(element) {
  const rect = forceLayout(element);
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

test("pickElementUnderCursor selects the deepest element under the pointer", () => {
  const fixture = mountFixture();
  const child = fixture.querySelector("#child");
  const point = centerOf(child);
  const picked = pickElementUnderCursor(point.x, point.y, { isOurNode: () => false });
  assertEqual(picked, child);
  fixture.remove();
});

test("pickElementUnderCursor skips extension-owned nodes", () => {
  const fixture = mountFixture();
  const child = fixture.querySelector("#child");
  const parent = fixture.querySelector("#parent");
  const point = centerOf(child);
  const picked = pickElementUnderCursor(point.x, point.y, {
    isOurNode: (node) => node === child,
  });
  assertEqual(picked, parent);
  fixture.remove();
});

test("pickElementUnderCursor prefers a significant iframe at the pointer", () => {
  const fixture = document.createElement("div");
  fixture.style.cssText = "position:fixed;left:0;top:260px;width:200px;height:120px;z-index:1;";
  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:absolute;left:10px;top:10px;width:80px;height:60px;border:0;display:block;";
  iframe.srcdoc = "<!doctype html><body>frame</body>";
  fixture.append(iframe);
  document.body.append(fixture);
  forceLayout(fixture);

  const rect = iframe.getBoundingClientRect();
  const picked = pickElementUnderCursor(rect.left + 20, rect.top + 20, {
    isOurNode: () => false,
  });
  assert(picked instanceof HTMLIFrameElement);
  assertEqual(picked, iframe);

  fixture.remove();
});
