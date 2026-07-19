import { icon_default } from "../lib/our/icons/extension-logos.js";
import {
  chart_column_increasing_default,
  chevron_left_default,
  chevron_right_default,
  chevrons_left_default,
  chevrons_right_default,
  info_default,
  shield_check_default,
  square_check_default,
  terminal_default,
  trash_2_default,
  undo_2_default,
} from "../lib/vendor/icons/lucide.js";
import { md2it_default } from "../lib/our/icons/md2it.js";

function stripComment2(svg) {
  return svg.replace(/<!--[\s\S]*?-->\s*/g, "").trim();
}
function lucideUiIcon2(raw) {
  return stripComment2(raw);
}
function brandIcon2(raw) {
  return stripComment2(raw).replace(/fill="#000000"/g, 'fill="currentColor"');
}
var MD2IT = brandIcon2(md2it_default);
var UNDO_2 = lucideUiIcon2(undo_2_default);
var CHEVRON_LEFT = lucideUiIcon2(chevron_left_default);
var CHEVRON_RIGHT = lucideUiIcon2(chevron_right_default);
var CHEVRONS_LEFT = lucideUiIcon2(chevrons_left_default);
var CHEVRONS_RIGHT = lucideUiIcon2(chevrons_right_default);
var INACTIVE_BG = "#012292";
var TOOLBAR_VIEWBOX = 24;
var TOOLBAR_RADIUS_RATIO = 0.18;
var TOOLBAR_PAD_RATIO = 0.1;
var elementDeleterLogoInner = stripFullBackgroundRect(
  innerSvgMarkup(stripComment2(icon_default)),
);
function innerSvgMarkup(svg) {
  const match = svg.match(/<svg[\s\S]*?>([\s\S]*)<\/svg>/i);
  return match ? match[1].trim() : svg;
}
function stripFullBackgroundRect(inner) {
  const match = inner.match(/^\s*(<rect\b[^>]*\/?>)/i);
  if (!match) return inner;
  const tag = match[1];
  const x = Number(svgAttr(tag, "x") ?? 0);
  const y = Number(svgAttr(tag, "y") ?? 0);
  const w = Number(svgAttr(tag, "width"));
  const h = Number(svgAttr(tag, "height"));
  const fill = svgAttr(tag, "fill");
  if (
    x === 0 &&
    y === 0 &&
    w === 24 &&
    h === 24 &&
    fill &&
    !/^none$/i.test(fill)
  ) {
    return inner.slice(match[0].length).trimStart();
  }
  return inner;
}
function svgAttr(tag, name) {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`));
  return m?.[1];
}
var trash2Inner = innerSvgMarkup(stripComment2(trash_2_default));
function trashMarkGroup(stroke) {
  return `<g fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${trash2Inner}</g>`;
}
function extensionMarkSvg(options) {
  switch (options.variant) {
    case "toast":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">${trashMarkGroup("#ffffff")}</svg>`;
    case "panel":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">${trashMarkGroup("currentColor")}</svg>`;
  }
}
var ABOUT_SECTION_ICONS = {
  overview: lucideUiIcon2(info_default),
  capabilities: lucideUiIcon2(square_check_default),
  privacy: lucideUiIcon2(shield_check_default),
  code: lucideUiIcon2(terminal_default),
  statistics: lucideUiIcon2(chart_column_increasing_default),
};
function toolbarWelcomeIconSvg(bg = INACTIVE_BG, size = 16) {
  const r = TOOLBAR_VIEWBOX * TOOLBAR_RADIUS_RATIO;
  const pad = TOOLBAR_VIEWBOX * TOOLBAR_PAD_RATIO;
  const scale = (TOOLBAR_VIEWBOX - pad * 2) / TOOLBAR_VIEWBOX;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${TOOLBAR_VIEWBOX} ${TOOLBAR_VIEWBOX}" aria-hidden="true"><rect width="${TOOLBAR_VIEWBOX}" height="${TOOLBAR_VIEWBOX}" rx="${r}" fill="${bg}"/><g fill="#ffffff" transform="translate(${pad} ${pad}) scale(${scale})">${elementDeleterLogoInner}</g></svg>`;
}

export { stripComment2, lucideUiIcon2, brandIcon2, MD2IT, UNDO_2, CHEVRON_LEFT, CHEVRON_RIGHT, CHEVRONS_LEFT, CHEVRONS_RIGHT, INACTIVE_BG, TOOLBAR_VIEWBOX, TOOLBAR_RADIUS_RATIO, TOOLBAR_PAD_RATIO, elementDeleterLogoInner, innerSvgMarkup, stripFullBackgroundRect, svgAttr, trash2Inner, trashMarkGroup, extensionMarkSvg, ABOUT_SECTION_ICONS, toolbarWelcomeIconSvg };
