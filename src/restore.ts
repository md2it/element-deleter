import { ensurePageHighlightStyles } from "./highlight-visual";

const ELEMENT_ANIM_MS = 200;

export type UndoEntry = {
  id: number;
  parent: Element;
  parentPath: number[];
  parentTagName: string;
  parentNs: string | null;
  nextSibling: ChildNode | null;
  childIndex: number;
  removedElement: Element;
  outerHTML: string;
  elementLabel: string;
};

export type DeletionSnapshot = {
  parent: Element;
  parentPath: number[];
  parentTagName: string;
  parentNs: string | null;
  nextSibling: ChildNode | null;
  childIndex: number;
  removedElement: Element;
  outerHTML: string;
  elementLabel: string;
};

export type RestoreHost = {
  onRestored: (elementLabel: string) => void;
};

export type UndoStackAccess = {
  stack: UndoEntry[];
  allocId: () => number;
};

export function buildDocumentChildPath(element: Element): number[] {
  const path: number[] = [];
  let node: Element | null = element;
  while (node.parentElement) {
    path.unshift(
      Array.prototype.indexOf.call(node.parentElement.children, node),
    );
    node = node.parentElement;
  }
  return path;
}

function findElementByDocumentChildPath(
  path: readonly number[],
): Element | null {
  if (path.length === 0) return null;
  let node: Element = document.documentElement;
  for (const index of path) {
    if (index < 0 || index >= node.children.length) return null;
    node = node.children[index]!;
  }
  return node;
}

function parentMatchesEntry(el: Element, entry: UndoEntry): boolean {
  return el.tagName === entry.parentTagName && el.namespaceURI === entry.parentNs;
}

export function resolveUndoEntryParent(entry: UndoEntry): Element | null {
  if (entry.parent.isConnected) return entry.parent;
  const resolved = findElementByDocumentChildPath(entry.parentPath);
  if (resolved?.isConnected && parentMatchesEntry(resolved, entry)) {
    entry.parent = resolved;
    entry.parentPath = buildDocumentChildPath(resolved);
    return resolved;
  }
  return null;
}

function getChildIndexPath(
  ancestor: Element,
  descendant: Element,
): number[] | null {
  const path: number[] = [];
  let node: Element | null = descendant;
  while (node && node !== ancestor) {
    const parent: Element | null = node.parentElement;
    if (!parent) return null;
    const index = Array.prototype.indexOf.call(parent.children, node);
    if (index < 0) return null;
    path.unshift(index);
    node = parent;
  }
  if (node !== ancestor) return null;
  return path;
}

function findElementByChildIndexPath(
  root: Element,
  path: readonly number[],
): Element | null {
  let node: Element = root;
  for (const index of path) {
    if (index < 0 || index >= node.children.length) return null;
    node = node.children[index]!;
  }
  return node;
}

export function runElementTransition(el: Element, out: boolean): Promise<void> {
  const node = el as HTMLElement;
  const animClass = out ? "dd-delete-anim" : "dd-restore-anim";
  if (out && node === document.activeElement) {
    node.blur();
  }
  node.classList.add(animClass);
  if (out) {
    void node.offsetWidth;
    node.classList.add("is-out");
  } else {
    void node.offsetWidth;
    node.classList.remove("is-out");
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (): void => {
      if (settled) return;
      settled = true;
      node.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(timeoutId);
      if (!out) {
        node.classList.remove("dd-restore-anim", "is-out");
      }
      resolve();
    };

    const onTransitionEnd = (event: TransitionEvent): void => {
      if (event.target !== node) return;
      if (
        event.propertyName !== "opacity" &&
        event.propertyName !== "transform"
      ) {
        return;
      }
      finish();
    };

    node.addEventListener("transitionend", onTransitionEnd);
    const timeoutId = window.setTimeout(finish, ELEMENT_ANIM_MS + 75);
  });
}

function parseElementForInsertion(outerHTML: string, parent: Element): Element | null {
  const svgNS = "http://www.w3.org/2000/svg";
  if (parent.namespaceURI === svgNS) {
    const tmp = document.createElementNS(svgNS, "g") as SVGGElement;
    tmp.innerHTML = outerHTML;
    return tmp.firstElementChild;
  }
  const wrap = document.createElement("div");
  wrap.innerHTML = outerHTML;
  return wrap.firstElementChild;
}

export class RestoreSystem {
  constructor(
    private readonly host: RestoreHost,
    private readonly undo: UndoStackAccess,
  ) {}

  canUndo(): boolean {
    return this.undo.stack.some((entry) => resolveUndoEntryParent(entry) !== null);
  }

  recordDeletion(snapshot: DeletionSnapshot): number {
    const entry: UndoEntry = {
      id: this.undo.allocId(),
      ...snapshot,
    };
    this.undo.stack.push(entry);
    return entry.id;
  }

  async undoLast(): Promise<boolean> {
    while (this.undo.stack.length > 0) {
      const entry = this.undo.stack.at(-1)!;
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

  async undoById(id: number): Promise<boolean> {
    const index = this.undo.stack.findIndex((entry) => entry.id === id);
    if (index === -1) return false;
    const entry = this.undo.stack[index];
    const ok = await this.restoreEntry(entry);
    if (ok) this.undo.stack.splice(index, 1);
    return ok;
  }

  private insertRestoredElement(entry: UndoEntry, restored: Element): void {
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

  private remapSubtreeUndoParents(
    removedRoot: Element,
    restoredRoot: Element,
  ): void {
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

  private async restoreEntry(entry: UndoEntry): Promise<boolean> {
    if (!resolveUndoEntryParent(entry)) return false;

    ensurePageHighlightStyles();

    const restored = parseElementForInsertion(entry.outerHTML, entry.parent);
    if (!restored) return false;

    try {
      restored.classList.add("dd-restore-anim", "is-out");
      this.insertRestoredElement(entry, restored);
      this.remapSubtreeUndoParents(entry.removedElement, restored);
      await runElementTransition(restored, false);
      restored.classList.remove("dd-restore-anim", "is-out");
      this.host.onRestored(entry.elementLabel);
      return true;
    } catch {
      restored.classList.remove("dd-restore-anim", "is-out");
      return restored.isConnected;
    }
  }
}
