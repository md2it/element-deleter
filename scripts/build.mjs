import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const esbuild = require(
  join(dirname(fileURLToPath(import.meta.url)), "../../SHARED/node_modules/esbuild"),
);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const watch = process.argv.includes("--watch");

const stylesDir = join(root, "styles");
const panelHeaderCss = readFileSync(join(stylesDir, "panel-header.css"), "utf8");
const contentCss = readFileSync(join(stylesDir, "content.css"), "utf8").replace(
  /^@import\s+["']\.\/panel-header\.css["'];\s*\n?/,
  "",
);
const css = `${panelHeaderCss}\n${contentCss}`;

const define = {
  "process.env.CSS_CONTENT": JSON.stringify(css),
};

const common = {
  bundle: true,
  platform: "browser",
  target: "es2022",
  define,
  logLevel: "info",
  loader: {
    ".svg": "text",
  },
};

const ctx = await esbuild.context({
  ...common,
  entryPoints: {
    background: join(root, "src/background.ts"),
    content: join(root, "src/content.ts"),
    welcome: join(root, "src/welcome.ts"),
  },
  outdir: root,
});

if (watch) {
  await ctx.watch();
  console.log("watching…");
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log("build ok");
}
