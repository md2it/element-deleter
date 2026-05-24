declare const process: {
  env: {
    CSS_CONTENT: string;
  };
};

declare const browser: typeof chrome | undefined;

declare module "*.svg" {
  const content: string;
  export default content;
}
