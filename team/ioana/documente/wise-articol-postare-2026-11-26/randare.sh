#!/bin/sh
# Randare doar headless (fără ferestre pe ecran): HTML → PDF A4.
AICI="$(cd "$(dirname "$0")" && pwd)"
node "$AICI/gen.mjs" || exit 1
PROFIL="$(mktemp -d)"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --no-first-run \
  --user-data-dir="$PROFIL" --no-pdf-header-footer --allow-file-access-from-files \
  --print-to-pdf="$AICI/The-4-Layers-and-workshop-post.pdf" "file://$AICI/articol-postare.html" 2>/dev/null
rm -rf "$PROFIL"
