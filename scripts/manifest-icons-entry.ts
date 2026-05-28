import { getToolbarIconSets } from "../src/icons";

export type ManifestIconRaster = {
  size: number;
  data: Buffer;
};

/** Canvas-drawn toolbar icon for manifest / setIcon(path) fallback. */
export function getInactiveManifestRasters(): ManifestIconRaster[] {
  const sets = getToolbarIconSets().inactive;
  return ([16, 32, 48, 128] as const).map((size) => ({
    size,
    data: Buffer.from(sets[String(size)].data),
  }));
}

/** Output plan for lib/scripts/generate-manifest-icons.mjs */
export const manifestIconOutputs = [
  { prefix: "icon", getRasters: getInactiveManifestRasters },
] as const;
