#!/bin/sh
# Verifică un commit înainte să devină public: fără emailuri reale, telefoane sau chei.
# Folosire: scripts/verifica-public.sh [commit]   (implicit HEAD)
REV="${1:-HEAD}"
FAIL=0
PAT='[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|(\+40|\b0)7[0-9]{2}[ .-]?[0-9]{3}[ .-]?[0-9]{3}\b|gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9-]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----'
ALLOW='noreply@anthropic\.com|users\.noreply\.github\.com|@example\.(com|org)|\.invalid'
HITS=$(git grep -nIE "$PAT" "$REV" -- . ':!*.lock' 2>/dev/null | grep -vE "$ALLOW")
if [ -n "$HITS" ]; then
  echo "STOP: posibile date private în $REV:"; echo "$HITS" | head -20; FAIL=1
fi
BAD=$(git log --format='%ae%n%ce' "$REV" | sort -u | grep -vE "$ALLOW")
if [ -n "$BAD" ]; then
  echo "STOP: commit-uri cu adresă de email reală: $BAD"; FAIL=1
fi
[ $FAIL -eq 0 ] && echo "OK: nimic privat în $REV."
exit $FAIL
