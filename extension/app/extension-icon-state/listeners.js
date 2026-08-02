import { ext } from "../api.js";
import { clearTabActiveState, deleteTabActiveState, setTabActiveState } from "./tab-active-state.js";

export function registerExtensionIconStateListeners(sync) {
  ext.tabs.onRemoved.addListener((tabId) => {
    deleteTabActiveState(tabId);
    void sync.forgetIconSyncedTab(tabId);
  });
  ext.tabs.onActivated.addListener(({ tabId }) => {
    void sync.syncIconForTab(tabId);
  });
  ext.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === "loading" || changeInfo.url !== void 0) {
      clearTabActiveState(tabId);
    }
    if (changeInfo.url === void 0 && changeInfo.status !== "complete") {
      return;
    }
    void sync.syncIconForTab(tabId);
  });
}
export function onContentActiveChanged(sync, tabId, active) {
  setTabActiveState(tabId, active);
  void sync.syncIconForTab(tabId);
}
