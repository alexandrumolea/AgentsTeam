# Trello: Planning

> **DRI:** Tudor, responsabil de board („Tu, Tudor, rămâi în charge de acest board”, Alex). **Backup:** Radu. Regula lui Alex din 2026-11-20 (D-074).
> Boardul „Planning” din Trello-ul lui Alex (privat; linkul nu intră în repo-ul public).

Alex vede în Trello, într-un singur loc, tot ce are echipa de făcut și tot ce e deschis.

## Ce pune Tudor unde
| Coloana | Ce intră |
|---|---|
| **Backlog** | Tot ce ar trebui să lucreze echipa și n-a pornit încă: taskurile „nou” și „de făcut” din `docs/taskuri.md` și ideile „nouă” din `docs/idei.md`. |
| **In Delivery** | Tot ce e deschis: taskurile „în lucru”, „blocat”, „la Alex”, ideile „în analiză” sau „aprobată” și lucrurile de business pornite (oferte, clienți). |
| **Done** | Ce s-a terminat. Tudor mută cardul când se termină. |

Coloanele lui Alex (My Strategy, Opportunities, Design Needed, Gave Up Opportunities) și cardurile pe care le face el rămân ale lui. **Facem echipă** (Alex, 2026-11-25: „vreau să te uiți și peste cardurile mele, facem echipă”): la fiecare sincronizare, Tudor citește și cardurile lui Alex și:
- le leagă de ce știe echipa (oferte, clienți, cursuri), ca să nu existe două carduri pentru același lucru;
- semnalează ce s-a blocat sau a rămas vechi (fără activitate de peste o lună, termen care se apropie);
- propune cine din echipă poate prelua ceva (Ana, Victor, Learning Studio etc.).
- acționează direct: mută cardul în coloana în care e de fapt, unește dublurile (păstrează cardul lui Alex și arhivează copia echipei), completează descrierea cu starea și pasul următor.
Tudor nu șterge și nu arhivează cardurile lui Alex. După fiecare sincronizare îi spune lui Alex, scurt, ce a schimbat (Alex, 2026-11-25: „N-am mutat și n-am schimbat nimic. — De ce?”).

## Cum arată un card
- **Numele începe cu cine ține mingea acum:**
  - `🤖 <agent> ·` pentru lucrurile la agenți, cu eticheta **albastră**;
  - `👤 Alex ·` pentru cele care așteaptă după Alex, cu eticheta **portocalie**;
  - `💡 Idee ·` pentru ideile din backlog, pe care Alex le alege la triere.
- Urmează ID-ul (T-, I-) și un titlu scurt.
- Descrierea are 2–4 rânduri: ce e, ce urmează, de la cine se așteaptă și sursa (`docs/taskuri.md` sau `docs/idei.md`).
- Datele clienților (sume, oferte) stau doar în folderul privat. În card intră doar pasul următor.

## Când se actualizează
- Pe măsură ce lucrăm, în aceeași sesiune: un lucru pornit trece din Backlog în In Delivery, mingea care trece la Alex sau la un agent schimbă prefixul și eticheta, iar ce e gata trece în **Done** (și se bifează ca terminat).
- Ce iese din plan (anulat, înlocuit) se arhivează, cu motivul scris în repo.
- Sursa de adevăr rămâne repo-ul (`docs/taskuri.md`, `docs/idei.md`). Trello e vederea lui Alex. Dacă diferă, câștigă repo-ul, iar Tudor corectează cardul.
- Rutina de dimineață de pe GitHub nu are acces la Trello. Sincronizarea o face Tudor, în sesiune.

## După o livrare: toate cardurile pe aceeași temă (Alex, 2026-11-25)
După ce ceva pleacă sau e gata, Tudor caută pe board toate cardurile pe aceeași temă (după client sau subiect), nu doar cardul lui. Le mută pe Done, cu descrierea la zi. Ce rămâne de făcut (de exemplu un follow-up) devine card separat, cu termen. Când unește două carduri, descrierea cardului rămas spune starea de acum.
