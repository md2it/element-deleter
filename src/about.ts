import { ABOUT_BULLET_ICONS, toolbarIconSvg } from "./icons";
import type { Strings } from "./i18n/types";

export type AboutListItem = {
  iconHtml: string;
  iconKind: "bool" | "toolbar";
  text: string;
};

export function buildAboutListItems(copy: Strings): AboutListItem[] {
  const bullets: AboutListItem[] = copy.aboutBullets.map((text, index) => ({
    iconHtml: ABOUT_BULLET_ICONS[index] ?? ABOUT_BULLET_ICONS[0],
    iconKind: "bool",
    text,
  }));

  const legend: AboutListItem[] = [
    {
      iconHtml: toolbarIconSvg("inactive"),
      iconKind: "toolbar",
      text: copy.aboutIconLegend.inactive,
    },
    {
      iconHtml: toolbarIconSvg("active"),
      iconKind: "toolbar",
      text: copy.aboutIconLegend.active,
    },
  ];

  return [...bullets, ...legend];
}

export function aboutItemDomClasses(iconKind: AboutListItem["iconKind"]): {
  itemCls: string;
  iconCls: string;
} {
  return iconKind === "toolbar"
    ? { itemCls: "dd-about-item--icon", iconCls: "dd-about-toolbar-icon" }
    : { itemCls: "dd-about-item--bool", iconCls: "dd-about-bool" };
}
