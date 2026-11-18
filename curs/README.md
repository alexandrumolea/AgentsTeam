# Generatorul de curs

O sursă, trei ieșiri (Radu, `team/radu/documente/arhitectura-curs-change-agility-v0.md`, v1.2; D-048–D-051, D-053).
Folderul unui curs (un fișier `.md` pe modul, piesele de workshop în `piese/`, agenda în ediție) devine:

| Ieșirea | Fișierul | Pentru cine |
|---|---|---|
| Cursul participanților | `<slug>-participanti.json` | site-ul, mai târziu, prin PR aprobat de Alex. Se face **dintr-o ediție**: modulele și piesele singure din agendă, în ordinea ei, doar cu piesele folosite care au `in_curs: da`. Fără `:::trainer`, `:::sala`, schiță, pauze, biblioteca nefolosită |
| Materialul trainerului | `<slug>-trainer.html` | Alex. Un singur fișier, merge fără internet: vederile **Harvest** (panoul de control, prima vedere), Ziua, Modulul, Schița, **Biblioteca de piese** (toate piesele, cu căutare și filtre) și **Prezintă**. Ziua și Schița arată totalul zilei și cât rămâne din `durata_zi` |
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

### Programul zilei: pauzele la ore fixe (Alex, 2026-11-18)

- `pauze` în `curs.yml`: `[{ la: "11:00", min: 15 }, { la: "12:30", min: 60, titlu: "Prânz" }, { la: "15:00", min: 15 }]`. **Fără câmp, exact acestea sunt implicite** (cele de 15 minute sunt o presupunere: le corectezi aici). Ediția poate avea propriul `pauze`, care îl înlocuiește; `pauze: []` = niciuna. Ora se scrie între ghilimele.
- Pauzele împart ziua în **blocuri** (de la `ora_start` la prima pauză, între pauze, de la ultima pauză la sfârșitul din `durata_zi`). Agenda se așază în ele, în ordine; pauza fixă intră singură în agendă când îi vine ora. O pauză fixă de după ultimul rând din agendă apare doar ca reper în Ziua și Schiță, fără ecran.
- **`- bloc: 2`** în agendă: de aici începe blocul 2 (după pauza fixă dinaintea lui); restul blocului de dinainte rămâne liber. Un bloc care nu există oprește build-ul.
- **O piesă nu se rupe peste o pauză.** Dacă un rând trece peste ora pauzei, build-ul dă avertisment (nu se oprește), iar pauza începe după rând: „blocul 1 (9:30–11:00): 103 din 90 min; „…” trece peste pauza de la 11:00, deci pauza începe la 11:13”.
- **Unde se văd:** în Ziua și Schiță, un cap pe fiecare bloc cu „X din Y min” și „liber” / „plin” / „depășire” (marcată); pauza fixă e un rând (și un ecran de pauză cu cronometru, în banda zilei și în vederea Ecrane). Id-ul ecranului ține de oră: `pauza-11-00#pauza`, deci nu mută id-urile `pauza#k` ale rândurilor `pauza: N`, care rămân pauze suplimentare.
- „Copiază pentru ediție” (1.12) scrie pauza fixă ca `- bloc: N`, ca agenda copiată să păstreze blocurile.

### Harvest: panoul de control al cursului (Alex, 2026-11-18)

> Din 2026-11-18 vederea se numește Harvest (înainte: Masa), iar fișierul cursului e `harvest.yml` (înainte: `masa.yml`). Un curs care are doar `masa.yml` merge mai departe: build-ul îl citește, editorul scrie în el, iar build-ul dă avertismentul „redenumește masa.yml în harvest.yml”. Dacă le are pe amândouă, contează `harvest.yml`. În cod rămân numele vechi (`lib/masa.mjs`, `lib/masa.js`, `#masa`, `masa-*`, `/api/masa`).

Fluxul: **Harvest → Curate → Flow**, iar rezultatul e **firul roșu** (agenda ordonată). „In etapa C facem harvest, curate (alegem ce este suficient de actual și cu sens să rămână în librărie), flow (începem să facem un fir roșu). Finalul de aici este firul roșu.” Harvest: tot ce iese din Laborator (exerciții, knowledge bites, experiences). Curate: ce e suficient de actual și cu sens rămâne în Bibliotecă. Flow: firul roșu al zilei, pe blocuri. Întâi conținutul, apoi producția (slide-uri, curs online).

