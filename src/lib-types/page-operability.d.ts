export type BlockedNoticePayload = {
  text: string;
  dismissMs: number;
  tabId?: number;
};

export type BlockedNoticeConfig = {
  popupHtml: string;
  sessionKey: string;
  logLabel: string;
};

export const PROBE_DOCUMENT_OPERABILITY: "PROBE_DOCUMENT_OPERABILITY";

export type ProbeDocumentOperabilityMessage = {
  type: typeof PROBE_DOCUMENT_OPERABILITY;
};

export function canOperateOnTab(tabId: number, frameId?: number): Promise<boolean>;
export function isProbeDocumentOperabilityMessage(
  message: unknown,
): message is ProbeDocumentOperabilityMessage;
export function registerDocumentOperabilityProbeListener(): void;
export function probeDocumentOperability(): boolean;
export function showBlockedNotice(
  tabId: number,
  config: BlockedNoticeConfig,
  payload: BlockedNoticePayload,
  windowId?: number,
): Promise<void>;
export const BLOCKED_NOTICE_DISMISSED: "BLOCKED_NOTICE_DISMISSED";
export type BlockedNoticeDismissedMessage = {
  type: typeof BLOCKED_NOTICE_DISMISSED;
  tabId: number;
};
export function isBlockedNoticeDismissedMessage(
  message: unknown,
): message is BlockedNoticeDismissedMessage;
