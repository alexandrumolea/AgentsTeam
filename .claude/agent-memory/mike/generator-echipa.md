---
name: generator-echipa
description: Mike deține scripts/build-echipa.mjs din 2026-11-15; puncte fragile care nu se văd din cod la prima citire
metadata:
  type: project
---
Adăugat: 2026-11-15


Mike deține `scripts/build-echipa.mjs` (pagina echipei, `docs/echipa.html`) din 2026-11-15, delegat de Tudor. Contractul complet e documentat în `team/mike/documente/stack-tehnic-v0.md`, secțiunea 2.

Puncte fragile observate (necorectate, Tudor a cerut doar documentare):
- `tableRows` ia toate tabelele din fișier și sare doar primul antet → un al doilea tabel în `docs/aor.md` produce arii false.
- `team/tudor/rapoarte/` lipsă → scriptul crapă (readdirSync neprotejat).
- Titluri `##` redenumite în profil → carduri dispar fără eroare.
- Verdictele din colecția `verdicts` sunt legate de ID-ul deciziei; redenumirea ID-ului le pierde.

**Why:** Alte agenți editează aceste fișiere; stricăciunile sunt tăcute.
**How to apply:** Când Tudor/Alex aprobă, propune un mod de verificare care avertizează la titluri lipsă. Testează mereu pe o copie în scratchpad, nu peste `docs/echipa.html`. Vezi [[project-stack-hosting]].
