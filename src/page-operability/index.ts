export {
  RESTRICTED_NOTICE_CONFIG,
  RESTRICTED_NOTICE_MIN_MS,
  RESTRICTED_NOTICE_POPUP,
  RESTRICTED_NOTICE_SESSION_KEY,
} from "./constants";
export {
  canOperateOnTab,
  probeDocumentOperability,
  showBlockedNotice,
  type BlockedNoticeConfig,
  type BlockedNoticePayload,
} from "../../../SHARED/src/page-operability";
export {
  refreshRestrictedNoticeCache,
  showRestrictedNotice,
  type RestrictedNoticePayload,
} from "./notice";
