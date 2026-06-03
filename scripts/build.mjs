import { createRequire } from "node:module";
import { cpSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const esbuild = require(
  join(dirname(fileURLToPath(import.meta.url)), "../../lib/node_modules/esbuild"),
);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const libRoot = join(root, "../lib");
const libSrc = join(root, "../lib/our");
const extensionDir = join(root, "extension");
const appDir = join(extensionDir, "app");
const watch = process.argv.includes("--watch");

const stylesDir = join(root, "src/styles");
const panelHeaderCss = readFileSync(join(stylesDir, "panel-header.css"), "utf8");
const panelFooterCss = readFileSync(join(stylesDir, "panel-footer.css"), "utf8");
const panelCss = readFileSync(join(stylesDir, "panel-popup.css"), "utf8");
const toastCss = readFileSync(join(stylesDir, "toast.css"), "utf8");
const contentCss = readFileSync(join(stylesDir, "content.css"), "utf8");
const panelSurfaceCss = `${panelHeaderCss}\n${panelFooterCss}\n${panelCss}\n${toastCss}`;
const css = `${panelSurfaceCss}\n${contentCss}`;

const define = {
  "process.env.CSS_CONTENT": JSON.stringify(css),
  "process.env.PANEL_CSS_CONTENT": JSON.stringify(panelSurfaceCss),
  "process.env.PANEL_HEADER_CSS": JSON.stringify(panelHeaderCss),
};

const common = {
  bundle: true,
  platform: "browser",
  target: "es2022",
  charset: "utf8",
  define,
  logLevel: "info",
  loader: {
    ".svg": "text",
  },
  alias: {
    "@lib": libSrc,
  },
  plugins: [
    {
      name: "lib-icons-compat",
      setup(build) {
        build.onResolve({ filter: /^\.\/icons\/md2it\.svg$/ }, (args) => {
          if (args.importer === join(libSrc, "icons.ts")) {
            return { path: join(libRoot, "icons/md2it.svg") };
          }
        });
        build.onResolve({ filter: /^\.\/brand\/linkedin\.svg$/ }, (args) => {
          if (args.importer === join(libRoot, "icons/index.ts")) {
            return { path: join(libRoot, "icons/brands/linkedin.svg") };
          }
        });
        build.onResolve({ filter: /^\.\.\/\.\.\/vendor\/icons$/ }, (args) => {
          if (args.importer === join(libSrc, "panel-footer/footer.ts")) {
            return { path: join(libRoot, "icons/index.ts") };
          }
        });
      },
    },
  ],
};

rmSync(appDir, { recursive: true, force: true });
mkdirSync(appDir, { recursive: true });
cpSync(
  join(libSrc, "page-operability/blocked-notice-page.js"),
  join(appDir, "blocked-notice.js"),
);

const ctx = await esbuild.context({
  ...common,
  entryPoints: {
    background: join(root, "src/background.ts"),
    content: join(root, "src/content.ts"),
    welcome: join(root, "src/welcome/welcome.ts"),
  },
  outdir: appDir,
});

if (watch) {
  await ctx.watch();
  console.log("watching…");
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log("build ok");
}
