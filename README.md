# PGR Oberbergkirchen – Infoseite

Diese statische Website informiert über die Arbeit des Pfarrgemeinderats Oberbergkirchen. Veranstaltungen, Bilder und Artikel werden über Dateien unter `redaktioneller_inhalt/` gepflegt. Ein CMS ist nicht erforderlich.

Der verbindliche fachliche Arbeitsauftrag steht in `KI/Auftrag.md`.

## Voraussetzungen

Für die Katalogerzeugung wird [Node.js](https://nodejs.org/) benötigt. Prüfen lässt sich die Installation im Terminal mit:

```bash
node --version
```

Für die lokale Vorschau wird in den folgenden Beispielen Python 3 verwendet. Auf dem Mac ist es häufig bereits installiert.

## Inhalte aktualisieren

Nach dem Hinzufügen, Umbenennen oder Löschen von Veranstaltungen, Bildern oder Artikeln:

1. Den Ordner `werkzeuge` öffnen und auf `aktualisieren.command` doppelklicken.
2. Warten, bis „Aktualisierung erfolgreich abgeschlossen“ erscheint.
3. Zum Schließen des Fensters die Eingabetaste drücken.

Beim ersten Start kann macOS die Datei aus Sicherheitsgründen blockieren. Dann `werkzeuge/aktualisieren.command` mit der rechten Maustaste anklicken, `Öffnen` wählen und den Start bestätigen.

Alternativ kann die Aktualisierung im Terminal gestartet werden:

```bash
./werkzeuge/aktualisieren.command
```

Für eine Ausführung ohne Rückfrage am Ende steht weiterhin der direkte Befehl zur Verfügung:

```bash
node scripts/generate-catalogs.mjs
```

Das Skript aktualisiert automatisch:

- `redaktioneller_inhalt/veranstaltungen.json`
- `redaktioneller_inhalt/slideshow.json`
- `redaktioneller_inhalt/artikel.json`
- optimierte WebP-Kopien aller verwendeten Bilder
- `redaktioneller_inhalt/bildoptimierung.json`

Zusätzlich werden Ordnernamen, Datumsangaben, Plakate und in Artikeln eingebettete Bilder geprüft. Verständliche Hinweise und Fehler erscheinen direkt im Terminalfenster. Bei einem Fehler wird die Aktualisierung abgebrochen.

Diese drei JSON-Dateien nicht von Hand bearbeiten.

Das Skript muss nicht allein deshalb erneut laufen, weil ein Termin abgelaufen ist. Die Website vergleicht die gespeicherten Daten beim Öffnen selbst mit dem aktuellen Datum. Es muss nur nach einer Änderung an den Quelldateien ausgeführt werden.

Am Ende fragt `werkzeuge/aktualisieren.command`, ob die lokale Vorschau im Browser geöffnet werden soll. Falls nötig, wird dafür automatisch ein lokaler Webserver auf Port 8000 gestartet.

## Website veröffentlichen

Im Projektordner den Ordner `werkzeuge` öffnen und auf `veroeffentlichen.command` doppelklicken. Die Datei:

1. optimiert die Bilder,
2. erzeugt alle Kataloge,
3. prüft die Inhalte,
4. zeigt die gefundenen Git-Änderungen,
5. fragt vor der Übertragung noch einmal nach,
6. erstellt einen Git-Commit und überträgt ihn zu GitHub.

Nach der Bestätigung werden alle Änderungen des Projekts gemeinsam veröffentlicht. Deshalb vor der Bestätigung kurz die angezeigte Dateiliste prüfen.

GitHub Actions baut und veröffentlicht die Website nach der Übertragung automatisch.

### Suchmaschinen und eigene Domain

Beim Erstellen des Veröffentlichungspakets werden automatisch erzeugt:

- aussagekräftige Seitentitel und Beschreibungen,
- Vorschauangaben für Suchmaschinen und soziale Netzwerke,
- strukturierte Daten für den Pfarrgemeinderat und die Artikel,
- eigenständige, von Suchmaschinen erreichbare HTML-Seiten für jeden Artikel,
- `robots.txt` und `sitemap.xml`.

Die gültige Website-Adresse steht zentral in `site.config.json`. Solange die neue Domain noch nicht erreichbar und in GitHub Pages eingerichtet ist, bleibt dort die bisherige GitHub-Pages-Adresse eingetragen.

Sobald `https://pgr-oberbergkirchen.de/` vollständig funktioniert:

1. In `site.config.json` den Wert `siteUrl` auf `https://pgr-oberbergkirchen.de/` ändern.
2. `werkzeuge/veroeffentlichen.command` ausführen.
3. Die Sitemap `https://pgr-oberbergkirchen.de/sitemap.xml` in der Google Search Console einreichen.

Die Datei `plannedDomain` dient nur als Merkhilfe und beeinflusst die veröffentlichte Seite nicht.

### Automatische Aktualisierung beim Commit

Für dieses Projekt ist ein Git-`pre-commit`-Hook unter `.githooks/pre-commit` eingerichtet. Bei jedem Commit – auch aus VS Code – führt er automatisch die vorhandene Aktualisierung aus:

- Bilder werden als verkleinerte WebP-Arbeitskopien optimiert,
- alle Kataloge werden neu erzeugt,
- die Inhalte werden geprüft,
- geänderte Katalogdateien werden dem Commit hinzugefügt.

Die Originalbilder bleiben unverändert. Der Hook ist ausschließlich in diesem Repository aktiv. Nach einem neuen Klonen wird er einmalig mit folgendem Befehl eingeschaltet:

```bash
git config --local core.hooksPath .githooks
```

Falls ein Commit wegen fehlender Abhängigkeiten abbricht, einmal `npm install` ausführen.

## Veranstaltungen pflegen

Jede Veranstaltung erhält einen eigenen Unterordner:

```text
redaktioneller_inhalt/
└── veranstaltungen/
    └── JJJJ-MM-TT-VeranstaltungstitelInCamelCase/
        ├── Plakat.png
        ├── ErstesBild.jpeg
        ├── ZweitesBild.jpeg
        └── information.md
```

Beispiel:

```text
redaktioneller_inhalt/veranstaltungen/2026-12-06-Adventskonzert/
```

Regeln:

- Der Ordnername beginnt mit dem Datum und enthält danach den Titel der Veranstaltung.
- Das Datum verwendet das Format `JJJJ-MM-TT`.
- Ein einfacher Bindestrich `-` trennt das vorangestellte Datum vom Titel.
- `Plakat.jpg`, `Plakat.jpeg`, `Plakat.png` und `Plakat.webp` werden als Plakat erkannt.
- Im Terminbereich werden ausschließlich solche Plakatdateien angezeigt. Ohne `Plakat` erscheint die Veranstaltung dort nicht; andere Bilder werden nicht als Ersatz verwendet.
- Eine optionale `information.md` kann zusätzlichen Text enthalten.
- Andere Bilder im Ordner tragen ihren Bildtitel als CamelCase-Dateinamen.
- Unterstützte Bildformate sind JPEG, PNG und WebP.

Solange das Datum heute oder in der Zukunft liegt, erscheint die Veranstaltung unter „Termine und Veranstaltungen“. Danach verschwindet sie dort automatisch. Normale Bilder der vergangenen Veranstaltung können anschließend in der Diashow erscheinen. Dateien namens `Plakat` werden grundsätzlich niemals in die Diashow übernommen.

Für mehrtägige Veranstaltungen wird vorerst der erste Veranstaltungstag im Ordnernamen verwendet.

## Freie Bilder für die Diashow

Bilder ohne zugehörige Veranstaltung kommen nach:

```text
redaktioneller_inhalt/bilder/
```

Dateinamensmuster:

```text
JJJJ-MM-TT-BildtitelInCamelCase.jpeg
```

Beispiel:

```text
2026-01-15-KircheImSchnee.jpeg
```

Die Diashow mischt freie Bilder mit Bildern vergangener Veranstaltungen. Neuere Bilder werden bei der zufälligen Reihenfolge deutlich bevorzugt; ältere bleiben weiterhin im Fundus.

## Artikel anlegen

Jeder Artikel ist eine eigene Markdown-Datei unter:

```text
redaktioneller_inhalt/artikel/
```

Dateinamensmuster:

```text
JJJJ-MM-TT-ArtikeltitelInCamelCase.md
```

Das Datum ist das Veröffentlichungsdatum. Beispiel:

```text
2026-08-04-SommerfestRueckblick.md
```

Durch das vorangestellte Datum werden Artikel, Veranstaltungsordner und freie Bilder bereits bei der Sortierung nach Dateinamen chronologisch gruppiert.

Ein einfacher Artikel:

```md
# Sommerfest der Kirchengemeinde

Bei schönem Wetter kamen viele Menschen rund um das Pfarrheim zusammen.

![Gäste beim Sommerfest](../veranstaltungen/2026-08-02-Sommerfest/Gruppenbild.jpeg)

Vielen Dank an alle Helferinnen und Helfer.
```

Der erste normale Textabsatz wird automatisch als Vorschau verwendet. Das erste eingebettete Bild dient zugleich als Vorschaubild der Artikelkarte.

Über „Alle Artikel“ öffnet sich das vollständige Artikelverzeichnis. Dort kann nach einem Teil des Artikeltitels gesucht und nach Veröffentlichungsmonat gefiltert werden.

## Regeln für Dateinamen

Titel werden in CamelCase geschrieben:

```text
KaffeeUndKuchen
KircheImSchnee
TagDerOffenenTuer
```

Die Website trennt CamelCase bei der Anzeige automatisch in einzelne Wörter. Umlaute wie `Ä`, `Ö`, `Ü` und `ß` dürfen in Dateinamen verwendet werden.

Titel und Datum werden immer durch einen einfachen Bindestrich getrennt.

## Logo

Das verwendete Logo liegt unter:

```text
redaktioneller_inhalt/logo/logo.png
```

Die Datei nur ersetzen, wenn das neue Logo ebenfalls als PNG unter genau diesem Namen gespeichert wird.

## Website lokal ansehen

`index.html` nicht per Doppelklick öffnen, da der Browser die JSON- und Markdown-Dateien dann häufig nicht laden darf.

Im Projektordner einen lokalen Server starten:

```bash
python3 -m http.server 8000
```

Danach im Browser öffnen:

```text
http://localhost:8000
```

Der Server wird im Terminal mit `Ctrl+C` beendet.

Einfacher ist die Frage „Lokale Vorschau im Browser öffnen?“ am Ende von `werkzeuge/aktualisieren.command` mit `j` zu beantworten.

## GitHub Pages einmalig einrichten

Das Repository enthält unter `.github/workflows/pages.yml` die vollständige Veröffentlichungsautomatik.

Einmalig auf GitHub:

1. Repository öffnen.
2. `Settings` → `Pages` aufrufen.
3. Unter `Build and deployment` als Quelle `GitHub Actions` auswählen.
4. Eine Übertragung auf den Branch `main` startet anschließend automatisch die Veröffentlichung.

Für spätere Veröffentlichungen genügt der Doppelklick auf `werkzeuge/veroeffentlichen.command`.

## Bildoptimierung

Originalbilder bleiben unverändert erhalten. Beim Aktualisieren entstehen automatisch WebP-Kopien mit maximal 1600 × 1600 Pixeln und angepasster Dateigröße. Die veröffentlichte Website verwendet diese optimierten Dateien auch für Plakate und Artikelbilder.

Die erzeugten WebP-Dateien liegen lokal unter `redaktioneller_inhalt/optimiert/`. Sie werden nicht in Git gespeichert, sondern lokal und bei GitHub jeweils neu erzeugt.

## Hinweise zu öffentlichen Bildern

Alle über GitHub Pages veröffentlichten Bilder sind grundsätzlich öffentlich über ihre genaue URL erreichbar. Keine vertraulichen Dateien ablegen. Bei Bildern von Personen müssen die erforderlichen Veröffentlichungsrechte und Einwilligungen vorliegen.

## Technischer Aufbau

- `index.html` – Seitenstruktur
- `styles.css` – Gestaltung und responsive Darstellung
- `app.js` – Diashow, Termine, Artikel und Dialoge
- `redaktioneller_inhalt/` – alle redaktionell gepflegten Inhalte
- `scripts/` – Erzeugung der JSON-Kataloge
- `werkzeuge/aktualisieren.command` – Aktualisierung aller Kataloge per Doppelklick
- `werkzeuge/veroeffentlichen.command` – prüfen, speichern und zu GitHub übertragen
- `.github/workflows/pages.yml` – automatische GitHub-Pages-Veröffentlichung
- `package.json` – benötigte Node.js-Komponenten und Befehle
- `KI/Auftrag.md` – verbindlicher Projektauftrag

Die Website verwendet keine externen Schriftarten, keine Analyse- oder Trackingdienste und kein externes Markdown-Skript.
