# Manualul de brand BEMORE, v1: partea vizuală

Autor: Ioana. Data: 2026-11-17. Idee: I-022 (DRI Ioana, backup Maria). Status: v1, pentru aprobarea lui Alex.
Pagina de răsfoit, cu planșe: [manual-brand-v1.html](manual-brand-v1.html).
Poziționarea și arhitectura de brand (cine poartă ce brand, numele, rolurile, regula „un material, un brand”) sunt la Maria: [manual-brand-pozitionare-v1.md](../../maria/documente/manual-brand-pozitionare-v1.md), secțiunile 2 și 3. Aici nu se repetă. Tudor le unește într-un skill.

**Ce e decis (D-057, Alex, 2026-11-17):** „Designul Sora cu cele 2 tipuri de scris e noul branding bemore.” Paleta Sora, **Sora la titluri, Inter Tight la text**, Liquid Glass. Îl folosesc materialele BEMORE (workshop-uri, cursuri, ecranele din sală, D-055) și site-ul lui Alex, ca owner. Pe site diferă doar semnătura (numele lui Alex) și vocea (persoana întâi); regulile vizuale sunt aceleași.

Manualul spune regulile finale. Istoricul variantelor (v1, v2, v3) rămâne în documentele de lucru, nu aici.

---

## 1. Pe scurt: cinci reguli
1. **Lumină.** Fundal deschis peste tot. Culoarea stă în gradient și în obiecte, nu sub text.
2. **Sticlă peste culoare.** Textul stă mereu pe sticlă (80 % sau 93 %) sau pe o suprafață plină, niciodată direct pe gradient.
3. **Două fonturi, fiecare cu treaba lui:** Sora la titluri, Inter Tight la text. Ierarhia vine din mărime și din greutate subțire, nu din bold.
4. **Esență, nu elemente.** Simboluri, nu mobilier. Un obiect înseamnă o idee.
5. **Puține lucruri deodată.** Un lucru important pe ecran, legendă mare, multe drumuri la un click.

Testul pentru orice material: *ar putea face asta un template bun din 2024?* Dacă da, nu e destul. Contrastul AA, mișcarea redusă și viteza sunt limite, nu motive să faci ceva banal.

---

## 2. Culori

### Paleta
| Nume | Hex | Rol | Ca text? |
|---|---|---|---|
| Cerneală | `#14161F` | tot textul principal, butonul plin | da |
| Grafit | `#474A58` | textul secundar: explicații, date, etichete | da |
| Albastru Sora | `#2B44B8` | accentul: linkuri, etichete de sus, numere, focus, cuvântul evidențiat din titlu | da |
| Alb | `#FFFFFF` | sticla, suprafața de citit, textul de pe buton | – |
| Ceață | `#F3EEF6` | baza gradientului, fundalul paginilor interioare | – |
| Cer | `#4FA3F0` | gradient, obiecte | **nu** |
| Cer deschis | `#8FD3F7` | gradient, obiecte | **nu** |
| Lavandă | `#B7A6EA` | gradient, obiecte | **nu** |
| Piersică | `#F7B79A` | gradient, obiecte, panoul exercițiului (training) | **nu** |
| Portocaliu | `#F28C3B` | gradient, punctul-semn (cu inel `#C96A1E`) | **nu** |
| Alertă | `#A63D2A` | „blocat”, eroare, cronometru terminat | da (nou în v1) |

### Sage: doar în lecții
| Nume | Hex | Rol |
|---|---|---|
| Masă sage | `#E9EFE4` | fundalul „mesei de lucru” (exercițiul din lecție), pauza din sală |
| Sage | `#9DB08A` | decor: cercul care respiră, punctul din Live. Niciodată text (1,99) |
| Sage închis | `#4E6B45` | bifa ✓ la lecțiile parcurse, eticheta „Pe masa de lucru” |

- Sage înseamnă „ce faci tu” și „ce ai terminat”. Nu intră în gradient (lângă lavandă și piersică devine gri-murdar), nu intră pe prima pagină, nu intră în Compania mea.
- D-054 notează sage ca „de confirmat”. Până confirmă Alex, masa de lucru fără sage e `#EEF1FB`.

### Perechi permise
Contrastul e calculat cu formula WCAG 2.2, pe cel mai rău punct: sticla exact peste cea mai închisă sau cea mai deschisă culoare din gradient, fără blur.

