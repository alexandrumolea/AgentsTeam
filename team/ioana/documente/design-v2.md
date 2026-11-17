# Design v2: trei design-uri din paleta BEMORE LS Ive

Autor: Ioana. Data: 2026-11-17. Status: propunere, Alex alege (nivel 2).
Pagina de comparat: [design-v2.html](design-v2.html), cu designul, pagina (prima pagină, Compania mea, lecție), ecranul (desktop, telefon) și „Azi / Aerisit” pe prima pagină. Nimic din `site/` sau `content/` nu s-a schimbat.
Înlocuiește variantele din [culori-v1.md](culori-v1.md); diagnosticul și regulile de sens pentru statusuri de acolo rămân valabile.

## Jurnal
- **2026-11-17, v2.0:** trei design-uri (A Amalfi, B Planșa, C Lămâia).
- **2026-11-17, v2.1:** Alex: „Îmi place Planșa. Nu-mi place că e foarte mic scrisul din lista din stânga de pe desktop.” Ce s-a schimbat în pagină:
  - Legenda din B are acum 20 px (era 16), pe două coloane („De ce ai nevoie?” și „Intră în atelier”), ca să încapă fără să se lovească de titlu sau de scenă. Am verificat la 1440 × 900 și la 1280 × 800 (comutatorul „Laptop 1280” e nou).
  - Celelalte texte mici din B: „Live” 16 px (era 13), marca 16 px (era 12), eticheta legendei și a căsuței de titlu 13 px, inscripția 24 px, etichetele din scenă (19–22 px, ca să rămână peste 16 px și după ce scena se micșorează), numerele de reper 17–20 px.
  - Pe toate paginile, tot ce se apasă are acum cel puțin 16 px: meniul, „Site-ul X →”, „← Lecția 2”, cronometrul, butoanele comutatorului.
  - Pagina pornește acum pe B.
- **Regula, de acum (Alex observă scrisul mic):** sub 16 px doar etichete (litere mari spațiate, cum ar fi „LEGENDĂ” sau „COMPANIA MEA”), niciodată lucruri pe care dai click. Textul de citit are cel puțin 17 px, iar lecțiile 19–20 px.
- **Ce urmează:** Alex vrea un stil nou, propus de mine, care să i se potrivească. Întâi răspunde la două întrebări (le pune Tudor în chat), apoi fac propunerea.
- **2026-11-17, v2.2:** Alex a răspuns la cele două întrebări (citate mai jos). Am construit **D · Studio** în aceeași pagină, pe prima pagină, Compania mea și lecție, la 1440, 1280 și pe telefon. Pagina pornește pe D. B rămâne reper, A și C rămân doar ca istoric.

## D · Studio (v2.2)
*Un studio de arhitect, luminos, la ultimul etaj: lucrurile tale pe o masă lungă de stejar, orașul și muntele în fereastră.*

### Ce a spus Alex (2026-11-17)
1. „Îmi place ideea de atelier al unui artist. Dar îmi place mai schițat, că arată ca un atelier al unui arhitect de fapt. Îmi plac spațiile de birou foarte moderne și minimaliste. Ușor industriale, cu lemn și foarte luminoase. Un loc care îmi place este magazinul apple, sediul lor central. Dar îmi plac și plantele într-un loc. Și îmi place și un balcon în new york la ultimul etaj al unui bloc cu privire asupra orașului și îmi place și o priveliște de munte.”
2. „Să simtă că a întrat într-un spațiu de wellness al minții. Unde este pe mâini bune. Unde se simte inspirat de ceea ce vede în jur. Ca într-o bibliotecă foarte modernă, ca într-un showroom.”

