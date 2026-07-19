"use strict";
import { createExtensionIconState } from "../../lib/our/extension-icon-state/create.js";
import { TOOLBAR_ICON_PATHS } from "../icon-paths.js";
import { ICON_SYNCED_TAB_IDS_KEY, ICON_STATE_LOG_LABEL } from "./constants.js";

export var iconState = createExtensionIconState({
  paths: TOOLBAR_ICON_PATHS,
  syncedTabIdsStorageKey: ICON_SYNCED_TAB_IDS_KEY,
  logLabel: ICON_STATE_LOG_LABEL,
});
export var {
  bootstrapToolbarIcons,
  forgetIconSyncedTab,
  onContentActiveChanged: onContentActiveChanged2,
  registerExtensionIconStateListeners: registerExtensionIconStateListeners2,
  setGlobalToolbarIcon,
  syncIconForTab,
} = iconState;
