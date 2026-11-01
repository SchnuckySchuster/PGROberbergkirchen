# PGR Oberbergkirchen – Infoseite

Diese statische Website informiert über die Arbeit des Pfarrgemeinderats Oberbergkirchen. Veranstaltungen, Bilder und Artikel werden über Dateien unter `redaktioneller_inhalt/` gepflegt. Ein CMS ist nicht erforderlich.

Der verbindliche fachliche Arbeitsauftrag steht in `KI/Auftrag.md`.

## Voraussetzungen

Für die Katalogerzeugung wird [Node.js](https://nodejs.org/) benötigt. Prüfen lässt sich die Installation im Terminal mit:

```bash
node --version
```

Für die lokale Vorschau wird in den folgenden Beispielen Python 3 verwendet. Auf dem Mac ist es häufig bereits installiert.

## Wichtigster Arbeitsablauf

Nach dem Hinzufügen, Umbenennen oder Löschen von Veranstaltungen, Bildern oder Artikeln:

1. Im Projektordner auf `aktualisieren.command` doppelklicken.
2. Warten, bis „Aktualisierung erfolgreich abgeschlossen“ erscheint.
3. Zum Schließen des Fensters die Eingabetaste drücken.

Beim ersten Start kann macOS die Datei aus Sicherheitsgründen blockieren. Dann `aktualisieren.command` mit der rechten Maustaste anklicken, `Öffnen` wählen und den Start bestätigen.

Alternativ kann die Aktualisierung im Terminal gestartet werden:

```bash
./aktualisieren.command
```

Für eine Ausführung ohne Rückfrage am Ende steht weiterhin der direkte Befehl zur Verfügung:

```bash
node scripts/generate-catalogs.mjs
```

Das Skript aktualisiert automatisch:

- `redaktioneller_inhalt/veranstaltungen.json`
- `redaktioneller_inhalt/slideshow.json`
- `redaktioneller_inhalt/artikel.json`

Diese drei JSON-Dateien nicht von Hand bearbeiten.

Das Skript muss nicht allein deshalb erneut laufen, weil ein Termin abgelaufen ist. Die Website vergleicht die gespeicherten Daten beim Öffnen selbst mit dem aktuellen Datum. Es muss nur nach einer Änderung an den Quelldateien ausgeführt werden.

## Veranstaltungen pflegen

Jede Veranstaltung erhält einen eigenen Unterordner:

```text
redaktioneller_inhalt/
└── veranstaltungen/
    └── VeranstaltungstitelInCamelCase__JJJJ-MM-TT/
        ├── Plakat.png
        ├── ErstesBild.jpeg
        ├── ZweitesBild.jpeg
        └── information.md
```

Beispiel:

```text
redaktioneller_inhalt/veranstaltungen/Adventskonzert__2026-12-06/
```

Regeln:

- Der Ordnername enthält Titel und Datum der Veranstaltung.
- Das Datum verwendet das Format `JJJJ-MM-TT`.
- Die beiden Unterstriche `__` trennen Titel und Datum eindeutig.
- Bestehende ältere Ordner mit einfachem Bindestrich vor dem Datum werden weiterhin erkannt.
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
BildtitelInCamelCase__JJJJ-MM-TT.jpeg
```

Beispiel:

```text
KircheImSchnee__2026-01-15.jpeg
```

Die Diashow mischt freie Bilder mit Bildern vergangener Veranstaltungen. Neuere Bilder werden bei der zufälligen Reihenfolge deutlich bevorzugt; ältere bleiben weiterhin im Fundus.

## Artikel anlegen

Jeder Artikel ist eine eigene Markdown-Datei unter:

```text
redaktioneller_inhalt/artikel/
```

Dateinamensmuster:

```text
ArtikeltitelInCamelCase__JJJJ-MM-TT.md
```

Das Datum ist das Veröffentlichungsdatum. Beispiel:

```text
SommerfestRueckblick__2026-08-04.md
```

Ein einfacher Artikel:

```md
# Sommerfest der Kirchengemeinde

Bei schönem Wetter kamen viele Menschen rund um das Pfarrheim zusammen.

![Gäste beim Sommerfest](../veranstaltungen/Sommerfest__2026-08-02/Gruppenbild.jpeg)

Vielen Dank an alle Helferinnen und Helfer.
```

Der erste normale Textabsatz wird automatisch als Vorschau verwendet. Das erste eingebettete Bild dient zugleich als Vorschaubild der Artikelkarte.

## Regeln für Dateinamen

Titel werden in CamelCase geschrieben:

```text
KaffeeUndKuchen
KircheImSchnee
TagDerOffenenTuer
```

Die Website trennt CamelCase bei der Anzeige automatisch in einzelne Wörter. Für besonders zuverlässige Dateinamen können Umlaute als `Ae`, `Oe`, `Ue` und `ss` geschrieben werden.

Keine doppelten Unterstriche innerhalb des eigentlichen Titels verwenden. Sie sind als Trennzeichen vor dem Datum reserviert.

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

## Auf GitHub Pages veröffentlichen

Vor jeder Veröffentlichung zuerst die Kataloge erzeugen:

```bash
./aktualisieren.command
```

Danach alle geänderten Quelldateien und die neu erzeugten JSON-Kataloge gemeinsam in das GitHub-Repository übertragen.

Für ein neues Repository:

1. Repository auf GitHub anlegen und Projektdateien hochladen.
2. `Settings` → `Pages` öffnen.
3. Als Quelle `Deploy from a branch` wählen.
4. Branch `main` und Ordner `/root` auswählen.
5. Speichern.

Eine spätere GitHub-Automatisierung kann die Katalogerzeugung beim Veröffentlichen übernehmen. Derzeit muss `aktualisieren.command` nach inhaltlichen Änderungen ausgeführt werden.

## Hinweise zu öffentlichen Bildern

Alle über GitHub Pages veröffentlichten Bilder sind grundsätzlich öffentlich über ihre genaue URL erreichbar. Keine vertraulichen Dateien ablegen. Bei Bildern von Personen müssen die erforderlichen Veröffentlichungsrechte und Einwilligungen vorliegen.

## Technischer Aufbau

- `index.html` – Seitenstruktur
- `styles.css` – Gestaltung und responsive Darstellung
- `app.js` – Diashow, Termine, Artikel und Dialoge
- `redaktioneller_inhalt/` – alle redaktionell gepflegten Inhalte
- `scripts/` – Erzeugung der JSON-Kataloge
- `aktualisieren.command` – Aktualisierung aller Kataloge per Doppelklick
- `KI/Auftrag.md` – verbindlicher Projektauftrag

Die Website verwendet keine externen Schriftarten, keine Analyse- oder Trackingdienste und kein externes Markdown-Skript.