### Cum am tradus fiecare reper
| Reper | Decizie |
|---|---|
| Atelier de arhitect, schițat | Totul e desenat cu linie de creion (grafit `#5E574B`). Liniile trec puțin de colțuri, liniile de construcție rămân la vedere. Nimic lucios, nimic randat. |
| Birou minimalist, ușor industrial, cu lemn | Pereți de travertin, masă și podea de stejar deschis, cadre subțiri ca de oțel. Lemnul e material, nu culoare de text. |
| Foarte luminos | Fundal deschis peste tot. Lumina din fereastră cade pe podea și „respiră” încet (9 s). |
| Apple Park, magazinul Apple | O fereastră uriașă și o singură masă lungă pe care stau lucrurile lui Alex, cu spațiu între ele, sub trei lumini suspendate. |
| Plante | O plantă desenată în colțul atelierului, una în panorama lecției și o crenguță lângă ideea de reținut. Verdele e doar linie. |
| Balcon în New York, ultimul etaj | În fereastră e orașul văzut de sus. Seara i se aprind ferestrele (citron). Lumina urmează ora vizitatorului: dimineață, zi, seară. |
| Priveliște de munte | Dincolo de oraș e linia munților. În lecții, panorama de munte e capul paginii; în Compania mea, orașul și muntele închid pagina. |
| Wellness al minții, „pe mâini bune” | Ritm lent, un singur pas pe ecran, fără nimic care clipește. Cronometrul din exercițiu respiră cu tine: 4 s inspiri, 4 s expiri. |
| Bibliotecă foarte modernă | Drumurile stau pe un raft de stejar, scrise la 20 px. Lecția are cuprinsul cursului lângă text, ca într-o sală de lectură. |
| Showroom | Compania mea e o galerie: fiecare business pe soclul lui, cu lumină de sus și inițiala mare, subțire (tiparul „big-letter” din deck-urile BEMORE). |

Ce am păstrat din Planșa: desenul în loc de efect, luminozitatea, aerul, liniile albastre ale obiectelor, legenda scrisă mare (acum raftul).

### Tokenii D
Baza e paleta BEMORE LS Ive de pe paginile deschise (`page-*` din tabelul de mai sus). În plus:

| Rol nou | Valoare | Ce colorează | Contrast |
|---|---|---|---|
| `sketch` | `#5E574B` | liniile de creion ale camerei (pereți, fereastră, lămpi) | 5,96 pe travertin (nu e text) |
| `oak` | `#C9A57A` | raftul, masa, scândurile, linia de sub cuprinsul lecției | 1,91: doar material, niciodată text sau singurul semn al unei stări |
| `oak-light` | `#EDE2CF` | blatul mesei și „masa de lucru” din lecție (fundal) | text `#2A2620` 11,73; secundar `#66604F` 4,89 |
| `oak-dark` | `#8C6A43` | muchiile lemnului | 4,11 (nu e text) |
| `plant` / `plant-light` | `#4F6B3D` / `#E3E8D8` | linia și umplutura frunzelor | 5,00 pe travertin, ar trece și ca text |
| `sky-*` | dimineață `#F6F2EA`→`#F7E3A6`; zi `#DCE5F3`→`#F6F2EA`; seară `#C8D2E8`→`#F2D49E` | cerul din fereastră | fără text pe cer |
| `city-light` | `#F1C436` | ferestrele aprinse seara | semn, nu text |

Regulă nouă: pe „masa de lucru” (`oak-light`) accentul de text devine Amalfi `#2E5AA7` (5,22), pentru că `#3E66A8` dă acolo doar 4,46.
Restul regulilor rămân: sub 16 px doar etichete; tot ce se apasă are cel puțin 16 px; raftul 20 px; textul lecției 20 px.

