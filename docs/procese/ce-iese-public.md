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

## Verificare înainte de push (automată)
- La fiecare `git push`, hook-ul `.githooks/pre-push` rulează `scripts/verifica-public.sh`. Acesta caută emailuri reale, numere de telefon, chei API și adrese de email reale în commit-uri. Dacă găsește ceva, push-ul se oprește.
- Pe un clone nou, activează hook-ul o dată: `git config core.hooksPath .githooks`.
- Numele de clienți nu pot fi detectate automat. Tudor le verifică manual în diff.
- Când verificarea oprește push-ul, Tudor scoate datele și îl întreabă pe Alex. Nu o ocolește niciodată.
