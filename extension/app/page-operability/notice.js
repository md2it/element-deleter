"use strict";
import { RESTRICTED_NOTICE_MIN_MS, RESTRICTED_NOTICE_CONFIG } from "./constants.js";
import { showBlockedNotice } from "../../lib/our/page-operability/show-notice.js";

var restrictedNoticeCache = null;
async function restrictedNoticeDismissMs() {
  const seconds = await getNotificationSeconds();
  if (seconds <= 0) return RESTRICTED_NOTICE_MIN_MS;
  return seconds * 1e3;
}
export async function getRestrictedNoticeDismissMs() {
  return restrictedNoticeDismissMs();
}
export async function refreshRestrictedNoticeCache() {
  const [locale, dismissMs] = await Promise.all([
    getLocale(),
    restrictedNoticeDismissMs(),
  ]);
  restrictedNoticeCache = { text: t(locale).restrictedPageNotice, dismissMs };
}
export async function showRestrictedNotice(tabId, windowId) {
  if (!restrictedNoticeCache) {
    await refreshRestrictedNoticeCache();
  }
  await showBlockedNotice(
    tabId,
    RESTRICTED_NOTICE_CONFIG,
    restrictedNoticeCache,
    windowId,
  );
}