| Text | Pe | Raport | Nivel | Folosește pentru |
|---|---|---|---|---|
| Cerneală `#14161F` | sticlă 80 % | 15,04 | AAA | orice text |
| Cerneală `#14161F` | sticlă 93 % | 16,94 | AAA | **textul lung** (lecții, articole) |
| Grafit `#474A58` | sticlă 80 % | 7,33 | AAA | text secundar |
| Albastru `#2B44B8` | sticlă 80 % | 6,68 | AA (AAA la text mare) | linkuri, etichete, titluri mari |
| Alb | buton Cerneală | 18,04 | AAA | butonul plin |
| Cerneală / Albastru / Grafit | Ceață `#F3EEF6` | 15,78 / 7,01 / 7,69 | AAA / AA / AAA | paginile pline |
| Sage închis `#4E6B45` | masă sage / sticlă | 5,10 / 4,98 | AA | etichete pe masa de lucru |
| Alertă `#A63D2A` | sticlă 80 % (cel mai rău) / Ceață | 5,29 / 5,53 | AA | stări de eroare, cu cuvânt |

- **Textul lung cere AAA (7 : 1):** doar Cerneală, pe sticlă 93 % sau pe alb.
- **Interzis ca text:** orice culoare din gradient (cer pe alb 2,68; lavandă 2,17; piersică 1,72; portocaliu 2,44), alb pe cer (2,68), sage `#9DB08A`.
- **Elementele care nu sunt text** (contur, semn, iconiță care poartă sens) au cel puțin 3 : 1. Inelul punctului `#C96A1E` dă 3,30 pe Ceață.
- **Culoarea nu poartă singură sensul.** O stare are mereu și formă sau cuvânt (romb pentru oameni, „blocat” scris).

---

## 3. Gradientul mesh granulat
Gradientul e semnătura: culori mari care se topesc, cu o granulație fină, ca o fotografie pe film.

**Cum se face**
- Baza `#F3EEF6` și cinci pete `radial-gradient`, fiecare de la culoare plină la transparent la 70 %:
  - cer `#4FA3F0`, 60 % × 70 %, în stânga sus (4 % 6 %);
  - cer deschis `#8FD3F7`, 50 % × 55 %, sus (70 % 0 %);
  - lavandă `#B7A6EA`, 55 % × 60 %, jos în stânga (32 % 80 %);
  - piersică `#F7B79A`, 50 % × 60 %, în dreapta (86 % 56 %);
  - portocaliu `#F28C3B`, 48 % × 58 %, în colțul din dreapta jos (100 % 100 %), până la 72 %.
- Ordinea pe roată e mereu aceeași: **rece sus și în stânga, cald jos și în dreapta.** Lumina vine dintr-o parte, ca într-un atelier.
- **Granulația:** o imagine de zgomot în tonuri de gri, 128 × 128 px (4–6 KB), repetată, cu `mix-blend-mode: overlay` la opacitate 0,38, pe un singur strat fix. Rezerva, unde blend-ul costă: aceeași imagine la opacitate 0,06, fără blend. Nu `feTurbulence` live pe site.

**Prima pagină (varianta liniștită, D-054 „Sticlă colorată”)**
- Fundal `#F6F4FA`, cu culoare doar în colțuri: cer 30 % în stânga sus, lavandă 30 % în stânga jos, portocaliu 24 % în dreapta jos.
- Culoarea plină trece în obiecte (vezi 7).

**Unde se folosește:** fundalul paginilor de pe site, fundalul scenei, cercul care respiră, coperta unui material (ca bandă sau colț, fără text pe ea), câmpul mesajului cheie pe proiector (fără granulație).
**Unde nu:** sub text, în interiorul suprafeței de citit, pe butoane, peste fotografii, pe hârtie (doar o bandă subțire), în grafice cu date, pe sticlă peste sticlă.

---

## 4. Tipografie
Două fonturi, ambele cu licență liberă (SIL Open Font License) și cu ș și ț cu virgulă:
- **Sora** pentru **titluri și cifre mari**: titluri, inițiale, mesajul de final, ideea de reținut, cronometrele, semnătura. Inscripția misiunii (22 px) e sub 26 px, deci intră în Inter Tight. Greutăți: 200 și 300 (400 doar la semnătură).
- **Inter Tight** pentru **tot ce citești și apeși**: text, introducere, liste, legendă, meniu, butoane, linkuri, etichete. Greutăți: 300, 400, 500.

