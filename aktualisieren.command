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
read "?Zum Schließen die Eingabetaste drücken …"
