import type { BlockedNoticeConfig } from "@lib/page-operability";

/** Popup HTML shown when the tab cannot run extension scripts. */
export const RESTRICTED_NOTICE_POPUP = "blocked-notice.html";

/** Minimum notice visibility when notification duration is disabled (0 s). */
export const RESTRICTED_NOTICE_MIN_MS = 4000;

export const RESTRICTED_NOTICE_SESSION_KEY = "restrictedNotice";

export const RESTRICTED_NOTICE_CONFIG: BlockedNoticeConfig = {
  popupHtml: RESTRICTED_NOTICE_POPUP,
  sessionKey: RESTRICTED_NOTICE_SESSION_KEY,
  logLabel: "Element Deleter",
};
