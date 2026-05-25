declare const process: {
  env: {
    CSS_CONTENT: string;
    PANEL_CSS_CONTENT: string;
    PANEL_HEADER_CSS: string;
  };
};

declare const browser: typeof chrome | undefined;

declare module "*.svg" {
  const content: string;
  export default content;
}
