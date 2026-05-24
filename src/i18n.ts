import { ext } from "./api";

export type Locale = "en" | "es" | "fr" | "de" | "ru" | "zh" | "ar";

export const LOCALES: readonly Locale[] = [
  "en",
  "es",
  "fr",
  "de",
  "ru",
  "zh",
  "ar",
] as const;

/** Button labels in settings (fixed per README). */
export const LOCALE_BUTTON_LABELS: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  fr: "FR",
  de: "DE",
  ru: "RU",
  zh: "中文",
  ar: "عربي",
};

export type Strings = {
  tabSettings: string;
  tabAbout: string;
  notificationPeriodPrefix: string;
  notificationPeriodSuffix: string;
  notificationPeriodHint: string;
  startHotkeyToggleLabel: string;
  escHotkeyToggleLabel: string;
  undoHotkeyToggleLabel: string;
  toastDeleted: string;
  toastRestored: string;
  btnRestore: string;
  panelSubtitle: string;
  titleSettings: string;
  titleAbout: string;
  contextMenuDeleteElement: string;
  restrictedPageNotice: string;
  welcomePin: string;
  welcomePinStep1: string;
  welcomePinStep2: string;
  welcomePinStep3: string;
  aboutBullets: readonly string[];
  aboutIconLegend: {
    inactive: string;
    active: string;
  };
};

