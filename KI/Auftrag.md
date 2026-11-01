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

Als Logo der Website wird ausschließlich die vorhandene Datei `redaktioneller_inhalt/logo/logo.png` verwendet. Das Logo erscheint im Seitenkopf und an geeigneten hervorgehobenen Stellen des Designs.

## Inhaltsstruktur

```text
redaktioneller_inhalt/
├── veranstaltungen/
│   ├── Sommerfest__2026-08-02/
│   │   ├── Plakat.jpeg
│   │   ├── Gottesdienst.jpeg
│   │   ├── KaffeeUndKuchen.jpeg
│   │   └── bericht.md
│   └── Adventskonzert__2026-12-06/
│       ├── Plakat.jpeg
│       └── information.md
└── bilder/
    ├── Fronleichnamsaltar__2026-06-04.jpeg
    ├── KircheImSchnee__2025-12-15.jpeg
    └── Osterkerze__2026-04-05.jpeg
```

## Namensregeln

### Veranstaltungsordner

```text
VeranstaltungstitelInCamelCase__JJJJ-MM-TT
```

Beispiel:

```text
TagDerOffenenTuer__2026-09-20
```

Der Teil vor `__` ist der Veranstaltungstitel. Das Datum hinter `__` wird für die zeitliche Einordnung und Sortierung verwendet.

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
BildtitelInCamelCase__JJJJ-MM-TT.jpeg
```

Beispiel:

```text
KircheImSchnee__2025-12-15.jpeg
```

### Anzeige der Titel

CamelCase wird bei der Anzeige automatisch an den Wortgrenzen durch Leerzeichen getrennt:

- `KircheImSchnee` wird zu „Kirche Im Schnee“.
- `KaffeeUndKuchen` wird zu „Kaffee Und Kuchen“.
- `TagDerOffenenTuer` wird zu „Tag Der Offenen Tuer“.

Umlaute dürfen im angezeigten Text vorkommen. Für zuverlässige Dateinamen sollen sie als `Ae`, `Oe`, `Ue` und `ss` geschrieben werden. Eine spätere sprachliche Nachbearbeitung der automatisch erzeugten Titel ist nicht vorgesehen.

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

Für die einfache manuelle Aktualisierung liegt `aktualisieren.command` im Projektwurzelverzeichnis. Die Datei startet per Doppelklick auf dem Mac die Erzeugung aller Kataloge.

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

Die Diashow steht nach dem einleitenden Seitenbereich und unmittelbar vor den Terminen. Sie vermittelt einen lebendigen Eindruck und kommt vollständig ohne sichtbare Überschrift, Einführungstext oder Bildunterschriften aus. Die Bilder füllen nicht die gesamte Seitenbreite. Ein schmaler farbiger Rand bindet die Diashow sichtbar in das Seitendesign ein. Navigationselemente und notwendige barrierefreie Beschriftungen bleiben möglich, sollen sich optisch aber zurückhalten.

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
    ├── RenovierungDerKirche__2026-05-12.md
    └── SommerfestRueckblick__2026-08-04.md
```

Für Artikelnamen gilt das Muster:

```text
ArtikeltitelInCamelCase__JJJJ-MM-TT.md
```

Das Datum bezeichnet das Veröffentlichungsdatum des Artikels. Titel und Datum werden aus dem Dateinamen gewonnen. Artikel dürfen Bilder aus den Veranstaltungs- und Bilderordnern einbetten.

- In der Startseitenübersicht erscheinen Titel, Datum und ein automatisch erzeugter kurzer Textanfang.
- Die Artikelkarten sind horizontal nach rechts scrollbar.
- Die neuesten Artikel stehen zuerst.
- Eine zusätzliche Funktion „Zufälligen Artikel entdecken“ bietet einen zufällig ausgewählten Artikel an.
- Die Zufallsfunktion ergänzt die chronologische Übersicht und ersetzt sie nicht.
- Alle Artikel sind außerdem über einen vollständigen Artikelindex erreichbar.
- Beim Öffnen füllt der Artikel die Inhaltsfläche der Seite aus; der Seitenkopf bleibt erhalten.
- Die Artikelansicht besitzt eine gut sichtbare Zurück-Funktion.
- Jeder Artikel erhält eine direkt aufrufbare Adresse über einen URL-Hash.

## Sichtbarkeit der Dateien

Die Veranstaltungs- und Bilderordner werden nicht als Verzeichnis oder eigener Navigationsbereich auf der Website angeboten. Besucher sehen nur die daraus erzeugten Inhalte.

Da die Website öffentlich und statisch ausgeliefert wird, sind verwendete Bilder technisch über ihre genaue URL erreichbar. Die Ordnerstruktur ist daher nicht geheim und darf keine vertraulichen Dateien enthalten.

## Abgrenzung zum Pfarrverband

- Die Seite tritt eindeutig als Angebot des Pfarrgemeinderats Oberbergkirchen auf.
- Sie bildet nicht das vollständige Angebot des Pfarrverbands nach.
- Die offizielle Seite des Pfarrverbands wird prominent verlinkt.
- Die Gottesdienstordnung wird weder parallel gepflegt noch separat verlinkt.
- Inhalte wie amtliche Informationen, Sakramente, Seelsorge und Pfarrbüro bleiben beim offiziellen Angebot.

## Vorgehensweise bei der Weiterentwicklung

- kleinräumig denken und umsetzen
- Design und fachliche Regeln zuerst besprechen
- danach verfeinern
- erst anschließend programmieren
- bei Unklarheiten frühzeitig nachfragen
- diese Datei bei jeder neuen oder geänderten fachlichen Entscheidung aktualisieren

