# Lighthouse pe alexandrumolea.com (T-034) și țintele de 44 px (T-041)

Data: 2026-11-26 · Autor: Mike · Unealta: Lighthouse 12.8.2, Chrome headless (fără ferestre), setările implicite (telefon: Moto G emulat, 4G lent, procesor încetinit de 4 ori; desktop: `--preset=desktop`).

## Pe scurt
- **Ținta 90+ la performanță și accesibilitate e atinsă pe toate cele 3 pagini, pe telefon și pe desktop.** Singura excepție e accesibilitatea pe Despre: **96**, din cauza unui contrast (o culoare, deci decizia e a Ioanei).
- Prima pagină pe telefon variază: o rulare „la rece” a dat 75 (scena 3D a ținut procesorul ocupat 680 ms), următoarele trei au dat 100. Pe telefoane slabe, scena poate întârzia primele atingeri.
- T-041: semnătura din bară are acum o țintă de 44 px pe toate paginile, fără să se miște nimic pe ecran (capturi identice pixel cu pixel). Rândurile-drum de pe ecranele scurte NU le-am mărit: ar schimba compoziția (vezi „Pentru Ioana”).

## Înainte (adresa live, 3 rulări pe pagină, mediana)
Performanță / Accesibilitate / Bune practici / SEO

| Pagina | Telefon | Desktop |
|---|---|---|
| Prima pagină | 100 / 100 / 100 / 100 (LCP 1,4 s, TBT 20 ms); o rulare la rece: 75 (TBT 680 ms) | 100 / 100 / 100 / 100 |
| Despre | 98 / **96** / 100 / 100 (LCP 2,3 s) | 100 / **96** / 100 / 100 |
| Coaching | 100 / 100 / 100 / 100 (LCP 1,4 s) | 100 / 100 / 100 / 100 |

## După (build-ul din PR, server local cu gzip, comparat cu `main` pe același server)
Serverul local nu e GitHub Pages (HTTP/1.1, fără CDN), deci cifrele absolute sunt puțin mai mici decât pe live. Ce contează e diferența A/B, pe aceeași mașină.

| Pagina | `main` (telefon / desktop) | PR (telefon / desktop) |
|---|---|---|
| Prima pagină | 84–97 / 100 | 89–98 / 100 |
| Despre | 97 / 100 (accesibilitate 96) | 97 / 100 (accesibilitate 96) |
| Coaching | 99 / 100 | 99 / 100 |

Schimbarea din PR e doar în CSS-ul semnăturii, deci scorurile nu se schimbă: variația de pe prima pagină vine din încărcarea scenei 3D, nu din PR.

## T-041: ținte de atingere (măsurate cu getBoundingClientRect, 320–1440 px)

| Țintă | Înainte | După |
|---|---|---|
| Semnătura „Alex · Atelier de învățare” (bara de sus, toate paginile) | 16 px (32 px pe două rânduri) | 44 px (60 px pe două rânduri) |
| Rândurile-drum, telefon înalt (390 × 844) | 44 px | 44 px (neschimbat) |
| Rândurile-drum, telefon scurt (≤ 740 px înălțime) | 40 px | 40 px (decizia Ioanei) |
| Rândurile-drum, tabletă 768 × 1024 | 40–41 px | 40–41 px (decizia Ioanei) |
| Rândurile-drum, desktop scund (≤ 840 / ≤ 700 px înălțime) | 31–32 px | 31–32 px (decizia Ioanei) |

Cum: `padding: 14px 0` plus `margin: -14px 0` pe `.brand`. Zona de atingere crește, locul ocupat rămâne același. `position: relative` o ține deasupra titlului de sub ea (altfel titlul acoperea ultimii 3 px). Verificat:
- capturi identice pixel cu pixel, `main` față de PR, la 320, 375 și 1440 px (prima pagină fără 3D, Coaching, Workshops);
- înălțimea barei, golul dintre panouri și derularea coloanei sunt identice la 320 × 568 … 1440 × 900;
- zona semnăturii nu acoperă niciun alt link sau buton.

Am încercat și `min-height: 44px` pe rândurile-drum. Pe ecranele scurte, coloana de pe prima pagină începea să se deruleze (la 320 × 640 depășirea creștea de la 21 la 63 px; la 1024 × 700, de la 0 la 51 px), iar golul dintre panouri scădea (la 1440 × 900, de la 88 la 60 px). E o schimbare de compoziție, așa că am scos-o.

## Ce am încercat și am scos (fără câștig măsurat)
- `fetchpriority="high"` pe poza de pe Despre (Lighthouse o cerea): LCP-ul a crescut de la 2,3 la 2,5 s, pentru că poza concura cu fonturile. Scos.
- Pregătirea scenei 3D în pași, cu pauze între ei: în 3 + 3 rulări, TBT-ul n-a scăzut clar (89/98/89 față de 91/91/97). Scos: simplu bate complicat.

## Ce rămâne și de ce nu l-am făcut
| Sugestie Lighthouse | De ce nu acum |
|---|---|
| Cache mai lung pentru fonturi, CSS, three.js (azi 10 min) | GitHub Pages fixează 10 minute și nu poate fi schimbat. Abia dacă mutăm site-ul (D-037). |
| CSS care blochează afișarea (~150 ms pe 4G) | Am putea pune CSS-ul critic direct în pagină, dar e mai complicat de întreținut, iar scorurile sunt deja 97–100. |
| three.js are cod nefolosit (81 KiB) | Ar cere un pas de bundling (tree-shaking). E o propunere separată, dacă vrem telefoanele slabe mai rapide. |
| Poza de pe Despre: mai mică / WebP (~49 KiB) | Ar cere un al doilea fișier de poză, ținut la zi lângă cel din `content/despre.md`. Câștigul e mic (Despre are 97–100). |
| CSS/JS neminimizat (2–5 KiB) | Câștig neglijabil după gzip. |

## Pentru Ioana (schimbări care se văd, nu le-am făcut)
1. **Contrast pe Despre:** eticheta „ACUM” din lista rolurilor (`.despre .roles .yrs em`) e portocalie (#c96a1e) pe aproape alb: 3,74:1 la 13 px, iar WCAG AA cere 4,5:1. E singurul motiv pentru 96 în loc de 100. Varianta simplă: o nuanță mai închisă, sau aceeași culoare la text mai mare sau mai gros.
2. **Rândurile-drum pe ecrane scurte:** 31–41 px (vezi tabelul). Pentru 44 px trebuie 16–48 px în plus pe înălțime: fie un pic mai puțin aer în panoul de sus, fie acceptăm derularea, fie lăsăm așa (WCAG 2.5.8 cere 24 px, iar rândurile trec).
3. **Linkurile text de pe Despre** („Tot parcursul”, „Mă găsești pe GitHub”): 27–29 px înălțime, lângă butoane de 47 px. Trec de WCAG (24 px), dar nu de regula noastră de 44.

## Cum se repetă măsurătoarea
Lighthouse instalat temporar (nu intră în repo), apoi, pentru fiecare pagină:
```
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
npx lighthouse@12.8.2 https://alexandrumolea.com/despre/ --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless=new" --output=json --output-path=despre-telefon.json   # + --preset=desktop
```
Rulează de 3 ori și ia mediana. Prima rulare după pornire iese adesea mai slab.
