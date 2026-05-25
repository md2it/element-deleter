import { ext } from "../api";
import {
  clearTabActiveState,
  deleteTabActiveState,
  setTabActiveState,
} from "./tab-active-state";
import { forgetIconSyncedTab, syncIconForTab } from "./icon-sync";

export function registerExtensionIconStateListeners(): void {
  ext.tabs.onRemoved.addListener((tabId) => {
    deleteTabActiveState(tabId);
    void forgetIconSyncedTab(tabId);
  });

  ext.tabs.onActivated.addListener(({ tabId }) => {
    void syncIconForTab(tabId);
  });

  ext.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === "loading" || changeInfo.url !== undefined) {
      clearTabActiveState(tabId);
    }

    if (changeInfo.url === undefined && changeInfo.status !== "complete") {
      return;
    }

    void syncIconForTab(tabId);
  });
}

export function onContentActiveChanged(tabId: number, active: boolean): void {
  setTabActiveState(tabId, active);
  void syncIconForTab(tabId);
}
