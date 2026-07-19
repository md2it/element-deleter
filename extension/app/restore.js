import { runElementTransition } from "./highlight/delete-restore-visual.js";

function buildDocumentChildPath(element) {
  const path = [];
  let node = element;
  while (node.parentElement) {
    path.unshift(
      Array.prototype.indexOf.call(node.parentElement.children, node),
    );
    node = node.parentElement;
  }
  return path;
}
function findElementByDocumentChildPath(path) {
  if (path.length === 0) return null;
  let node = document.documentElement;
  for (const index of path) {
    if (index < 0 || index >= node.children.length) return null;
    node = node.children[index];
  }
  return node;
}
function parentMatchesEntry(el, entry) {
  return (
    el.tagName === entry.parentTagName && el.namespaceURI === entry.parentNs
  );
}
function resolveUndoEntryParent(entry) {
  if (entry.parent.isConnected) return entry.parent;
  const resolved = findElementByDocumentChildPath(entry.parentPath);
  if (resolved?.isConnected && parentMatchesEntry(resolved, entry)) {
    entry.parent = resolved;
    entry.parentPath = buildDocumentChildPath(resolved);
    return resolved;
  }
  return null;
}
function getChildIndexPath(ancestor, descendant) {
  const path = [];
  let node = descendant;
  while (node && node !== ancestor) {
    const parent = node.parentElement;
    if (!parent) return null;
    const index = Array.prototype.indexOf.call(parent.children, node);
    if (index < 0) return null;
    path.unshift(index);
    node = parent;
  }
  if (node !== ancestor) return null;
  return path;
}
function findElementByChildIndexPath(root, path) {
  let node = root;
  for (const index of path) {
    if (index < 0 || index >= node.children.length) return null;
    node = node.children[index];
  }
  return node;
}
function parseElementForInsertion(outerHTML, parent) {
  const svgNS = "http://www.w3.org/2000/svg";
  if (parent.namespaceURI === svgNS) {
    const tmp = document.createElementNS(svgNS, "g");
    tmp.innerHTML = outerHTML;
    return tmp.firstElementChild;
  }
  const wrap = document.createElement("div");
  wrap.innerHTML = outerHTML;
  return wrap.firstElementChild;
}
var RestoreSystem = class {
  constructor(host, undo) {
    this.host = host;
    this.undo = undo;
  }
  canUndo() {
    return this.undo.stack.some(
      (entry) => resolveUndoEntryParent(entry) !== null,
    );
  }
  recordDeletion(snapshot) {
    const entry = {
      id: this.undo.allocId(),
      ...snapshot,
    };
    this.undo.stack.push(entry);
    return entry.id;
  }
  async undoLast() {
    while (this.undo.stack.length > 0) {
      const entry = this.undo.stack.at(-1);
      if (!resolveUndoEntryParent(entry)) {
        this.undo.stack.pop();
        continue;
      }
      const ok = await this.restoreEntry(entry);
      if (ok) this.undo.stack.pop();
      return ok;
    }
    return false;
  }
  async undoById(id) {
    const index = this.undo.stack.findIndex((entry2) => entry2.id === id);
    if (index === -1) return false;
    const entry = this.undo.stack[index];
    const ok = await this.restoreEntry(entry);
    if (ok) this.undo.stack.splice(index, 1);
    return ok;
  }
  insertRestoredElement(entry, restored) {
    if (
      entry.nextSibling?.isConnected &&
      entry.nextSibling.parentNode === entry.parent
    ) {
      entry.parent.insertBefore(restored, entry.nextSibling);
      return;
    }
    const { children } = entry.parent;
    if (entry.childIndex >= 0 && entry.childIndex < children.length) {
      entry.parent.insertBefore(restored, children[entry.childIndex] ?? null);
      return;
    }
    entry.parent.appendChild(restored);
  }
  remapSubtreeUndoParents(removedRoot, restoredRoot) {
    for (const other of this.undo.stack) {
      if (other.parent === removedRoot) {
        other.parent = restoredRoot;
        other.parentPath = buildDocumentChildPath(restoredRoot);
        continue;
      }
      if (!removedRoot.contains(other.parent)) continue;
      const path = getChildIndexPath(removedRoot, other.parent);
      if (!path) continue;
      const mapped = findElementByChildIndexPath(restoredRoot, path);
      if (
        mapped &&
        mapped.tagName === other.parent.tagName &&
        mapped.namespaceURI === other.parent.namespaceURI
      ) {
        other.parent = mapped;
        other.parentPath = buildDocumentChildPath(mapped);
      }
    }
  }
  async restoreEntry(entry) {
    if (!resolveUndoEntryParent(entry)) return false;
    const restored = parseElementForInsertion(entry.outerHTML, entry.parent);
    if (!restored) return false;
    try {
      restored.classList.add("dd-restore-anim", "is-out");
      this.insertRestoredElement(entry, restored);
      this.remapSubtreeUndoParents(entry.removedElement, restored);
      await runElementTransition(restored, false);
      restored.classList.remove("dd-restore-anim", "is-out");
      this.host.onRestored(restored);
      return true;
    } catch {
      restored.classList.remove("dd-restore-anim", "is-out");
      return restored.isConnected;
    }
  }
};

export { buildDocumentChildPath, findElementByDocumentChildPath, parentMatchesEntry, resolveUndoEntryParent, getChildIndexPath, findElementByChildIndexPath, parseElementForInsertion, RestoreSystem };
