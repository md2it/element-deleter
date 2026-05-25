import { ext } from "../api";
import { t } from "../i18n";
import { getLocale, getNotificationSeconds } from "../storage";
import {
  RESTRICTED_NOTICE_MIN_MS,
  RESTRICTED_NOTICE_POPUP,
  RESTRICTED_NOTICE_SESSION_KEY,
} from "./constants";

export type RestrictedNoticePayload = {
  text: string;
  dismissMs: number;
};

let restrictedNoticeCache: RestrictedNoticePayload | null = null;

async function restrictedNoticeDismissMs(): Promise<number> {
  const seconds = await getNotificationSeconds();
  if (seconds <= 0) return RESTRICTED_NOTICE_MIN_MS;
  return seconds * 1000;
}

export async function refreshRestrictedNoticeCache(): Promise<void> {
  const [locale, dismissMs] = await Promise.all([
    getLocale(),
    restrictedNoticeDismissMs(),
  ]);
  restrictedNoticeCache = { text: t(locale).restrictedPageNotice, dismissMs };
}

export async function showRestrictedNotice(
  tabId: number,
  windowId?: number,
): Promise<void> {
  if (!restrictedNoticeCache) {
    await refreshRestrictedNoticeCache();
  }
  const { text, dismissMs } = restrictedNoticeCache!;

  void ext.storage.session.set({
    [RESTRICTED_NOTICE_SESSION_KEY]: { text, dismissMs },
  });

  const noticeUrl = ext.runtime.getURL(RESTRICTED_NOTICE_POPUP);
  let winId = windowId;

  if (winId === undefined) {
    try {
      const tab = await ext.tabs.get(tabId);
      winId = tab.windowId;
    } catch {
      /* tab may be gone */
    }
  }

  try {
    await ext.action.setPopup({ tabId, popup: RESTRICTED_NOTICE_POPUP });
    const openPopup = (
      ext.action as typeof ext.action & {
        openPopup?: (details: { windowId: number }) => Promise<void>;
      }
    ).openPopup;
    if (openPopup && winId !== undefined) {
      await openPopup({ windowId: winId });
      return;
    }
    throw new Error("action.openPopup unavailable");
  } catch (err) {
    console.warn("[Element Deleter] openPopup notice failed, using tab:", err);
    try {
      await ext.tabs.create({
        url: `${noticeUrl}?mode=tab`,
        active: true,
      });
    } catch (err2) {
      console.error("[Element Deleter] restricted notice tab failed:", err2);
    }
  } finally {
    await ext.action.setPopup({ tabId, popup: "" });
  }
}
