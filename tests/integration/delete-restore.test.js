"use strict";

import { runElementTransition } from "../../extension/app/highlight/delete-restore-visual.js";
import {
  RestoreSystem,
  buildDocumentChildPath,
} from "../../extension/app/restore.js";

const { assert, assertEqual, test } = TestHarness;

async function deleteElement(element, restore) {
  const parent = element.parentElement;
  if (!parent) return false;
  const snapshot = {
    parent,
    parentPath: buildDocumentChildPath(parent),
    parentTagName: parent.tagName,
    parentNs: parent.namespaceURI,
    nextSibling: element.nextSibling,
    childIndex: Array.prototype.indexOf.call(parent.children, element),
    removedElement: element,
    outerHTML: element.outerHTML,
    elementLabel: element.tagName.toLowerCase(),
  };
  await runElementTransition(element, true);
  if (!element.isConnected) return false;
  element.remove();
  restore.recordDeletion(snapshot);
  return true;
}

test("deleted element is removed from the DOM and can be restored", async () => {
  const hostElement = document.createElement("div");
  hostElement.innerHTML = '<article id="ad">Remove me</article>';
  document.body.append(hostElement);

  const target = hostElement.querySelector("#ad");
  const undo = { stack: [], allocId: (() => {
    let id = 0;
    return () => id++;
  })() };
  const restore = new RestoreSystem({ onRestored() {} }, undo);

  assert(await deleteElement(target, restore));
  assertEqual(hostElement.querySelector("#ad"), null);
  assert(restore.canUndo());

  assert(await restore.undoLast());
  const restored = hostElement.querySelector("#ad");
  assert(restored instanceof HTMLElement);
  assertEqual(restored.textContent, "Remove me");

  hostElement.remove();
});

test("multiple deletions restore in reverse deletion order", async () => {
  const hostElement = document.createElement("ul");
  hostElement.innerHTML = "<li>one</li><li>two</li><li>three</li>";
  document.body.append(hostElement);

  const items = Array.from(hostElement.querySelectorAll("li"));
  const undo = { stack: [], allocId: (() => {
    let id = 0;
    return () => id++;
  })() };
  const restore = new RestoreSystem({ onRestored() {} }, undo);

  assert(await deleteElement(items[0], restore));
  assert(await deleteElement(items[1], restore));
  assertEqual(hostElement.querySelectorAll("li").length, 1);

  assert(await restore.undoLast());
  assertEqual(hostElement.children[0].textContent, "two");
  assert(await restore.undoLast());
  assertEqual(hostElement.children[0].textContent, "one");
  assertEqual(hostElement.querySelectorAll("li").length, 3);

  hostElement.remove();
});
