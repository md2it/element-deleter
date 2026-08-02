"use strict";
var tabActive = /* @__PURE__ */ new Map();
export function getTabActiveState(tabId) {
  return tabActive.get(tabId) ?? false;
}
export function setTabActiveState(tabId, active) {
  tabActive.set(tabId, active);
}
export function deleteTabActiveState(tabId) {
  tabActive.delete(tabId);
}
export function clearTabActiveState(tabId) {
  tabActive.set(tabId, false);
}
export function forEachActiveTabId(fn) {
  for (const tabId of tabActive.keys()) {
    if (tabActive.get(tabId)) fn(tabId);
  }
}