### Fezabilitatea D
- **Doar din `content/tema.yml`:** nimic din ce e nou. D cere rolurile `page-*` (ca B) și rolurile de mai sus (`sketch`, `oak*`, `plant*`, `sky-*`, `city-light`), adică încă o secțiune în `tema.yml`.
- **CSS (Mike):** pagini luminoase, un singur font, raftul (linia de stejar sub drumuri), galeria din Compania mea (4 coloane, 2 pe telefon), sala de lectură (cuprinsul cursului lângă text), masa de lucru, cronometrul care respiră. Cam 2 zile.
- **`scena.js`: refacere, nu recolorare.** Scena devine un interior desenat:
  - camera ca linii (`LineSegments`): colțul, podeaua cu scânduri, fereastra cu montanți, lămpile;
  - cerul ca un plan cu gradient care se schimbă după ora locală (sau după `prefers-color-scheme`, de discutat);
  - orașul și munții ca siluete plate (două planuri cu contur), la distanță, cu o mică paralaxă când tragi de scenă;
  - obiectele de azi (aceleași geometrii) stau pe masă, cu contur `EdgesGeometry` albastru și umplutură mată; fără sticlă și fără strălucire;
  - pata de soare pe podea: un plan transparent, cu opacitatea animată lent.
  Estimare: 3–4 zile, plus test pe telefon real. E mai ușor de randat decât sticla de azi (bine pentru telefoane vechi).
- **Varianta fără 3D:** desenul SVG din mostră e chiar fallback-ul. Se poate folosi direct și ca primă versiune, înainte de 3D.

### Riscuri D
- **„Trage de spațiu”** are sens doar dacă scena 3D se mișcă la tras. În desenul 2D nu se mișcă; dacă rămânem fără 3D, propoziția trebuie schimbată (o decide Alex).
- **Ora vizitatorului:** seara cerul e cald și orașul aprins. E frumos, dar cine intră seara vede altă pagină decât cine intră la prânz. Textul nu stă niciodată pe cer, deci contrastul nu se schimbă.
- **Lemnul și verdele** sunt în afara paletei BEMORE. Le-am ținut doar ca material (linii, blat), nu ca text sau accent, ca să nu concureze cu cornflower și citron.
- Mostrele sunt desen 2D; perspectiva reală și mișcarea se văd doar după `scena.js`.

## Cererea
Alex, 2026-11-17:
- „Am nevoie ca totul să fie mai aerisit și mai vreau să văd și câteva design-uri care să pornească de la BEMORE IVE ca și culori.”
- Mai devreme, în aceeași zi: site-ul e „foarte închis la culori” pentru un curs online; „Îmi place că este compact”; „Îmi place că este interactiv, dinamic.”

## Ce înseamnă „aerisit” fără să pierdem „compact”
Interpretarea lui Tudor e corectă și o păstrez:
- **Compact** = totul la îndemână, puțini pași, o singură scenă. Cele 8 camere rămân la un click distanță.
- **Aerisit** = mai puține lucruri vizibile deodată, mai mult spațiu între ele, mai puțin zgomot.

Pe prima pagină de azi sunt vizibile deodată 11 grupuri: marca, titlul, rândul „cine”, inscripția, propoziția „cum”, cardul „În lucru” (cu 5 elemente), ticker-ul Live, 7 etichete pe obiecte, titlul dock-ului, capsula dock-ului cu 8 butoane. În design-urile noi rămân 5–6.

| Ce | Azi | În v2 |
|---|---|---|
| Cardul „În lucru · Din atelier” | etichetă, titlu, text, buton | **scos**; rămâne „Desfă inovația” sub obiectul din centru |
| Ticker-ul Live | derulează în colț | **scos**; rămâne „● Live”, cu punctul care respiră |
| Etichetele obiectelor | 7, tot timpul | **ascunse** până la hover, Tab sau atingere; doar centrul are etichetă |
| Dock-ul | capsulă cu 8 butoane | **rărit**: text pe o linie fină, grupuri despărțite prin spațiu; pe telefon 3 drumuri + „Toate camerele” |
| Titlul | gros pe „vor să crească.” | **subțire**, cu accent de culoare în loc de bold |
| Fonturi | 4 (Unbounded, Onest, JetBrains Mono, Fraunces) | **1** (Inter Tight) |
| Scena, „Desfă inovația”, mișcarea | da | **da** |
| Introducerea aprobată, inscripția | da | **da**, cuvânt cu cuvânt (în C, propoziția „cum” e înlocuită de butonul „Alege un drum”; decizia e a lui Alex) |

## Cele trei design-uri