const MESSAGES: Record<Locale, Strings> = {
  en: {
    tabSettings: "SETTINGS",
    tabAbout: "ABOUT",
    notificationPeriodPrefix: "Notifications ",
    notificationPeriodSuffix: " sec.",
    notificationPeriodHint: "Set 0 to turn off notifications",
    startHotkeyToggleLabel: "On/Off",
    escHotkeyToggleLabel: "Off",
    undoHotkeyToggleLabel: "Undo delete",
    toastDeleted: "DELETED",
    toastRestored: "RESTORED",
    btnRestore: "RESTORE",
    panelSubtitle: "browser extension",
    titleSettings: "Settings",
    titleAbout: "About",
    contextMenuDeleteElement: "Delete this element",
    restrictedPageNotice: "Browser extensions don't work on this page or site.",
    welcomePin: "To keep the extension handy:",
    welcomePinStep1: "In the toolbar, find an icon like this",
    welcomePinStep2: "In the list, find",
    welcomePinStep3: "Click an icon like this",
    aboutBullets: [
      "Removes a page element,",
      "On/Off with one click,",
      "You can restore an element,",
      "Reloading the page restores everything,",
      "Doesn't use the network,",
      "Doesn't collect data,",
    ],
    aboutIconLegend: {
      inactive: "Extension is off,",
      active: "Extension is running.",
    },
  },
  es: {
    tabSettings: "AJUSTES",
    tabAbout: "ACERCA DE",
    notificationPeriodPrefix: "Avisos ",
    notificationPeriodSuffix: " seg.",
    notificationPeriodHint: "Ponga 0 para desactivar las notificaciones",
    startHotkeyToggleLabel: "Activar/desactivar",
    escHotkeyToggleLabel: "Apagar",
    undoHotkeyToggleLabel: "Deshacer eliminación",
    toastDeleted: "ELIMINADO",
    toastRestored: "RESTAURADO",
    btnRestore: "RESTAURAR",
    panelSubtitle: "extensión de navegador",
    titleSettings: "Ajustes",
    titleAbout: "Acerca de",
    contextMenuDeleteElement: "Eliminar este elemento",
    restrictedPageNotice:
      "Las extensiones del navegador no funcionan en esta página o sitio.",
    welcomePin: "Para tener la extensión siempre a mano:",
    welcomePinStep1: "En la barra superior, busca un icono como este",
    welcomePinStep2: "En la lista, busca",
    welcomePinStep3: "Haz clic en un icono así",
    aboutBullets: [
      "Elimina el elemento de la página,",
      "Activar/desactivar con un clic,",
      "Se puede restaurar un elemento,",
      "Al recargar la página se restaura todo,",
      "No usa la red,",
      "No recopila datos,",
    ],
    aboutIconLegend: {
      inactive: "Extensión desactivada,",
      active: "Extensión en ejecución.",
    },
  },
  fr: {
    tabSettings: "PARAMÈTRES",
    tabAbout: "À PROPOS",
    notificationPeriodPrefix: "Notifications ",
    notificationPeriodSuffix: " s",
    notificationPeriodHint: "Mettez 0 pour désactiver les notifications",
    startHotkeyToggleLabel: "Activer/désactiver",
    escHotkeyToggleLabel: "Arrêt",
    undoHotkeyToggleLabel: "Annuler la suppression",
    toastDeleted: "SUPPRIMÉ",
    toastRestored: "RESTAURÉ",
    btnRestore: "RESTAURER",
    panelSubtitle: "extension de navigateur",
    titleSettings: "Paramètres",
    titleAbout: "À propos",
    contextMenuDeleteElement: "Supprimer cet élément",
    restrictedPageNotice:
      "Les extensions du navigateur ne fonctionnent pas sur cette page ou ce site.",
    welcomePin: "Pour garder l'extension à portée de main :",
    welcomePinStep1: "Dans la barre du haut, trouvez une icône comme celle-ci",
    welcomePinStep2: "Dans la liste, trouvez",
    welcomePinStep3: "Cliquez sur une icône comme celle-ci",
    aboutBullets: [
      "Supprime l'élément de la page,",
      "Activer/désactiver en un clic,",
      "Un élément peut être restauré,",
      "Le rechargement de la page restaure tout,",
      "N'utilise pas le réseau,",
      "Ne collecte pas de données,",
    ],
    aboutIconLegend: {
      inactive: "Extension désactivée,",
      active: "Extension en cours d'exécution.",
    },
  },
  de: {
    tabSettings: "EINSTELLUNGEN",
    tabAbout: "INFO",
    notificationPeriodPrefix: "Hinweise ",
    notificationPeriodSuffix: " Sek.",
    notificationPeriodHint: "0 setzen, um Benachrichtigungen auszuschalten",
    startHotkeyToggleLabel: "Ein/Aus",
    escHotkeyToggleLabel: "Aus",
    undoHotkeyToggleLabel: "Löschen rückgängig",
    toastDeleted: "GELÖSCHT",
    toastRestored: "WIEDERHERGESTELLT",
    btnRestore: "WIEDERHERSTELLEN",
    panelSubtitle: "Browser-Erweiterung",
    titleSettings: "Einstellungen",
    titleAbout: "Info",
    contextMenuDeleteElement: "Dieses Element löschen",
    restrictedPageNotice:
      "Browser-Erweiterungen funktionieren auf dieser Seite oder Website nicht.",
    welcomePin: "Damit die Erweiterung immer griffbereit ist:",
    welcomePinStep1: "In der oberen Leiste finde ungefähr ein solches Symbol",
    welcomePinStep2: "In der Liste finde",
    welcomePinStep3: "Klicke auf ein solches Symbol",
    aboutBullets: [
      "Entfernt das Seitenelement,",
      "Ein/Aus mit einem Klick,",
      "Elemente können wiederhergestellt werden,",
      "Beim Neuladen der Seite wird alles wiederhergestellt,",
      "Nutzt kein Netzwerk,",
      "Sammelt keine Daten,",
    ],
    aboutIconLegend: {
      inactive: "Erweiterung aus,",
      active: "Erweiterung aktiv.",
    },
  },
  ru: {
    tabSettings: "НАСТРОЙКИ",
    tabAbout: "О\u00A0РАСШИРЕНИИ",
    notificationPeriodPrefix: "Уведомления ",
    notificationPeriodSuffix: " сек",
    notificationPeriodHint: "Установите 0 для выключения уведомлений",
    startHotkeyToggleLabel: "Вкл/выкл",
    escHotkeyToggleLabel: "Выкл",
    undoHotkeyToggleLabel: "Отменить удаление",
    toastDeleted: "УДАЛЕНО",
    toastRestored: "ВОССТАНОВЛЕНО",
    btnRestore: "ВОССТАНОВИТЬ",
    panelSubtitle: "браузерное расширение",
    titleSettings: "Настройки",
    titleAbout: "О расширении",
    contextMenuDeleteElement: "Удалить этот элемент",
    restrictedPageNotice:
      "На этой странице или сайте браузерные расширения не работают",
    welcomePin: "Чтобы расширение было всегда под рукой:",
    welcomePinStep1: "В верхней панели найди примерно такую иконку",
    welcomePinStep2: "В списке найди",
    welcomePinStep3: "Нажми такую иконку",
    aboutBullets: [
      "Удаляет элемент страницы,",
      "Вкл/выкл в один клик,",
      "Можно восстановить элемент,",
      "Перезагрузка страницы восстановит всё,",
      "Не использует сеть,",
      "Не собирает данные,",
    ],
    aboutIconLegend: {
      inactive: "Расширение выключено,",
      active: "Расширение запущено.",
    },
  },
  zh: {
    tabSettings: "设置",
    tabAbout: "关于",
    notificationPeriodPrefix: "通知 ",
    notificationPeriodSuffix: " 秒",
    notificationPeriodHint: "设为 0 可关闭通知",
    startHotkeyToggleLabel: "开/关",
    escHotkeyToggleLabel: "关闭",
    undoHotkeyToggleLabel: "撤销删除",
    toastDeleted: "已删除",
    toastRestored: "已恢复",
    btnRestore: "恢复",
    panelSubtitle: "浏览器扩展",
    titleSettings: "设置",
    titleAbout: "关于",
    contextMenuDeleteElement: "删除此元素",
    restrictedPageNotice: "浏览器扩展无法在此页面或网站上运行。",
    welcomePin: "让扩展随时可用：",
    welcomePinStep1: "在顶部栏找到大致这样的图标",
    welcomePinStep2: "在列表中找到",
    welcomePinStep3: "点击这样的图标",
    aboutBullets: [
      "删除页面元素，",
      "一键开/关，",
      "可恢复元素，",
      "重新加载页面可恢复一切，",
      "不使用网络，",
      "不收集数据，",
    ],
    aboutIconLegend: {
      inactive: "扩展已关闭，",
      active: "扩展已启动。",
    },
  },
  ar: {
    tabSettings: "الإعدادات",
    tabAbout: "حول",
    notificationPeriodPrefix: "إشعار ",
    notificationPeriodSuffix: " ث",
    notificationPeriodHint: "اضبط على 0 لإيقاف الإشعارات",
    startHotkeyToggleLabel: "تشغيل/إيقاف",
    escHotkeyToggleLabel: "إيقاف",
    undoHotkeyToggleLabel: "تراجع عن الحذف",
    toastDeleted: "تم الحذف",
    toastRestored: "تم الاستعادة",
    btnRestore: "استعادة",
    panelSubtitle: "امتداد المتصفح",
    titleSettings: "الإعدادات",
    titleAbout: "حول",
    contextMenuDeleteElement: "حذف هذا العنصر",
    restrictedPageNotice: "لا تعمل إضافات المتصفح على هذه الصفحة أو الموقع.",
    welcomePin: "لتبقى الإضافة دائمًا في متناول يدك:",
    welcomePinStep1: "في الشريط العلوي، ابحث عن أيقونة مثل هذه",
    welcomePinStep2: "في القائمة، ابحث عن",
    welcomePinStep3: "انقر على أيقونة مثل هذه",
    aboutBullets: [
      "يحذف عنصر الصفحة،",
      "تشغيل/إيقاف بنقرة واحدة،",
      "يمكن استعادة العنصر،",
      "إعادة تحميل الصفحة تستعيد كل شيء،",
      "لا تستخدم الشبكة،",
      "لا تجمع البيانات،",
    ],
    aboutIconLegend: {
      inactive: "الإضافة متوقفة،",
      active: "الإضافة قيد التشغيل.",
    },
  },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function isRtlLocale(locale: Locale): boolean {
  return locale === "ar";
}

export function t(locale: Locale): Strings {
  return MESSAGES[locale];
}

/** Full browser language list (primary + fallbacks) from Chrome/Firefox prefs. */
export function getAcceptLanguageTags(): Promise<string[]> {
  return new Promise((resolve) => {
    const getAccept = ext.i18n?.getAcceptLanguages;
    if (typeof getAccept !== "function") {
      resolve(fallbackLanguageTags());
      return;
    }
    try {
      const maybePromise: unknown = getAccept((languages: string[]) => {
        resolve(pickLanguageTags(languages));
      });
      if (
        maybePromise &&
        typeof (maybePromise as Promise<string[]>).then === "function"
      ) {
        void (maybePromise as Promise<string[]>)
          .then((languages) => resolve(pickLanguageTags(languages)))
          .catch(() => resolve(fallbackLanguageTags()));
      }
    } catch {
      resolve(fallbackLanguageTags());
    }
  });
}

function pickLanguageTags(languages: string[] | undefined): string[] {
  if (languages?.length) return [...languages];
  return fallbackLanguageTags();
}

function fallbackLanguageTags(): string[] {
  if (typeof navigator !== "undefined" && navigator.languages?.length) {
    return [...navigator.languages];
  }
  try {
    const ui = ext.i18n?.getUILanguage?.();
    return ui ? [ui] : [];
  } catch {
    return [];
  }
}

/**
 * User language preferences: primary, then fallbacks, then EN.
 * Uses i18n.getAcceptLanguages (full Chrome language list). Do not use navigator.language —
 * in content scripts that is the page locale; navigator.languages may omit fallbacks.
 */
export async function detectLocale(): Promise<Locale> {
  const tags = await getAcceptLanguageTags();
  const seen = new Set<string>();
  for (const tag of tags) {
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const mapped = mapLanguageTag(tag);
    if (mapped) return mapped;
  }
  return "en";
}

function mapLanguageTag(tag: string): Locale | null {
  const lower = tag.trim().toLowerCase().replace(/_/g, "-");
  if (lower.startsWith("zh")) return "zh";
  const base = lower.split("-")[0];
  const map: Record<string, Locale> = {
    en: "en",
    es: "es",
    fr: "fr",
    de: "de",
    ru: "ru",
    ar: "ar",
  };
  return map[base] ?? null;
}
