# План публикации

Для публикации в https://chrome.google.com/webstore/ нужно подготовить Single purpose, Permission justification, скриншоты, описания.
Документ связан с [lib/PUBLICATION.md](../../lib/PUBLICATION.md)

---

## СКРИПТЫ

Общие скрипты — в [lib/scripts/](../../lib/scripts/). Запуск из корня проекта (`element-deleter/`).

- Скриншот страниц
   - `npm run screenshots:pages -- ru` → `capture-pages.mjs`
   - welcome + settings + about
- Обрезка изображений
   - `npm run screenshots:live` → `crop-live-screenshots.mjs`
   - В проекте нужен свой `PUBLICATION/scripts/welcome-seed-entry.ts` (данные welcome под расширение).

В `package.json` проекта:

```json
"screenshots:pages": "node ../lib/scripts/capture-pages.mjs",
"screenshots:live": "node ../lib/scripts/crop-live-screenshots.mjs"
```

Коды языков в CLI (и в именах файлов в **uncut-live-screenshots/**): `ru`, `en`, `es`, `fr`, `de`, `zn`, `ar`. Каталоги в PUBLICATION — `RU`, `EN`, `ES`, `FR`, `DE`, `ZN`, `AR` (`zn` → локаль `zh_CN`).

---

## КАТАЛОГ PUBLICATION

- Создаётся в каталоге проекта перед публикацией
- Актуализируется перед повторной публикацией

Содержит:
- **uncut-live-screenshots/** -- необработанные скриншоты (обрезка: `npm run screenshots:live`)
   - Имена: `{lang}1.png`, `{lang}2.png` (например `ru1.png`, `ru2.png`)
- **[lang]/** -- каталоги под каждый язык
   - Набор может отличаться для разных проектов
   - EN/ есть в любом случае, даже если проект не поддерживает разные языки
   - Для element-deleter: `RU`, `EN`, `ES`, `FR`, `DE`, `ZN`, `AR`
   - Для каждого языка создаётся отдельный каталог
   - В каждом:
      - description.txt -- файл без разметки, чтобы копировать текст целиком
      - массив скриншотов
- **scripts/welcome-seed-entry.ts** -- данные welcome для `capture-pages`
- **complience.md** ответы на вопросы:
   1. Single purpose
   2-n. "Permission justification" Про каждое разрешение
- **public-key.pem** -- копирует человек из интерфейса магазина

---

## ПОДГОТОВКА СКРИНШОТОВ

Это базовый план подготовки скриншотов. *Для конкретного проекта план может быть изменён*.

По 3 скрина на каждый поддерживаемый язык:
1. Страницы
2. Живой скриншот 1
3. Живой скриншот 2

### Страницы
- 24-bit PNG (no alpha)
- Единый холст 1280×800
- На холсте наших страницы:
   - Приветственная
   - Настройки
   - About
- Вёрстка:
   - Между страницами и между краями справа-слева одинаковое пространство
   - Вертикальное выравнивание по середине холста
- Состояние дефолтное для всех страниц
- Для "Приветственной" только основной блок, без стрелочки
- Язык интерфейса показывать соответственно языку итогового изображения
- Итоговый результат назвать `{lang}-pages.png` (например `ru-pages.png` в каталоге `RU/`)

### Живой скриншот
- Взять скриншоты из **uncut-live-screenshots/**
- Обрезать до 1280×800 (24-bit PNG (no alpha))
- ВАЖНО УТОЧНИТЬ, КАК ОБРЕЗАТЬ!
   - По умолчанию:
      - Обрезать слева и сверху
      - Снизу и справа не обрезать
      - Так делаем, чтобы показать уведомления
   - Для element-deleter (подтверждено):
      - Обрезать слева и сверху
      - Снизу не обрезать
- Назвать
   - live-1.png
   - live-2.png
   - ...
- Положить в каталог соответствующего языка
- Если в проекте есть разные языки, но не ясно, к какому языку относятся скриншоты, то нужно уточнить

---

## ЧЕКЛИСТ

Если готово, то заменить 🔲 на ✅

- 🔲 Каталог PUBLICATION/ создан и заполнен шаблонами и каталогами
- 🔲 public-key.pem
- 🔲 complience.md
- 🔲 scripts/welcome-seed-entry.ts
- 🔲 EN
   - 🔲 description.txt
   - 🔲 en-pages.png
   - 🔲 live-1.png
   - 🔲 live-2.png
- 🔲 RU
   - 🔲 description.txt
   - 🔲 ru-pages.png
   - 🔲 live-1.png
   - 🔲 live-2.png
- 🔲 ES
   - 🔲 description.txt
   - 🔲 es-pages.png
   - 🔲 live-1.png
   - 🔲 live-2.png
- 🔲 FR
   - 🔲 description.txt
   - 🔲 fr-pages.png
   - 🔲 live-1.png
   - 🔲 live-2.png
- 🔲 DE
   - 🔲 description.txt
   - 🔲 de-pages.png
   - 🔲 live-1.png
   - 🔲 live-2.png
- 🔲 ZN
   - 🔲 description.txt
   - 🔲 zn-pages.png
   - 🔲 live-1.png
   - 🔲 live-2.png
- 🔲 AR
   - 🔲 description.txt
   - 🔲 ar-pages.png
   - 🔲 live-1.png
   - 🔲 live-2.png
