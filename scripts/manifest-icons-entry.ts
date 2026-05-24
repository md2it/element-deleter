import { getToolbarIconSets } from "../src/icons";

export type ManifestIconRaster = {
  size: number;
  data: Buffer;
};

/** Same pixels as toolbar inactive icon (canvas draw, not SVG rasterize). */
export function getInactiveManifestRasters(): ManifestIconRaster[] {
  const { inactive } = getToolbarIconSets();
  return ([16, 32, 48, 128] as const).map((size) => ({
    size,
    data: Buffer.from(inactive[String(size)].data),
  }));
}
