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

## Logo

Die Website verwendet das Logo unter:

`redaktioneller_inhalt/logo/logo.png`

## Redaktionelle Inhalte

Die vereinbarte Ordnerstruktur und alle Dateinamensregeln stehen in `KI/Auftrag.md`. Die automatische Verarbeitung der Veranstaltungen, Bilder und Markdown-Artikel wird in den nächsten Ausbauschritten umgesetzt.

## Hinweis
Diese Version ist absichtlich ohne Backend oder CMS gebaut. Die Pflege soll später ausschließlich über klar benannte Ordner, Bilder und Markdown-Dateien erfolgen.

## Rechtliches

Enthalten sind jetzt:
- sichtbarer Hinweis auf den privaten Charakter der Seite,
- prominenter Link zur offiziellen Pfarrseite,
- Impressum,
- Datenschutzinformation.

Externe Google-Fonts und das externe Markdown-CDN wurden entfernt.
