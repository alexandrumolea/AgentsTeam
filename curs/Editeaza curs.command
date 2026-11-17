#!/bin/zsh
# Dublu-click în Finder: pornește editorul cursului și deschide browserul (1.11).
# Fereastra Terminal trebuie să rămână deschisă cât editezi; o închizi când ai terminat.
cd "$(dirname "$0")" || exit 1
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
if ! command -v node >/dev/null; then echo "Nu găsesc Node.js. Instalează-l de pe nodejs.org și încearcă din nou."; read -k 1; exit 1; fi
[ -d node_modules ] || npm ci --silent
node editor.mjs "${1:-../privat/cursuri/change-agility}"