### A · Amalfi
*Atelierul e albastru, tot ce citești e piatră caldă.*
- **Prima pagină:** scena pe Amalfi `#2E5AA7`, accent citron (titlul „vor să crească.”, punctul, butonul). Dock-ul pe o linie fină, jos.
- **Paginile și lecțiile:** travertin `#EFEAE0`, cu o bandă Amalfi sus (meniul), ca legătură cu scena.
- **Citron:** doar accent, niciodată câmp.
- **Față de azi:** cel mai mic pas. Aceeași scenă, alt cer. E varianta B din culori-v1, refăcută pe paleta BEMORE.

### B · Planșa (prima pagină luminoasă)
*Atelierul ca desen tehnic pe hârtie caldă.*
- **Prima pagină:** travertin, obiectele desenate cu linie albastră (`#3E66A8`) pe o grilă fină, cu numere de reper ca într-o planșă. Lista drumurilor e **legenda** desenului: treci peste un rând și obiectul se aprinde. Inscripția misiunii stă în colț, ca titlul planșei.
- **Paginile și lecțiile:** travertin; Amalfi apare doar în blocul de teorie al lecției.
- **Citron:** un singur punct, semnătura (marca și centrul invenției).
- **Față de azi:** cel mai aerisit, cel mai luminos. Se leagă de ideea aprobată pe 2026-11-15: „un desen tehnic în explozie”.

### C · Lămâia (varianta curajoasă)
*Citronul te trece dintr-o cameră în alta.*
- **Prima pagină:** intrarea e un câmp citron cu „Învățarea ca sursă a binelui.” (1,9 s), care urcă și lasă scena pe Amalfi. Drumurile sunt ascunse sub un singur „● Alege un drum”. Când alegi o cameră, un câmp citron trece peste ecran cu numele ei și fraza ei, apoi se deschide pagina.
- **Paginile:** travertin; la final, mesajul cheie pe citron („Prima conversație e gratuită.”).
- **Lecțiile:** toate trei lumile, ca în deck-uri: ideea pe Amalfi, exercițiul pe travertin, „Dacă reții un singur lucru” pe citron.
- **Față de azi:** cel mai „wow” și cel mai apropiat de BEMORE LS.

## Paleta pe web: patru corecturi de contrast
Paleta e gândită pentru proiector, cu litere mari. Pe site, textul mic trebuie să treacă AA (4,5:1). Calculat cu formula WCAG 2.2:

| Culoare din deck | Pe | Raport | Pe web |
|---|---|---|---|
| Text secundar `#A9B8D6` | Amalfi `#2E5AA7` | 3,35 | **`#D2DBEE`**, 4,82 |
| Text secundar `#7A7264` | travertin `#EFEAE0` | 3,96 | **`#66604F`**, 5,23 |
| Cornflower `#5C88CD` ca text | travertin | 2,99 | **`#3E66A8`** (Cornflower Deep), 4,77; `#5C88CD` rămâne pentru linii și semne |
| Secundar pe citron `#7E7A4A` | citron `#F1C436` | 2,66 | **`#4F4A1E`**, 5,44 |

Care trec așa cum sunt:

| Pereche | Raport | Regulă |
|---|---|---|
| `#F4F1EA` pe Amalfi `#2E5AA7` | 5,94 | text principal pe scenă |
| Citron `#F1C436` pe Amalfi `#2E5AA7` | 4,05 | **doar text mare (de la 24 px) și semne**; text mic citron doar pe Amalfi soft `#27508F` (4,82) |
| Cornflower `#5C88CD` pe Amalfi | 1,87 | nu se folosește (și skill-ul spune la fel) |
| `#2A2620` pe travertin | 12,54 | text principal pe pagini |
| `#23406F` pe citron | 6,24 | tot textul de pe citron |
| `#F4F1EA` pe buton Amalfi | 5,94 | butonul principal pe pagini deschise |
| `#23406F` pe buton citron | 6,24 | butonul principal pe scenă |

Liniile fine (`#CFC7B6` pe travertin, alb la 26% pe Amalfi) sunt decor, nu poartă sens. Focusul: inel `#3E66A8` pe deschis, `#F4F1EA` pe Amalfi (5,94).

