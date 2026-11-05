# Arbeitsauftrag: Infoseite des PGR Oberbergkirchen

## Ziel

Die Website ist eine moderne, leicht zu pflegende Infoseite des Pfarrgemeinderats Oberbergkirchen. Sie soll keine Konkurrenz zur offiziellen Website des Pfarrverbands sein.

Offizielle Informationen werden nicht doppelt gepflegt. Die Seite verweist gut sichtbar auf die offizielle Website des Pfarrverbands Schönberg. Einen eigenen Link zur Gottesdienstordnung gibt es nicht, weil dessen Ziel regelmäßig manuell nachgepflegt werden müsste.

Der laufende Pflegeaufwand soll möglichst gering sein. Neue Inhalte sollen überwiegend dadurch entstehen, dass Bilder und bei Bedarf Markdown-Dateien nach festen Regeln in Ordner gelegt werden.

## Grundform der Website

- moderne, dynamisch wirkende Singlepage
- konsequent für Handys geeignet
- statisch betreibbar, beispielsweise über GitHub Pages
- ohne klassisches CMS wartbar
- überschaubare Seitenlänge
- aktuelle Inhalte zuerst
- längere Inhaltsreihen möglichst horizontal durchsuchbar
- Index beziehungsweise Gesamtübersicht für alle Artikel

## Seitenkopf

- Das Hauptmenü steht auf der linken Seite.
- Das Logo steht ganz rechts am Rand des Seitenkopfs.
- Auf kleinen Bildschirmen steht der Menüknopf links und das Logo ganz rechts.
- Das ausgeklappte mobile Menü verwendet die warme Hintergrundfarbe der Seite.
- Die Diashow benötigt keinen eigenen Menüeintrag „Einblicke“.

## Logo

Als Logo der Website wird ausschließlich die vorhandene Datei `redaktioneller_inhalt/logo/logo.png` verwendet. Das Logo erscheint im Seitenkopf und ersetzt im einleitenden Seitenbereich die bisherige große Textüberschrift „Kirche vor Ort. Gemeinsam gestaltet.“.

## Inhaltsstruktur

```text
redaktioneller_inhalt/
├── veranstaltungen/
│   ├── 2026-08-02-Sommerfest/
│   │   ├── Plakat.jpeg
│   │   ├── Gottesdienst.jpeg
│   │   ├── KaffeeUndKuchen.jpeg
│   │   └── bericht.md
│   └── 2026-12-06-Adventskonzert/
│       ├── Plakat.jpeg
│       └── information.md
└── bilder/
    ├── 2026-06-04-Fronleichnamsaltar.jpeg
    ├── 2025-12-15-KircheImSchnee.jpeg
    └── 2026-04-05-Osterkerze.jpeg
```

## Namensregeln

### Veranstaltungsordner

```text
JJJJ-MM-TT-VeranstaltungstitelInCamelCase
```

Beispiel:

```text
2026-09-20-TagDerOffenenTuer
```

Das Datum steht am Anfang, danach folgt der Veranstaltungstitel. Das Datum wird für die zeitliche Einordnung und Sortierung verwendet. Als Trenner wird immer ein einfacher Bindestrich verwendet. Durch das vorangestellte Datum werden Veranstaltungsordner, Artikel und freie Bilder im Dateisystem chronologisch gruppiert.

### Bilder innerhalb einer Veranstaltung

```text
BildtitelInCamelCase.jpeg
```

Beispiele:

```text
GemeinsamerGottesdienst.jpeg
KaffeeUndKuchen.jpeg
Kinderprogramm.jpeg
```

Das Veranstaltungsdatum wird aus dem Ordnernamen übernommen und muss nicht in jedem Bildnamen wiederholt werden.

### Freie Bilder ohne Veranstaltung

```text
JJJJ-MM-TT-BildtitelInCamelCase.jpeg
```

Beispiel:

```text
2025-12-15-KircheImSchnee.jpeg
```

### Anzeige der Titel