Pe site se găzduiesc local; pe proiector se includ local (vezi 9). Sora nu are italic: titlurile sunt mereu drepte. Italicul din Inter Tight doar pentru citate în text.

| Rol | Font | Desktop | Telefon | Greutate | Rând | Spațiere |
|---|---|---|---|---|---|---|
| Titlul primei pagini | Sora | 56 px | 32–34 px | 200 | 1,06 | −0,035 em |
| Titlul unei pagini | Sora | 68 px (58 la 1280) | 36 px | 200 | 1,04 | −0,03 em |
| Inițiala mare (Compania mea) | Sora | 112 px | 72 px | 200 | 0,9 | −0,04 em |
| Mesajul de final | Sora | 48 px | 30 px | 200 | 1,08 | −0,025 em |
| „Dacă reții un singur lucru” | Sora | 40 px | 28 px | 200 | 1,15 | −0,025 em |
| Titlu de card | Sora | 34 px | 28 px | 300 | 1,05 | −0,02 em |
| Subtitlu în lecție | Sora | 32 px | 26 px | 300 | 1,15 | −0,02 em |
| Semnătura | Sora | 16 px | 16 px | 400, MAJUSCULE | – | +0,14 em |
| Introducere (lead) | Inter Tight | 20 px | 17 px | 400, Grafit | 1,5 | – |
| Legenda și meniul cu drumuri | Inter Tight | 20 px | 18 px | 400 | 1,3 | – |
| **Textul lecției** | Inter Tight | 20 px | 17 px | 400 | 1,7 | max. 62 ch (cam 66 de caractere) |
| Text obișnuit | Inter Tight | 17 px | 17 px | 400 | 1,5 | – |
| Buton | Inter Tight | 16 px | 16 px | 500 | – | – |
| Link | Inter Tight | 16 px | 16 px | 400, Albastru, linie 1 px dedesubt | – | – |
| Eticheta de sus (eyebrow) | Inter Tight | 13 px | 13 px | 500, Albastru, MAJUSCULE | – | +0,16 em |
| Legendă mică (caption) | Inter Tight | 12 px | 12 px | 500, Grafit, MAJUSCULE | – | +0,16 em |

- **Sub 16 px doar etichete** (majuscule spațiate) și text de subsol care nu se apasă. **Tot ce se apasă are cel puțin 16 px.** Alex observă scrisul mic.
- **Sora nu coboară sub 26 px** (în afară de semnătură). Sub 26 px scrii cu Inter Tight.
- Titlurile: `text-wrap: balance`, niciodată bold. Cuvântul evidențiat dintr-un titlu ia culoarea Albastru, nu greutate.
- Cifrele în coloane: `font-variant-numeric: tabular-nums`.

---

## 5. Materialul: Liquid Glass
Sticla e finisajul, nu fundația. Stă pe straturile de navigare și pe carduri; conținutul lung stă pe sticlă aproape plină.

| | Sticlă (navigare, carduri, legendă) | Sticlă de citit (lecții, text lung) |
|---|---|---|
| Fond | alb la **80 %** | alb la **93 %** |
| Blur | `blur(28px) saturate(150%)`; pe telefon `blur(16px)` | la fel |
| Margine | 1 px, alb la 60 % | la fel |
| Lumina marginii | `inset 0 1px 0` alb 80 %, `inset 0 -1px 0` alb 20 % | la fel |
| Umbră | `0 24px 60px -30px rgba(43,47,85,.45)` | la fel |
| Colțuri | 28 px (24 px pe telefon) | la fel |

- **Capsule** (meniul de sus, butoanele, inscripția): colțuri complete (999 px). Elementul curent din meniu: alb 55 % cu inel interior alb 90 %.
- **Rezerva fără transparență** (obligatorie):
  - browser fără `backdrop-filter`: sticla 94 %, sticla de citit 100 %;
  - `prefers-reduced-transparency: reduce`: sticlă plină, fără blur;
  - contrastul e calculat fără blur, deci textul trece AA și în Safari, care nu are încă media query-ul.
