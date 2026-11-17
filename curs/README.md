# Generatorul de curs

O sursă, trei ieșiri (Radu, `team/radu/documente/arhitectura-curs-change-agility-v0.md`, v1.1; D-048–D-051, I-021).
Folderul unui curs (un fișier `.md` pe modul, banca de exerciții în `exercitii/`, agenda în ediție) devine:

| Ieșirea | Fișierul | Pentru cine |
|---|---|---|
| Cursul participanților | `<slug>-participanti.json` | site-ul, mai târziu, prin PR aprobat de Alex. Se face **dintr-o ediție**: modulele din agendă, în ordinea ei, cu exercițiile folosite care au `in_curs: da`. Fără `:::trainer`, `:::sala`, schiță, banca nefolosită |
| Materialul trainerului | `<slug>-trainer.html` | Alex. Un singur fișier, merge fără internet: vederile Ziua, Modulul, Schița, **Banca** (toate exercițiile, cu filtre) și **Prezintă** |
| PDF-uri (cu `--pdf`) | `<slug>-trainer.pdf`, `<slug>-ecrane.pdf` | plasa de siguranță: hârtie și ecranele din sală, câte unul pe pagină |

## Cum rulezi

```
cd curs
npm ci                                             # o singură dată
node build.mjs ../privat/cursuri/change-agility --pdf
npm run exemplu                                    # cursul [EXEMPLU] din exemple/
npm test                                           # verificările care opresc build-ul
npm run test:chrome                                # modul Prezintă, automat, în Google Chrome
```

Opțiuni: `--editie 2026-11-23` (altfel, cea mai recentă din `editii/`), `--out <folder>` (altfel `<folderul cursului>/dist/`, ignorat de git), `--pdf` (cere Google Chrome instalat).

**Conținutul real nu stă în acest repo** (e public). Locul lui e `privat/cursuri/<curs>/`, ignorat de git, până la repo-ul privat (D-050). Aici stau doar codul și cursul `[EXEMPLU]`.

## Formatul (pe scurt)

Detaliile sunt în documentul lui Radu (1.2–1.7). Un modul:

```markdown
---
id: curba                 # stabil, litere mici și cratimă
titlu: "Ce se întâmplă cu noi când se schimbă ceva"
durata: 50                # minute
tip: teorie               # teorie · exercitiu · reflectie · mesaj · pauza (alege culoarea ecranelor)
ancora: "Curba, nu linia"
schita: ["…", "…", "…"]   # cel mult 3 puncte, cel mult 8 cuvinte fiecare
materiale: ["flipchart"]  # opțional
---
Textul de citit (cursul online și vederea Modul).

:::sala-si-curs
Un ecran în sală, care apare și în cursul online.
:::

:::sala cronometru=10
Un ecran doar în sală, cu cronometru de 10 minute (tasta C).
:::

:::trainer
Doar pentru Alex. Apare lângă ecranul de dinaintea ei, în ecranul de comandă.
:::

:::participant
Doar în cursul online.
:::
```

Primul ecran al fiecărui modul (numărul și titlul) se face singur. O pauză primește automat un cronometru cât durata ei.

### Banca de exerciții și agenda (v1.1, 1.7–1.8 la Radu)

- **Un exercițiu** = `exercitii/<id>.md` (id-ul e numele fișierului). Antet: `titlu`, `durata`, `format` (individual · perechi · grup · plen), `tip` (exercitiu · reflectie · energizant), `energie` (calm · mediu · activ), `obiectiv`; opțional `module`, `materiale`, `in_curs` (da/nu). Corpul are aceleași straturi ca un modul.
- **Modulul propune:** `exercitii: { implicite: [...], alternative: [...] }`. Linia `::exercitii` arată unde intră exercițiile alese (fără ea, la final). `durata` modulului nu include exercițiile.
- **Ediția decide:** `agenda` e lista zilei: `- curba` (cu implicitele), `- modul: curba` + `exercitii: [plimbare-curba]` (`[]` = fără), `- pauza: 15` (+ `titlu: "Prânz"`). Un modul care lipsește din agendă nu se face. Fără `agenda`: toate modulele, cu implicitele. Orele se recalculează la fiecare build.
- **Schimbi un exercițiu:** editezi agenda din ediție și rulezi build-ul (o secundă). În sală nu există încă un meniu „schimbă exercițiul”: alegerea live vine după 23, împreună cu drag and drop.

