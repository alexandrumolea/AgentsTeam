# Site-ul (alexandrumolea.com)

Build static, fără framework: `build.mjs` citește `content/`, `docs/taskuri.md` și istoricul git și scrie site-ul în `site/dist`.

```
cd site
npm ci            # o singură dată
npm run build     # construiește site/dist
npm run serve     # http://localhost:4321/
```

Conținutul (texte, categorii, business-uri) se schimbă în `content/`, nu aici.

## Cum schimbi culorile

**Un singur loc: `content/tema.yml`.** De acolo pleacă tot: CSS-ul, scena 3D, culoarea barei de adrese pe telefon (`theme-color`), favicon-ul și imaginea de previzualizare.

1. Deschide `content/tema.yml` și schimbă codurile hex (de exemplu `accent: "#7CF5C8"`).
2. `npm run build` și verifică local (`npm run serve`).
3. Dacă ai schimbat paleta, refă imaginile PNG: `npm run imagini` (doar pe macOS). Altfel, previzualizarea pe rețele și iconița de pe ecranul iPhone-ului rămân în culorile vechi.

### Rolurile

Numele spun ce face culoarea, nu cum arată, ca „accent” să poată deveni albastru fără să mintă. Sunt numele propuse de Ioana în `team/ioana/documente/culori-v1.md`.

| Rol | Ce colorează |
|---|---|
| `bg`, `bg-glow` | fundalul paginii și al scenei 3D (`bg` e și `theme-color`); lumina difuză din spate |
| `surface`, `glass` | panourile, cardurile, dock-ul: plin și cu sticlă |
| `line` | liniile subțiri și contururile (aceeași bază, mai stinsă, la hover) |
| `text`, `muted` | textul principal; explicații, date, etichete mici |
| `accent`, `on-accent` | aici apeși / se lucrează acum: butonul, focusul, agenții AI; textul de pe buton |
| `human` | oamenii din Live și „așteaptă decizia lui Alex” |
| `alert` | „blocat” |
| `pressed-bg`, `pressed-fg`, `pressed-muted` | butonul apăsat din dock, pagina curentă din meniu, butoanele deschise |
| `label-bg` | etichetele straturilor când desfaci inovația |
| `warm-glow` | accentul modului cald (My Journey), peste scenă |
| `warm-bg`, `warm-text`, `warm-muted`, `warm-accent`, `warm-line`, `warm-divider` | hârtia din panoul My Journey |
| `fallback-*` | varianta fără 3D (telefoane vechi, economisire de date) |

O valoare poate fi un cod hex, numele altui rol (`pressed-bg: text`) sau oricare dintre ele cu transparență (`glass: surface / .94`).

Secțiunea `scena` are luminile, materialele și nuanțele de sticlă ale scenei 3D (în CSS-ul Ioanei: `--scene-*`). Multe trimit la un rol de mai sus (`glow: accent`), deci se schimbă singure. Nuanțele deschise de sticlă sunt alese de mână: dacă schimbi `accent`, schimbă-le și pe ele.

### Cum funcționează (pentru developer)

- `tema.mjs` citește `content/tema.yml`, rezolvă trimiterile și verifică totul. O greșeală (cod invalid, un rol care lipsește, trimiteri în cerc) oprește build-ul cu un mesaj clar.
- În CSS, fiecare rol devine două variabile: `--accent:#7CF5C8` și `--accent-rgb:124 245 200`. Alte transparențe se scriu `rgb(var(--accent-rgb) / .45)` (sintaxă suportată din Safari 12.1 / iOS 12.2, Chrome 65, Firefox 52).
- Scena 3D primește culorile prin datele din pagină: `COL.accent` pentru roluri, `SC['bg-warm']` pentru scenă. Dacă scena cere un rol care nu există, build-ul se oprește.
- `src/favicon.svg` și `src/og.svg` sunt șabloane cu `{{accent}}` sau `{{scena.glass-disc}}`.
- Excepții, intenționate: baza albă a sticlei clare din scenă (`0xffffff`, e fizică, nu paletă) și masca neagră a dock-ului pe telefon (`#000`, contează doar opacitatea).