## Regulile (pentru toate trei)
1. **Fiecare lume are o treabă.** Amalfi = scena și teoria (ce absorbi). Travertin = tot ce citești și tot ce faci (exerciții, camere). Citron = intrarea, tranzițiile, mesajul cheie, rar.
2. **Un singur accent activ într-un loc**, ales după fundal: cornflower deep `#3E66A8` pe travertin, citron pe Amalfi, cerneală `#23406F` pe citron.
3. **Titluri mari și subțiri** (Inter Tight 200), niciodată bold. Ierarhia vine din mărime, nu din grosime.
4. **Zero ornament:** fără carduri, umbre, capsule, iconițe în cercuri, bare colorate. Structura vine din linii fine, aliniere la stânga și spațiu.
5. **Un singur semn:** punctul mic de citron (marca, centrul invenției, Live).
6. **Un singur buton plin pe ecran.** Restul acțiunilor sunt text cu linie dedesubt.
7. **Textul stă pe suprafețe pline.** Fără text peste sticlă (rămâne regula D-004, D-011).
8. **Culoarea nu poartă singură sensul** (statusurile din Live au formă și cuvânt, ca în culori-v1).
9. **Mișcarea respectă `prefers-reduced-motion`:** obiectele nu mai plutesc, intrarea din C devine o tăietură scurtă.

## Fontul
Propun **Inter Tight** pentru tot (200 pentru titluri, 400 pentru text, 500 pentru etichetele mici cu litere spațiate).
- Helvetica Neue din deck nu are licență liberă pentru web. Inter Tight e cea mai apropiată ca desen (neo-grotesc, strâns, cu greutăți subțiri bune), e gratuită (SIL OFL) și are ș și ț cu virgulă.
- Un font în loc de patru înseamnă pagini mai ușoare și o voce mai liniștită.
- Pe site, Mike îl găzduiește local, ca pe cele de azi (fără cereri către Google). În pagina de comparat vine de pe Google Fonts, cum cer regulile de artifact.
- Alternativa fără cost: **Onest** la 200–300, care e deja pe site. Mai rotund, mai puțin „Ive”, dar zero fișiere noi.

## Tokenii pentru `content/tema.yml`
Rolurile de azi rămân. Mai jos, valorile pe design. „nou” = rol care nu există azi și cere CSS (vezi Fezabilitatea).

### Scena și navigarea
| Rol | A · Amalfi | B · Planșa | C · Lămâia |
|---|---|---|---|
| `bg` | `#2E5AA7` | `#EFEAE0` | `#2E5AA7` |
| `bg-glow` | `#3A68B5` | `#F6F2EA` | `#3A68B5` |
| `surface` | `#27508F` | `#F6F2EA` | `#27508F` |
| `glass` | `surface / .96` | `surface / .96` | `surface / .96` |
| `line` | `#F4F1EA / .26` | `#CFC7B6` | `#F4F1EA / .26` |
| `text` | `#F4F1EA` | `#2A2620` | `#F4F1EA` |
| `muted` | `#D2DBEE` | `#66604F` | `#D2DBEE` |
| `accent` | `#F1C436` | `#3E66A8` | `#F1C436` |
| `on-accent` | `#23406F` | `#F4F1EA` | `#23406F` |
| `human` | `#F4F1EA` (cu romb) | `#2A2620` (cu romb) | `#F4F1EA` (cu romb) |
| `alert` | `#FFD6CE` (5,03) | `#A3361F` (5,64) | `#FFD6CE` |
| `pressed-bg` / `pressed-fg` | `#F4F1EA` / `#23406F` | `#2A2620` / `#F6F2EA` | `#F4F1EA` / `#23406F` |
| `pressed-muted` | `#4F6A99` | `#CFC7B6` | `#4F6A99` |
| `label-bg` | `#27508F` | `#F6F2EA` | `#27508F` |