## Ce oprește build-ul (nu scrie nimic)

Agenda: modul sau exercițiu inexistent, modul de două ori, rând care nu e nici modul, nici pauză, pauză care nu e număr, agenda nu încape în `durata_zi`, `sari_peste` (vechi). Banca: id-uri inexistente în `implicite`/`alternative`/`module`, același exercițiu și implicit, și alternativă, câmpuri lipsă sau valori din afara listei, `::exercitii` greșit scris, de două ori sau într-un exercițiu. Apoi, ca în v1: bloc neînchis, bloc în bloc, bloc necunoscut (`:::traner`), atribut necunoscut; text din `:::trainer`, `:::sala` sau `nota_trainer` găsit în exportul pentru participanți (verificat pe rezultat, fragmente de minimum 4 cuvinte); un nume din `nume_interzise` în export (fără diacritice și majuscule); schiță cu peste 3 puncte sau un punct cu peste 8 cuvinte; module care nu încap în `durata_zi`; `cronometru` mai lung decât modulul; imagine de pe internet sau care nu e în `materiale/`; câmpuri lipsă, `id` dublat, `sari_peste` cu un id greșit. **Avertisment:** ecran din sală cu peste 30 de cuvinte, ancoră cu peste 3 cuvinte, exercițiu ales la un modul care nu e în `module` lui, modul de peste 90 de minute fără pauză după. Verificarea notelor trainerului se face pe toată banca, nu doar pe ce e în agendă.

## Modul Prezintă: cum merge

- **Două ferestre din același fișier.** „Deschide ecranul din sală” deschide același HTML cu `#sala`. Ferestrele vorbesc prin `postMessage`, care merge din `file://`, fără server și fără internet. Ecranul de comandă trimite doar „ce ecran, negru sau nu, cronometrul”; fereastra sălii trimite înapoi tastele.
- **Tastele merg în ambele ferestre** (contează pentru telecomandă: tastele ajung la fereastra pe care ai dat click ultima dată): `→ ↓ PageDown Spațiu Enter` înainte, `← ↑ PageUp` înapoi, `Home`/`End`, `C` cronometru (pornește / pauză / de la capăt), `N`, `B` sau `.` ecran negru, `S` schița mare (doar pe ecranul de comandă), `F` sau dublu-click tot ecranul (în fereastra sălii). `F5` (butonul „start” al multor telecomenzi) nu reîncarcă pagina.
- **Un refresh nu strică nimic:** ecranul de comandă ține minte unde ai rămas (în browser), iar „Deschide ecranul din sală” refolosește fereastra deja deschisă, fără s-o reîncarce, deci rămâne pe tot ecranul pe proiector.
- **Un singur ecran:** „Prezintă aici” arată ecranul sălii în aceeași fereastră, pe tot ecranul. `Esc` iese.
- **„Față de plan”:** în ziua ediției, după ceas; în altă zi, față de momentul în care ai apăsat Prezintă (scrie „repetiție”). „Repornește ziua” șterge orele.

## Tema

Culorile și litera stau doar în `tema/sobru.css` (tokeni). Pentru tema Ive a unui brand (T-023, Ioana): copiezi fișierul ca `tema/innersis.css` sau `tema/bemore-ls.css` și schimbi valorile. Generatorul o alege singur după `brand` din `curs.yml`. Structura (mărimi, așezare) e în `lib/stil.css`. Ecranul din sală are 1600×900 și se scalează la orice proiector.

## Fișierele

| Fișier | Ce face |
|---|---|
| `build.mjs` | linia de comandă: citește, verifică, scrie, face PDF-urile |
| `lib/sursa.mjs` | citește `curs.yml`, ediția, modulele și banca; agenda și orele; verificările pe sursă; `desfasoara()` pune exercițiile în modul |
| `lib/export.mjs` | cursul participanților și verificarea pe rezultat |
| `lib/trainer.mjs` | materialul trainerului (HTML), ecranele din sală |
| `lib/prezinta.js` | partea care rulează în browser (vederi, Prezintă, cronometru, tipar) |
| `lib/randare.mjs` | Markdown → HTML; HTML-ul brut și linkurile `javascript:` devin text |
| `teste/` | `verificari.test.mjs` (npm test), `chrome-prezinta.mjs` + `cdp.mjs` (Chrome comandat prin DevTools, fără dependențe) |
