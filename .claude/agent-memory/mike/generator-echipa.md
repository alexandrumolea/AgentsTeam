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

2026-11-17: Panoul de control (primul bloc de sus) clasifică doar după coloana Status: taskuri (nou, de făcut, în lucru, gata, blocat, la Alex, anulat), decizii (de luat, de confirmat, de discutat = deschise), întrebări (`~~` = răspunsă, „Amânat” = amânată, „răspuns AAAA-” = parțial). Un status nou apare la „Status necunoscut” plus avertisment în consolă la build. „la Alex (D-xxx)” se lipește de rândul deciziei. Datele „gata”/„actualizat” vin din `git blame` pe `docs/taskuri.md`. Verdictele din `verdicts` marchează rândurile „ai răspuns”.
2026-11-17: Pagina nu are meta viewport (o pune artifact-ul). Testul pe telefon se face pe o copie cu meta viewport, servită prin http din scratchpad; din file:// panoul randează instantanee data: și ignoră emularea. `.wrap` are acum `minmax(0,1fr)`: înainte, tabelele lățeau pagina la 608 px pe telefon.
