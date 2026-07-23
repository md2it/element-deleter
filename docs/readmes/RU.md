# ELEMENT DELETER

<p align="center" id="installation">
  <a href="https://chromewebstore.google.com/detail/element-deleter/dpgjhjgfbicnenmdknepflmdahmhlbag" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Chrome%20Web%20Store.svg?logo=googlechrome&logoColor=4285F4&mode=dark">
      <source media="(prefers-color-scheme: light)" srcset="https://shieldcn.dev/badge/Chrome%20Web%20Store.svg?logo=googlechrome&logoColor=4285F4&mode=light">
      <img src="https://shieldcn.dev/badge/Chrome%20Web%20Store.svg?logo=googlechrome&logoColor=4285F4&mode=dark" alt="Chrome Web Store">
    </picture>
  </a>
  <a href="https://addons.mozilla.org/firefox/addon/md2it-element-deleter/" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Firefox%20Add%E2%80%91ons.svg?logo=firefoxbrowser&logoColor=FF7139&mode=dark">
      <source media="(prefers-color-scheme: light)" srcset="https://shieldcn.dev/badge/Firefox%20Add%E2%80%91ons.svg?logo=firefoxbrowser&logoColor=FF7139&mode=light">
      <img src="https://shieldcn.dev/badge/Firefox%20Add%E2%80%91ons.svg?logo=firefoxbrowser&logoColor=FF7139&mode=dark" alt="Firefox Add-ons">
    </picture>
  </a>
  <a href="https://github.com/md2it/element-deleter/releases/latest/download/element-deleter.zip">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Latest%20Release%20ZIP.svg?logo=lu:FileArchive&logoColor=CA8A04&mode=dark">
      <source media="(prefers-color-scheme: light)" srcset="https://shieldcn.dev/badge/Latest%20Release%20ZIP.svg?logo=lu:FileArchive&logoColor=CA8A04&mode=light">
      <img src="https://shieldcn.dev/badge/Latest%20Release%20ZIP.svg?logo=lu:FileArchive&logoColor=CA8A04&mode=dark" alt="Latest Release ZIP">
    </picture>
  </a>
</p>

<p align="center" id="language">
=-=-=-=-=-=-=-=-= | <a href="./DE.md">DE</a> | <a href="../README.md">EN</a> | <a href="./ES.md">ES</a> | <a href="./FR.md">FR</a> | RU | <a href="./ZH.md">中文</a> | <a href="./AR.md">عربي</a> | =-=-=-=-=-=-=-=-=
</p>

## ОПИСАНИЕ

Element Deleter быстро очищает страницу от всего, что мешает: баннеров, всплывающих окон, закреплённых заголовков, виджетов, лишних блоков, iframe и других отвлекающих элементов.

Расширение полезно frontend-разработчикам, QA-инженерам и дизайнерам: можно проверить страницу без лишних блоков, подготовить чистый скриншот, оценить идею макета или удалить элемент, перекрывающий содержимое. При обычном просмотре страниц оно упрощает чтение, просмотр и сохранение.

Наведите указатель, нажмите — и элемент исчезнет. Ошибку можно отменить.

<p align="center" id="screenshots">
  <a href="../publication/screenshots/RU-0.png"><img src="../publication/screenshots/RU-0.png" width="180" alt="Element Deleter screenshot 1"></a>
  <a href="../publication/screenshots/RU-1.png"><img src="../publication/screenshots/RU-1.png" width="180" alt="Element Deleter screenshot 2"></a>
  <a href="../publication/screenshots/RU-2.png"><img src="../publication/screenshots/RU-2.png" width="180" alt="Element Deleter screenshot 3"></a>
  <a href="../publication/screenshots/RU-3.png"><img src="../publication/screenshots/RU-3.png" width="180" alt="Element Deleter screenshot 4"></a>
</p>

## КЛЮЧЕВЫЕ ВОЗМОЖНОСТИ

- Удаление элементов страницы за несколько нажатий
- Восстановление удалённых элементов
- Отмена нескольких удалений, пока активен режим удаления
- Удаление элементов через контекстное меню
- Работа с iframe и встроенным содержимым
- Понятное уведомление после удаления
- Лёгкость и простота
- Только локальные настройки
- Интерфейс доступен на английском, французском, немецком, испанском, русском, арабском и упрощённом китайском языках

## КОНФИДЕНЦИАЛЬНОСТЬ

- Данные не собираются
- Отслеживание отсутствует
- Сетевые запросы отсутствуют
- Изменения действуют только на текущей странице
- Перезагрузка страницы восстанавливает исходное содержимое

## ОГРАНИЧЕНИЯ

- **Выбор iframe отличается** от выбора других элементов:
   - Iframe выбирается целиком
   - Причина — ограничение платформы; внедрение внутрь iframe считается нежелательным
   - Выделение выглядит иначе из-за других обработчиков событий, но это не влияет на функции
- **Позиция восстановленного SVG** иногда определяется неправильно:
   - Это функциональная ошибка
   - Попытки исправить её потребовали значительного времени
   - Влияние невелико, поскольку сценарий встречается редко

## ЛИЦЕНЗИЯ

[Лицензия MIT](../LICENSE)
