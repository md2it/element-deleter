"use strict";

import {
  RestoreSystem,
  parseElementForInsertion,
  buildDocumentChildPath,
  findElementByDocumentChildPath,
} from "../../extension/app/restore.js";

const { assert, assertEqual, test } = TestHarness;

function createHost() {
  const restored = [];
  return {
    host: {
      onRestored(element) {
        restored.push(element);
      },
    },
    restored,
  };
}

function createSnapshot(element) {
  const parent = element.parentElement;
  return {
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
}

test("parseElementForInsertion rebuilds a removed element from outerHTML", () => {
  const container = document.createElement("div");
  container.innerHTML = '<span class="target" data-id="1">Hello</span>';
  const original = container.firstElementChild;
  const restored = parseElementForInsertion(original.outerHTML, container);
  assert(restored instanceof HTMLElement);
  assertEqual(restored.tagName, "SPAN");
  assertEqual(restored.className, "target");
  assertEqual(restored.textContent, "Hello");
});

test("restore system undoes the last deletion in reverse order", async () => {
  const container = document.createElement("div");
  container.innerHTML = "<p>first</p><p>second</p><p>third</p>";
  document.body.append(container);

  const first = container.children[0];
  const second = container.children[1];
  const { host, restored } = createHost();
  const undo = { stack: [], allocId: (() => {
    let id = 0;
    return () => id++;
  })() };
  const restore = new RestoreSystem(host, undo);

  const firstSnapshot = createSnapshot(first);
  first.remove();
  restore.recordDeletion(firstSnapshot);
  const secondSnapshot = createSnapshot(second);
  second.remove();
  restore.recordDeletion(secondSnapshot);

  assertEqual(container.querySelectorAll("p").length, 1);
  assert(restore.canUndo());

  assert(await restore.undoLast());
  assertEqual(container.querySelectorAll("p").length, 2);
  assertEqual(container.children[0].textContent, "second");

  assert(await restore.undoLast());
  assertEqual(container.querySelectorAll("p").length, 3);
  assertEqual(container.children[0].textContent, "first");
  assertEqual(restored.length, 2);

  container.remove();
});

test("restore system drops undo entries when the parent node is gone", async () => {
  const wrapper = document.createElement("div");
  const child = document.createElement("span");
  child.textContent = "gone";
  wrapper.append(child);
  document.body.append(wrapper);

  const { host } = createHost();
  const undo = { stack: [], allocId: () => 0 };
  const restore = new RestoreSystem(host, undo);
  const snapshot = createSnapshot(child);
  child.remove();
  restore.recordDeletion(snapshot);
  wrapper.remove();

  assertEqual(await restore.undoLast(), false);
  assertEqual(undo.stack.length, 0);
});

test("document child path resolves a parent after DOM changes", () => {
  const root = document.createElement("section");
  root.innerHTML = "<div><article><b>leaf</b></article></div>";
  document.body.append(root);

  const leaf = root.querySelector("b");
  const path = buildDocumentChildPath(leaf);
  const resolved = findElementByDocumentChildPath(path);
  assertEqual(resolved, leaf);

  root.remove();
});
