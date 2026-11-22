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
- [Element în pagina întreagă](feedback_element-in-pagina.md) — 2026-11-18: element în povestea paginii; densitate 16/12 px, primul ecran plin, un strat
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

- 2026-11-18: Un element care plutește (capsulă, raft) îl verific cu un script: coliziuni între straturi, text acoperit (Range.getClientRects), ținte < 44 px, nume accesibile. Clasele „doar în A” + „doar în B” pe același element îl ascund în ambele: folosește o clasă „nu în C”.

- 2026-11-18: Tipar din Chrome: umbrele cu blur mare ies ca dreptunghiuri închise (fără box-shadow la print); marginile @page taie fundalul, deci foi explicite de 210×297 mm cu @page margin 0 și fundal pe fiecare foaie. PDF → PNG: un script Swift cu PDFKit (fără pdftoppm pe Mac).

## Proiecte și referințe
- 2026-11-18: Oferte (D-073): șablonul `team/ioana/documente/oferta-sablon-v1.html`, 2 foi A4 (povestea / înțelegerea), Ana îl umple prin comentariile ANA. Brand implicit BEMORE LS, fundalul site-ului, lentila la final. Alex (v3b): fără „Pe scurt” în primul card și fără bandă neagră la total (acum sticlă deschisă cu margine Sora); v3d: materialele nu mai stau într-un card separat, ci în tabelul Investiția, ca rânduri „inclus · 0 EUR” sub rândul de care țin (Alex: „pachetul să pară cât mai bogat”); foaia 1 umplută cu componente mai mari la tipar, nu cu goluri.
- [Contact v1](project_contact-v1.md) — 2026-11-18: doar iconițe-link; Alex a ales capsula, numită „Contact” (D-072); review build T-042
- [Manual de brand BEMORE](project_manual-brand.md) — 2026-11-17: D-057 Sora = noul BEMORE; §7 lentila Despre; §8 portretul = lentila (D-060)
- 2026-11-18: Despre: Alex a ales A (orbita). v2.1 în `despre-compozitie-v2.html`: orbita vie, cărțile rotitoare înapoi, „Acum” cu textul lui. Aștept reacția; Mike construiește. v1 rămâne (D-063).
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
- 2026-11-18: Slide-uri v2 (Alex: „mult mai creative vizual”, notă comună între tipuri): prototip în `privat/cursuri/change-agility/design/slide-uri-v2.html` (10 ecrane, 9 vizualuri, nota A Lumi / B Cotor, H = cum se scrie). Recomand A. Principii publice: `team/ioana/documente/slide-uri-v2.md`. Aștept alegerea; apoi Radu (T-040).
- 2026-11-18: Tehnic, ecrane animate: pașii ca clase cumulative p0..pK pe ecran + `dK` pe elemente; liniile desenate cu lungimea măsurată în JS (nu `pathLength`); etichete în CSS 3D întoarse spre privitor cu rotațiile camerei inversate; `?static` + `#n.k` pentru capturi headless. La navigarea doar pe hash, pagina are nevoie de `hashchange`, altfel capturile ies identice.
- 2026-11-22: Slide-uri pentru PowerPoint-ul lui Matei (genereaza.js, pptxgenjs): mock-urile le fac ca SVG 1280×720 (= 13,33×7,5 in), doar cu ce poate genera el (elipse/roundRect semitransparente, casete de text, fundalul „lumina”). Pentru perechi de concepte am propus `tip: pereche` (2 cercuri care se suprapun + capsula „comun”), cu model gol cu zone numite. Aștept alegerea lui Alex (homeostaza-alostaza-mockup.html în privat/cursuri/change-agility/design/).
- 2026-11-22: Capturi pe secțiuni dintr-o pagină lungă: copie a paginii cu `<style>` care ascunde restul + Chrome headless; `sips --cropOffset` nu taie unde crezi, iar PIL lipsește.
- 2026-11-22: FEEDBACK ALEX pe perechi de concepte: cercurile suprapuse (Venn) „nu transmit că se completează”; vrea un INFINIT, „o dinamică între ele”. Pentru „se completează” folosesc forme care curg una în alta (∞, buclă), nu forme statice. Nu pun pe slide formulări care nu sunt ale lui (subtitlu, cuvântul comun): zona rămâne „de ales de Alex”.
- 2026-11-22: Punct de lumină pe o cale SVG doar din CSS: path cu pathLength="1000", stroke-dasharray "1 999" + linecap round, animat pe stroke-dashoffset 1000→0; fără animație la prefers-reduced-motion.
- 2026-11-22: Slide de întrebări (intrebari-mockup.html, design/): A una mare (Noapte), B vot Da/Nu, C principală + adâncire, D pe rând (una activă, restul estompate 40 %). Recomandat D ca model de bază (generatorul face un slide pe întrebare, `pe_rand`), B pentru întrebări da/nu. Pe slide: 1 pt = 1,333 px la 1280 lățime, deci 28 pt ≈ 38 px. Doar întrebările lui Alex, cuvânt cu cuvânt.
- 2026-11-22: FEEDBACK ALEX (slide de întrebări, varianta A): „nu văd scopul acelor cercuri”. Fără elemente decorative fără rol pe slide-uri; fiecare formă trebuie să spună ceva.
- 2026-11-22: REGULĂ ALEX: „nu văd scopul acelor cercuri”: nicio formă decorativă fără rol pe slide; fiecare formă spune ceva (linia = răspuns, punctat = punct de plecare, zona colorată = cost). Am scos cercurile din varianta A a slide-ului de întrebări.
- 2026-11-22: Încărcarea alostatică (incarcare-alostatica-mockup.html): recomandat B, același răspuns cu pauză / fără pauză, baza care urcă = uzură. Fără medicalizare (fișa o interzice): fără corp, „boală”, „sănătate”.
- 2026-11-22: FEEDBACK ALEX: schemele de încărcare alostatică (răspunsuri repetate, baza care urcă) „nu exprimă că se adună riscul de probleme prin uzură cumulată”. Pentru acumulare: un rest vizibil la fiecare presiune + un PRAG numit („riscul de probleme”) + pauza ca singura ieșire (rezervor cu straturi și robinet). Alex a ales C (pauză · sens · control) ca slide de ieșire.
- 2026-11-22: Capturi pe secțiuni: CSS-ul de ascuns pus înaintea paginii pierde în fața regulilor ei (.intro{display:grid}); folosește !important.
- 2026-11-22: FEEDBACK ALEX: o schemă trebuie să arate MECANISMUL (de ce), nu doar rezultatul (acumularea). Încărcarea alostatică: două sisteme, aceleași presiuni (cel care se adaptează: răspuns tot mai mic, revine; cel care nu reușește: răspuns la fel, nu coboară, costul se adună până la prag). Recomandat M2; M1 = bucla cu „se adaptează?” și tiparele pe ramura NU.
