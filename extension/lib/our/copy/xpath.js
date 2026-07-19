function xpathSegment(element) {
  const tag = element.tagName.toLowerCase();
  const parent = element.parentElement;
  if (!parent) return tag;
  let sameTagCount = 0;
  for (const child of parent.children) {
    if (child.tagName === element.tagName) sameTagCount += 1;
  }
  if (sameTagCount <= 1) return tag;
  let index = 1;
  for (const child of parent.children) {
    if (child === element) break;
    if (child.tagName === element.tagName) index += 1;
  }
  return `${tag}[${index}]`;
}
function getFullXPath(element) {
  const parts = [];
  let node = element;
  while (node) {
    parts.unshift(xpathSegment(node));
    node = node.parentElement;
  }
  return `/${parts.join("/")}`;
}

export { xpathSegment, getFullXPath };