CamelCase wird bei der Anzeige automatisch an den Wortgrenzen durch Leerzeichen getrennt:

- `KircheImSchnee` wird zu „Kirche Im Schnee“.
- `KaffeeUndKuchen` wird zu „Kaffee Und Kuchen“.
- `TagDerOffenenTuer` wird zu „Tag Der Offenen Tuer“.

Umlaute dürfen im angezeigten Text und in Dateinamen vorkommen. Eine spätere sprachliche Nachbearbeitung der automatisch erzeugten Titel ist nicht vorgesehen.

Zulässige Bildformate werden bei der Umsetzung verbindlich festgelegt. Vorgesehen sind mindestens JPEG, PNG und WebP.

## Automatische Verarbeitung

Eine statische Website kann Verzeichnisse im Browser nicht selbst auflisten. Deshalb erzeugt ein Skript beim Veröffentlichen automatisch einen Inhaltskatalog, beispielsweise `redaktioneller_inhalt/katalog.json`.

Der Katalog enthält:

- alle Veranstaltungen mit Titel und Datum
- die zugehörigen Bilder
- freie Bilder mit Titel und Datum
- vorhandene Markdown-Dateien
- die für die Darstellung benötigten Pfade

Der Katalog wird nicht von Hand gepflegt. Bei GitHub Pages soll seine Erzeugung Teil des Veröffentlichungsprozesses sein.

Für die einfache manuelle Aktualisierung liegt `aktualisieren.command` im Ordner `werkzeuge`. Die Datei startet per Doppelklick auf dem Mac die Erzeugung aller Kataloge.

Die Aktualisierung umfasst außerdem:

- automatische WebP-Bildoptimierung mit maximal 1600 × 1600 Pixeln
- Prüfung der Namensmuster und Datumsangaben
- Prüfung auf fehlende Plakate und fehlende Artikelbilder
- verständliche Hinweise und Fehlermeldungen
- optionale lokale Vorschau im Browser

`werkzeuge/veroeffentlichen.command` aktualisiert und prüft die Inhalte, zeigt die Git-Änderungen, fragt vor der Übertragung nach und überträgt anschließend einen Commit zu GitHub. GitHub Actions erstellt daraus automatisch das optimierte Veröffentlichungspaket und veröffentlicht es über GitHub Pages.

Zusätzlich führt der nur für dieses Repository aktivierte Git-`pre-commit`-Hook `.githooks/pre-commit` bei jedem Commit automatisch die Bildoptimierung, Katalogerzeugung und Inhaltsprüfung aus. Er nimmt aktualisierte Katalogdateien in den Commit auf; die Originalbilder bleiben unverändert.

## Zukünftige Veranstaltungen

Eine Veranstaltung gilt als zukünftig, wenn ihr Datum heute oder später liegt.

Zukünftige Veranstaltungen werden prominent beworben:

- chronologisch nach Datum sortiert
- früheste Veranstaltung zuerst
- Im Terminbereich werden ausschließlich Dateien namens `Plakat` angezeigt.
- Veranstaltungen ohne `Plakat` erscheinen nicht im Terminbereich; andere Bilder werden dort niemals als Ersatz verwendet.
- Text aus einer optionalen Informationsdatei wie `information.md`
- mehrere Termine werden horizontal nach rechts durchsuchbar dargestellt
- ein Plakat kann zum Lesen in einer großen Ansicht geöffnet werden

Für zukünftige Veranstaltungen ist ein Plakat erforderlich. Eine optionale textuelle Beschreibung kann es ergänzen, ersetzt das Plakat aber nicht.

## Vergangene Veranstaltungen

Nach Ablauf des Datums wechselt eine Veranstaltung automatisch in die Vergangenheit. Ihre normalen Bilder werden dann Teil des Diashow-Fundus.