- Mereu ambele proprietăți: `-webkit-backdrop-filter` și `backdrop-filter`.
- **Cel mult 3 panouri de sticlă vizibile deodată pe telefon.** Fără sticlă în sticlă.
- **Nu pe proiector și nu pe hârtie.** Acolo sticla devine suprafață plină.

---

## 6. Spațiu și aerisire
**Aerisit înseamnă mai puține lucruri vizibile deodată, nu mai puține drumuri.** Compactul și interactivitatea rămân.

- **Cel mult 5–6 grupuri vizibile pe un ecran.** Ce nu e esențial se ascunde până la hover, Tab sau atingere (etichetele obiectelor), nu se șterge.
- **Un singur buton plin pe ecran.** Restul acțiunilor sunt linkuri cu linie dedesubt.
- **Legenda e mare:** 20 px pe desktop, 18 px pe telefon, pe două coloane când sunt multe drumuri. Pe telefon: 3 drumuri directe și „Toate cele 8 drumuri”.
- **Marginile paginii:** 40 px pe desktop, 32 px la 1280, 16 px pe telefon. Între panouri: 28 px (14–16 px pe telefon).
- **Interiorul panourilor:** 72 px la capul de pagină, 64 × 80 px la lecție, 34 × 32 px la card; pe telefon 22–24 px.
- **Ritmul vertical:** pași de 8 px; între secțiuni mari 64–72 px.
- **Rândul de text:** cel mult 62 de caractere.
- **Aliniere la stânga.** Centrat doar mesajul cheie și pauza.

---

## 7. Forme, simboluri, mișcare

### Obiectele-simbol
- Scena e un **atelier de invenții**: obiecte geometrice simple (discuri, elipse stivuite, cupole) care stau pentru o idee, ca într-o planșă tehnică. Fiecare drum din site are obiectul lui, cu număr de reper.
- **Esență, nu elemente** (Alex): luăm lumina laterală, ordinea, spațiul și un singur lucru important dintr-un atelier, un showroom sau o bibliotecă, nu mesele, rafturile sau plantele lor.
- Fiecare obiect are **gradientul lui** (două culori, diagonal, 92 %), contur alb 1,3 px și umbră colorată `rgba(43,68,184,.22)`:
  - Live: cer deschis → cer; My Journey: piersică → portocaliu; Knowledge Base: lavandă → cer deschis; coaching: piersică → lavandă; Latest Workshops: cer deschis → lavandă; Compania mea: cer → lavandă; Innovations (centrul): cer deschis → lavandă; **Despre mine: cer → piersică** (2026-11-17).
- **Obiectele se văd imediat peste fundal:** contur, culoare proprie, umbră. E prima verificare a oricărei scene.

### Despre mine: lentila (2026-11-17)
Obiectul nou pentru al treilea drum vizibil (D-056). Mostra 2D, cu hover: [poza-forme-v1.html](poza-forme-v1.html), secțiunea „Obiectul pentru Despre mine”.

- **Ideea, pentru echipă (nu se scrie pe site):** o lentilă e felul în care vezi din altă perspectivă. Punctul portocaliu din centru e semnătura lui Alex, același ca lângă nume, în meniu. E singurul obiect vertical din scenă și singurul care poartă punctul.
- **Forma:** un disc biconvex de sticlă (o sferă turtită), ținut vertical și întors pe jumătate spre dreapta. Pe margine, o ramă albă subțire. În centru, un punct portocaliu cu inelul lui.
- **Gradientul:** cer `#4FA3F0` → piersică `#F7B79A`, diagonal, 92 %, ca toate obiectele. Înlocuiește cer → lavandă, care e al Companiei mele (în `content/tema.yml`: `obj-despre: [cer, piersica]`).
- **Proporțiile față de celelalte** (W = lățimea elipsei Coaching):
  | Obiect | Lățime | Înălțime |
  |---|---|---|
  | Coaching (elipsa cu inel) | 1 W | 0,54 W |
  | Latest Workshops (cupola) | 0,81 W | 0,41 W |
  | **Despre mine (lentila)** | 0,65 W (diametrul; văzută întoarsă, cam 0,5 W) | 0,65 W |
  - Masa vizuală a lentilei e cât a cupolei. Coaching rămâne cel mai mare obiect.
