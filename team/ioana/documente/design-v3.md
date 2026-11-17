# Design v3: sticlă peste lumină

Autor: Ioana. Data: 2026-11-17. Status: propunere, Alex alege paleta (nivel 2).
Pagina de comparat: [design-v3.html](design-v3.html). Are comutatoare pentru paletă (4), pagină (prima pagină, Compania mea, lecție), ecran (Desktop 1440, Laptop 1280, Telefon), fontul titlurilor (Sora sau Inter Tight) și transparență (Sticlă sau Redusă, adică rezerva).
v2 rămâne neatinsă, ca istoric: [design-v2.md](design-v2.md). Nimic din `site/` sau `content/` nu s-a schimbat.

## Jurnal
- **2026-11-17, v3.0:** pornit din răspunsul lui Alex la D · Studio (v2.2).
- **2026-11-17, v3.1 (după D-054):** Alex: „Sora îmi place ca font, e mai modern. Îmi place paleta sora. Mă întreb dacă merge și un sage cumva pe undeva în ansamblu, dar poate că nu. Ce nu iese bine, este home page-ul. Elementele dinamice care îmi plac mult, nu sunt suficient de vizibil în acest gradient. Trebuie altă soluție pentru homepage.”
  - Paleta și fontul Sora sunt fixate. Celelalte trei palete au trecut jos, la „Istoric”.
  - Trei prime pagini noi de comutat, plus cea din v3 ca reper.
  - Comutator „Text: Sora peste tot / Sora + Inter Tight” și „Sage: fără / cu”.
  - Pagina pornește pe Sora, prima pagină 1 · Sticlă colorată.

## v3.1: ce am ales și de ce

### Prima pagină: trei soluții
Problema din v3: obiectele erau albe și translucide peste un gradient deschis, deci culoarea fundalului le ștergea conturul. Toate trei soluțiile de mai jos repară asta pe căi diferite. Toate trei au:
- obiectele cu 15 % mai mari;
- scena mutată mai sus, în centrul liber al ecranului;
- panourile de text doar în coloana din stânga, ca să nu acopere nimic;
- legenda la 20 px și „Desfă inovația”;
- mișcare vizibilă: obiectele plutesc, două lumini mici se rotesc pe orbite, iar la hover sau la Tab obiectul crește și se aprinde (și din legendă).

| | 1 · Sticlă colorată | 2 · Scenă luminoasă | 3 · Seară |
|---|---|---|---|
| Ideea | Gradientul trece din fundal în obiecte | Obiectele stau pe un câmp alb, ca pe o scenă | Doar prima pagină e noapte; obiectele au lumină proprie |
| Fundal | aproape uniform `#F6F4FA`, cu culoare doar în colțuri (24–30 %) | alb în centru, gradientul Sora doar pe margini | `#0D1333`, cu lumini Sora în spatele obiectelor (32–50 %) |
| Obiecte | fiecare cu gradientul lui Sora (cer → albastru, piersică → portocaliu, lavandă → cer), contur alb, umbră colorată | alb plin, contur `#2B44B8` (7,50 pe alb), umbră albastră moale | translucide, contur alb, aură albastră |
| Panouri | sticlă albă 80 % | sticlă albă 80 % | sticlă închisă `#121636` la 72 %, text `#F5F3FF` (11,88) |
| Cât se văd obiectele | foarte bine, și pe telefon | foarte bine, cel mai „precis” | cel mai bine; e momentul „wow” |
| Riscul | culoare multă dacă adăugăm obiecte | cel mai cuminte dintre cele trei | contrastul cu restul site-ului, luminos |
| Cost în `scena.js` | mediu | mic | cel mai mic (scena de azi e deja pe întuneric) |

**Recomand 1 · Sticlă colorată.** Păstrează site-ul luminos de la un capăt la altul, iar culorile Sora, care lui Alex îi plac, ajung exact pe lucrurile care se mișcă. **3 · Seară** e alternativa cu cel mai mare efect. Dacă Alex o vrea, poate fi și varianta de seară a lui 1 (după ora vizitatorului), cu același cod.

