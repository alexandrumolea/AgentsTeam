---
name: wise-workshop-design
description: Cum proiectez un workshop strategic Wise Teams (oglinda comună din chestionar, variante după rezultate, calibrare cu liderul, unelte); lecții generale, fără date de client
metadata:
  type: project
---

2026-11-27: Primul workshop strategic Wise cu o echipă de manageri (detaliile clientului doar în repo-ul privat).

- **Flow-ul pornește de la rezultate care nu există încă:** scriu varianta cea mai probabilă în foaia principală, alternativa ca foaie separată („2b”), cu locuri marcate [DIN REZULTATE]. Varianta o decide regula de leverage Wise (Flux și Încredere întâi; Livrare doar dacă ambele peste 4,0; Anticipare doar dacă și Livrarea e peste 4,0), nu ce pare mai urgent.
  **Why:** Tudor a cerut ce se schimbă dacă Încrederea iese sau nu cea mai jos; o singură variantă ar fi cerut rescriere după raport.
  **How to apply:** orice workshop Wise sau orice flow care depinde de un diagnostic primit după design.
- **Calibrarea cu liderul înainte (60 min):** vede primul raportul și diferența dintre el și echipă, își alege fraza de deschidere, agreăm ce arătăm în sală (doar medii și dispersie, fără nume). În sală: liderul deschide cu oscilația lui și vorbește ultimul.
- **Grup care evită conflictul:** cartonașe anonime citite de trainer („ce se spune pe hol, dar nu în ședință”), apoi perechi doar despre „ce mă oprește pe mine”. Când punctele de leverage sunt despărțite între Flux și Încredere, încep cu Încrederea: o hartă a deciziilor făcută fără adevărul pe masă rămâne pe hârtie.
- **Durata:** pentru echipe sub presiune am recomandat jumătate de zi + follow-up de 90 min la ~3 săptămâni (formatul modelează „touchpoint, progres real, touchpoint”); ziua întreagă doar ca alternativă, cu ambele variante și final la 16:00. Legat de [[lectii-debrief-change-agility]].
- **Unelte:** skill-ul training-flow-design are doar paletele Innersis și BEMORE; copiez `build_flow.py`, `check_flow.py`, `build_artefact.py` în `tools/` din folderul cursului și adaug paleta `wise` (cerneală 1C1B19, crem F7F4EE, nisip EDE8DF, portocaliu Wise ca accent). Pe Mac nu e openpyxl: venv în scratchpad (`pip install openpyxl python-docx`). Verificarea vizuală: `qlmanage -t` (doar prima foaie).
- **Checker-ul** dă WARN pe piesele scurte D-079 (nugget 5 min, model 10 min) și pe teoria fără debriefing: le accept conștient, regula casei bate pragul de 15 min al skill-ului.
