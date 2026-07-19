"use strict";
// Leading "/" = extension root. MV3 setIcon resolves bare relative paths from the SW dir.
export var INACTIVE = {
  16: "/icons/icon-16.png",
  32: "/icons/icon-32.png",
  48: "/icons/icon-48.png",
  128: "/icons/icon-128.png",
};
export var ACTIVE = INACTIVE;
export var TOOLBAR_ICON_PATHS = {
  inactive: INACTIVE,
  active: ACTIVE,
};
