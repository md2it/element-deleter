/** Static toolbar SVGs (manifest + setIcon path fallback). */
const INACTIVE = "icons/toolbar-inactive.svg";
const ACTIVE = "icons/toolbar-active.svg";

export const TOOLBAR_ICON_PATHS = {
  inactive: {
    16: INACTIVE,
    32: INACTIVE,
    48: INACTIVE,
    128: INACTIVE,
  },
  active: {
    16: ACTIVE,
    32: ACTIVE,
    48: ACTIVE,
    128: ACTIVE,
  },
} as const;

export type ToolbarIconMode = keyof typeof TOOLBAR_ICON_PATHS;