- Dateien namens `Plakat` werden grundsätzlich niemals in der Diashow gezeigt.
- Artikel werden unabhängig davon im zentralen Artikelordner gepflegt und dürfen auf Bilder aus einem Veranstaltungsordner verweisen.
- Ohne einen passenden Artikel bleibt die vergangene Veranstaltung ausschließlich über ihre Bilder in der Diashow vertreten.

Für mehrtägige Veranstaltungen ist später bei Bedarf eine Regel für ein Enddatum zu ergänzen.

## Freier Bilderfundus

Der Ordner `redaktioneller_inhalt/bilder/` enthält Bilder, die keiner Veranstaltung zugeordnet sind. Titel und Datum werden vollständig aus dem Dateinamen gelesen.

Diese Bilder werden gemeinsam mit den Bildern vergangener Veranstaltungen in der Diashow berücksichtigt.

## Diashow

Die Diashow steht nach dem einleitenden Seitenbereich und unmittelbar vor den Terminen. Der sichtbare Abstand zum Einleitungsbereich beträgt ungefähr 26 Pixel beziehungsweise rund 0,7 cm. Sie vermittelt einen lebendigen Eindruck und kommt vollständig ohne sichtbare Überschrift, Einführungstext oder Rahmen aus. Die Bilder füllen nicht die gesamte Seitenbreite und werden vollständig mit unverändertem Seitenverhältnis dargestellt. Je nach Bildformat dürfen dabei freie Flächen entstehen; diese verwenden dieselbe helle Hintergrundfarbe wie die Seite und sind deshalb nicht als eigener Darstellungsbereich sichtbar. Wichtige Bildbereiche werden nicht abgeschnitten. Am unteren Bildrand stehen klein und mittig ausgerichtet das Datum und der Name des zugehörigen Artikels. Ist kein Artikel vorhanden, wird stattdessen der Name der Veranstaltung beziehungsweise des freien Bildes verwendet. Diese Zuordnung wird beim Aktualisieren automatisch aus den Bildverweisen der Artikel ermittelt. Auf sichtbare Schaltflächen zum Vor- und Zurückspringen oder Anhalten wird verzichtet.

Die Diashow wird automatisch aus zwei Quellen zusammengestellt:

1. normalen Bildern vergangener Veranstaltungen
2. freien Bildern aus `redaktioneller_inhalt/bilder/`

Die Auswahl erfolgt zufällig, aber gewichtet:

- neue Bilder werden deutlich bevorzugt,
- ältere Bilder bleiben grundsätzlich auswählbar,
- mehrere Bilder derselben Veranstaltung sollen möglichst nicht unmittelbar aufeinander folgen,
- Plakate zukünftiger oder vergangener Veranstaltungen gehören nicht in die Diashow.
- Bei reduzierter Bewegung im Betriebssystem erfolgt kein automatischer Bildwechsel.
- Bei einer Bedienung durch den Besucher wird der automatische Wechsel vorübergehend angehalten.

Für die zufällige Reihenfolge gilt folgende Gewichtung: `0,18 + e^(-AlterInTagen / 180)`. Ein ganz neues Bild hat damit ungefähr die sechsfache Auswahlchance eines sehr alten Bildes. Die Auswahl erfolgt ohne Wiederholung; Bilder aus derselben Veranstaltung werden nach Möglichkeit nicht direkt hintereinander angeordnet. Auf der Website werden nur Bilder angezeigt, deren Datum erreicht oder bereits vergangen ist.

## Artikel

Artikel werden als eigenständige Markdown-Dateien abgelegt:

```text
redaktioneller_inhalt/
└── artikel/
    ├── 2026-05-12-RenovierungDerKirche.md
    └── 2026-08-04-SommerfestRueckblick.md
```

Für Artikelnamen gilt das Muster:

```text
JJJJ-MM-TT-ArtikeltitelInCamelCase.md
```

Das Datum bezeichnet das Veröffentlichungsdatum des Artikels. Titel und Datum werden aus dem Dateinamen gewonnen. Artikel dürfen Bilder aus den Veranstaltungs- und Bilderordnern einbetten.

