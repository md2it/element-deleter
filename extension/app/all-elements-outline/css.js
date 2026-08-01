var DEFAULT_WIDTH_PX = 1;
var DEFAULT_OFFSET_PX = -1;
function assertRgba(value, label) {
  const trimmed = value.trim();
  if (!/^rgba\s*\(/i.test(trimmed)) {
    throw new Error(`${label} must be an rgba(...) color, got: ${value}`);
  }
}
function buildAllElementsOutlineCss(config) {
  assertRgba(config.rgba, "rgba");
  const width = config.widthPx ?? DEFAULT_WIDTH_PX;
  const offset = config.offsetPx ?? DEFAULT_OFFSET_PX;
  const outlineStyle = config.outlineStyle ?? "solid";
  const color = config.rgba.trim();
  return `
* {
  outline-width: ${width}px !important;
  outline-style: ${outlineStyle} !important;
  outline-color: ${color} !important;
  outline-offset: ${offset}px !important;
}
`.trim();
}

export { DEFAULT_WIDTH_PX, DEFAULT_OFFSET_PX, assertRgba, buildAllElementsOutlineCss };
