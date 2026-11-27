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
- [Slide-uri Change Agility](project_slideuri-change-agility.md) — 2026-11-18…24: istoricul mock-urilor și capcanele SVG/headless
- 2026-11-22/24: REGULI ALEX pentru slide-uri (rezumat): Noapte DOAR pentru întrebări și mesaje cheie, knowledge pe Lumină; orice slide pe sticlă rotunjită peste gradient; nicio formă fără rol; schema arată MECANISMUL, nu doar rezultatul; „se completează” = infinit/buclă, nu Venn; lavandă = amenințare, albastru = oportunitate; mai puțin text decât propun (deck-ul lui final din `materiale/livrat-2026-11-23/` e modelul).
- 2026-11-24: NICIODATĂ aplicații cu interfață pe ecranul lui Alex (Keynote, open, osascript, `qlmanage -p`). Doar Chrome headless (cdp.mjs) sau `qlmanage -t`, în scratchpad.
- [Iconița Financial Growth](project_iconita-financial-growth.md) — 2026-11-25: final J2b; preferința lui: semn simplu, bold, contur blând, sticla ca MATERIAL al obiectului, nu capac
- 2026-11-25: Proces training (curs-nou-vizual.html): pas nou 7b „Lessons learned și flow-ul următor” (Elena, Daria), numerotat ca în curs-nou.md, fără renumerotare. Viewport 390 în CDP: adaug meta viewport din JS (pagina o primește de la site).
- 2026-11-25: How I Work (cum-lucram-mockup-v1.html + cum-lucram-capturi/): A Poveste (firul unei idei, 5 stații + „În lume”) / B Sistem (board viu: un card trece Backlog→Done și își schimbă stăpânul; flux în 6 noduri; organigramă). Pagina finală fără <script> (pagina-html.mjs), deci comutatorul e :target. Aștept alegerea.
- 2026-11-25: Favicon v1 (favicon-v1/, planșa): A Monograma (recomandat), B Lentila, C Orbita pe accent, D Sticlă peste culoare. Un singur rx="14" (în clipPath): imagini.mjs îl scoate o dată pentru touch-icon.
- 2026-11-25: Pagina procesului de training: 9b „Feedback către client” (Ana, Daria) + Ana în echipă. Grila .pasi (auto-fit 220 px) dă 4+2 la 1440 cu 6 carduri; verificat cu cdp.mjs (mobile:false la 390, pagina are meta viewport).
- 2026-11-25: Pagina de curs (T-052, pagina-curs-mockup-v1.html): o compoziție; planul de reinventare = obiectul din primul ecran, drumul zilei cu capsule „în plan”, ușa mini-cursului ca bandă. Capcană: pagina-html.mjs respinge „<script” și în comentarii; background-attachment:fixed dispare în capturile full-page.
- 2026-11-25: Prima sesiune (pagina-prima-sesiune-mockup-v1.html): familia Change Agility; foaia cu 5 întrebări = obiectul paginii, 9 <details> numerotate, butonul popovertarget="contact". Tokenii mock-ului au numele din temă (--text, --glass-read), ca Mike să șteargă doar blocul DOAR MOCK-UP. Capcană: „Pregătește-te” se rupe la cratimă în h1; nowrap pe cuvânt.
- 2026-11-25: FEEDBACK ALEX: „text cu link-uri, nu pare intuitiv” (elementele unei secțiuni). Ce se deschide = card/rând clicabil în întregime, cu semn clar („Deschide →”/săgeată în cerc) și eticheta tipului. elemente-sectiune-v1.html: A Cardul (recomandat), B Rândul-drum (pentru >4–5 elemente); generator scratchpad el/gen.mjs.
- [Mini-curs online](arhiva/project_mini-curs-online.md) — 2026-11-25 (arhivat: D-099 oprește cursul online): prototip Bun venit + Stația 1 (Drumul Danei), tiparul pentru stațiile următoare
- 2026-11-25: Diagrame Substack (schita-4-layers-v1/, gen.mjs): familia lui = fundal deschis, forme pline, sans bold, semnătura „Alexandru Molea”. Pe telefon imaginea de 1456 px se vede la ~358 px (×0,25): text ≥ 46 px în sursă. v2 (schita-4-layers-v2/) e în limbajul Wise Teams: crem, titluri bold, etichete spațiate, culori pe capabilitate (Delivery coral, Anticipation portocaliu, Flow teal, Trust indigo). Font Poppins, care nu e pe Mac: randez în Avenir Next până îl avem. Wordmark-ul „wise” nu-l redesenez. v3 (schita-4-layers-v3/): Drumul / Treptele / Harta pe axe. Aștept alegerea.
- 2026-11-25: LECȚIE (Alex a respins stiva și piramida: „contrazice metodologia, care zice că există o ordine”): imaginea unui model Wise urmează ORDINEA din metodologie (Container → Aligned → Flow+Trust → Delivering consistently → Anticipation → echipă emergentă), nu ierarhia din textul articolului. Înainte de schiță citesc metodologia, nu doar articolul.
- 2026-11-25: Materialele clienților (rapoarte Wise Teams etc.) le citesc doar ca imagine, din scratchpad, apoi șterg randările; nici numele clientului, nici datele nu intră în repo sau memorie. Verificarea suprapunerilor: cutia textului din font-size (y−0,74·fs … +0,22·fs), nu getBBox (Avenir dă cutii prea înalte).
- 2026-11-25: Capcană CSS: `.fraza .f` (0,2,0) bate `button.f{all:unset;padding}` (0,1,1); la `all:unset` verifică specificitatea regulilor vechi.
- 2026-11-25: ALEX pe schița 4 Layers v3: fără mesajul „there is an order” și fără „each stage unlocks/makes the next possible” (nici „each step rests on the one before”). Ordinea se vede din imagine, nu se spune în text.
- 2026-11-25: Alex a ales A · Drumul (schita-4-layers-v3/a-drumul.png) pentru articolul „The 4 Layers”. B și C sunt în arhivă.
- [Brand Wise Teams v1](project_brand-wise.md) — 2026-11-26: manual + 6 mock-up-uri, gen.mjs; culori aproximative, așteaptă deciziile lui Alex și ale Andreei
- 2026-11-26: Căutările web le fac doar după numele business-ului, nu după numele oamenilor (partenerul, clienții).
- 2026-11-26: PDF articol + postare în stilul The Wise (wise-articol-postare-2026-11-26/, gen.mjs ia textele direct din draft-urile Sofiei, randare.sh headless). Capcane la tipar: un element mai lat decât zona paginii (margin negativ) face Chrome să micșoreze TOT documentul; flex cu gap pe h3 pune gol între span și text (înfășor titlul într-un span). Verific textul HTML vs. markdown cuvânt cu cuvânt (PDF-ul rupe literele spațiate). Tool-uri PDFKit (pagini PNG, foaie de contact) le refac în scratchpad cu swiftc. v2 (după manualul Wise, gen-v2.mjs + verifica-text.mjs + randare-v2.sh): wordmark în @page margin box cu content:url(svg cu width/height în mm), :first pentru dreapta pe copertă. Aura la tipar: elipse SVG cu feGaussianBlur, ținute în interiorul cutiei (altfel margini tăiate); un element absolut cu top negativ se scurge pe pagina anterioară. brand-wise/gen.mjs NU se importă (își regenerează PNG-urile): copiez piesele.
- 2026-11-26: REGULĂ ALEX (D-098): în majoritatea timpului lucrăm în imaginea BEMORE Learning Studio (brand-bemore). Când lucrăm pe Wise Teams: culorile și stilul Wise (team/ioana/documente/brand-wise/manual-wise-v1.html). Un material, un singur brand.
- 2026-11-26: Cursul online Change Agility (privat/…/curs-online/index.html): pe telefon, schemele late din deck se citesc în zoom CULCATE pe lungimea ecranului (rotate 90° pe portrait, lățimea = min(100dvh−88px, (100vw−24px)·raport)); raportul îl pune JS la onload. „Mărește” stă sub imagine, nu peste ea (acoperea etichete din schemă). Capturile full-page le fac cu un script în scratchpad (captureBeyondViewport + clip), plus foi de contact randate tot în Chrome headless; elementele fixed apar la mijloc în capturi, nu e bug.