- **Sursa:** `harvest.yml` în folderul cursului, o listă `candidate:` de obiecte mici: `id`, `titlu`, `scop`, `durata`, `tip`, `sursa` (Irina, Alex, bibliotecă…), `verdict` (nou / da / poate / nu), `bloc` (1, 2… sau gol), `ordine`; opțional `obiective`, `nota`. Fără text de slide. Exemplul: `exemple/change-agility-exemplu/masa.yml`.
- **O singură listă:** o piesă care are deja fișier în `piese/`, dar nu e în Harvest (piesele vechi), apare în Harvest cu „Da”, adică în Bibliotecă. Intră în `harvest.yml` la prima schimbare din editor (sau cu „Copiază harvest.yml”).
- **Harvest e prima vedere**, la deschidere, și în editor, și în fișierul offline (când cursul nu are încă `harvest.yml`, arată o propunere).
- **Rezumatul de sus** (fiecare cifră e un link): Harvest (noi / poate / nu), Biblioteca (piese, produse, de produs → Biblioteca filtrată), firul roșu (piese, minute din timpul blocurilor, „B1 85/90”… → Ziua, la bloc), obiectivele (câte piese din agendă servesc fiecare; unul neacoperit e marcat → Schița), ediția (agenda e la zi cu firul roșu sau diferă, cu „Trimite în agendă”). Obiectivele unei piese vin din Harvest și din fișierul ei.
- **Trei coloane, cele trei etape:** **1 · Harvest** (nou; „Poate” rămâne în Harvest, separat; „Nu” se ascunde, cu „Arată și Nu”), **2 · Curate** („Da”: rămâne în Bibliotecă, produs sau de produs), **3 · Flow** (firul roșu: blocurile zilei, cu pauzele fixe între ele și „X din Y min”, recalculat pe loc, și în timpul tragerii). Cartonașe compacte: titlu, scop pe un rând, durată, tip, sursa, „produsă”.
- **Cum lucrezi:** Da / Poate / Nu pe cartonaș; tragere în și între liste (mouse de oriunde, deget de pe mânerul ⠿); pe cartonașul selectat: `D` `P` `N`, `1`–`4` (în blocul ales), `0` (scoate din bloc), `↑` `↓` (mută în Agendă, și peste granița blocului). Tras în Bibliotecă = „Da”; tras într-un bloc = „Da” dacă era nou.
- **Biblioteca de piese** arată și piesele cu „Da” din Harvest care nu au încă fișier: titlu, scop, durată, marcate **„de produs”**, fără ecrane și fără „Prezintă” (filtrul „Stare”). Se actualizează la build (în editor, la reîncărcarea paginii).
- **Salvarea:** în **editorul local**, fiecare schimbare se scrie direct în `harvest.yml` (același server, același token; comentariile din fișier rămân; copie în `.editor-istoric/`; dacă fișierul s-a schimbat pe disc, nu suprascrie), apoi materialul se reface. În **fișierul offline**, schimbările stau în browser (rezistă la refresh; „Resetează” revine la fișier), iar „Copiază harvest.yml” dă fișierul întreg. Fără `harvest.yml`, în editor, butonul „Creează harvest.yml” scrie propunerea.
- **„Trimite în agendă”:** din blocurile Agendei, piesele cu „Da” care au fișier produs devin agenda ediției (cu `- bloc: N` între blocuri); celelalte sunt listate: „de produs” (Da, fără fișier) și „nehotărâte” (Poate). În editor scrie doar cheia `agenda:` din `editii/<data>.yml` (restul ediției rămâne identic, verificat), cu copie de siguranță, și reface materialul; offline, copiază blocul. Pauzele suplimentare (`pauza: N`) nu sunt candidate: le adaugi în agendă după.
- **Ce oprește build-ul:** id dublat sau cu alte caractere decât litere mici, cifre, cratimă; verdict necunoscut; durată care nu e număr; YAML greșit. Un bloc care nu există azi și un tip necunoscut dau doar avertisment. Harvest nu intră în cursul participanților.

### „Prezintă” din Bibliotecă (1.12, Alex, 2026-11-17)

- Fiecare piesă din Biblioteca de piese are **Prezintă**, și alternativele care nu sunt în agendă. Ecranele piesei intră imediat după ecranul de acum, iar prezentarea sare la primul; după ultimul ecran al piesei, continuă de unde ai rămas. Dacă piesa e deja în prezentare (în agendă sau adăugată live), doar sare la ea.
- Fără fereastra sălii deschisă, piesa e pregătită ca ecran următor, iar pagina propune „Deschide ecranul din sală” sau „Prezintă aici”.
- Ecranele adăugate sunt marcate **„adăugat live”** în ecranul de comandă, în banda zilei și în vederea Ecrane (cu **Scoate**). Totalul zilei din Ziua și Schiță crește cu durata piesei și spune cât e adăugat live.
- Se salvează în browser, cu ordinea și ascunderile (rezistă la refresh); fereastra sălii le primește pe același canal. „Resetează la ordinea din curs” le scoate.
- **„Copiază pentru ediție”** dă, pe lângă `ecrane:`, toată `agenda:` cu piesele adăugate ca rânduri noi (piese singure), după rândul în care erai, de exemplu `- plimbare-curba   # adăugată live (în sală: după curba#1)`. Lipești blocul în locul agendei din ediție.
- Build-ul pune în materialul trainerului ecranele tuturor pieselor (`biblioteca`, id-uri `<piesă>~live#n`), ca prezentarea live să meargă fără internet.