Notă despre `human`: în culori-v1 oamenii erau citron. Aici citronul e deja accentul pe Amalfi, deci oamenii (și Alex) devin text plin cu romb, iar agenții rămân accentul. Așa nu se amestecă „om” cu „în lucru”.

### Paginile și lecțiile (nou, aceleași în toate trei)
| Rol nou | Valoare | Ce colorează |
|---|---|---|
| `page-bg` | `#EFEAE0` | fundalul paginilor interioare și al lecțiilor |
| `page-surface` | `#F6F2EA` | câmpul de scris, zonele de exercițiu |
| `page-text` / `page-muted` | `#2A2620` / `#66604F` | textul |
| `page-accent` | `#3E66A8` | eticheta de sus, linkuri, focus, progresul |
| `page-mark` | `#5C88CD` | liniuțele scurte de sub etichete (doar semn) |
| `page-line` | `#CFC7B6` | liniile fine |
| `page-btn` / `page-on-btn` | `#2E5AA7` / `#F4F1EA` | butonul principal |
| `theory-bg` / `theory-text` / `theory-muted` / `theory-accent` | `#27508F` / `#F4F1EA` / `#D2DBEE` / `#F1C436` | blocul de teorie (B, C) |
| `key-bg` / `key-text` / `key-muted` / `key-line` | `#F1C436` / `#23406F` / `#4F4A1E` / `#C9A21F` | mesajul cheie și tranzițiile (C) |
| `nav-bg` | A: `#2E5AA7`; B, C: `page-bg` | banda de sus a paginilor |

### My Journey
Hârtia caldă de azi se potrivește cu travertinul: `warm-bg: "#EFEAE0"`, `warm-text: "#2A2620"`, `warm-muted: "#66604F"`, `warm-accent: "#23406F"`, `warm-line: "#C9A21F"`, `warm-divider: warm-text / .16`, `warm-glow: "#F1C436"`. My Journey rămâne camera caldă prin material (piatra, hârtia), nu prin maro.

### Scena 3D (`scena:`)
- A și C: `sky: "#D2DBEE"`, `ground: "#1E3F78"`, `glow: accent`, `floor: "#F4F1EA"`, `grid-bg: "#27508F"`, `grid-edge: "#5A7FB8"`, `grid-line: "#3A68B5"`, `metal: "#23406F"`, `ring: "#F4F1EA"`, `ticks: "#F4F1EA"`, `core: "#F1C436"`, `core-emissive: "#C9A21F"`, `agent: accent`, `network: "#D2DBEE"`, `pulse: "#F1C436"`, `bridge: "#F4F1EA"`, `marker: "#F1C436"`. Nuanțele de sticlă (`glass-*`) trec spre alb-albastru: `#E6ECF7` pentru toate, în afară de `glass-innovations: "#FFF3C9"`.
- B: aceleași roluri, dar scena nu mai e din sticlă (vezi mai jos), deci contează doar `line` (`#3E66A8`), `marker` (`#F1C436`) și `grid-line` (`#CFC7B6`).

## Fezabilitatea

### Doar din `content/tema.yml` (fără cod)
- **A, culorile scenei și ale panourilor de peste ea:** toate rolurile din tabelul „Scena și navigarea” și din `scena:`. Prima pagină devine albastră cu accent citron.
- **My Journey** pe travertin, din rolurile `warm-*`.
- Atât. Restul cere CSS, pentru că azi paginile interioare folosesc aceleași culori ca scena (nu există roluri `page-*`).

### Cere CSS (Mike), dar nu layout nou
- **Rolurile `page-*`, `theory-*`, `key-*`** și folosirea lor pe paginile interioare, ca paginile să fie luminoase chiar dacă scena e albastră. E aceeași separare propusă în T-024. Estimare: o zi.
- **Fontul:** un singur font (Inter Tight, găzduit local), titluri la 200, fără bold. Se scot Unbounded, JetBrains Mono și Fraunces.
- **Spațierea:** margini laterale de 72 px pe desktop și 24 px pe telefon, titluri mai mari, distanțe mai mari între secțiuni, rânduri de text de maximum 62 de caractere.
- **Ce dispare:** cardul „În lucru”, ticker-ul, capsula dock-ului, umbrele, colțurile rotunjite ale panourilor.

