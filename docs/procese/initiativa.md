# Proces: inițiativă și lucru între agenți

**DRI:** Tudor. **Scop:** echipa lucrează și fără Alex, dar numai acolo unde are voie.

## Nivelurile de autonomie
| Nivel | Ce înseamnă | Exemple |
|---|---|---|
| **1. Fac și raportez** | Agentul face singur. Tudor raportează la final | research, draft-uri, documente, propuneri, memorie, prototipuri, taskuri pentru colegi, commit și push (după verificarea automată) |
| **2. Propun și aștept** | Intră în panoul „Decizii de luat” din pagina echipei | direcția vizuală, structura site-ului, numele, poziționarea, roluri noi, renunțarea la un agent, orice cost |
| **3. Doar Alex** | Agentul pregătește, Alex acționează | publicarea site-ului, postări, emailuri, contactarea oamenilor, plăți, angajamente |

## Cum pornește un task de la un agent
1. La finalul oricărei sarcini, agentul se întreabă: „Ce ar ajuta acum pe altcineva din echipă, sau pe mine data viitoare?”
2. Dacă găsește ceva, adaugă cel mult 2 rânduri în `docs/taskuri.md`, cu ID nou (`T-NNN`), status **nou**, nivel și motiv.
3. La următoarea rulare, Tudor triază:
   - **nivel 1:** status **de făcut**, iar Tudor îl deleagă (cel mult 3 pe rulare);
   - **nivel 2:** Tudor adaugă o decizie (`D-NNN`) în `docs/decizii.md`, iar statusul devine **la Alex**;
   - **dublură sau inutil:** **anulat**, cu motiv.
4. Când termină, agentul pune status **gata** și link la rezultat.
5. **Curățenie** (Alex, 2026-11-17: „simplificare continuă”). La fiecare triere, Tudor închide deciziile, întrebările și taskurile devenite irelevante („înlocuită de D-xxx”, „anulat: motiv”) și mută documentele înlocuite în `arhiva/` din folderul agentului. Panoul de control trebuie să arate doar ce mai contează.

## Cum lucrează agenții între ei
Subagenții nu se pot chema direct unul pe altul. Totul trece prin panoul de taskuri și prin Tudor, ceea ce înseamnă că totul rămâne scris și la vedere.

## Sesiuni separate cu un agent
- **În aplicația Claude:** deschide o sesiune nouă în folderul proiectului și începe cu numele agentului („Sofia, …”). Sesiunea devine acel agent.
- **Din terminal:** `claude --agent sofia` (sau orice alt nume).
- **Prin Tudor:** „Tudor, pornește o sesiune separată cu Maria pentru X.” Tudor o pornește ca sesiune nouă, vizibilă în bara laterală.
- Agentul dintr-o sesiune separată urmează aceleași reguli. Ce lasă pentru alții merge în `docs/taskuri.md`.
