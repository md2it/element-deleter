# ELEMENT DELETER

<p align="center" id="installation">
  <a href="https://chromewebstore.google.com/detail/element-deleter/dpgjhjgfbicnenmdknepflmdahmhlbag">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Chrome%20Web%20Store.svg?logo=googlechrome&logoColor=4285F4&mode=dark">
      <source media="(prefers-color-scheme: light)" srcset="https://shieldcn.dev/badge/Chrome%20Web%20Store.svg?logo=googlechrome&logoColor=4285F4&mode=light">
      <img src="https://shieldcn.dev/badge/Chrome%20Web%20Store.svg?logo=googlechrome&logoColor=4285F4&mode=dark" alt="Chrome Web Store">
    </picture>
  </a>
  <a href="https://addons.mozilla.org/firefox/addon/md2it-element-deleter/">
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
=-=-=-=-=-=-=-=-= | DE | <a href="../README.md">EN</a> | <a href="./ES.md">ES</a> | <a href="./FR.md">FR</a> | <a href="./RU.md">RU</a> | <a href="./ZH.md">中文</a> | <a href="./AR.md">عربي</a> | =-=-=-=-=-=-=-=-=
</p>

## BESCHREIBUNG

Element Deleter entfernt schnell alles, was auf einer Seite stört: Banner, Pop-ups, fixierte Kopfzeilen, Widgets, zusätzliche Blöcke, Iframes und andere ablenkende Elemente.

Die Erweiterung hilft Frontend-Entwicklern, QA-Testern und Designern, Seiten ohne störende Blöcke zu prüfen, saubere Screenshots zu erstellen, Layoutideen zu bewerten oder verdeckte Inhalte freizulegen. Beim alltäglichen Surfen erleichtert sie das Lesen, Anzeigen und Speichern von Seiten.

Bewegen Sie den Mauszeiger über ein Element und klicken Sie: Das Element wird entfernt. Ein Fehler lässt sich rückgängig machen.

<p align="center" id="screenshots">
  <a href="../publication/screenshots/DE-0.png"><img src="../publication/screenshots/DE-0.png" width="180" alt="Element Deleter screenshot 1"></a>
  <a href="../publication/screenshots/DE-1.png"><img src="../publication/screenshots/DE-1.png" width="180" alt="Element Deleter screenshot 2"></a>
  <a href="../publication/screenshots/DE-2.png"><img src="../publication/screenshots/DE-2.png" width="180" alt="Element Deleter screenshot 3"></a>
  <a href="../publication/screenshots/DE-3.png"><img src="../publication/screenshots/DE-3.png" width="180" alt="Element Deleter screenshot 4"></a>
</p>

## HAUPTFUNKTIONEN

- Seitenelemente mit wenigen Klicks entfernen
- Entfernte Elemente wiederherstellen
- Mehrere Löschungen rückgängig machen, solange der Löschmodus aktiv ist
- Elemente über das Kontextmenü löschen
- Funktioniert mit Iframes und eingebetteten Inhalten
- Klare Benachrichtigung nach dem Löschen
- Leichtgewichtig und einfach
- Ausschließlich lokale Einstellungen
- Oberfläche verfügbar auf Englisch, Französisch, Deutsch, Spanisch, Russisch, Arabisch und vereinfachtem Chinesisch

## DATENSCHUTZ

- Keine Datenerfassung
- Kein Tracking
- Keine Netzwerkanfragen
- Änderungen gelten nur für die aktuelle Seite
- Beim Neuladen wird der ursprüngliche Inhalt wiederhergestellt

## EINSCHRÄNKUNGEN

- **Die Auswahl von Iframes unterscheidet sich** von der Auswahl anderer Elemente:
   - Das Iframe wird als Ganzes ausgewählt
   - Ursache ist eine Plattformbeschränkung; eine Injektion in das Iframe ist unerwünscht
   - Die Auswahl sieht wegen anderer Ereignishandler anders aus, ohne die Funktion zu beeinträchtigen
- **Die Position eines wiederhergestellten SVG ist manchmal falsch:**
   - Dies ist ein Funktionsfehler
   - Versuche zur Behebung waren sehr zeitaufwendig
   - Die Auswirkung ist gering, da dieses Szenario selten auftritt

## LIZENZ

[MIT-Lizenz](../LICENSE)