### Cere layout sau comportament nou
- **Etichetele ascunse până la hover/focus/atingere** pe obiectele scenei (atenție la telefon: prima atingere arată eticheta, a doua intră).
- **Dock-ul rărit:** pe telefon 3 drumuri + „Toate camerele”, care se desface.
- **B:** legenda legată de obiecte (hover pe rând → obiectul se aprinde și invers).
- **C:** intrarea citron (o dată pe sesiune, nu la fiecare vizită) și tranziția citron între camere (View Transitions API unde există, altfel o animație simplă; cu mișcare redusă devine instantanee).

### Scena 3D pe fond Amalfi sau travertin
- **Pe Amalfi (A, C): ușor.** Fundalul e mediu, nu deschis, deci sticla cu `transmission` și sprite-urile cu `AdditiveBlending` se văd încă. Trebuie recolorate luminile și ceața (`fog` la `#2E5AA7`) și scăzută puțin strălucirea, altfel sticla devine lăptoasă pe albastru. Fără schimbări de geometrie. Risc: pe Amalfi contrastul obiectelor e mai mic decât pe negru; le dau contur alb fin (cum se vede în mostră).
- **Pe travertin (B): refacere de material.** Pe hârtie deschisă sticla `transmission` devine aproape invizibilă, iar `AdditiveBlending` dispare complet pe alb (adună lumină peste un fond deja luminos). Soluția pentru B: obiectele devin **desene cu linie** (`LineSegments` / `EdgesGeometry` din geometria de azi, linie `#3E66A8`), cu umplutură mată foarte deschisă și fără strălucire; luminițele agenților din Live devin puncte pline, nu halouri. E mai ieftin la randare decât sticla (bine pe telefoane), dar cere 2–3 zile de lucru în `scena.js` și un test pe telefon real.
- **Varianta fără 3D** (telefoane vechi): în toate trei, desenul 2D din mostră e chiar fallback-ul bun. Se poate refolosi.

## Riscuri și note
- **Contrastul citronului pe Amalfi (4,05)** e limita cea mai ușor de încălcat: orice etichetă mică în citron pe `#2E5AA7` pică AA. Regula: citron mic doar pe `#27508F`.
- **C poate obosi:** tranziția citron la fiecare cameră e frumoasă primele ori. O limitez la 1,1 s, se poate sări (click sau Esc) și intrarea apare o dată pe sesiune.
- **B schimbă cel mai mult** (scena nu mai e din sticlă). Cel mai luminos, dar cel mai scump și cel mai departe de „spațiu”.
- **Identitatea:** BEMORE e business-ul lui Alex, iar paleta lui pe site-ul personal leagă cele două. Regula din `vocea-alex` spune că site-ul personal prezintă business-urile, nu le copiază. Paleta BEMORE pe site e o decizie de brand (nivel 2), deci o semnalez Mariei și lui Alex.
- Textele din lecție și propozițiile despre business-uri sunt **exemple**, marcate în pagină.
- Scena din mostră e desenată 2D; proporțiile și culorile sunt cele reale, mișcarea 3D nu.

## Surse
- Paleta, cele trei lumi, regulile Ive: skill-ul lui Alex `bemore-ls-ive` (SKILL.md, 2026-11-17).
- WCAG 2.2, 1.4.3 Contrast (minim) și 1.4.11 Contrast fără text: https://www.w3.org/TR/WCAG22/#contrast-minimum și https://www.w3.org/TR/WCAG22/#non-text-contrast
- Formula luminanței relative: https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
- Inter Tight (SIL Open Font License): https://fonts.google.com/specimen/Inter+Tight
- View Transitions API (pentru tranzițiile din C): https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
- Three.js `EdgesGeometry` (pentru scena-desen din B): https://threejs.org/docs/#api/en/geometries/EdgesGeometry
- De ce lecțiile pe fundal deschis: sursele din [culori-v1.md](culori-v1.md).
