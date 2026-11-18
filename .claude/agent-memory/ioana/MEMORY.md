# Memoria lui Ioana (Designer UI/UX)

> **Regula datelor (de la 2026-11-15):** fiecare intrare nouă începe cu data adăugării, `AAAA-LL-ZZ:`. Intrările de mai jos fără dată au fost adăugate pe 2026-11-15.

Păstrează sub 150 de rânduri. Comprimă când crește. Fapte, nu povești.

## Despre Alex
- Coach, fondator, inventator. Implicat în BEMORE, Wise Teams, LIFT, Innersis. Construiește tool-uri, aplicații, cursuri; conduce o echipă de agenți AI.
- Vrea: site ușor de navigat și de actualizat, carte, tool-uri, rezervare de sesiuni de coaching.
- Lucrează în română. Navigare pe limba utilizatorului: „Ai nevoie de X? Mergi aici.”
- Detalii de profil și voce: skill-ul `vocea-alex`.
- 2026-11-15: Misiunea lui (D-026) e fundația: „Necunoscutul creează monștri. Educația creează poduri.” Nu o ilustra la propriu, nu o reformula pe site (formulările sunt ale Mariei).

## Preferințe confirmate
- [Scrisul mic](feedback_scris-mic.md) — 2026-11-17: sub 16 px doar etichete; ce se apasă ≥16 px; Alex observă
- [Element în pagina întreagă](feedback_element-in-pagina.md) — 2026-11-18: un element cerut se gândește în povestea paginii, nu „pus undeva”
- [Inovație, nu calm](feedback_inovatie-nu-calm.md) — „prea banale” (2026-11-15); vrea viitor, un wow clar; a11y și viteza sunt limite
- 2026-11-15: Alex a ales **Spațiu** (D-023): „Ioana a făcut treabă bună acum.”
- 2026-11-17: Îi place **Planșa** (luminos, desen tehnic, aerisit). Întrebările le vrea ca să descopăr un stil nou pentru el, nu ca să aleagă între variantele mele.
- 2026-11-17: Spațiile care îi plac: atelier de arhitect schițat, birouri minimaliste ușor industriale cu lemn și multă lumină, Apple Park, plante, balcon în NY la ultimul etaj, munte. Vrea ca vizitatorul să simtă „wellness al minții”, „pe mâini bune”, ca într-o bibliotecă modernă sau un showroom.
- 2026-11-17: Site-ul e „foarte închis”, neplăcut pentru cursuri online; vrea pagini de citit luminoase. Îi plac: compact, interactiv, dinamic (nu le pierde).
- 2026-11-15: I-au plăcut: feed-ul cu taskurile dintre agenți (din Sistem viu), introducerea scrisă din mock (păstreaz-o exact), metafora „acces în atelierul meu de inovație, work & living”.

## Ce a mers / ce nu
- Mock HTML cu comutator între direcții = mod bun de a-l lăsa pe Alex să aleagă.
- Capcană în mock-uri: `.hero{padding:X 0}` suprascrie padding-ul lateral din `.wrap`. Folosește padding-top/bottom.
- Browserul integrat ascuns încetinește rAF, tranzițiile și WAAPI aproape până la zero. Pentru animații: `show_pane preview`, `dt` limitat generos (0,2–0,25 s) și o plasă `setTimeout` care termină animațiile critice.
- 2026-11-15: WebGL în browserul integrat rulează ~3–4 cadre/s chiar și vizibil (fără GPU real, la fel și v1). Nu măsura performanța 3D acolo; cere test pe telefon real.
- 2026-11-15: `element.focus()` din JS nu declanșează `focusin` dacă documentul nu are focus. Testează focusul cu click real + Tab.
- 2026-11-15: Elementele ascunse cu `opacity:0` rămân în ordinea de Tab. Adaugă `visibility:hidden` cu tranziție întârziată.
- 2026-11-15: Pe mobil, cu panou deschis, ascunde titlul și ridică obiectul ales deasupra panoului (altfel scena dispare sub panou).
- 2026-11-15: Brief-ul s-a schimbat de 5 ori în timpul sarcinii (colegii lucrează în paralel). Construiește în straturi, iar ID-urile din `docs/taskuri.md` le verifici chiar înainte de scriere.
- 2026-11-17: Browserul integrat nu deschide file://; pentru capturi locale merge Chrome headless (`--screenshot`), dar fereastra are minim 500px lățime: verifică overflow-ul cu JS, nu din captură.
- Tranziția CSS a `clip-path` cu `var()` nu s-a desenat în Chromium; WAAPI cu valori explicite merge.
- 2026-11-17: Mock-uri la proporții reale: o lățime fixă (1440 / 390) scalată cu `transform`, plus `@container` pe rădăcina mock-ului, ca telefonul să fie același markup. Chrome headless cu `--user-data-dir` nou la fiecare rulare (altfel se blochează); viewport-ul de telefon îl testezi în browserul integrat cu `resize_window mobile` + meta viewport adăugat din JS.
- 2026-11-17: Alex iubește elementele dinamice; prima verificare a oricărei prime pagini: obiectele se văd imediat peste fundal (contur, culoare proprie, umbră)?
- 2026-11-17: Alex vrea esența locurilor, nu obiectele lor („prea literar”). Metafora (obiectele-simbol) da; mobilier desenat nu.
- 2026-11-17: Alex cere acum Liquid Glass clar, cu gradient mesh granulat. Regula mea rămâne: textul doar pe sticlă opacă (80 % sau 93 %) și contrastul calculat peste cel mai rău punct.
- 2026-11-17: Brief-urile de la Tudor se pot schimba de două ori într-o sarcină (D-055, D-057). Scrie regulile neutre la nume și ține valorile într-un singur loc, ca schimbarea să fie de câteva rânduri.
- 2026-11-17: Sesiunea mea de lucru nu are voie să pornească un server local (refuzat); pentru capturi folosesc `curs/teste/cdp.mjs` dintr-un script în scratchpad.
- 2026-11-17: Întrebările deschise despre locuri care îi plac (nu despre site-uri) au dat cel mai mult material de design.
- 2026-11-17: În mock-urile cu variante pun `#varianta` în URL: capturile headless pe fiecare variantă ies dintr-o comandă.
- 2026-11-17: Alex: „mai aerisit”. Înseamnă mai puține lucruri vizibile deodată, nu mai puține drumuri; compactul și interactivitatea rămân.

