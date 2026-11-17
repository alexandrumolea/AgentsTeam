# Generatorul de curs

O sursă, trei ieșiri (Radu, `team/radu/documente/arhitectura-curs-change-agility-v0.md`, v1.2; D-048–D-051, D-053).
Folderul unui curs (un fișier `.md` pe modul, piesele de workshop în `piese/`, agenda în ediție) devine:

| Ieșirea | Fișierul | Pentru cine |
|---|---|---|
| Cursul participanților | `<slug>-participanti.json` | site-ul, mai târziu, prin PR aprobat de Alex. Se face **dintr-o ediție**: modulele și piesele singure din agendă, în ordinea ei, doar cu piesele folosite care au `in_curs: da`. Fără `:::trainer`, `:::sala`, schiță, pauze, biblioteca nefolosită |
| Materialul trainerului | `<slug>-trainer.html` | Alex. Un singur fișier, merge fără internet: vederile Ziua, Modulul, Schița, **Biblioteca de piese** (toate piesele, cu căutare și filtre) și **Prezintă**. Ziua și Schița arată totalul zilei și cât rămâne din `durata_zi` |
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

### Etichetele (Alex, 2026-11-17)

- `etichete: [Positive Outlook, Closing]` pe piese și pe module, opțional. Texte libere, scrise cum vrei (și în engleză, cu spații).
- Majusculele și diacriticele nu contează la grupare: pe ecran rămâne forma folosită prima, iar „Positive outlook” față de „Positive Outlook” dă avertisment.
- **Biblioteca de piese:** chip-uri mici pe rândul piesei (un click pornește filtrul etichetei), un rând de filtre „Etichete” cu numărul de piese (chip-urile se adună), căutare după etichetă. În Ziua și Modul apar discret.
- Etichetele sunt organizare internă: nu ajung pe ecranele din sală și nici în cursul participanților.

### Obiectivele zilei (Alex, 2026-11-17)

- `obiective` în `curs.yml`: o listă de texte scurte (peste ~12 cuvinte, doar avertisment). Ediția poate avea propriul `obiective`, care o înlocuiește pe a cursului.
- Un modul sau o piesă poate avea `obiective: [1, 3]` (indexuri de la 1); Schița arată discret „→ ob. 1, 3” lângă rând.
- **În Schiță** (vederea Schița și schița din ecranul de comandă, inclusiv cea mare): „Obiectivele zilei”, cu bife, contor („2 din 4”) și „Debifează tot”. Bifele se salvează doar în browser (cheie: slug + data ediției), rezistă la refresh și nu ajung niciodată în fereastra sălii. La tipar, căsuțele ies goale.
- **În cursul participanților:** `obiective`, ca listă simplă (sunt publice). Numele interzise sunt verificate și aici.

### Piesele și agenda (v1.2, 1.7–1.9 la Radu, D-053)

- **O piesă** = `piese/<id>.md` (id-ul e numele fișierului, unic în tot cursul, și printre module). Antet: `titlu`, `durata` (obligatorie, la orice piesă), `tip`; opțional `ancora`, `module`, `materiale`, `in_curs` (da/nu). Corpul are aceleași straturi ca un modul.
- **Tipul alege familia** (conținut: `teorie`, `model`, `poveste`; activitate: `exercitiu`, `reflectie`, `energizant`; punte: `deschidere`, `inchidere`, `mesaj`, `pauza`). **Felul ecranului din sală** e separat (vezi „Felurile ecranelor”, mai jos). **Activitățile** cer și `format` (individual · perechi · grup · plen), `energie` (calm · mediu · activ) și `obiectiv`.
- **Modulul propune:** `piese: { implicite: [...], alternative: [...] }`. Linia `::piese` arată unde intră piesele alese (fără ea, la final). `durata` modulului = doar corpul lui (poate fi 0).
- **Ediția decide:** `agenda` e lista zilei: `- curba` (modul cu implicitele), `- modul: curba` + `piese: [model-curba, plimbare-curba]` (`[]` = fără), `- ridica-te-daca` (piesă singură), `- pauza-cafea` (piesă de tip pauză), `- pauza: 10` (scurtătură, cu `titlu` opțional). Fără `agenda`: toate modulele, cu implicitele. `comun/<id>` e rezervat pentru biblioteca comună de după 25.
- **Depășirea zilei** nu oprește build-ul (Alex, 2026-11-17): apare ca avertisment și, marcată, în Ziua și în Schiță („depășire 45 min”).
- **Totalurile:** fiecare modul arată „modul + piese” (de exemplu 45 min = 10 + 20 + 15); ziua arată totalul agendei, cât rămâne până la sfârșitul din `durata_zi` și ora de final. În Bibliotecă, piesele de azi arată cât din zi ocupă.
- **Schimbi o piesă:** editezi agenda din ediție și rulezi build-ul (o secundă). Alegerea live în sală și drag and drop vin după 23.

## Ce oprește build-ul (nu scrie nimic)