### Editorul local: editezi direct pe ecran (1.11, Alex, 2026-11-17)

**Pornire:** dublu-click pe `curs/Editeaza curs.command` (deschide Terminal și browserul), sau `npm run editor -- <folderul cursului>`. Implicit: `privat/cursuri/change-agility`. Fereastra Terminal rămâne deschisă cât editezi; Ctrl+C sau închiderea ei oprește editorul.

- Serverul (`editor.mjs`, doar `node:http`) ascultă **doar pe 127.0.0.1** (portul 4747, sau altul liber), servește materialul trainerului cu modul de editare și cere un **token aleator** din linkul deschis la pornire. Verifică și gazda cererii (fără DNS rebinding). Fișierul HTML offline din `dist/` rămâne exact cum e: editorul se adaugă doar în pagina servită și niciodată în fereastra sălii.
- **„Editează”** apare pe ecrane în vederea Ecrane, în Modul (și pe notele trainerului) și în ecranul de comandă (ecranul de acum). Se deschide sursa blocului (`:::sala` / `:::sala-si-curs` / `:::trainer`), cu un mini-ajutor (`## titlu`, `- punct`, `1. pas`, `**îngroșat**`) și previzualizare live la mărimea ecranului. Titlurile de modul și pauzele nu se editează aici (sunt în antet / în agendă).
- **Salvarea** rescrie doar blocul acela, găsit după id (`piesa#n`, `modul#nota1`); restul fișierului rămâne identic. Dacă fișierul s-a schimbat pe disc între timp, nu suprascrie. Versiunea veche merge în `.editor-istoric/` (cu `.gitignore` propriu). Apoi build-ul se reface și pagina se reîncarcă la aceeași vedere și același ecran. Dacă build-ul refuză textul (de exemplu un nume interzis), fișierul revine la ce era, iar eroarea apare lângă ecran, cu textul păstrat.
- Textul nu poate conține rânduri care încep cu `::` (ar strica structura fișierului) și un ecran nu poate rămâne gol.
- **Commit-ul nu îl face editorul.** Bara de jos arată câte fișiere sunt schimbate față de ultimul commit al repo-ului cursului.

### Ecranele din sală: mută și ascunde (1.10, Alex, 2026-11-17)

- Fiecare ecran are un id stabil: `curba#1` (al n-lea bloc din sală al fișierului), `curba#titlu`, `pauza-cafea#pauza`, `pauza#1`; a doua apariție a unei piese: `<piesă>@2#1`. Id-urile se văd în vederea **Ecrane**.
- **Vederea Ecrane:** miniaturi în ordinea de prezentare. Muți prin tragere (pe tabletă, de mânerul ⠿), ↑ ↓ sau Alt+săgeți; „Ascunde” / „Arată” (sau H). Ordinea ta stă în browser; **„Copiază pentru ediție”** dă blocul pentru fișierul ediției; „Resetează la ordinea din curs” revine la ediție.
- **În ediție:** `ecrane: { muta: ["ridica-te-daca#1 după deschidere#2", "x#1 la început"], ascunse: ["pasul-de-luni#1"] }`. Un id greșit sau dublat oprește build-ul; unul din curs care azi nu e în agendă dă avertisment; un ecran nou intră singur la locul lui.
- Ascunsele se sar la prezentare, în banda zilei, în „Acum”/„Urmează” și în PDF-ul ecranelor. Timpul rămâne pe piese: o piesă cu toate ecranele ascunse rămâne în total (avertisment). Cursul online nu se schimbă.

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

