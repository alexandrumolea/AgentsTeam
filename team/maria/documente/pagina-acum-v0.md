# Pagina „Acum” — v0

> Autor: Maria. Dată: 2026-11-15. Status: **propunere, nivel 1, de validat cu Alex.** Răspunde la T-004 / I-005.
> Numele sunt ale mele (D-025), structura e a lui Radu (`arhitectura-v2.md`, 1.4 și 4.1). Tot ce e despre Alex e ipoteză până confirmă el. Exemplul din secțiunea 4 e **fictiv/ipoteză**, nu conținut real.

## Pe scurt
- **„Acum” nu e pagină separată, e un strat în Live**, primul de sus, scris de mână de Alex. Sunt de acord cu decizia lui Radu (T-008).
- **3–5 rânduri**, un titlu de dată („Actualizat: [lună an]”), tonul unui om care vorbește cu un prieten pe care nu l-a văzut de mult.
- **Ritm: o dată pe lună, 5 minute**; după 90 de zile fără actualizare dispare singur (regula lui Radu). Mai bine absent decât învechit.
- **Un singur lucru nu-l face Jurnalul atelierului: spune ce contează acum.** Jurnalul arată ce s-a întâmplat (automat), Acum arată pe ce se concentrează Alex (de mână).

## 1. Ce e și ce nu e (cu surse)
- Precedentul: pagina „/now”. Derek Sivers a adăugat-o pe site în 2015 și o descrie ca „o declarație publică a priorităților”. Sfatul lui de ton: spui ce i-ai spune cuiva pe care nu l-ai văzut de o vreme. [sive.rs/nowff](https://sive.rs/nowff) (citit 2026-11-15).
- Diferența față de o pagină de noutăți: „/now” e „un rezumat al întregului”, nu „happenings and updates”. Ce înseamnă pentru noi: Acum ≠ Jurnalul atelierului.
- Mișcarea s-a extins prin colecția [nownownow.com](https://nownownow.com/about) (citit 2026-11-15): pagina definește „now” ca ce se concentrează o persoană în acest moment din viață și spune că nu prescrie niciun format. Am citit doar aceste două pagini; **nu afirm cifre de adopție**, pagina citită nu dă date.
- Ce a spus Sivers despre actualizare: nu are program; el „șterge și înlocuiește” (fără istoric). Noi diferim conștient: istoricul rămâne în git, dar pe site se vede doar versiunea curentă (simplu bate complicat).
- O utilitate în plus citată de Sivers: arată prioritățile și te ajută să refuzi cu eleganță. Pentru Alex, asta leagă Acum de Victor (oportunități): cine propune ceva vede ce e prioritar acum.

## 2. Format: câmpuri
Fișier unic: `content/acum.md` (Radu). Tot ce se editează stă aici.

| Câmp | Obligatoriu | Ce conține | Lungime |
|---|---|---|---|
| `data` | da | luna actualizării, nu ziua (ex.: „noiembrie 2026”) | – |
| **Mă concentrez pe** | da | 1–3 lucruri, fiecare o propoziție cu verb la persoana întâi | max. 1 propoziție/rând |
| **Învăț acum** | opțional | un lucru, spus simplu | 1 propoziție |
| **Nu fac acum** | opțional | un lucru amânat cinstit (ideea lui Sivers: prioritățile includ ce lași deoparte) | 1 propoziție |
| **Ia de aici** | opțional | o idee, un link sau o unealtă pe care o poate lua vizitatorul. Testul: „Și ce fac cu asta azi?” | 1 rând |

Total 3–5 rânduri (cum a spus Radu). Fără poze, fără cifre inventate, fără nume de clienți sau de colaboratori fără acord (`docs/procese/ce-iese-public.md`).

Titlul: **„Acum”**, subtitlul: *„Ce contează pentru mine în perioada asta.”* Alternativa: „În perioada asta”. Aleg „Acum” (cuvânt scurt, clar în 5 secunde, ca „/now”).

## 3. Ritm și proces
| Moment | Ce | Cine | Cost pentru Alex |
|---|---|---|---|
| În fiecare lună | Tudor îi trimite lui Alex trei întrebări scurte (pe ce te concentrezi, ce înveți, ce ai amânat) | Tudor, draftul îl scriu eu | 5 minute |
| Draft | Doar din cuvintele lui; eu tai și ordonez, nu adaug | Maria | 0 |
| Aprobare și publicare | Alex citește și aprobă (nivel 3, public) | Alex | 2 minute |
| 90 de zile fără update | Stratul dispare automat de pe Live | automat (Radu/Mike) | 0 |

- Dacă într-o lună nimic nu s-a schimbat, nu actualizăm. Nu scriem pentru ritm.
- Promisiunea publică de ritm („actualizat lunar”) nu apare pe pagină; apare doar data. Alex decide dacă promite ceva.
- Surse pentru draft (ca să nu-l încărcăm): ce e în „Pe banc acum” și în Jurnalul atelierului arată pe ce a lucrat echipa; eu mă uit întâi acolo și îi propun lui Alex rândurile deja gata, el le confirmă sau corectează.

## 4. Ton, în vocea lui Alex
Reguli (din `vocea-alex`): „eu”, propoziții scurte, o idee pe rând, verbe, fără adjective de promovare. Fără „futurist”, „revoluționar”. Fără hustle („uite cât sunt de ocupat”). Citește-l cu testul: „ar spune-o Alex la o cafea?”

Exemplu **fictiv, ipoteză, nu aprobat** (conținutul real îl dă Alex):

> **Acum**
> *Ce contează pentru mine în perioada asta. Actualizat: noiembrie 2026.*
> - Mă concentrez pe un singur lucru: să pun primele unelte în mâinile oamenilor, nu doar să le descriu. *(ipoteză)*
> - Învăț cum arată o lecție care se termină cu un exercițiu, nu cu o morală. *(ipoteză)*
> - Nu fac acum: lansări mari. Mai întâi lucruri mici, încercate. *(ipoteză)*
> - Ia de aici: ia o întrebare care te frământă și scrie-o într-o propoziție. Începe de acolo. *(ipoteză)*

Ce a fost evitat: „sunt extrem de entuziasmat”, „o perioadă transformatoare”, liste lungi, nume de proiecte private.

## 5. Relația cu Live și cu Jurnalul atelierului (recomandare)

| | **Acum** | **Pe banc acum** | **Jurnalul atelierului** |
|---|---|---|---|
| Întrebarea | „Ce contează pentru el în perioada asta?” | „La ce lucrează acum?” | „Ce s-a întâmplat, cine cui?” |
| Scris de | Alex, de mână | automat (taskuri în lucru) | automat (taskuri, decizii, fișiere) |
| Viteză | lunar | zilnic | la fiecare push |
| Ce spune despre Alex | direcția | munca curentă | dovada |

**Recomandarea mea: Live absoarbe Acum.** Un singur loc, `/live`, trei viteze, pe ordinea „direcție → acum → dovadă”. Motive:
1. Un vizitator nou întreabă una: „Alex e activ?” Trei pagini separate îl obligă să ghicească unde.
2. Acum singur, scris de mână, riscă să rămână învechit. În Live, chiar dacă el nu-l actualizează, Jurnalul și „Pe banc” arată că atelierul merge, iar Acum dispare cinstit după 90 de zile.
3. Fără pagină nouă în meniu (simplu bate complicat).

**O condiție:** Acum să fie primul strat vizibil de pe `/live`, sus, scurt. Dacă e îngropat sub Jurnal, pierde rolul lui (direcția, nu jurnalul).

**Ce NU absoarbe:** Acum nu duplică Jurnalul. Dacă un rând din Acum seamănă cu un task, e prea tehnic și îl rescriem.

**Se leagă și cu poveștile:** „Ce m-a crescut” e trimestrial, Acum e lunar. Drumul: Acum (direcția) → Jurnal (dovada) → Ce m-a crescut (ce a costat) → Învață (lecția).

## 6. Riscuri
| Risc | Cum îl evităm |
|---|---|
| Se învechește | dispare după 90 de zile; draft pregătit de mine, 5 minute pentru Alex |
| Sună a autopromovare | fără adjective, un „Ia de aici” pentru vizitator |
| Expune ceva privat (clienți, oameni) | regulile din `ce-iese-public.md`; Alex aprobă fiecare versiune |
| Promite prea mult („lansez în ianuarie”) | doar ce e deja decis; fără date de lansare dacă nu sunt sigure |
| Se dublează cu Jurnalul | Acum e direcție, Jurnalul e fapt; testul din secțiunea 5 |

## 7. Întrebări pentru Alex
1. Îți place ideea unui text de 3–5 rânduri, lunar, doar dacă s-a schimbat ceva? Sau preferi trimestrial, odată cu „Ce m-a crescut”?
2. „Nu fac acum” (ce amâni) te încurcă sau ți-ar plăcea? Ajută la refuzul politicos al ofertelor, dar e o expunere.
3. Vrei pe pagină data exactă sau doar luna?

## Surse
- Derek Sivers, pagina despre „/now” (sive.rs/nowff): [sive.rs/nowff](https://sive.rs/nowff), citit 2026-11-15.
- nownownow.com, pagina „About”: [nownownow.com/about](https://nownownow.com/about), citit 2026-11-15.
- Intern: `team/maria/documente/research-branding-2026-11.md`, `knowledge-si-live-v0.md`, `team/radu/documente/arhitectura-v2.md` (4.1, 4.2).
- Sursele sunt texte de practicieni, nu studii. Nu susțin cu ele afirmații despre eficiența paginii.