### Fontul: Sora peste tot
- Am măsurat: Sora la 19 px e cu 11 % mai lată decât Inter Tight la 20 px, deci un rând de lecție are 56–60 de caractere în loc de 66. E încă în zona bună de citit (45–75).
- Recomand **Sora peste tot**: titluri la 200, text la 300 și 400, lecția la 19 px cu rânduri la 1,75. Un singur font e mai simplu și pagina e mai ușoară.
- Rezerva: dacă lecțiile ajung lungi (peste 15 minute), doar paragrafele lecției trec pe Inter Tight. Comutatorul din pagină arată diferența.

### Sage: merge, dar doar în lecție
Răspunsul cinstit: **da în lecție, nu în gradient.**
- **În gradient nu.** Am încercat o pată sage `#B9C9A8` între lavandă și cer. Lângă lavandă și piersică devine gri-murdar și ia din luminozitatea paletei.
- **În lecție da.** Sage devine culoarea a ce faci tu și a ce ai terminat, adică wellness-ul minții:
  - masa de lucru pe `#E9EFE4`;
  - bifa ✓ la lecțiile parcurse și eticheta „Pe masa de lucru” în `#4E6B45` (5,10 pe masă, 4,98 pe sticlă);
  - cercul care respiră, în sage și cer;
  - punctul din „Live” (doar decor).
- Pe prima pagină și în Compania mea nu l-aș folosi: acolo nu adaugă sens.

### Tokenii finali (Sora)
| Rol | Valoare | Note |
|---|---|---|
| `mesh-baza` | `#F3EEF6` | paginile interioare |
| `mesh` | cer `#4FA3F0`, cer deschis `#8FD3F7`, lavandă `#B7A6EA`, piersică `#F7B79A`, portocaliu `#F28C3B` | poziții și mărimi ca în `design-v3.html` |
| `sticla` / alfa | `#FFFFFF` / 0,80 navigare și carduri, 0,93 unde citești | |
| `text` / `muted` | `#14161F` / `#474A58` | 15,04 / 7,33 în cel mai rău caz |
| `accent` / `accent-mare` | `#2B44B8` / `#2B44B8` | 6,68 |
| `buton` / `pe-buton` | `#14161F` / `#FFFFFF` | 18,04 |
| `punct` / `punct-inel` | `#F28C3B` / `#C96A1E` | doar semn |
| `masa` | `#EEF1FB` (fără sage) sau `#E9EFE4` (cu sage) | 15,98 / 15,40 |
| `sage`, `sage-ink` | `#9DB08A` (decor), `#4E6B45` (text) | doar în lecție |
| `home-1-fundal` | `#F6F4FA`, colțuri cer / lavandă / portocaliu la 24–30 % | |
| `home-1-obiecte` | perechi de gradient: live cer deschis → cer; journey piersică → portocaliu; knowledge lavandă → cer deschis; coaching piersică → lavandă; workshops cer deschis → lavandă; compania cer → lavandă; centrul cer deschis → lavandă | |
| `home-1-umbra` | `rgba(43,68,184,.22)` | |
| `home-2-contur` | `#2B44B8` | 7,50 pe alb; minim 3,68 pe marginea lavandă (prag 3 pentru elemente care nu sunt text) |
| `home-3-fundal` / `home-3-sticla` | `#0D1333` / `#121636` la 0,72 | |
| `home-3-text` / `muted` / `link` / `accent-mare` | `#F5F3FF` / `#C9CBE6` / `#A9C4FF` / `#FFB98A` | 11,88 / 8,17 / 7,46 / 7,79 |

Toate cele 72 de combinații din pagină (4 prime pagini × 3 pagini × 3 ecrane × cu și fără sage) au trecut verificarea: niciun prag ratat, fără derulare laterală la 375 px, fără erori.