Agenda: id inexistent (nici modul, nici piesă), modul de două ori, rând care nu e modul, piesă, pauză sau `bloc`, `bloc: N` peste numărul de blocuri, pauze fixe greșite (oră fără ghilimele, durată, suprapuse), pauză care nu e număr, `comun/…` (încă nu există), `sari_peste` și `exercitii` (vechi). Piese: `durata` lipsă (la orice piesă și la module), tip din afara listei, activitate fără `format`/`energie`/`obiectiv`, id folosit și de un modul, și de o piesă, id-uri inexistente în `implicite`/`alternative`/`module`, aceeași piesă și implicită, și alternativă, folderul vechi `exercitii/`, modul cu și `exercitii`, și `piese`, `::piese` greșit scris, de două ori sau într-o piesă. Apoi, ca în v1: bloc neînchis, bloc în bloc, bloc necunoscut (`:::traner`), atribut necunoscut; text din `:::trainer`, `:::sala` sau `nota_trainer` găsit în exportul pentru participanți (verificat pe rezultat, fragmente de minimum 4 cuvinte); un nume din `nume_interzise` în export (fără diacritice și majuscule); schiță cu peste 3 puncte sau un punct cu peste 8 cuvinte; module care nu încap în `durata_zi`; `cronometru` mai lung decât modulul; imagine de pe internet sau care nu e în `materiale/`; câmpuri lipsă, `id` dublat, `sari_peste` cu un id greșit. **Avertisment:** ecran din sală cu peste 30 de cuvinte, ancoră cu peste 3 cuvinte, piesă aleasă la un modul care nu e în `module` ei, modul de peste 90 de minute fără pauză după. Verificarea notelor trainerului se face pe toată biblioteca, nu doar pe ce e în agendă; titlurile modulelor și ale pieselor pot apărea în note (sunt publice).

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

Culorile și litera stau doar în teme (tokeni): `tema/innersis.css` (Innersis Ive, Ioana) și `tema/sobru.css` (provizorie, pentru orice alt brand). Pentru BEMORE LS: copiezi `innersis.css` ca `tema/bemore-ls.css` și schimbi valorile `--fel-*` și `--t-*`. Generatorul o alege singur după `brand` din `curs.yml`. Structura (mărimi, așezare) e în `lib/stil.css`. Titlurile din sală, mesajul cheie, reflecția și cronometrele folosesc `--font-titlu` (T-031); o temă fără el le scrie cu `--font`. Pentru BEMORE: `--font-greutate-subtitlu` (h2, h3) și `--cronometru-panou-marime` / `-spatiere` (Sora e mai lată). **Imaginile** de pe ecrane (de exemplu schemele SVG 16:9) iau exact spațiul rămas sub titlu și text, fără să fie tăiate; o imagine scrisă imediat sub text primește paragraful ei. Cu titlu și două rânduri de text mare rămâne loc puțin: pe mesajul cheie, ~170 px din 900. Ecranul din sală are 1600×900 și se scalează la orice proiector.

**Marca studioului (D-061, Ioana).** Pe `brand: bemore`, fiecare ecran din sală poartă jos, în stânga, wordmark-ul „BEMORE Learning Studio” (mai mare pe titlurile de modul, pe deschidere și pe închidere), iar bara și PDF-ul trainerului îl au sus. Numele vine din `curs.yml`: fără câmp, implicit „BEMORE Learning Studio”; `marca: "Alt nume"` îl schimbă (cel mult 40 de caractere; primul cuvânt se scrie în Sora, restul în Inter Tight); `marca: ""` îl scoate. Pe `innersis` și pe alte branduri nu apare (un `marca` scris acolo e ignorat, cu avertisment). Culorile, cu AA pe fiecare fel: `--fel-*-marca` în `tema/bemore.css`; structura: `.marca` în `lib/stil.css`. Regulile: manualul de brand, secțiunea 9.

## Fișierele

| Fișier | Ce face |
|---|---|
| `build.mjs` | linia de comandă: citește, verifică, scrie, face PDF-urile |
| `lib/sursa.mjs` | citește `curs.yml`, ediția, modulele și piesele; agenda, pauzele fixe, blocurile, orele și totalurile; verificările pe sursă; `desfasoara()` pune piesele în modul |
| `lib/masa.mjs` | `harvest.yml`: citire și verificare, propunerea de pornire, „Trimite în agendă”, scrierea din editor |
| `lib/masa.js` | vederea Harvest (`#masa`), în browser (offline și în editor) |
| `lib/export.mjs` | cursul participanților și verificarea pe rezultat |
| `lib/trainer.mjs` | materialul trainerului (HTML), ecranele din sală |
| `lib/prezinta.js` | partea care rulează în browser (vederi, Prezintă, cronometru, tipar) |
| `lib/randare.mjs` | Markdown → HTML; HTML-ul brut și linkurile `javascript:` devin text |
| `teste/` | `verificari.test.mjs`, `editor.test.mjs` (npm test); `chrome-*.mjs` + `cdp.mjs` (Chrome comandat prin DevTools, fără dependențe), între ele `chrome-masa.mjs` |
