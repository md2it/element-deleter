import { ABOUT_BULLET_ICONS } from "./icons";
import type { Strings } from "./i18n/types";

export type AboutListItem = {
  iconHtml: string;
  text: string;
};

export function buildAboutListItems(copy: Strings): AboutListItem[] {
  return copy.aboutBullets.map((text, index) => ({
    iconHtml: ABOUT_BULLET_ICONS[index] ?? ABOUT_BULLET_ICONS[0],
    text,
  }));
}