### Impactul asupra `scena.js`
În toate trei, fundalul e CSS în spatele unui canvas WebGL transparent (`alpha: true`), iar etichetele (numere, „Desfă inovația”, straturile) sunt HTML peste canvas. Geometria obiectelor rămâne cea de azi.
- **1 · Sticlă colorată:**
  - fiecare obiect primește un material cu două culori care se amestecă pe înălțime (culori pe vârfuri sau o textură mică de gradient, 2 × 64 px), plus `clearcoat` pentru reflexia de sticlă și conturul alb din `EdgesGeometry`;
  - umbra colorată devine o textură moale sub fiecare obiect (umbră de contact), nu umbre în timp real;
  - estimare: 2–3 zile.
- **2 · Scenă luminoasă:**
  - material alb mat, contur `#2B44B8` și umbre de contact;
  - cea mai ieftină la randare;
  - estimare: 2 zile.
- **3 · Seară:**
  - scena de azi e deja pe întuneric, cu lumini aditive, deci se recolorează: fundal transparent peste `#0D1333`, aura obiectelor din sprite-urile existente (`AdditiveBlending` merge pe întuneric);
  - fără efect de strălucire pe tot ecranul (prea scump pe telefon);
  - estimare: 1–2 zile.
- **Orbitele:** cele două lumini care se rotesc sunt două puncte pe o elipsă, cost neglijabil. Cu mișcare redusă, stau pe loc.

## Cererea
Alex, 2026-11-17, despre D · Studio:
> „Îmi place varianta D, dar parcă ai luat-o prea literar să arate ca un atelier. Una e inspirat din esența unor ateliere și sowhroom-uri, alta e să pui elemente din ele.
> Also felul în care să se combine culorile mi-ar plăcea să fie ăsta atașat. Stil clar spre liquid glass ca design, poate puțin spre culorile din Sora. Îți mai atașez niște palete să vedem.
> Îmi place mai mult varianta elementelor metaforică din planșă.
> Îmi place mai mult cum e structurată informația în curs în Studio.
> vreau combinații culorile în continuare din Bemore IVe, dar combinate altfel. Și variantele noi pe care ți le-am dat, sora, apoi cele cu navy și roz, apoi cele cu verde și teal.”

Referințele lui (imagini primite în chat, nepublicate):
1. „Smooth abstract gradients”: un gradient fin și granulat, din negru-navy în albastru, apoi gheață și portocaliu-roșu. Așa vrea să se combine culorile.
2. Afișul fontului Sora: albastru cer → lavandă → piersică → portocaliu.
3. Navy și roz: Misty Rose `#FFE4E1`, Slate Gray `#708090`, Vivid Tangerine `#FFA089`, Cetacean Blue `#001440`.
4. Verde și teal: Spring Meadow `#CAFFA6`, Teal Waters `#204654`, Glacial Sky `#A9E0F1`, Morning Mist `#F7F9E1`.

## Ce am luat de unde
| De unde | Ce rămâne | Ce pleacă |
|---|---|---|
| B · Planșa | Cele 7 obiecte-simbol, numerele de reper, legenda scrisă mare (20 px), „Desfă inovația” | Grila de hârtie milimetrică, cerneala albastră pe hârtie |
| D · Studio | Structura lecției: cuprinsul cursului lângă text, sala de lectură, masa de lucru pentru exercițiu, respirația, ideea de reținut | Masa, raftul, lămpile, fereastra cu orașul, planta: tot ce era literal |
| Atelier, showroom, bibliotecă | Esența: lumină care vine dintr-o parte, mult spațiu, panouri aliniate, un singur lucru important pe ecran, ordine | Obiectele care le ilustrau |
| Imaginea 1 | Câmpuri mari de culoare care se topesc, cu granulație fină | Contrastul dur negru / portocaliu din colțuri, acolo unde stă text |
| Liquid Glass | Panouri de sticlă cu blur, transparență și margine luminoasă, pe toate straturile de navigare și pe carduri | Textul direct pe gradient (nu apare nicăieri) |