## Proiecte și referințe
- [Manual de brand BEMORE](project_manual-brand.md) — 2026-11-17: D-057 Sora = noul BEMORE; §7 lentila Despre; §8 portretul = lentila (D-060)
- 2026-11-18: Despre ca întreg: `despre-compozitie-v1.html`, A (omul → banda misiunii cu cărțile → linia timpului, recomandat) / B (lentila cu evantai, parcurs la scară). Aștept alegerea lui Alex; Mike construiește.
- [Design v2 și v3](project_design-v2.md) — 2026-11-17: D-054 Sora (font + paletă); v3.1 = 3 prime pagini; aștept alegerea
- [Culori v1](project_culori-v1.md) — 2026-11-17: diagnostic + A/B/C; înlocuit de design v2 (regulile de sens rămân)
- [Spațiu v2](project_spatial-v2.md) — prototipul curent; deschise: rândurile din Live, propoziția „pod”, test pe telefon
- [Direcții v1](project_directii-v1.md) — Dialog / Spațiu / Sistem viu; Alex a ales Spațiu
- [Descoperire v0](project_descoperire-v0.md) — logica UX rămâne; stilul A/B respins
- [Suport browsere sticlă](reference_browser-support-glass.md) — Safari nu suportă prefers-reduced-transparency

## Deschis
- Vezi `docs/intrebari-pentru-alex.md`.
- Profilul meu (`team/ioana/profil.md`, „calm”) și estetica din `vocea-alex` trebuie actualizate după feedback (T-006 la Maria; profilul, semnalat lui Tudor).

## Curs (materialul trainerului)
- 2026-11-17: Banca v2 (cerută de Alex: „UX mai bun, s-o navighez mai ușor”): listă compactă `<details>`, chipuri, căutare, „Azi în agendă” sus. Alex o folosește din timp (agenda) și live, în pauză, pe tabletă. Aștept reacția lui.
- 2026-11-17: Pentru capturi cu clicuri și viewport de tabletă/telefon din file://: `curs/teste/cdp.mjs` + `Emulation.setDeviceMetricsOverride`. Enter pe `<summary>` nu se simulează cu CDP fără `text`; testează cu click.
- 2026-11-17: Tokenii temei (`curs/tema/*.css`) nu se ating din stil; folosesc doar `--t-*` existente.
- 2026-11-17: Ecranele din sală au 4 feluri + pauza (`slide-tipuri-v1.md`): teorie ■ hârtie, exercițiu ▶ alb + panou de aur cu cronometru, reflecție ● navy + cerc, mesaj ▬ câmp teal centrat, pauză ‖ salvie. Tema `curs/tema/innersis.css` e a mea; BEMORE LS = copie cu alte valori. Aștept reacția lui Alex la primul Prezintă.
- 2026-11-17: Capcană: o clasă de fel pusă și pe ecran, și pe semnele mici (`fel-x`) cere selectori legați de `.ecran.fel-x`, altfel decorurile (::before/::after, padding) se scurg în UI.
- 2026-11-17: Marca „BEMORE Learning Studio” (D-061): text, jos în stânga pe ecrane (dreapta jos e a cronometrului), mai mare pe titluri/deschidere/închidere; `marca` în curs.yml, doar brand: bemore. Regulile: manual §9. Fără semn lângă: semnele spun felul ecranului.
- 2026-11-17: Înainte de capturi, verific cu un script coliziunile unui element fix pe TOATE ecranele cursului real (bounding boxes); ecranele prea pline (>30 cuvinte) ies din padding.
- 2026-11-17: Slide-urile Ive ale lui Alex: Helvetica Neue subțire, etichetă mică spațiată în teal, punct de aur la reflecție, liste 01/02 cu linii fine. Pe proiector: fără sticlă, fonturi de sistem.
