import { createRequire } from "node:module";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const shared = join(root, "..", "SHARED");
const require = createRequire(join(shared, "package.json"));

const { createCanvas, Path2D } = require("@napi-rs/canvas");
const { PNG } = require("pngjs");
const esbuild = require(join(shared, "node_modules/esbuild"));

globalThis.Path2D = Path2D;
globalThis.OffscreenCanvas = class OffscreenCanvas {
  constructor(width, height) {
    this._canvas = createCanvas(width, height);
  }
  getContext(type) {
    if (type === "2d") return this._canvas.getContext("2d");
    return null;
  }
};

const tmp = mkdtempSync(join(tmpdir(), "dom-deleter-icons-"));
const outfile = join(tmp, "run.mjs");

try {
  await esbuild.build({
    entryPoints: [join(__dirname, "manifest-icons-entry.ts")],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile,
    target: "es2022",
    logLevel: "silent",
    loader: { ".svg": "text" },
    nodePaths: [join(shared, "node_modules")],
  });

  const { getInactiveManifestRasters } = await import(pathToFileURL(outfile).href);
  const outDir = join(root, "icons");
  mkdirSync(outDir, { recursive: true });

  for (const { size, data } of getInactiveManifestRasters()) {
    const png = new PNG({ width: size, height: size });
    png.data = data;
    const dest = join(outDir, `icon-${size}.png`);
    writeFileSync(dest, PNG.sync.write(png));
    console.log("wrote", dest);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