- **În 3D (Three.js), pentru Mike.** D = diametrul lentilei = 0,65 W:
  - **Corpul:** `SphereGeometry(D/2, seg(48), seg(24))` cu `scale.set(1, 1, 0.3)`. Grosimea e 0,3 D. Materialul de sticlă al celorlalte obiecte, `pair('despre')`.
  - **Rama:** `TorusGeometry(D/2, D × 0.018, 10, seg(96))` în planul discului, culoarea `edge` (alb), `roughness 0.3`.
  - **Punctul:** `SphereGeometry(D/16, 24, 12)`, culoarea `punct` (`#F28C3B`), `emissive` piersică la 0,35 (ca cristalul din centru). În repaus stă chiar sub suprafața din față (`z = 0.1 D`), ca să se vadă prin sticlă.
  - **Orientarea în repaus:** `rotation.y = -0.6` (cam 34°, întoarsă spre dreapta), `rotation.x = 0.08`.
  - **Mișcarea:** plutește ca celelalte (7 px, 14 s). Nu se rotește complet: se leagănă pe `y` cu ±0,15 rad, în 14 s, `ease-in-out`.
  - **Hover și focus:** în 0,45 s, `cubic-bezier(.2,.7,.2,1)`, lentila se întoarce cu fața spre vizitator (`rotation.y → 0`), iar punctul iese în fața suprafeței (`z → 0.18 D`) și crește de 1,5 ori. Rama se îngroașă ca la celelalte obiecte.
  - **`prefers-reduced-motion`:** lentila stă întoarsă pe jumătate, cu punctul deja în față, mărimea 1. Fără legănare.
- **În 2D** (desenul fără WebGL din `build.mjs`, coordonate centrate):
  `<ellipse class="s" cx="8" rx="34" ry="46" opacity=".55"/><ellipse class="s" rx="34" ry="46"/><ellipse class="f" rx="27.5" ry="39"/><circle class="m" r="6"/>`
  Prima elipsă e marginea discului, văzută din lateral.
- Numerele de reper stau în discuri de sticlă (Inter Tight 16 px, 500, Albastru). Etichetele sunt HTML, nu text desenat, ca să se citească și să se ajungă la ele cu Tab.

### Iconițe și semne
- **Punctul** (portocaliu `#F28C3B`, inel `#C96A1E`, 8 px) e singurul semn recurent: semnătura, centrul invenției, ideea de reținut.
- Iconițele, unde trebuie: linie de 1,5 px, colțuri rotunjite, o singură culoare (Cerneală sau Albastru), pe grila de 24 px. Fără iconițe în cercuri colorate, fără emoji.
- Semnele felurilor de ecran din sală: ■ teorie, ▶ exercițiu, ● reflecție, ▬ mesaj cheie, ‖ pauză.

### Mișcarea
| Ce | Cum |
|---|---|
| Plutire | obiectele urcă 7 px și coboară, în 10, 12 și 14 s (decalate), `ease-in-out` |
| Hover și focus | obiectul crește de la 1,15 la 1,28 în 0,45 s, `cubic-bezier(.2,.7,.2,1)`, conturul se îngroașă; rândul din legendă se aprinde odată cu obiectul |
| Orbite | două lumini mici pe elipse, 24 s și 38 s pe tur |
| Desfacerea inovației | straturile se depărtează în 0,8 s, etichetele apar după 0,25 s |
| Respirația | cercul din lecție: 4 s inspiri, 4 s expiri |
| Live | punctul pulsează lent, 3,2 s |

- Nimic nu clipește, nimic nu sare. Mișcarea e lentă și continuă.
- `prefers-reduced-motion: reduce`: obiectele stau, orbitele stau, tranzițiile devin instantanee. Toată informația rămâne.

---

## 8. Fotografie
- **Poza de acum:** `site/static/alex.jpg` (900 × 1200, 3 : 4): Alex zâmbind, pe o alee cu copaci de toamnă, lumină naturală, fundal estompat. Folosește-o până aprobă Alex altele.
- **Încadrare:** 3 : 4 pe desktop, 4 : 5 pe telefon, colțuri 28 px (ca sticla). Avatar rotund doar sub 64 px, tăiat deasupra textului de pe tricou.
- **Poza stă pe o suprafață plină sau pe sticlă de citit**, nu peste gradient. Fără text, gradient sau sticlă peste față.
- **Fără filtre:** fără duotone, fără alb-negru, fără „grading”. Doar expunere și decupaj.
- **Ce fel de poze se potrivesc:** reale, cu lumină naturală, la nivelul ochilor; Alex lucrând (la tablă, în sală, construind, explicând), spații luminoase, mâini și unelte. Ce se potrivește cu paleta: cer, lumină caldă de după-amiază, alb.
- **Ce nu:** poze de stoc, oameni inventați sau generați, poze în care apar clienți sau participanți fără acordul lor (Maria, secțiunea 4).

