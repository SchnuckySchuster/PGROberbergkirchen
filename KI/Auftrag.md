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
- Das Logo steht auf der rechten Seite.
- Auf kleinen Bildschirmen steht der Menüknopf links und das Logo rechts.

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

## Zukünftige Veranstaltungen

Eine Veranstaltung gilt als zukünftig, wenn ihr Datum heute oder später liegt.

Zukünftige Veranstaltungen werden prominent beworben:

- chronologisch nach Datum sortiert
- früheste Veranstaltung zuerst
- Darstellung mit `Plakat` als bevorzugtem Vorschaubild, falls vorhanden
- alternativ Verwendung eines anderen vorhandenen Bildes
- Text aus einer optionalen Informationsdatei wie `information.md`

Für zukünftige Veranstaltungen soll sowohl eine bildliche Bewerbung in Form eines Plakats als auch eine textuelle Beschreibung möglich sein.

## Vergangene Veranstaltungen

Nach Ablauf des Datums wechselt eine Veranstaltung automatisch in die Vergangenheit. Ihre normalen Bilder werden dann Teil des Diashow-Fundus.

- `Plakat`-Bilder werden nach der Veranstaltung nicht in der Diashow gezeigt.
- Artikel werden unabhängig davon im zentralen Artikelordner gepflegt und dürfen auf Bilder aus einem Veranstaltungsordner verweisen.
- Ohne einen passenden Artikel bleibt die vergangene Veranstaltung ausschließlich über ihre Bilder in der Diashow vertreten.

Für mehrtägige Veranstaltungen ist später bei Bedarf eine Regel für ein Enddatum zu ergänzen.

## Freier Bilderfundus

Der Ordner `redaktioneller_inhalt/bilder/` enthält Bilder, die keiner Veranstaltung zugeordnet sind. Titel und Datum werden vollständig aus dem Dateinamen gelesen.

Diese Bilder werden gemeinsam mit den Bildern vergangener Veranstaltungen in der Diashow berücksichtigt.

## Diashow

Die Diashow steht unmittelbar unter dem Seitenkopf und damit vor allen Textbereichen der Startseite. Sie vermittelt beim Einstieg einen lebendigen Eindruck und kommt vollständig ohne sichtbare Überschrift, Einführungstext oder Bildunterschriften aus. Navigationselemente und notwendige barrierefreie Beschriftungen bleiben möglich, sollen sich optisch aber zurückhalten.

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

Die konkrete Gewichtungsformel wird bei der Umsetzung kleinräumig festgelegt und dokumentiert.

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

