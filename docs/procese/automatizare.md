# Proces: fiecare flux devine automat, Alex doar revizuiește

**DRI:** Tudor. **Principiul (Alex, 2026-11-15):** „Pe parcurs, pentru fiecare ne dezvoltăm și câte un proces cu trigger din GitHub, ca să se întâmple și fără mine. Eu doar să revizuiesc munca. Și mai angajăm agenți unde e nevoie, ca un proces să meargă cap-coadă repetitiv.”

## Când automatizăm un flux
Pe parcurs, nu tot deodată (regula backlog-ului). Un flux devine automat după ce l-am făcut de mână cel puțin o dată și știm cum arată „bine”.

## Șablonul unui proces automat
Fiecare proces automat are, scris în `docs/procese/<nume>.md`:
| Element | Ce scrie |
|---|---|
| **Trigger** | când pornește: program fix (cron), un fișier nou în repo, o etichetă pe un issue, o decizie aprobată |
| **Owner** | agentul care face munca, cap-coadă |
| **Intrări** | ce citește |
| **Ieșire** | ce produce și unde |
| **Revizuirea lui Alex** | ce verifică Alex și cum. Munca de nivel 1 intră direct. Munca de nivel 2–3 vine ca **Pull Request** pe GitHub: Alex o citește, iar merge = aprobat |
| **Workflow** | fișierul din `.github/workflows/` |
| **Cost** | cât de des rulează și cât consumă |

## Când angajăm un agent nou
Tudor propune un agent nou (ca decizie pentru Alex) când un proces:
- se repetă cel puțin lunar,
- are nevoie de skill-uri pe care nu le are niciun agent existent,
- sau încarcă un agent deja ocupat până la rezultate slabe în scorecard.
Pașii: `ECHIPA.md`, secțiunea „Cum adăugăm un agent nou”.

## Procese automate
| Proces | Trigger | Owner | Revizuire Alex | Workflow | Status |
|---|---|---|---|---|---|
| [Rutina de dimineață](rutina-dimineata.md): backlog → propunere → agenții lucrează | luni–vineri 9:00 | Tudor | issue-ul de dimineață pe GitHub | `rutina-zilnica.yml` | **activ din 2026-11-15**. Prima rulare completă: 4 taskuri gata, issue #2, cost ~1,2 USD echivalent din abonament |
