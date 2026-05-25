import { buildAboutListItems } from "../about";
import { PANEL_TITLE } from "../brand";
import {
  ARROW_UP,
  COG,
  HEART,
  PIN,
  PUZZLE,
  extensionMarkSvg,
  toolbarWelcomeIconSvg,
  welcomeStepIcon,
} from "../icons";
import {
  isRtlLocale,
  LOCALE_BUTTON_LABELS,
  LOCALES,
  t,
  type Locale,
} from "../i18n";

function buildWelcomeLocalePayload(locale: Locale, extensionName: string) {
  const strings = t(locale);

  return {
    locale,
    dir: isRtlLocale(locale) ? ("rtl" as const) : ("ltr" as const),
    headerSubtitle: strings.panelSubtitle,
    pinHeading: strings.welcomePin,
    pinStep1: strings.welcomePinStep1,
    pinStep2: strings.welcomePinStep2,
    pinStep3: strings.welcomePinStep3,
    aboutHeading: strings.tabAbout,
    aboutItems: buildAboutListItems(strings),
    settingsLabel: strings.titleSettings,
    langAriaLabel: strings.tabSettings,
  };
}

export function buildWelcomeData(
  locale: Locale,
  extensionName: string,
  options?: { isPinned?: boolean | null },
) {
  const isPinned = options?.isPinned === true;
  const perLocale = Object.fromEntries(
    LOCALES.map((code) => [code, buildWelcomeLocalePayload(code, extensionName)]),
  ) as Record<Locale, ReturnType<typeof buildWelcomeLocalePayload>>;

  const current = perLocale[locale];

  return {
    extensionName,
    locale,
    dir: current.dir,
    headerLogoSvg: extensionMarkSvg({ variant: "panel" }),
    headerTitle: PANEL_TITLE,
    headerSubtitle: current.headerSubtitle,
    iconSvg: toolbarWelcomeIconSvg(),
    pinHeading: current.pinHeading,
    pinStep1: current.pinStep1,
    pinStep2: current.pinStep2,
    pinStep3: current.pinStep3,
    puzzleIcon: welcomeStepIcon(PUZZLE),
    pinIcon: welcomeStepIcon(PIN),
    arrowUpIcon: welcomeStepIcon(ARROW_UP, 28),
    pinHintIcon: welcomeStepIcon(PIN, 16),
    heartIcon: welcomeStepIcon(HEART, 56),
    isPinned,
    aboutHeading: current.aboutHeading,
    aboutItems: current.aboutItems,
    settingsLabel: current.settingsLabel,
    settingsIcon: welcomeStepIcon(COG),
    hasAbout: true,
    hasSettings: true,
    hasLocales: true,
    locales: [...LOCALES],
    localeLabels: LOCALE_BUTTON_LABELS,
    langAriaLabel: current.langAriaLabel,
    perLocale,
  };
}

export type WelcomeData = ReturnType<typeof buildWelcomeData>;
