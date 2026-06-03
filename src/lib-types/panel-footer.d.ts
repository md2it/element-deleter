export type PanelFooterLink = {
  href: string;
  title: string;
  iconHtml: string;
};

export type PanelFooterConfig = {
  footerClassName: string;
};

export const PANEL_FOOTER_LINKS: readonly PanelFooterLink[];
export function attachPanelFooterLinks(footer: HTMLElement): void;
export function createPanelFooter(config: PanelFooterConfig): HTMLDivElement;
