#!/bin/zsh

set -u

projekt_ordner="${0:A:h}"
cd "$projekt_ordner" || exit 1

echo "PGR-Infoseite wird für die Veröffentlichung vorbereitet …"
echo

for programm in node npm git; do
  if ! command -v "$programm" >/dev/null 2>&1; then
    echo "Fehler: $programm wurde nicht gefunden."
    read "?Zum Schließen die Eingabetaste drücken …"
    exit 1
  fi
done

if [[ ! -d node_modules/sharp ]]; then
  echo "Benötigte Komponenten werden installiert …"
  npm install || {
    read "?Installation fehlgeschlagen. Zum Schließen Eingabetaste drücken …"
    exit 1
  }
fi

if ! npm run update; then
  echo
  echo "Die Inhaltsprüfung ist fehlgeschlagen. Es wurde nichts veröffentlicht."
  read "?Zum Schließen die Eingabetaste drücken …"
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "Fehler: Es ist kein GitHub-Remote namens origin eingerichtet."
  read "?Zum Schließen die Eingabetaste drücken …"
  exit 1
fi

echo
echo "Folgende Änderungen werden veröffentlicht:"
git status --short
echo
read "antwort?Jetzt zu GitHub übertragen? [j/N] "
if [[ "$antwort" != [jJyY] ]]; then
  echo "Veröffentlichung abgebrochen."
  read "?Zum Schließen die Eingabetaste drücken …"
  exit 0
fi

git add -A
if git diff --cached --quiet; then
  echo "Es gibt keine neuen Änderungen zum Veröffentlichen."
  read "?Zum Schließen die Eingabetaste drücken …"
  exit 0
fi

zeitpunkt=$(date '+%Y-%m-%d %H:%M')
git commit -m "Inhalte aktualisiert $zeitpunkt" || {
  read "?Git-Commit fehlgeschlagen. Zum Schließen Eingabetaste drücken …"
  exit 1
}

branch=$(git branch --show-current)
if git push origin "$branch"; then
  echo
  echo "Erfolgreich übertragen. GitHub veröffentlicht die Website automatisch."
else
  echo
  echo "Die Übertragung zu GitHub ist fehlgeschlagen."
  read "?Zum Schließen die Eingabetaste drücken …"
  exit 1
fi

echo
read "?Zum Schließen die Eingabetaste drücken …"
