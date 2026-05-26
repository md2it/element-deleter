import circlePowerSvg from "../icons/circle-power.svg";
import shieldCheckSvg from "../icons/shield-check.svg";
import trash2Svg from "../icons/trash-2.svg";
import undo2Svg from "../icons/undo-2.svg";

export {
  ARROW_UP,
  COG,
  HEART,
  INFO,
  LINKEDIN,
  MD2IT,
  PIN,
  PUZZLE,
} from "../../SHARED/src/icons";

function stripComment(svg: string): string {
  return svg.replace(/<!--[\s\S]*?-->\s*/g, "").trim();
}

/** Lucide UI icon (toast); stroke uses currentColor from parent. */
function lucideUiIcon(raw: string): string {
  return stripComment(raw);
}

export const UNDO_2 = lucideUiIcon(undo2Svg);

export const CHEVRON_LEFT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>`;
export const CHEVRON_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>`;
export const CHEVRONS_LEFT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>`;
export const CHEVRONS_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>`;

const INACTIVE_BG = "#012292";
// Spec: toolbar icon uses single active style; badge carries state.
const ACTIVE_BG = INACTIVE_BG;
const TOOLBAR_VIEWBOX = 24;
const TOOLBAR_RADIUS_RATIO = 0.18;
const TOOLBAR_PAD_RATIO = 0.1;

function innerSvgMarkup(svg: string): string {
  const match = svg.match(/<svg[\s\S]*?>([\s\S]*)<\/svg>/i);
  return match ? match[1].trim() : svg;
}

function svgAttr(tag: string, name: string): string | undefined {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`));
  return m?.[1];
}

/** Draw Lucide inner markup on canvas (SW-safe; no SVG image decode). */
function drawInnerSvg(
  ctx: OffscreenCanvasRenderingContext2D,
  inner: string,
): void {
  ctx.fillStyle = "transparent";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const m of inner.matchAll(/<line\b[^>]*\/?>/g)) {
    const tag = m[0];
    const x1 = Number(svgAttr(tag, "x1"));
    const y1 = Number(svgAttr(tag, "y1"));
    const x2 = Number(svgAttr(tag, "x2"));
    const y2 = Number(svgAttr(tag, "y2"));
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  for (const m of inner.matchAll(/<rect\b[^>]*\/?>/g)) {
    const tag = m[0];
    const x = Number(svgAttr(tag, "x") ?? 0);
    const y = Number(svgAttr(tag, "y") ?? 0);
    const w = Number(svgAttr(tag, "width"));
    const h = Number(svgAttr(tag, "height"));
    const rx = Number(svgAttr(tag, "rx") ?? 0);
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, rx);
    ctx.stroke();
  }

  for (const m of inner.matchAll(/<path\b[^>]*\/?>/g)) {
    const d = svgAttr(m[0], "d");
    if (d) ctx.stroke(new Path2D(d));
  }
}

const trash2Inner = innerSvgMarkup(stripComment(trash2Svg));

export type ExtensionMarkOptions =
  | { variant: "toast" }
  | { variant: "panel" };

function trashMarkGroup(stroke: string): string {
  return `<g fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${trash2Inner}</g>`;
}

/** Trash mark for toast or panel header. */
export function extensionMarkSvg(options: ExtensionMarkOptions): string {
  switch (options.variant) {
    case "toast":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">${trashMarkGroup("#ffffff")}</svg>`;
    case "panel":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">${trashMarkGroup("currentColor")}</svg>`;
  }
}

/** Lucide icons for the about-panel boolean list (gray via `.dd-about-bool`). */
export const ABOUT_BULLET_ICONS: readonly string[] = [
  lucideUiIcon(trash2Svg),
  lucideUiIcon(circlePowerSvg),
  lucideUiIcon(undo2Svg),
  lucideUiIcon(undo2Svg),
  lucideUiIcon(shieldCheckSvg),
  lucideUiIcon(shieldCheckSvg),
];

export type ToolbarIconVariant = "inactive" | "active";

/** Toolbar icon as shown in the browser action area (about panel legend). */
export function toolbarIconSvg(variant: ToolbarIconVariant, size = 16): string {
  return toolbarWelcomeIconSvg(variant === "inactive" ? INACTIVE_BG : ACTIVE_BG, size);
}

export type ToolbarIconSets = {
  inactive: Record<string, ImageData>;
  active: Record<string, ImageData>;
};

function drawToolbarIcon(size: number, bg: string): ImageData {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");

  const r = size * TOOLBAR_RADIUS_RATIO;
  const pad = size * TOOLBAR_PAD_RATIO;
  const scale = (size - pad * 2) / TOOLBAR_VIEWBOX;

  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, r);
  ctx.fill();

  ctx.save();
  ctx.translate(pad, pad);
  ctx.scale(scale, scale);
  drawInnerSvg(ctx, trash2Inner);
  ctx.restore();

  return ctx.getImageData(0, 0, size, size);
}

let toolbarCache: ToolbarIconSets | null = null;

export function getToolbarIconSets(): ToolbarIconSets {
  if (toolbarCache) return toolbarCache;

  const sizes = [16, 32, 48, 128] as const;
  const inactive: Record<string, ImageData> = {};
  const active: Record<string, ImageData> = {};

  for (const size of sizes) {
    const key = String(size);
    inactive[key] = drawToolbarIcon(size, INACTIVE_BG);
    active[key] = drawToolbarIcon(size, ACTIVE_BG);
  }

  toolbarCache = { inactive, active };
  return toolbarCache;
}

/** Toolbar icon markup for welcome onboarding (same padding as `drawToolbarIcon`). */
export function toolbarWelcomeIconSvg(bg = INACTIVE_BG, size = 16): string {
  const r = TOOLBAR_VIEWBOX * TOOLBAR_RADIUS_RATIO;
  const pad = TOOLBAR_VIEWBOX * TOOLBAR_PAD_RATIO;
  const scale = (TOOLBAR_VIEWBOX - pad * 2) / TOOLBAR_VIEWBOX;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${TOOLBAR_VIEWBOX} ${TOOLBAR_VIEWBOX}" aria-hidden="true"><rect width="${TOOLBAR_VIEWBOX}" height="${TOOLBAR_VIEWBOX}" rx="${r}" fill="${bg}"/><g fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(${pad} ${pad}) scale(${scale})">${trash2Inner}</g></svg>`;
}