---

## 9. Materialele de training
Toate materialele BEMORE, începând cu workshop-urile din 23 și 25 noiembrie (D-055), și cursurile lui Alex. Ce brand poartă un material decide regula Mariei (secțiunea 3); când clientul vine prin Innersis, materialul e Innersis, nu BEMORE.

### Pe proiector: patru feluri de ecran și pauza
Pornesc din `slide-tipuri-v1.md`: cinci semnale deodată (fond, semn, așezare, mărimea textului, element recurent), ca felul să se recunoască și fără culoare.
**Fără sticlă și fără granulație** pe proiector: nu adaugă nimic și scad contrastul. Gradientul apare o singură dată, pe mesajul cheie.

| Felul | Fond | Text | Accent / semn | Așezare și element recurent |
|---|---|---|---|---|
| ■ **Teorie** | Ceață `#F3EEF6` | Cerneală (15,78) | Albastru `#2B44B8` (7,01); linie `#DCD6E6` | pagină de sus, aliniată la stânga; linie fină sub etichetă |
| ▶ **Exercițiu** | Alb `#FFFFFF` | Cerneală (18,04) | Albastru (8,01); semnul ▶ `#C96A1E` (3,77, grafic); panoul **piersică** `#F7B79A` pe o treime, cu Cerneală (10,47) | pașii 01, 02, 03 la stânga, **cronometrul mare în panou** (Sora 124 px: Sora e mai lată, 150 px nu încape în panoul de 440 px) |
| ● **Reflecție** | Noapte `#0D1333` | `#F5F3FF` (16,53) | `#A9C4FF` (10,39); cercul-semn portocaliu `#F28C3B` (7,42); cerc larg `#A9C4FF` la 26 % | stânga, rar; cerc mare tăiat de marginea din dreapta |
| ▬ **Mesaj cheie** | câmp de gradient: cer deschis `#8FD3F7` → cer `#4FA3F0` → lavandă `#B7A6EA`, diagonal, fără granulație (rezervă: cer plin `#4FA3F0`) | Cerneală (6,72 în cel mai rău punct) | linie groasă Cerneală deasupra ideii | totul în centru, Sora 92 px, 200 |
| ‖ **Pauză** | Masă sage `#E9EFE4` | Cerneală (15,40) | Sage închis `#4E6B45` (5,10) | totul în centru, cronometrul de 230 px |

- **Starea „gata” a cronometrului:** Alertă `#A63D2A` pe teorie (5,53) și pauză (5,40); `#7A2E0E` pe panoul piersică (5,48); `#FF9C7A` pe noapte (8,88); pe mesaj cheie rămâne Cerneală și apare cuvântul „Gata”.
- **Ecranul trainerului** (`--t-*`): fundal `#F6F4FA`, suprafață alb, text Cerneală, șters Grafit (8,06), linie `#E4E0EA`, accent Albastru, pe accent alb, notă `#FDF1EB` cu linie portocalie, rândul de acum `#EEF1FB`.
- **Fonturile:** Sora (titluri, cronometre) și Inter Tight (pași, liste, etichete), incluse local ca `woff2`, cu licența OFL lângă; rezerva: „Helvetica Neue”, `-apple-system`, `system-ui`. Ecranele merg fără internet.
- **Greutăți pe proiector:** Sora 200 doar de la 48 px în sus; sub 48 px, Sora 300 sau Inter Tight 400 (liniile subțiri se spală pe proiector). Eticheta: Inter Tight 500, majuscule, +0,16 em, la 26 px pe un ecran de 1600 px.
- Luminozitățile celor cinci fonduri sunt diferite (deschis, alb cu panou, foarte închis, mediu, deschis-verzui), iar așezările diferă. Pe un proiector spălat, felul se recunoaște după siluetă și semn.

