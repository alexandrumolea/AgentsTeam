#!/bin/sh
# v2: generează HTML-ul după manualul Wise Teams, verifică textele cuvânt cu cuvânt, randează PDF-ul headless.
AICI="$(cd "$(dirname "$0")" && pwd)"
node "$AICI/gen-v2.mjs" || exit 1
node "$AICI/verifica-text.mjs" "$AICI/articol-postare-v2.html" || exit 1
PROFIL="$(mktemp -d)"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --no-first-run \
  --user-data-dir="$PROFIL" --no-pdf-header-footer --allow-file-access-from-files \
  --print-to-pdf="$AICI/The-4-Layers-and-workshop-post-v2.pdf" "file://$AICI/articol-postare-v2.html" 2>/dev/null
rm -rf "$PROFIL"