- 2026-11-26: Meditația „The Positive Unknown” (privat/…/design/positive-unknown-mockup.html): scenă DOM 1280×720 scalată, animația din timp, `__pu.seek('B', ms)` pentru capturi; `?v=noapte` / `?puntea=lumina` în URL. v2: doar B Orizontul, scriptul lui Alex în `SCRIPT`, comutator Lumină/Noapte (recomandat: Lumină cu puntea pe Noapte). Aștept alegerea; apoi Matei face PPTX-ul.
- 2026-11-26: LECȚIE (Alex: „nu respectă linia de design a slide-urilor”): linia Lumină/Noapte se aplică FIECĂRUI slide nou, chiar dacă subiectul pare „de seară” (meditație). Implicit Lumină ca deck-ul livrat (cer #80CAF1→#BED6F3→#AB9AE3 135°, titlu și capsulă bleumarin #0F1B43 sus, card alb 90 %); Noapte doar pentru mesajul cheie. Înainte de un slide nou mă uit în `materiale/<ultima livrare>/previzualizari/`. Pe alb, o lumină cu margine estompată dispare: margine plină ≥3:1 + halo separat.
- 2026-11-26: Capcană SVG: gradient pe o linie orizontală cu objectBoundingBox (înălțime 0) nu se desenează deloc; folosește gradientUnits="userSpaceOnUse".
- 2026-11-26: D-099 (Alex): renunțăm la cursul online în procesul de curs („nu are sens dacă nu fac video-uri”). După livrare facem doar materialul participantului (PDF, schemele din deck); în Producție intră planșe pentru sală și alte materiale tipărite (Matei, Ioana pe vizual). D-094 e înlocuită.
- 2026-11-27: Imaginea og a paginii Change Agility (T-057, og-change-agility/gen.mjs: culorile din site/tema.mjs, fonturile din site/node_modules/@fontsource-variable, randare cdp.mjs): A · Planul (recomandat) / B · Resursele, comparatie.html. LECȚIE: og:image e UNA pe pagină și servește toate postările care duc acolo, deci arată cursul, nu o postare. În feed pe telefon imaginea are ~320 px (×0,27): titlu ≥ 120 px, fraza ≥ 46 px în sursa de 1200. Chrome headless ia dark mode-ul sistemului: Emulation.setEmulatedMedia light pentru capturi.
- 2026-11-27: Imaginea postării Change Agility. Runda 1 (arhiva/postare-change-agility-2026/) respinsă toată: „Nu-mi place niciun mock-up”. Runda 2 (postare-change-agility-2026-v2/, gen.mjs, comparatie.html): A Aleea (poza lui) / B Peretele (bilețele scrise de mână, recomandat) / C Dicționarul (folio 2026) / D Prognoza (app meteo) / E Biletul / F Afișul de film. Aștept alegerea. LECȚII: (1) când propun variante, schimb MEDIUL și conceptul, nu motivul de pe aceeași sticlă tipografică (runda 1 era o singură familie); (2) fraza de pe imagine nu repetă începutul postării; (3) în cdp.mjs pagina se deschide la 1280×800: JS de layout (elementFromPoint) rulează DUPĂ setDeviceMetricsOverride; (4) un drum desenat ca offset al unei Bézier cu lățime mare face cusp-uri: curba centrului blândă; (5) fără QR fals pe imagini (oamenii scanează): cod de bare decorativ.
- 2026-11-27: Butonul de email pe paginile de curs (buton-email-curs-v1.md/.html): A Două drumuri (email plin pentru publicul de organizații + WhatsApp gol + adresa ca text, pentru că mailto nu merge fără program de email) / B panoul Contact. Aștept Alex; T-058 la Mike.
