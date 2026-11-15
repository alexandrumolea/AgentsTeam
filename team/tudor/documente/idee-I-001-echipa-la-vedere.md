# I-001 — Echipa mea de agenți, la vedere

**DRI:** Tudor · **Contribuie:** Maria (povestea), Radu (unde stă pe site), Ioana (cum arată), Mike (versiunea publică), Elena (lecțiile ca material public) · **Status:** în analiză

## Ideea, în cuvintele lui Alex
„Mă gândesc să pun pe site și my team of agents, să poată vedea lumea cum m-am organizat eu. Aș vrea ca totul să fie la vedere.”

## De ce contează
- E chiar ideea de bază a brandului propusă de Maria: **constructorul care îți pune unealta în mână**. Aici unealta e chiar sistemul lui Alex.
- Arată, nu doar spune. Oricine poate vedea cum lucrează un coach și fondator cu o echipă de agenți AI: roluri, procese, decizii, lecții.
- Puțini își deschid sistemul de lucru. Transparența e un diferențiator, în spiritul curriculumului Mochary Method, care e public.
- E o invenție în sine, deci intră în Atelier ca **experiment**.

## Cum ar arăta (propunere)
1. **Repo-ul public pe GitHub** (decizia lui Alex din 2026-11-15) e sursa completă, pentru cine vrea detaliile.
2. **O pagină pe site**, „Cum lucrez cu echipa mea de agenți”, generată din același repo ca pagina internă a echipei:
   - organigrama și rolurile, cu Jobs to be done;
   - procesele (`docs/procese/`) și ariile de responsabilitate (`docs/aor.md`);
   - un jurnal de lansări și decizii despre sistem;
   - lecțiile Elenei, cel mai valoros conținut pentru cine vrea să facă la fel.
3. **Unde stă pe site:** în Atelier, ca experiment, cu un link din pagina Despre. De confirmat cu Radu.
4. **Postări:** Sofia transformă fiecare lecție lunară într-o postare („Ce am învățat luna asta conducând o echipă de agenți”).

## Ce NU facem
- Nu publicăm memorie sau note care conțin date personale, despre clienți sau financiare (vezi `docs/procese/ce-iese-public.md`).
- Nu publicăm draft-uri de mesaje către persoane anume.
- Nu prezentăm agenții ca oameni. Sunt agenți AI, cu nume ca să fie ușor de lucrat cu ei, și spunem asta clar.

## Întrebări pentru Alex
1. Pagina publică arată totul (inclusiv scorecard-urile și memoria), sau doar organigrama, procesele și lecțiile?
2. Vrei să spunem deschis ce unelte folosim (Claude Code, GitHub)?
3. Pagina e în română, în engleză sau în amândouă? Subiectul are audiență internațională.

## Pași următori
| Pas | Cine | Status |
|---|---|---|
| Alex răspunde la cele 3 întrebări | Alex | în așteptare |
| Repo-ul pe GitHub (public) | Alex: `gh auth login`, apoi Tudor: push | în așteptare |
| Generator cu mod public (`--public`), care filtrează ce nu iese | Mike | după răspunsuri |
| Textul paginii, în vocea lui Alex | Maria | după răspunsuri |
| Locul în Atelier | Radu | după aprobarea arhitecturii v1 |

## Jurnal
| Dată | Ce s-a întâmplat |
|---|---|
| 2026-11-15 | Alex a avut ideea. Tudor a notat-o ca I-001 și a scris acest document. |
| 2026-11-15 | Alex a decis că repo-ul rămâne public. |