- In der Startseitenübersicht erscheinen Titel, Datum und ein automatisch erzeugter kurzer Textanfang.
- Die Artikelkarten sind horizontal nach rechts scrollbar.
- Die neuesten Artikel stehen zuerst.
- Eine zusätzliche Funktion „Zufälligen Artikel entdecken“ bietet einen zufällig ausgewählten Artikel an.
- Die Zufallsfunktion ergänzt die chronologische Übersicht und ersetzt sie nicht.
- Alle Artikel sind außerdem über einen vollständigen Artikelindex erreichbar. Dieser bietet eine Teiltextsuche im Artikeltitel und einen Monatsfilter, beispielsweise für alle Artikel aus September 2026.
- Beim Öffnen füllt der Artikel die Inhaltsfläche der Seite aus; der Seitenkopf bleibt erhalten.
- Die Artikelansicht besitzt eine gut sichtbare Zurück-Funktion.
- Jeder Artikel erhält eine direkt aufrufbare Adresse über einen URL-Hash für die Bedienung innerhalb der Startseite.
- Beim Build wird zusätzlich für jeden Artikel eine eigenständige HTML-Seite erzeugt, damit Suchmaschinen ihn direkt finden und indexieren können.

## Suchmaschinen und Domain

- Die Seite wird für die geplante Domain `pgr-oberbergkirchen.de` vorbereitet.
- Solange diese Domain nicht erreichbar und in GitHub Pages eingerichtet ist, bleibt die bestehende GitHub-Pages-Adresse die kanonische Website-Adresse.
- Die jeweils gültige Adresse wird zentral in `site.config.json` gepflegt.
- Seitentitel, Beschreibungen, Vorschauangaben, strukturierte Daten, `robots.txt` und `sitemap.xml` werden beim Build bereitgestellt.
- Nach der Freischaltung der eigenen Domain wird `siteUrl` auf `https://pgr-oberbergkirchen.de/` umgestellt und neu veröffentlicht.

## Sichtbarkeit der Dateien

Die Veranstaltungs- und Bilderordner werden nicht als Verzeichnis oder eigener Navigationsbereich auf der Website angeboten. Besucher sehen nur die daraus erzeugten Inhalte.

Da die Website öffentlich und statisch ausgeliefert wird, sind verwendete Bilder technisch über ihre genaue URL erreichbar. Die Ordnerstruktur ist daher nicht geheim und darf keine vertraulichen Dateien enthalten.

## Abgrenzung zum Pfarrverband

- Die Seite tritt eindeutig als Angebot des Pfarrgemeinderats Oberbergkirchen auf.
- Sie bildet nicht das vollständige Angebot des Pfarrverbands nach.
- Die offizielle Seite des Pfarrverbands wird prominent verlinkt.
- Ein zusätzlicher Hinweisblock zur offiziellen Seite ist nicht erforderlich; die vorhandenen Links in Menü, Einleitung und Fußbereich genügen.
- Die Gottesdienstordnung wird weder parallel gepflegt noch separat verlinkt.
- Inhalte wie amtliche Informationen, Sakramente, Seelsorge und Pfarrbüro bleiben beim offiziellen Angebot.

## Anbieterkennzeichnung

Das Impressum nennt den privaten Anbieter mit vollständiger Postanschrift und E-Mail-Adresse. Wegen der veröffentlichten Artikel wird zusätzlich derselbe Anbieter als inhaltlich Verantwortlicher nach § 18 Abs. 2 MStV benannt. Das Impressum stellt klar, dass die Website kein offizieller Internetauftritt des Pfarrverbands Schönberg oder des Erzbistums München und Freising ist.

## Vorgehensweise bei der Weiterentwicklung

- kleinräumig denken und umsetzen
- Design und fachliche Regeln zuerst besprechen
- danach verfeinern
- erst anschließend programmieren
- bei Unklarheiten frühzeitig nachfragen
- diese Datei bei jeder neuen oder geänderten fachlichen Entscheidung aktualisieren

