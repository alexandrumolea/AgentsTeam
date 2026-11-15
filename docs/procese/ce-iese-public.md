# Proces: ce iese public

**DRI:** Tudor. **Context:** repo-ul e public din 2026-11-15, prin decizia lui Alex. Tot ce e în git poate fi citit de oricine.

## Poate fi public
- Rolurile, profilurile, Jobs to be done, procesele, ariile de responsabilitate
- Research cu surse, propuneri de design și arhitectură
- Rapoartele și deciziile despre sistem
- Ipotezele despre brand, marcate clar ca ipoteze

## Nu intră niciodată în repo
- Date de contact (emailuri, telefoane), adrese
- Informații despre clienți, coachees sau participanți la cursuri
- Prețuri negociate, contracte, date financiare
- Parole, chei API, tokeni (în `.env`, care e ignorat de git)
- Draft-uri de mesaje către persoane anume

## Unde merge ce e privat
`.claude/agent-memory-local/<agent>/` (ignorat de git) sau în afara repo-ului.

## Verificare înainte de push
Tudor caută în diff emailuri, numere de telefon, chei și nume de clienți. Dacă găsește ceva, oprește push-ul și îl întreabă pe Alex.