## Cum arată
- **Prima pagină:** gradientul ocupă tot ecranul. În stânga sunt două panouri de sticlă: sus intro-ul aprobat de Alex, jos legenda cu cele 8 drumuri pe două coloane, la 20 px. În dreapta stau obiectele din Planșa ca obiecte de sticlă, cu numere de reper în discuri de sticlă. Obiectul din centru se desface în straturi, iar etichetele straturilor stau pe pastile de sticlă. Inscripția misiunii e o capsulă de sticlă jos, în dreapta. Pe telefon: intro-ul sus, scena la mijloc, iar jos cele 3 drumuri directe și „Toate cele 8 drumuri”.
- **Compania mea:** bara de navigare e o capsulă de sticlă. Sub ea: un panou cu titlul, patru carduri de sticlă (inițiala mare și subțire, rolul, numele, propoziția lui Alex, linkul) și un panou de final cu „Prima conversație e gratuită.”
- **Lecția:** cuprinsul cursului stă pe un panou de sticlă în stânga, cu bară de progres. Textul stă pe o suprafață de citit aproape plină (93 %). Exercițiul e pe o „masă de lucru” plină, cu foaie liniată și un cerc de gradient care respiră (4 s inspiri, 4 s expiri). Ideea de reținut are punctul paletei alături.

## Cele 4 palete
Toate folosesc sticlă deschisă și text închis. Diferă gradientul și accentul.

| Paleta | Gradientul (de la colțul închis spre cel cald) | Sticla | Text / secundar | Accent text / titlu | Buton | Punct |
|---|---|---|---|---|---|---|
| **BEMORE LS Ive, topit** | Amalfi `#2E5AA7` și `#27508F` sus, cornflower `#5C88CD` la mijloc, travertin `#F6F2EA` jos, citron `#F1C436` în colțul de jos; baza `#EFEAE0` | `#F6F2EA` | `#2A2620` / `#5A5446` | `#23406F` / `#2E5AA7` | `#2E5AA7` cu `#F6F2EA` | citron |
| **Sora** | cer `#4FA3F0` și `#8FD3F7` sus, lavandă `#B7A6EA` jos, piersică `#F7B79A` în dreapta, portocaliu `#F28C3B` în colț; baza `#F3EEF6` | `#FFFFFF` | `#14161F` / `#474A58` | `#2B44B8` / `#2B44B8` | `#14161F` cu alb | portocaliu |
| **Navy și roz** | Cetacean Blue `#001440` (și `#1B2A55`) sus, Slate Gray `#708090` la mijloc, Misty Rose `#FFE4E1`, Vivid Tangerine `#FFA089` în colțul de jos; baza `#FFE4E1` | `#FFF4F2` | `#001440` / `#3F4858` | `#001440` / `#A8442A` | `#001440` cu `#FFE4E1` | mandarină |
| **Verde și teal** | Glacial Sky `#A9E0F1` sus și jos în stânga, Teal Waters `#204654` în colțul de sus, Morning Mist `#F7F9E1` la mijloc, Spring Meadow `#CAFFA6` jos; baza `#F7F9E1` | `#F7F9E1` | `#204654` / `#2F4A55` | `#204654` / `#2E7A5C` | `#204654` cu `#F7F9E1` | pajiște, cu inel teal |

Culori adăugate de mine, cu motivul:
- **BEMORE:** `#23406F` (cerneala Amalfi din skill) ca text de accent: `#2E5AA7` dă doar 4,38 peste cel mai închis punct al sticlei, iar ca text mic nu ajunge.
- **Navy și roz:** `#A8442A` e mandarina mai închisă, folosită doar la „vor să crească.” și la inițialele mari (text mare, prag 3 : 1, dă 3,59). Mandarina originală pe sticlă roz dă sub 2. `#3F4858` e ardezia mai închisă pentru textul secundar (`#708090` nu trece).
- **Verde și teal:** `#2E7A5C` e verde de pajiște pentru textul mare (3,43), pentru că Spring Meadow pe sticlă deschisă nu se vede. `#2F4A55` e textul secundar.

## Contrastul
Am calculat cazul cel mai rău: panoul de sticlă exact peste cea mai închisă sau cea mai deschisă culoare din gradient, fără blur (blur-ul doar ar media culorile). Formula e WCAG 2.2. Pagina recalculează tabelul live pentru paleta aleasă. Am verificat toate cele 36 de combinații (4 palete × 3 pagini × 3 ecrane): niciun prag ratat, iar la 375 px nu apare derulare laterală.

