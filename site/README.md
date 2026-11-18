# Site-ul (alexandrumolea.com)

Build static, fără framework: `build.mjs` citește `content/`, `docs/taskuri.md` și istoricul git și scrie site-ul în `site/dist`.

```
cd site
npm ci            # o singură dată
npm run build     # construiește site/dist
npm run serve     # http://localhost:4321/
```

Conținutul (texte, categorii, business-uri) se schimbă în `content/`, nu aici.

## Cum faci o secțiune vizibilă

`vizibil: true` în `content/categorii.yml`. O singură linie de schimbat (D-056).
O secțiune cu `vizibil: false` nu apare nicăieri: meniu, legendă, scena 3D, pagină, sitemap, `api/continut.json`, linkurile din alte pagini. Adresa ei duce la prima pagină. Cât timp Live e ascuns, nici luminițele echipei și nici `api/live.json` nu se publică; `live/echipa/` rămâne generată, nelegată din meniu.
Scena se adaptează singură: cu cel mult 3 obiecte, orbita se strânge și obiectele cresc. „Desfă inovația” (obiectul din centru, `in_centru` din `content/site.yml`) apare doar când Innovations e vizibil; altfel, în centru stă punctul paletei.

## Pagina Despre

**Un singur loc: `content/despre.md`** (compoziția v2 a Ioanei, varianta A „Orbita în jurul lentilei”, aprobată pe 2026-11-18; mostra: `team/ioana/documente/despre-compozitie-v2.html?solo=a`).
- Corpul: prima propoziție, apoi `## Misiunea mea` cu citatul (titlul în bold, apoi textul).
- Antetul: `rol` (eticheta de sus), `acum` (pe primul card), `poza` + `poza_alt` (în lentila din centrul orbitei), `valori` (cele trei cărți), `parcurs.roluri` (rol, organizatie, de_la, pana_la sau „prezent”, descriere, `scurt` = numele de pe orbită) și `formare.lista` (titlu, unde).
- Din roluri, `site/orbita.mjs` face la build orbita din primul card (un punct pe anul de început, unghiurile și culorile calculate din ani, rolurile din același an pe un punct cu inel dublu, etichetele depărtate ca să nu se suprapună) și lista parcursului, cel mai nou rol primul.
- Un rol fără `de_la`, un an greșit sau un rol care se termină înainte să înceapă opresc build-ul, cu mesaj clar.
- Mișcarea (lumina de pe inel, punctele, cărțile) e doar CSS și e continuă (Alex, 2026-11-18: fără buton de oprire). O oprește doar „reduce motion” din sistem; fără JavaScript, pagina stă pe loc. `site/src/despre.js` arată rolul sub orbită.

## Cum schimbi culorile și fonturile

**Un singur loc: `content/tema.yml`.** De acolo pleacă tot: CSS-ul, gradientul de fundal, fonturile, scena 3D, culoarea barei de adrese pe telefon (`theme-color`), favicon-ul și imaginea de previzualizare. Din D-057 e brandingul BEMORE: aceiași tokeni îi folosește și tema cursurilor.

1. Deschide `content/tema.yml` și schimbă codurile hex (de exemplu `accent: "#2B44B8"`).
2. `npm run build`. Build-ul verifică și contrastul (secțiunea `contrast`): dacă un text nu mai trece AA în cel mai rău punct al gradientului, se oprește și îți spune care.
3. Verifică local (`npm run serve`).
4. Dacă ai schimbat paleta, refă imaginile PNG: `npm run imagini` (doar pe macOS). Altfel, previzualizarea pe rețele și iconița de pe ecranul iPhone-ului rămân în culorile vechi.

### Secțiunile din `tema.yml`

| Secțiune | Ce face |
|---|---|
| `fonturi` | `titluri` (Sora: titluri la 200, marca, numerele mari, inscripția) și `text` (Inter Tight: text, meniu, legendă, etichete, butoane). Devin `--font-titluri` și `--font-text`. |
| `culori` | rolurile (tabelul de mai jos). Fiecare devine `--rol` și `--rol-rgb` în CSS. |
| `mesh` | gradientul de fundal: `pagini` (paginile interioare), `prima-pagina` (fundalul liniștit din spatele scenei), `journey` (prima pagină cu My Journey deschis). Fiecare pată: `[culoare, "x% y%", "lățime% înălțime%"]`. Devin `--mesh-pagini` etc. |
| `contrast` | perechile `[text, fundal, prag]` verificate la build, cu sticla pusă peste fiecare culoare din fiecare gradient, fără blur. |
| `scena` | luminile și materialele scenei 3D. O pereche `[sus, jos]` e gradientul unui obiect (`obj-coaching`, `obj-despre`…). |

