# Kirchengemeinde – GitHub Pages

## Starten
Lokal funktioniert `fetch()` nicht zuverlässig per Doppelklick auf `index.html`.
Zum Testen im Projektordner z. B.:

```bash
python3 -m http.server 8000
```

Dann im Browser:
`http://localhost:8000`

## Auf GitHub Pages veröffentlichen
1. Neues GitHub-Repository anlegen.
2. Alle Dateien dieses Ordners hochladen.
3. Repository → Settings → Pages.
4. Source: `Deploy from a branch`.
5. Branch: `main`, Ordner `/root`.
6. Speichern.

## Kirchenzeichnung ersetzen
Datei ersetzen:
`assets/images/kirche.svg`

Am einfachsten eine PNG-, JPG-, WebP- oder SVG-Datei verwenden und in `index.html`
den Dateinamen an zwei Stellen ändern, falls die Endung abweicht.

## Neue Bilder in die Diaschau
Bilder nach:
`assets/images/`

Danach `content/slides.json` ergänzen:

```json
{
  "image": "assets/images/mein-bild.jpg",
  "caption": "Mein Bildtitel",
  "alt": "Kurze Bildbeschreibung"
}
```

## Neuen Artikel anlegen
1. Markdown-Datei unter `content/articles/` erstellen, z. B. `pfarrfest.md`.
2. `content/articles.json` um einen Eintrag ergänzen:

```json
{
  "title": "Pfarrfest",
  "date": "20. September 2026 · 14:00 Uhr",
  "summary": "Kurze Vorschau auf der Startseite.",
  "image": "assets/images/pfarrfest.jpg",
  "file": "content/articles/pfarrfest.md"
}
```

Der Artikel selbst kann ganz normal in Markdown geschrieben werden:

```md
# Pfarrfest

**20. September 2026 · 14:00 Uhr**

Herzliche Einladung ...

## Programm

- Musik
- Kaffee und Kuchen
- Kinderprogramm
```

## Gruppen ändern
`content/groups.json`

Dort können Pfarrgemeinderat, Ministranten, Chor usw. ohne HTML-Kenntnisse gepflegt werden.

## Hinweis
Diese Version ist absichtlich ohne Backend/CMS gebaut. Die Pflege erfolgt über wenige JSON- und Markdown-Dateien.
Später kann problemlos ein Git-basiertes CMS ergänzt werden, ohne das Design neu zu bauen.
