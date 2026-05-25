export type ToastVariant = "deleted" | "restored";

export type ToastFillTargets = {
  toast: HTMLDivElement;
  leading: HTMLDivElement;
  actions: HTMLDivElement;
};

/** Shadow root + timing/RTL for toast stack (no i18n or app actions). */
export type ToastStackHost = {
  shadow: ShadowRoot;
  getNotificationSeconds: () => number;
  isRtl: () => boolean;
};

export type ToastAppendOptions = {
  variant: ToastVariant;
  markInnerHtml: string;
  fill: (targets: ToastFillTargets) => void;
};