### Pe hârtie (fișe, scheme, grile de observație)
- **A4, fond alb**, margini 18 mm. Fără sticlă, fără granulație, fără fond colorat pe toată pagina.
- Gradientul doar ca **bandă de 6 mm** sus, fără text pe ea (sau deloc, la tipar alb-negru).
- **Litera:** titlu Sora 28 pt 300; subtitlu Sora 16 pt 300; text Inter Tight 11 pt 400, rând 1,5; etichete Inter Tight 8 pt 500, majuscule, +0,14 em, în Albastru; numărul paginii Inter Tight 9 pt Grafit. Sora 200 nu se tipărește sub 36 pt.
- **Liniile de scris:** 0,5 pt, `#C9C4D4`, la 9 mm.
- Semnul felului (■ ▶ ● ▬) în colțul din dreapta sus, ca pe ecran, ca fișa să se lege de momentul din sală.
- Verifică o dată tiparul alb-negru: tot ce poartă sens are formă sau cuvânt, nu doar culoare.

### Pe social (pentru Sofia)
- Fondul e gradientul, textul stă pe un card de sticlă plină (pe imagine nu există blur, deci sticla e 93 % sau plină). Un singur mesaj pe imagine, Sora 200 mare, eticheta Inter Tight în Albastru.

---

## 10. Ce facem / ce nu facem
| Facem | Nu facem |
|---|---|
| Textul pe sticlă 80 % sau 93 % | Text direct pe gradient, oricât de mare |
| Culoarea plină în obiecte, fundal liniștit | Obiecte albe translucide peste gradient puternic (se pierd) |
| Un simbol geometric pentru o idee | Mobilier, plante, lămpi desenate „ca să arate a atelier” |
| Sora la titluri (subțire, mare), Inter Tight la text | Bold în titluri, Sora la text mic, un al treilea font, italic simulat în Sora |
| Albastru Sora pentru cuvântul evidențiat | Culori din gradient ca text |
| Un buton plin pe ecran | Trei butoane colorate unul lângă altul |
| Etichete ascunse până la hover sau Tab | Toate etichetele la vedere tot timpul |
| Legendă la 20 px | Liste de navigare la 14–15 px |
| Mișcare lentă, oprită de `reduced-motion` | Elemente care clipesc, sar sau derulează singure |
| Fotografia reală a lui Alex, colțuri 28 px | Poze de stoc, filtre, text peste față |
| Pe proiector: fonduri pline, cinci feluri | Sticlă și granulație pe proiector |
| Sage doar în lecții și în pauză | Sage în gradient sau pe prima pagină |
| Un brand pe un material | BEMORE amestecat cu Innersis sau cu vechiul BEMORE LS (Amalfi, citron) pe același slide |

---

## 11. Înainte să trimiți (lista de verificare)
1. Textul stă pe sticlă sau pe plin? Niciun cuvânt direct pe gradient.
2. Contrastul: AA pe tot textul, AAA pe textul lung? Ai calculat peste cel mai rău punct?
3. Ce se apasă are cel puțin 16 px? Sub 16 px sunt doar etichete?
4. Câte grupuri se văd deodată? Mai mult de 6 înseamnă că trebuie ascuns ceva.
5. Obiectele se văd imediat peste fundal?
6. Merge cu `reduced-motion`, cu „transparență redusă” și pe telefon la 375 px, fără derulare laterală?
7. Pe proiector: felul ecranului se recunoaște și fără culoare?

---

## 12. Unde stau valorile
- **Sursa unică a valorilor pentru site e `content/tema.yml`.** Mike o trece acum pe Sora (T-024). Manualul spune regulile; cine are nevoie de un cod exact pentru site îl citește din `tema.yml`.
- Până termină Mike T-024, valorile corecte sunt cele din acest manual (identice cu `design-v3.md`, D-054). După T-024, dacă un cod din manual diferă de `tema.yml`, câștigă `tema.yml`, iar eu actualizez manualul.
- **Ecranele de curs** au temele lor în `curs/tema/*.css` (aceiași tokeni `--fel-*` și `--t-*` în fiecare temă). Tema BEMORE e `curs/tema/bemore.css` (T-028, gata), cu valorile din secțiunea 9 și cu Sora și Inter Tight incluse în fișier; licențele OFL stau în `curs/tema/fonturi/`. Generatorul o alege singur pentru `brand: bemore`.
- Documentele de lucru, cu istoricul: `design-v2.md`, `design-v3.md`, `slide-tipuri-v1.md`.

