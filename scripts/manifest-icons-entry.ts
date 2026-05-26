import { getToolbarIconSets } from "../src/icons";

export type ManifestIconRaster = {
  size: number;
  data: Buffer;
};

function toolbarRasters(mode: "inactive" | "active"): ManifestIconRaster[] {
  const sets = getToolbarIconSets()[mode];
  return ([16, 32, 48, 128] as const).map((size) => ({
    size,
    data: Buffer.from(sets[String(size)].data),
  }));
}

/** Same pixels as toolbar inactive icon (canvas draw, not SVG rasterize). */
export function getInactiveManifestRasters(): ManifestIconRaster[] {
  return toolbarRasters("inactive");
}

export function getActiveManifestRasters(): ManifestIconRaster[] {
  return toolbarRasters("active");
}

/** Output plan for SHARED/scripts/generate-manifest-icons.mjs */
export const manifestIconOutputs = [
  { prefix: "icon", getRasters: getInactiveManifestRasters },
  { prefix: "toolbar-active", getRasters: getActiveManifestRasters },
] as const;