| Paleta | Text pe sticlă 80 % | Secundar 80 % | Accent 80 % | Textul lecției, 93 % | Buton |
|---|---|---|---|---|---|
| BEMORE | 9,85 | 4,93 | 6,76 | 12,12 (AAA) | 6,00 |
| Sora | 15,04 | 7,33 | 6,68 | 16,94 (AAA) | 18,04 |
| Navy și roz | 10,77 | 5,55 | 10,77 | 14,37 (AAA) | 14,85 |
| Verde și teal | 6,73 | 6,23 | 6,73 | 8,46 (AAA) | 9,49 |

Masa de lucru (plină): 11,91 / 15,98 / 14,95 / 9,06. Rezerva fără transparență (sticla plină): trece AAA peste tot.

Regulile, valabile în continuare:
- sub 16 px doar etichete; tot ce se apasă are cel puțin 16 px; legenda are 20 px; textul lecției 20 px;
- textul stă doar pe sticlă (80 % la navigare și carduri, 93 % unde citești) sau pe suprafețe pline;
- un singur accent activ, plus un punct al paletei.

## Fontul
Recomand **Sora la titluri** (ExtraLight 200, cu literele ușor strânse) și **Inter Tight la tot restul**.
- Sora e geometrică, rotundă și făcută pentru ecran. Se potrivește cu sticla și cu cercurile din scenă. La 200 e subțire, ca în stilul Ive. Are ș și ț cu virgulă (subsetul latin-ext).
- La text mărunt Sora e prea lată, iar lecțiile se citesc mai repede în Inter Tight.
- Două fonturi în loc de patru câte are site-ul azi. Ambele au licența SIL OFL, deci Mike le găzduiește local.
- În pagină poți compara cu „Titluri: Inter Tight”.

## Fezabilitatea

### Tokenii, în `content/tema.yml`
Propun o secțiune nouă, cu o paletă activă și patru definite (schimbi paleta dintr-un singur cuvânt):

```yaml
paleta: ive            # ive | sora | navy | teal
palete:
  ive:
    mesh-baza: "#EFEAE0"
    mesh:                # 5 pete: culoare, poziție (x% y%), mărime (lățime% înălțime%)
      - ["#2E5AA7", "6% 4%",   "62% 72%"]
      - ["#27508F", "100% 0%", "40% 50%"]
      - ["#5C88CD", "66% 32%", "52% 58%"]
      - ["#F6F2EA", "36% 78%", "55% 55%"]
      - ["#F1C436", "98% 98%", "52% 62%"]
    sticla: "#F6F2EA"    # sticla-alfa 0.80, suprafata-alfa 0.93 (comune tuturor)
    text: "#2A2620"
    muted: "#5A5446"
    accent: "#23406F"
    accent-mare: "#2E5AA7"
    buton: "#2E5AA7"
    pe-buton: "#F6F2EA"
    punct: "#F1C436"
    punct-inel: "#C9A21F"
    umbra: "#23406F"
    masa: "#ECE4D6"
  sora:  { ... }         # valorile din tabelul „Cele 4 palete”
  navy:  { ... }
  teal:  { ... }
```

`tema.mjs` ar transforma petele în `radial-gradient(...)` și ar verifica contrastul la build cu aceeași formulă ca pagina (textul peste fiecare culoare din gradient, la 80 % și 93 %). Dacă o paletă nouă nu trece, build-ul se oprește cu mesaj clar. Așa Alex poate încerca o paletă nouă fără să riște lizibilitatea.

### Granulația
- În mostră: un SVG `feTurbulence` de 160 × 160 px, ca `data:` URI repetat, peste gradient, cu `mix-blend-mode: overlay` și opacitate 0,38.
- **Pe site recomand o imagine mică repetată**, nu `feTurbulence` live: un PNG de 128 × 128 px în tonuri de gri (cam 4–6 KB), generat o dată la build. Motivele:
  - `feTurbulence` se rasterizează la fiecare repaint al stratului; pe telefoane slabe și la scroll costă;
  - PNG-ul e decodat o dată și pus în cache.
