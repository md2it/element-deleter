import { welcomeStepIcon } from "../../../SHARED/src/welcome/step-icon";
import type { WelcomeData } from "../../../SHARED/src/welcome/types";
import { buildAboutListItems } from "../../src/about";
import { PANEL_TITLE } from "../../src/brand";
import {
  ARROW_UP,
  COG,
  HEART,
  PIN,
  PUZZLE,
  toolbarWelcomeIconSvg,
} from "../../src/icons";
import { isRtlLocale } from "../../../SHARED/src/i18n/rtl";
import { t } from "../../src/i18n/strings";
import { LOCALE_BUTTON_LABELS, LOCALES, type Locale } from "../../src/i18n/types";

function buildWelcomeLocalePayload(locale: Locale) {
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

function buildWelcomeData(
  locale: Locale,
  extensionName: string,
  options?: { isPinned?: boolean | null },
): WelcomeData {
  const isPinned = options?.isPinned === true;
  const perLocale = Object.fromEntries(
    LOCALES.map((code) => [code, buildWelcomeLocalePayload(code)]),
  ) as Record<Locale, ReturnType<typeof buildWelcomeLocalePayload>>;
  const current = perLocale[locale];
  return {
    extensionName,
    locale,
    dir: current.dir,
    headerLogoSvg: toolbarWelcomeIconSvg(),
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

const locale = (process.argv[2] ?? "ru") as Locale;
const data = buildWelcomeData(locale, "Element Deleter", { isPinned: false });
process.stdout.write(JSON.stringify(data));