Agenda: id inexistent (nici modul, nici piesă), modul de două ori, rând care nu e modul, piesă sau pauză, pauză care nu e număr, `comun/…` (încă nu există), `sari_peste` și `exercitii` (vechi). Piese: `durata` lipsă (la orice piesă și la module), tip din afara listei, activitate fără `format`/`energie`/`obiectiv`, id folosit și de un modul, și de o piesă, id-uri inexistente în `implicite`/`alternative`/`module`, aceeași piesă și implicită, și alternativă, folderul vechi `exercitii/`, modul cu și `exercitii`, și `piese`, `::piese` greșit scris, de două ori sau într-o piesă. Apoi, ca în v1: bloc neînchis, bloc în bloc, bloc necunoscut (`:::traner`), atribut necunoscut; text din `:::trainer`, `:::sala` sau `nota_trainer` găsit în exportul pentru participanți (verificat pe rezultat, fragmente de minimum 4 cuvinte); un nume din `nume_interzise` în export (fără diacritice și majuscule); schiță cu peste 3 puncte sau un punct cu peste 8 cuvinte; module care nu încap în `durata_zi`; `cronometru` mai lung decât modulul; imagine de pe internet sau care nu e în `materiale/`; câmpuri lipsă, `id` dublat, `sari_peste` cu un id greșit. **Avertisment:** ecran din sală cu peste 30 de cuvinte, ancoră cu peste 3 cuvinte, piesă aleasă la un modul care nu e în `module` ei, modul de peste 90 de minute fără pauză după. Verificarea notelor trainerului se face pe toată biblioteca, nu doar pe ce e în agendă; titlurile modulelor și ale pieselor pot apărea în note (sunt publice).

## Modul Prezintă: cum merge

- **Două ferestre din același fișier.** „Deschide ecranul din sală” deschide același HTML cu `#sala`. Ferestrele vorbesc prin `postMessage`, care merge din `file://`, fără server și fără internet. Ecranul de comandă trimite doar „ce ecran, negru sau nu, cronometrul”; fereastra sălii trimite înapoi tastele.
- **Tastele merg în ambele ferestre** (contează pentru telecomandă: tastele ajung la fereastra pe care ai dat click ultima dată): `→ ↓ PageDown Spațiu Enter` înainte, `← ↑ PageUp` înapoi, `Home`/`End`, `C` cronometru (pornește / pauză / de la capăt), `N`, `B` sau `.` ecran negru, `S` schița mare (doar pe ecranul de comandă), `F` sau dublu-click tot ecranul (în fereastra sălii). `F5` (butonul „start” al multor telecomenzi) nu reîncarcă pagina.
- **Un refresh nu strică nimic:** ecranul de comandă ține minte unde ai rămas (în browser), iar „Deschide ecranul din sală” refolosește fereastra deja deschisă, fără s-o reîncarce, deci rămâne pe tot ecranul pe proiector.
- **Un singur ecran:** „Prezintă aici” arată ecranul sălii în aceeași fereastră, pe tot ecranul. `Esc` iese.
- **„Față de plan”:** în ziua ediției, după ceas; în altă zi, față de momentul în care ai apăsat Prezintă (scrie „repetiție”). „Repornește ziua” șterge orele.

## Felurile ecranelor (Ioana, 2026-11-17)

Patru feluri, ca Alex să recunoască tipul dintr-o privire, pe proiector și în miniaturile din ecranul de comandă. Detaliile și capturile: `team/ioana/documente/slide-tipuri-v1.md`.

| Felul | Tipurile | Cum îl recunoști |
|---|---|---|
| Teorie | `teorie`, `model`, `poveste` | hârtie deschisă, semn ■, text de sus, sub o linie subțire, ca o pagină |
| Exercițiu | `exercitiu`, `energizant`; și orice ecran cu `cronometru` dintr-un modul de teorie sau de mesaj | alb + panoul de aur în dreapta, cu cronometrul mare (sau ▶) și formatul („în perechi”), semn ▶ |
| Reflecție | `reflectie`, `deschidere`, `inchidere` | navy, semn ● de aur, text mare la stânga, un cerc subțire în dreapta |
| Mesaj cheie | `mesaj` | câmp teal, semn ▬, o idee foarte mare, în centru, sub o linie groasă |
| Pauză | `pauza` | salvie, semn ‖, totul în centru, cronometrul foarte mare |

Fiecare ecran are sus eticheta felului (de exemplu „Exercițiu · Unde sunt eu pe curbă”). În ecranul de comandă, sub „Acum”, **banda zilei** arată câte un semn pentru fiecare ecran, în ordine; un click sare la ecranul ales. Felul îl alege `FEL` din `lib/trainer.mjs`.

## Tema

Culorile și litera stau doar în teme (tokeni): `tema/innersis.css` (Innersis Ive, Ioana) și `tema/sobru.css` (provizorie, pentru orice alt brand). Pentru BEMORE LS: copiezi `innersis.css` ca `tema/bemore-ls.css` și schimbi valorile `--fel-*` și `--t-*`. Generatorul o alege singur după `brand` din `curs.yml`. Structura (mărimi, așezare) e în `lib/stil.css`. Ecranul din sală are 1600×900 și se scalează la orice proiector.

## Fișierele

| Fișier | Ce face |
|---|---|
| `build.mjs` | linia de comandă: citește, verifică, scrie, face PDF-urile |
| `lib/sursa.mjs` | citește `curs.yml`, ediția, modulele și piesele; agenda, orele și totalurile; verificările pe sursă; `desfasoara()` pune piesele în modul |
| `lib/export.mjs` | cursul participanților și verificarea pe rezultat |
| `lib/trainer.mjs` | materialul trainerului (HTML), ecranele din sală |
| `lib/prezinta.js` | partea care rulează în browser (vederi, Prezintă, cronometru, tipar) |
| `lib/randare.mjs` | Markdown → HTML; HTML-ul brut și linkurile `javascript:` devin text |
| `teste/` | `verificari.test.mjs` (npm test), `chrome-prezinta.mjs` + `cdp.mjs` (Chrome comandat prin DevTools, fără dependențe) |