### Rolurile (`culori`)

| Rol | Ce colorează |
|---|---|
| `cer`, `cer-deschis`, `lavanda`, `piersica`, `portocaliu` | paleta Sora; restul rolurilor trimit la ele |
| `bg` | fundalul primei pagini; și `theme-color` |
| `mesh-baza` | culoarea de sub gradientul paginilor interioare |
| `sticla`, `glass`, `glass-read`, `glass-edge`, `surface` | sticla: baza, 80 % (navigare, panouri, legendă), 93 % (text lung), marginea luminoasă, rezerva plină |
| `line` | liniile subțiri dintre rânduri |
| `text`, `muted` | textul principal; explicații, date, etichete mici |
| `accent`, `on-accent` | linkuri, focus, numerele obiectelor, agenții AI; textul de pe accent |
| `buton`, `pe-buton` | butonul principal și textul lui |
| `punct`, `punct-inel` | semnul paletei (marca, centrul scenei, Live): doar decor |
| `umbra` | umbrele colorate ale sticlei și ale obiectelor |
| `human`, `alert` | Live: oamenii și „așteaptă decizia lui Alex”; „blocat” |
| `pressed-bg`, `pressed-fg` | „în lucru” acum, butoanele apăsate |
| `warm-*` | hârtia din panoul My Journey |
| `masa`, `masa-sage`, `sage`, `sage-ink` | lecțiile (pregătit; site-ul nu are încă lecții). Sage doar în lecții (D-054) |

Live are un singur sens pe culoare: albastru = agent AI, maro = om, roșu = blocat, plin închis = în lucru acum, ✓ = gata.

O valoare poate fi un cod hex, numele altui rol (`buton: text`) sau oricare dintre ele cu transparență (`glass: sticla / .80`).

### Cum funcționează (pentru developer)

- `tema.mjs` citește `content/tema.yml`, rezolvă trimiterile, construiește gradientul și verifică totul, inclusiv contrastul. O greșeală (cod invalid, rol lipsă, trimiteri în cerc, contrast sub prag, font negăzduit) oprește build-ul cu un mesaj clar.
- În CSS, fiecare rol devine două variabile: `--accent:#2B44B8` și `--accent-rgb:43 68 184`. Alte transparențe se scriu `rgb(var(--accent-rgb) / .45)`.
- Fonturile: build-ul copiază din `node_modules/@fontsource-variable/<font>` doar `latin` și `latin-ext` (cu ș și ț), plus licența (`assets/fonts/LICENSE-*.txt`), și scrie `@font-face`-urile. Un font nou cere pachetul lui (`npm install --save-exact @fontsource-variable/<font>`) și o linie în `FONTURI` din `tema.mjs`.
- Granulația fundalului e `assets/grain.png` (128 × 128 px, ~6 KB), generat de build, determinist.
- Scena 3D primește culorile prin datele din pagină: `COL.accent` pentru roluri, `SC['obj-live']` pentru scenă. Dacă scena cere un rol care nu există, build-ul se oprește. Canvasul e transparent, peste gradientul CSS.
- `src/favicon.svg` și `src/og.svg` sunt șabloane cu `{{accent}}`, `{{scena.orbit}}` sau `{{scena.obj-coaching.0}}` (prima culoare a perechii).
- Semnătura din colț și din tab („Alex · Atelier”) stă într-un singur fișier, `content/site.yml` (`intro.marca` pentru colț și imaginea de previzualizare, `titlu` pentru tab). După o schimbare: `npm run imagini`.
- Excepții, intenționate: albul marginilor de sticlă și al conturului obiectelor (`#fff`, lumină, nu paletă).
- Formele obiectelor (planșa Ioanei) sunt în două locuri care trebuie să rămână la fel: `build` din `src/scena.js` (3D) și `SHAPES` din `build.mjs` (desenul fără WebGL). Același număr = aceeași formă peste tot.