- Granulația stă pe un singur strat `position: fixed` (sau pe fundalul scenei), nu pe fiecare panou. `mix-blend-mode` pe un strat mare poate costa pe Android vechi; rezerva e o opacitate mică (0,06) fără blend.
- Gradientul în sine (5 `radial-gradient`) e ieftin: îl desenează browserul, fără imagini.

### Sticla (`backdrop-filter`)
- **Suport:** Chrome, Edge și Firefox (de la 103) îl au. Safari are nevoie și de `-webkit-backdrop-filter` (îl pun pe amândouă).
- **Cost:** blur-ul se recalculează când se mișcă ce e dedesubt. Peste un gradient static e ieftin. Peste scena 3D care se mișcă e scump, mai ales pe telefoane slabe. De aceea:
  - pe prima pagină, panourile stau peste zone în care scena se mișcă puțin, iar raza de blur e 28 px (nu 60+);
  - pe telefon propun blur 16 px și cel mult 3 panouri de sticlă vizibile deodată.
- **Rezerva** (vezi „Transparență: Redusă” în pagină):
  - `@supports not (backdrop-filter)`: sticla devine 94 % opacă, iar suprafața de citit 100 %;
  - `@media (prefers-reduced-transparency: reduce)`: sticla devine plină, fără blur. Safari nu suportă încă media query-ul (notat în memoria mea, `reference_browser-support-glass.md`), deci pentru utilizatorii lui contează pragul de 80 %, care trece AA oricum;
  - textul trece AA chiar și fără blur, pentru că am calculat fără el.

### Scena 3D
- Rămân obiectele din Planșa (aceleași geometrii din `scena.js`), dar materialul devine **sticlă mată**: `MeshPhysicalMaterial` cu `transmission` redus, `roughness` mare, margine luminoasă din `EdgesGeometry` (alb, sau teal în paleta verde), fără strălucire aditivă.
- Fundalul scenei nu mai e culoare plină: gradientul mesh e un `<div>` CSS **în spatele** canvas-ului WebGL transparent (`alpha: true`). Scena nu desenează cerul, deci costă mai puțin.
- Numerele de reper și pastilele („Desfă inovația”, straturile) devin HTML peste canvas, nu text 3D. Așa se citesc la 16+ px și se văd cu Tab.
- Estimare:
  - 2–3 zile în `scena.js` (material, fundal transparent, etichete HTML);
  - 2 zile CSS (sticla, paletele din `tema.yml`, lecția);
  - test pe telefon real, cu atenție la blur peste canvas.
- Fără 3D, desenul SVG din mostră e chiar fallback-ul.

## Riscuri
- **Prea multă sticlă obosește.** Am ținut-o pe navigare și pe carduri, iar textul lung pe o suprafață aproape plină. Dacă adăugăm panouri, scade calmul.
- **Blur peste scena 3D pe telefoane slabe:** de testat pe un Android de buget înainte de lansare (T-014, T-020).
- **Paleta navy și roz** are colțul cel mai închis exact sub intro. Trece AA (10,77), dar sticla arată mai gri acolo. Dacă Alex o alege, mut pata închisă spre dreapta.
- **Patru palete e mult pentru un site:** propun ca Alex să aleagă una (sau două: una pentru atelier, una pentru cursuri), nu un comutator public.
- **Identitatea:** paleta BEMORE pe site-ul personal e decizie de brand (T-025, Maria).

## Surse
- WCAG 2.2, 1.4.3 și 1.4.6 (contrast minim și sporit): https://www.w3.org/TR/WCAG22/#contrast-minimum, https://www.w3.org/TR/WCAG22/#contrast-enhanced
- `backdrop-filter`, suport: https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter
- `prefers-reduced-transparency`: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency
- `feTurbulence`: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence
- Sora (SIL OFL): https://fonts.google.com/specimen/Sora
- Inter Tight (SIL OFL): https://fonts.google.com/specimen/Inter+Tight
- Paleta BEMORE LS Ive: skill-ul lui Alex `bemore-ls-ive`.
