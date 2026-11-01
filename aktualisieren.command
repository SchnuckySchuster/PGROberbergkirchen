#!/bin/zsh

set -u

projekt_ordner="${0:A:h}"
cd "$projekt_ordner" || exit 1

echo "PGR-Infoseite wird aktualisiert …"
echo

if ! command -v node >/dev/null 2>&1; then
  echo "Fehler: Node.js ist nicht installiert oder wurde nicht gefunden."
  echo "Download: https://nodejs.org/"
  echo
  read "?Zum Schließen die Eingabetaste drücken …"
  exit 1
fi

if [[ ! -d node_modules/sharp ]]; then
  echo "Bildoptimierung wird eingerichtet …"
  if ! npm install; then
    echo
    echo "Die benötigten Komponenten konnten nicht installiert werden."
    read "?Zum Schließen die Eingabetaste drücken …"
    exit 1
  fi
  echo
fi

if node scripts/generate-catalogs.mjs; then
  echo
  echo "Aktualisierung erfolgreich abgeschlossen."
else
  status=$?
  echo
  echo "Die Aktualisierung ist fehlgeschlagen. Bitte die Fehlermeldung oben prüfen."
  read "?Zum Schließen die Eingabetaste drücken …"
  exit "$status"
fi

echo
read "antwort?Lokale Vorschau im Browser öffnen? [j/N] "
if [[ "$antwort" == [jJyY] ]]; then
  if ! curl --silent --head http://127.0.0.1:8000/ >/dev/null 2>&1; then
    if ! command -v python3 >/dev/null 2>&1; then
      echo "Python 3 wurde nicht gefunden. Die Vorschau kann nicht gestartet werden."
      read "?Zum Schließen die Eingabetaste drücken …"
      exit 1
    fi
    nohup python3 -m http.server 8000 > /tmp/pgr-oberbergkirchen-vorschau.log 2>&1 &
    sleep 1
  fi
  open http://localhost:8000
  echo "Die Vorschau wurde unter http://localhost:8000 geöffnet."
fi

echo
read "?Zum Schließen die Eingabetaste drücken …"