---

## 13. Întrebări pentru Maria (și, prin ea, pentru Alex)
1. **Semnul BEMORE:** păstrăm vechiul logo BEMORE sau semnătura devine cuvântul BEMORE scris în Sora, cu punctul portocaliu (cum e acum „Alex · Atelier” pe site)? Propunerea mea: cuvântul în Sora, cu punctul. Decizia e a lui Alex (nivel 2).
2. **Semnătura pe site:** „Alex · Atelier” rămâne sau devine numele lui Alex? Regula ta (b) spune „numele lui, nu logo-ul BEMORE”.
3. **Vechiul `bemore-ls-ive`** (Amalfi, travertin, citron): îl retragem sau rămâne pentru clienții vechi BEMORE LS? De asta depinde dacă ecranele mai au nevoie de tema `bemore-ls`.

---

## Pentru Mike
- **Textul nu stă niciodată direct pe gradient**, nici pe prima pagină. Intro-ul, legenda și inscripția stau pe sticlă 80 %.
- **Rezerva sticlei e obligatorie:** `@supports not (backdrop-filter)` cu 94 % / 100 % și `prefers-reduced-transparency` cu sticlă plină. Ambele prefixe la `backdrop-filter`.
- **Granulația ca PNG mic repetat**, pe un singur strat fix, nu `feTurbulence` live și nu pe fiecare panou.
- **Blur 16 px pe telefon** și cel mult 3 panouri de sticlă vizibile deodată.
- **Marginea paginii pe telefon e 16 px.** În mock-ul v3.1 era 14 px; 16 e regula.
- **Ce se apasă are cel puțin 16 px**, inclusiv linkurile din subsol (textul subsolului poate fi 14 px doar dacă nu e link).
- **Două fonturi (D-057):** Sora doar la titluri și cifre mari (nu sub 26 px), Inter Tight la tot restul, inclusiv butoane, meniu, legendă și textul lecției (20 px, rând 1,7). Inscripția misiunii e în Inter Tight (e sub 26 px), dreaptă, fără italic.
- **Alerta are o culoare nouă:** `#A63D2A` (5,29 pe sticlă în cel mai rău punct), mereu cu cuvânt.
- **Etichetele scenei sunt HTML**, ca să se citească la 16+ px și să se ajungă la ele cu Tab.

---

## Surse
- Decizii: D-004 (sticla doar pe navigare și carduri), D-011 (sticla trece AA fără rezervă), D-054 (paleta Sora, Liquid Glass, prima pagină „Sticlă colorată”), D-055 (workshop-urile în noul branding BEMORE), D-057 (Sora e noul branding BEMORE, cu două fonturi), în `docs/decizii.md`.
- Documentele de lucru: `design-v2.md` (aerisirea, scrisul mic), `design-v3.md` (paleta, sticla, gradientul, contrastul), `slide-tipuri-v1.md` (cele patru feluri de ecran).
- WCAG 2.2, 1.4.3, 1.4.6 și 1.4.11 (contrast pentru text, sporit și pentru elemente care nu sunt text): https://www.w3.org/TR/WCAG22/#contrast-minimum, https://www.w3.org/TR/WCAG22/#contrast-enhanced, https://www.w3.org/TR/WCAG22/#non-text-contrast
- `backdrop-filter`: https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter
- `prefers-reduced-transparency`: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency
- `prefers-reduced-motion`: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- Sora (SIL OFL): https://fonts.google.com/specimen/Sora
- Inter Tight (SIL OFL): https://fonts.google.com/specimen/Inter+Tight
- Apple, Liquid Glass (materialul de referință): https://developer.apple.com/documentation/technologyoverviews/liquid-glass

## Istoric
| Dată | Versiune | Ce |
|---|---|---|
| 2026-11-17 | v1 | Prima versiune, din D-054, D-055, D-057 și din documentele de lucru v2, v3 și slide-tipuri v1. Manualul BEMORE; site-ul lui Alex îl folosește ca owner. |
| 2026-11-17 | v1.1 | Secțiunea 7: obiectul „Despre mine” (lentila), cu gradientul cer → piersică și specificația 3D. Secțiunea 8 se schimbă după ce Alex alege forma pozei (`poza-forme-v1.html`). |
