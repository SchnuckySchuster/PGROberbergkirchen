#!/bin/zsh

set -u
unsetopt BG_NICE 2>/dev/null || true

projekt_ordner="${0:A:h:h}"
cd "$projekt_ordner" || exit 1

echo "Lokale Vorschau der PGR-Infoseite wird vorbereitet …"
echo

for programm in node npm python3 curl open lsof; do
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

if ! npm run update || ! npm run build; then
  echo
  echo "Die lokale Vorschau konnte nicht erstellt werden."
  read "?Zum Schließen die Eingabetaste drücken …"
  exit 1
fi

port=8000
while lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; do
  (( port++ ))
done

adresse="http://localhost:$port/"
python3 -m http.server "$port" --directory "$projekt_ordner/dist" &
server_pid=$!

server_beenden() {
  kill "$server_pid" >/dev/null 2>&1 || true
}
trap server_beenden EXIT INT TERM

for versuch in {1..20}; do
  if curl --silent --head "$adresse" >/dev/null 2>&1; then
    break
  fi
  sleep 0.1
done

if ! curl --silent --head "$adresse" >/dev/null 2>&1; then
  echo "Der lokale Server konnte nicht gestartet werden."
  read "?Zum Schließen die Eingabetaste drücken …"
  exit 1
fi

open "$adresse"
echo
echo "Die Vorschau läuft unter $adresse"
echo "Zum Beenden dieses Fenster schließen oder Ctrl+C drücken."
echo

wait "$server_pid"
