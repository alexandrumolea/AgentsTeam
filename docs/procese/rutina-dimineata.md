# Proces automat: rutina de dimineață a lui Tudor

**Primul proces automat al echipei** (Alex, 2026-11-15): „Tudor trece în fiecare dimineață prin task-urile din backlog și propune, apoi agenții se ocupă de muncă.”

| Element | Ce scrie |
|---|---|
| **Trigger** | luni–vineri, 7:30 ora României, tot anul, pe GitHub Actions (două cron-uri în UTC, rulează doar cel potrivit; din 2026-11-16, la cererea lui Alex). Și manual: Actions → „Rutina zilnică a lui Tudor” → Run workflow |
| **Owner** | Tudor |
| **Intrări** | `docs/taskuri.md`, `docs/idei.md`, `docs/ritmuri.md`, `docs/decizii.md`, memoria lui Tudor |
| **Ieșire** | 1. **Propunerea de dimineață:** issue pe GitHub, cu ce intră azi în lucru și de ce, ce idei propune să pornim (cel mult 2) și ce așteaptă după Alex. 2. Munca agenților (cel mult 3 taskuri pe zi). 3. Raport în `team/tudor/rapoarte/`. |
| **Revizuirea lui Alex** | Citește issue-ul (și pe telefon, în aplicația GitHub). Răspunde cu un comentariu: „da”, „nu la T-xxx”, „pornim I-xxx”. Ideile pornesc doar după „da” de la Alex. Taskurile de nivel 1 pornesc direct |
| **Workflow** | `.github/workflows/rutina-zilnica.yml` |
| **Cost** | o rulare pe zi lucrătoare, cel mult 3 agenți pe rulare |

## Pașii rutinei
1. **Citește** backlog-ul: taskurile „nou” și „de făcut”, ideile „nouă”, ritmurile datorate azi, comentariile lui Alex pe issue-ul de ieri.
2. **Aplică** răspunsurile lui Alex de pe issue-ul de ieri (pornim I-xxx devine task, nu la T-xxx devine anulat).
3. **Triază** taskurile noi pe niveluri (`docs/procese/initiativa.md`).
4. **Propune** (issue-ul de dimineață):
   - ce taskuri lucrează agenții azi (cel mult 3), în ordinea priorității;
   - cel mult 2 idei din backlog de pornit și de ce acum;
   - deciziile care așteaptă după Alex.
5. **Agenții lucrează** la taskurile de nivel 1 alese pentru azi.
6. **Salvează:** raport, commit, verificarea de date private, push. Issue-ul se actualizează cu ce s-a terminat.
