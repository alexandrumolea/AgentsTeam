# Ședința de dimineață

> Cerut de Alex (2026-11-25): „în fiecare dimineață, voi să faceți o ședință și să vă uitați peste ce este important, să fiți proactivi, să-mi pregătiți niște drafturi și să luăm deciziile împreună.”
> Status: aprobată de Alex (D-090, 2026-11-25). Rulează ca task programat `sedinta-de-dimineata` (luni–vineri, ~7:30; aplicația pornește taskurile cu câteva minute de decalaj). Înlocuiește rutina de pe GitHub (`rutina-dimineata.md`), care nu vede emailul, calendarul și Trello.

| Element | Ce scrie |
|---|---|
| **Când** | luni–vineri, 7:30 ora României. Echipa se pregătește singură; Alex intră când ajunge la calculator (10–15 min) |
| **Unde** | un task programat în aplicația Claude, care deschide o sesiune nouă „Ședința de dimineață · data”. Merge doar cu aplicația deschisă și Mac-ul treaz |
| **Owner** | Tudor (backup Elena) |
| **Ce citește** | Gmail (ultimele 24 h, plus firele care așteaptă răspuns), Google Calendar (azi și mâine), Trello „Planning”, board-urile Wise („WISE”, „Wise Pipeline”, „WISE TEAM”) și „Health” (doar citire; sănătatea rămâne doar în agenda din sesiune, Alex, 2026-11-25), `docs/taskuri.md`, `docs/decizii.md`, `docs/intrebari-pentru-alex.md`, follow-up-urile Anei (evidența privată), ritmurile din `docs/ritmuri.md`, întâlnirile înregistrate în Wispr Flow în ziua precedentă (lunea: vineri–duminică; Alex, 2026-11-27) |
| **Ce poate face singur** | citește, pregătește drafturi (ciorne în Gmail, texte, fișiere), mută carduri în Trello, notează în repo |
| **Ce nu face niciodată** | nu trimite emailuri sau mesaje, nu publică, nu acceptă invitații, nu răspunde în numele lui Alex. Tot ce pleacă în lume pleacă după „da” în chat |

## Pașii
1. **Tudor se uită peste zi.** Ce e în calendar azi și mâine (pregătire, drum, materiale), ce emailuri cer răspuns, ce follow-up-uri sunt datorate, ce carduri stau, ce decizii așteaptă. Cu o zi înainte de un training: amintirea cerută de Alex (coaching și conversații autentice, nu informație).
1b. **Tudor citește întâlnirile de ieri din Wispr Flow** (Alex, 2026-11-27: „în ședința de dimineață, aș vrea să verificați și întâlnirile pe care le-am înregistrat în wispr flow în ziua precedentă”). Din transcript, nu doar din rezumat: ce s-a decis, ce și-a asumat Alex și până când, ce au promis ceilalți, follow-up-urile, oportunitățile noi. Ce cere un pas devine card pe „Planning” sau actualizează un card din Opportunities (cu scorul refăcut, D-100); follow-up-urile către clienți merg la Ana, ca draft. Detaliile întâlnirilor stau doar în sesiune, pe Trello și în evidența privată, niciodată în repo. Sesiunile de coaching 1:1 sunt confidențiale: din ele luăm doar logistica (următoarea sesiune, ce a promis Alex să trimită), fără conținutul discuției.
2. **Echipa pregătește drafturile.** Tudor alege cel mult 3 lucruri care merită un draft azi și le dă agentului potrivit: Ana (răspunsuri și follow-up la clienți), Sofia (postări), Daria sau Matei (pregătirea unui training), Victor (oportunități). Drafturile de email intră ca ciorne în Gmail; restul în repo sau în folderul privat potrivit.
2b. **Echipa avansează backlog-ul fără Alex** (Alex, 2026-11-26: „Scopul vostru este să avansați cât mai mult lucrurile fără mine.”). În fiecare ședință, Tudor pornește în paralel cardurile din Backlog care nu așteaptă după Alex (schițe, prime versiuni, PR-uri, documente private) și le mută în In Delivery. Echipa decide detaliile; Alex vede întregul, iar întrebările rămân doar cele care schimbă direcția. Agenda nu e o listă de lucruri care așteaptă după Alex: arată întâi ce a pornit echipa.
3. **Tudor scrie agenda ședinței**, scurt, în sesiune:
   - **Ce contează cel mai mult astăzi pentru a avansa lucrurile?** Întâi obiectivele globale pe scurt, ca amintire, apoi checklistul de 3–5 rânduri, fiecare cu obiectivul pe care îl avansează (O1–O4). Regulile sunt în [`../obiective.md`](../obiective.md) (D-096).
   - **Important azi:** 3–5 rânduri (ce, când, de ce contează).
   - **Din întâlnirile de ieri:** câte un rând pe întâlnire (decizii, ce are Alex de făcut, ce a pus echipa pe Trello).
   - **Drafturi gata de văzut:** fiecare cu un rând de context și unde e.
   - **Decizii de luat:** cel mult 3, fiecare cu recomandarea echipei.
   - **Propun azi:** ce lucrează echipa dacă Alex e de acord.
4. **Ședința cu Alex.** Alex bifează sau schimbă checklistul și răspunde scurt („trimite 1”, „la 2 schimbă…”, „da la decizii”). Tudor aplică pe loc: trimite doar ce a aprobat Alex, notează deciziile în `docs/decizii.md`, mută cardurile în Trello.
5. **Închiderea.** Commit, push, pagina echipei republicată.

## Prima rulare
Prima rulare o pornim împreună, cu Alex de față: aplicația cere o dată acordul pentru Gmail, Calendar și Trello, iar Alex alege „Permite mereu” doar pentru citire și ciorne. Altfel rularea se oprește la primul acord (lecția din 24.11, emailul Laviniei).
