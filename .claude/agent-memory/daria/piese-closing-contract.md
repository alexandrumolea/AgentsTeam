---
name: piese-closing-contract
description: Cum am modelat piesele predefinite de închidere și contractul (alegeri de tip, straturi, capcane ale generatorului)
metadata:
  type: project
---

2026-11-17: Alex vrea closing-urile lui (apreciere, ciclul învățării, asimilare) ca piese predefinite, refolosibile, plus un contract-șablon.

- Closing-urile au `tip: reflectie` (activitate), nu `inchidere`: la familia punte generatorul ignoră `format` și `energie`, iar Alex vrea filtrele. Rolul de „închidere” îl dă eticheta `Closing`. Consecință: lumea Ive e cea luminoasă, deși slide-urile originale sunt întunecate. De confirmat cu Ioana.
- Contractul are `tip: deschidere`; locurile de completat sunt marcate `[DE PERSONALIZAT: …]`, vizibile pe ecran ca să nu scape.
- Textul care apare și pe ecran, și în cursul online merge în `:::sala-si-curs`. Același text în `:::sala` și în `:::participant` oprește build-ul (verificarea pe export).
- Notele trainerului nu repetă fraze de 4+ cuvinte din ecranele publice (aceeași verificare).
- Slide-urile lui Alex au peste 30 de cuvinte pe ecran: build-ul dă doar avertisment. Textul rămâne exact.
- Pe slide-ul Eco-cycle, capcanele par inversate față de Liberating Structures (rigiditate: Maturitate→Distrugere; penurie: Gestație→Naștere). Semnalat lui Ioana/Alex.

**Why:** piesele vor trece în biblioteca comună (`privat/piese/`, după 25), deci contează să fie corecte de la început.
**How to apply:** la orice piesă nouă de închidere sau deschidere, refolosește alegerile de mai sus; după 25, mută-le în `comun/`.
