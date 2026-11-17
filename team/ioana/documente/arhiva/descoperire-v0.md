# Descoperire și inspirație: concept vizual și UX (v0)

> Autor: Ioana. Dată: 2026-11-15. Status: **propunere, de ales de Alex** (direcția vizuală, secțiunea 6).
> Răspunde la obiectivul 2 din `docs/charter.md`. Se potrivește cu oricare mecanism ales de Radu: bandă „Nou”, recomandări, vitrină, mini-diagnostic.
> Numele secțiunilor („Nou de la Alex”, „Vitrina” etc.) sunt provizorii. Maria le stabilește.
> Toate produsele din exemple sunt **fictive**.
> Mock: `team/ioana/documente/arhiva/mock-descoperire.html` (static, un fișier, conținut fictiv, are un comutator între cele 2 direcții).

## Regula de bază
Drumul direct rămâne la 2 click-uri. Descoperirea stă **după** răspunsul la nevoia vizitatorului, niciodată înainte sau peste el.
Concret: fără pop-up-uri la intrare, fără carusele care se mișcă singure, fără secțiuni de descoperire deasupra alegătorului de intenții. Singura excepție e o pastilă de o linie în hero (vezi 3.1).

---

## 1. Inspirație prin design: wow calm, nu zgomot

### Ce creează senzația
| Element | Cum îl folosim | Doza |
|---|---|---|
| **Ritm** | Alternăm secțiuni dense cu secțiuni aerisite. O idee pe ecran. Spațiul gol e o alegere. | Fiecare pagină are cel puțin un „ecran de respirație” (o frază mare, nimic altceva). |
| **Imagini mari** | Fiecare invenție are o copertă proprie, după un șablon comun (aceeași lumină, aceeași compoziție, culoarea tipului). Fotografii reale cu Alex la lucru bat orice stock. | O imagine mare pe ecran, nu un colaj. |
| **Adâncime prin sticlă** | Cardurile de sticlă plutesc peste un câmp de culoare moale pe care îl controlăm (nu peste fotografii). Câmpul își schimbă foarte încet tonul la scroll. | Sticlă doar pe navigare, carduri, pastile, overlay-uri. |
| **Mișcare subtilă** | Apariție la scroll: 8–12 px + opacitate, 300–400 ms, o singură dată. Card ridicat 2 px la hover. Tranziții între pagini cu View Transitions. | Doar `transform` și `opacity`. Nimic în buclă. |
| **Tipografie sigură pe ea** | Titluri mari, strânse, puține cuvinte. Text de corp generos (18 px+). | Un singur font variabil, două greutăți vizibile. |
| **Momente de surpriză** | (a) pastila „Nou” din hero; (b) recomandarea de la final cu motivul ei („pentru că citești despre echipe”); (c) un „gând al săptămânii” scris de Alex, care se schimbă; (d) mini-diagnosticul. | Maxim una pe ecran. Surpriza vine din conținut, nu din efecte. |
| **Urma umană** | O notă scurtă de la Alex pe fiecare invenție („de ce am făcut asta”). Eventual semnătura lui scrisă de mână. | Contrapunctul la estetica generică AI. |

### Actual la sfârșitul lui 2026 vs. clișeu
| Actual (adoptăm) | Clișeu sau datat (evităm) |
|---|---|
| Mișcare cu scop, nu decorativă | Scroll hijacking, parallax greu |
| Animații native CSS legate de scroll, cu `@supports` | Biblioteci JS mari doar pentru efecte de scroll |
| View Transitions între pagini | Ecrane de încărcare animate |
| Sticlă ca accent (popularizată de Apple în sistemele 26) | Glassmorphism peste tot, sticlă peste fotografii și text lung |
| Elemente umane, calde, imperfecte | „Orb-uri” de gradient, blob-uri abstracte, paleta aurie generică AI |
| Tipografie editorială mare | Text animat literă cu literă |
| Grile cu dimensiuni diferite **doar** când ierarhia o cere | Bento pentru orice (verdictul e împărțit; îl folosim doar în vitrină, cu măsură) |
| Statusuri oneste („în curând”, „prototip”) | Contoare care cresc animat, „100+ clienți fericiți” |
| | Carusele automate, pop-up cu email la intrare, fundaluri cu particule, iconițe 3D generice |

Surse: la final. Notă: majoritatea sunt bloguri de agenții. Le tratez ca semnale, nu ca dovezi.

---

## 2. Cardul de invenție

O singură componentă pentru curs, aplicație, tool, experiment. Apare în bandă, în recomandări și în vitrină, în 3 mărimi: **mare** (orizontal pe desktop), **standard**, **compact** (pentru recomandări).

### Anatomie (de sus în jos)
```
┌──────────────────────────────────────┐
│ [ IMAGINE 16:10 ]                    │  1. copertă (solidă, nu sub sticlă)
│  (• Nou)                 Aplicație   │  2. status (pastilă de sticlă)  3. tip
├──────────────────────────────────────┤
│ Când nu mai știi pe ce să te         │  4. NEVOIA = titlul (h3)
│ concentrezi azi.                     │
│ Busola · fictiv                      │  5. numele = semnătura
│ Pentru: oricine · 5 minute           │  6. pentru cine + efort
│                         Încearcă →   │  7. o singură acțiune
└──────────────────────────────────────┘
```
1. **Imagine.** 16:10 peste tot (mobil inclus), cu `aspect-ratio` fix ca să nu sară pagina. Fallback fără imagine: câmpul de culoare al tipului plus inițiala.
2. **Status.** Pastilă de sticlă peste imagine, cu text, nu doar culoare: „Nou” sau „În curând”. Lipsește când e doar disponibil.
3. **Tip.** Text mic + iconiță: Curs, Aplicație, Tool, Experiment. Fiecare tip are o culoare de accent discretă (doar pe iconiță și pe câmpul de fallback).
4. **Nevoia rezolvată, ca titlu.** Pe limba vizitatorului, maxim 2 rânduri. E exact regula „Ai nevoie de X?” aplicată descoperirii: omul se recunoaște în nevoie înainte să afle numele. (Propunere; decid împreună cu Maria.)
5. **Numele.** Mai mic, ca o semnătură.
6. **Pentru cine + efort.** „Pentru: lideri de echipă · 15 minute.” Efortul scade frica de a încerca.
7. **Acțiune.** Una singură, cu verb: „Încearcă”, „Vezi cursul”, „Anunță-mă”. Tot cardul e clickabil (link întins pe card), dar textul acțiunii e vizibil.

### Ce câmpuri îi cere cardul fișierului de conținut
Pentru Radu și Mike, ca să iasă dintr-un singur fișier: `tip`, `status` (disponibil / în-curând), `data_lansare`, `nevoie`, `nume`, `pentru_cine`, `efort`, `imagine`, `alt`, `cta_text`, `link`, opțional `nota_alex`. „Nou” se calculează singur: `data_lansare` în ultimele 30 de zile. Alex nu trebuie să-și amintească să scoată eticheta.

### Stări
| Stare | Ce se vede |
|---|---|
| **Normal** | Sticlă discretă, umbră mică, imagine întreagă. |
| **Hover** (doar pe dispozitive cu `hover: hover`) | Card ridicat 2 px, umbra se adâncește, imaginea crește 2% în cadru, bordura de lumină se intensifică. 180 ms, ease-out. Săgeata acțiunii se mută 2 px. |
| **Focus** (tastatură) | Contur 2 px în culoarea de accent, decalat 3 px. Vizibil pe orice fundal. Aceleași schimbări ca la hover. |
| **Nou** | Pastila „Nou” cu un punct de accent. Pe varianta mare, o linie de 2 px de accent pe marginea de sus. Fără puls animat. |
| **În curând** | Imagine ușor desaturată (`saturate(.6)`), data estimativă („primăvara 2027”), acțiune secundară „Anunță-mă” (contur, nu buton plin). Pe pagina invenției: un câmp de email, fără nimic altceva. |
| **Apăsat** | `scale(.99)`, 100 ms. |

### Mobil
- Toată lățimea în liste; 85% din lățime în benzi orizontale (se vede marginea cardului următor, deci omul înțelege că poate glisa).
- Fără stare de hover. Nimic important nu se ascunde după hover.
- Zonă de atingere minimă 44×44 px pentru acțiune.
- Blur redus la 12 px (mai ieftin pe telefoane slabe).

### Sticla pe card (valori orientative)
Sticla stă **doar peste câmpul de culoare al secțiunii**, pe care îl controlăm. Textul din card stă pe un strat aproape opac, deci contrastul nu depinde de ce e dedesubt.

```css
:root {
  --glass-tint: rgb(255 255 255 / .72);
  --glass-tint-strong: rgb(255 255 255 / .86);   /* sub text */
  --glass-border: rgb(255 255 255 / .6);
  --glass-edge: rgb(255 255 255 / .75);          /* lumina de sus */
  --glass-shadow: 0 1px 2px rgb(20 24 38 / .06), 0 8px 28px rgb(20 24 38 / .08);
  --solid-surface: #FBFAF7;
  --ink: #1C1F26;      /* ~15:1 pe suprafața solidă */
  --ink-soft: #4A5060; /* ~7.5:1, pentru meta */
}
@media (prefers-color-scheme: dark) {
  :root {
    --glass-tint: rgb(28 31 38 / .62);
    --glass-tint-strong: rgb(28 31 38 / .82);
    --glass-border: rgb(255 255 255 / .12);
    --glass-edge: rgb(255 255 255 / .18);
    --glass-shadow: 0 1px 2px rgb(0 0 0 / .3), 0 10px 32px rgb(0 0 0 / .35);
    --solid-surface: #16181D;
    --ink: #F2F1EE;
    --ink-soft: #B8BCC6;
  }
}

.card {
  border-radius: 24px;
  background: var(--glass-tint);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid var(--glass-border);
  box-shadow: inset 0 1px 0 var(--glass-edge), var(--glass-shadow);
}
.card__body { background: var(--glass-tint-strong); }  /* textul nu stă pe sticlă subțire */

/* Fallback 1: browser fără backdrop-filter */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .card, .card__body { background: var(--solid-surface); }
}
/* Fallback 2: utilizatorul a cerut mai puțină transparență */
@media (prefers-reduced-transparency: reduce) {
  .card, .card__body { background: var(--solid-surface); backdrop-filter: none; -webkit-backdrop-filter: none; }
}
/* Fallback 3: contrast ridicat */
@media (prefers-contrast: more) {
  .card { background: var(--solid-surface); backdrop-filter: none; border-color: var(--ink-soft); }
}
@media (max-width: 640px) { .card { backdrop-filter: blur(12px) saturate(150%); } }
```
**Atenție (găsit în research):** Safari, inclusiv iOS, **nu** suportă `prefers-reduced-transparency` (caniuse, verificat 2026-11-15). Deci varianta implicită cu sticlă trebuie să treacă singură AA, fără să conteze pe fallback. De aici stratul `--glass-tint-strong` sub text.

---

## 3. Banda „Nou”, recomandările, vitrina

### 3.1 Banda „Nou de la Alex” (acasă)
**Poziție:** sub alegătorul de intenții. Plus o pastilă de o linie în hero, deasupra titlului, care duce la ultima lansare. Pastila e singurul element de descoperire deasupra drumului direct și nu ocupă mai mult de un rând.

Desktop:
```
┌ nav (sticlă) ── Coaching  Tools  Business  Speaking  Carte  Despre  [Rezervă] ┐
   ( • Nou: Curs fictiv „Ritm de lucru” → )        ← pastilă de sticlă, 1 rând
   Titlul hero: cine e Alex, într-o propoziție
   [intenție] [intenție] [intenție]
   [intenție] [intenție] [intenție]
   ─────────────────────────────────────────────────────
   Nou de la Alex                                  Vezi tot →
   ┌───────────── card MARE ─────────────┐ ┌─ card ─┐ ┌─ card ─┐
   │ imagine │ nevoie, nume, acțiune      │ │        │ │        │
   └─────────────────────────────────────┘ └────────┘ └────────┘
```
Maxim 3 carduri: cea mai nouă lansare mare, apoi încă două (una poate fi „În curând”).

Mobil:
```
   ( • Nou: „Ritm de lucru” → )
   Titlu hero
   [intenție] ×6 (listă)
   Nou de la Alex          Vezi tot →
   ┌──── card 85% ────┐┌──
   │                   ││     ← glisare orizontală, scroll-snap, fără autoplay
   └───────────────────┘└──
   • ○ ○                     ← indicator de poziție
```
Straturi: câmp de culoare (solid) → carduri de sticlă → pastile de status (sticlă) → text (strat aproape opac).

### 3.2 Recomandări „S-ar putea să-ți folosească și…”
**Poziție:** la finalul fiecărei pagini-destinație (coaching, un tool, un business, un articol), **după** acțiunea principală. Niciodată între vizitator și butonul de rezervare.
**Diferența care contează:** fiecare recomandare are un motiv vizibil, de o linie: „Pentru că te uiți la lucrul cu echipa.” Motivul face recomandarea să pară grijă, nu reclamă.

Desktop:
```
   … conținutul paginii …   [ Rezervă o sesiune ]
   ─────────────────────────────────────────────────
   S-ar putea să-ți folosească și
   ┌ compact ─────────────────┐ ┌ compact ─────────────────┐ ┌ compact ──┐
   │ [img] Nevoia             │ │ [img] Nevoia             │ │ …         │
   │ 1:1   Nume · tip         │ │ 1:1   Nume · tip         │ │           │
   │       Pentru că …        │ │       Pentru că …        │ │           │
   └──────────────────────────┘ └──────────────────────────┘ └───────────┘
```
Mobil: aceleași 2–3 carduri compacte, una sub alta. Maxim 3. Dacă nu avem o recomandare relevantă, secțiunea lipsește.

### 3.3 Vitrina (toate invențiile)
**Scop:** „tot ce a creat Alex, într-un loc, filtrat după ce ai nevoie”.
Desktop:
```
   Titlu scurt + o frază de la Alex despre de ce construiește lucruri
   Filtre (pastile): [Toate] [Focus] [Obiceiuri] [Echipă] [Carieră] …   Tip: [Toate ▾]
   ┌──────────── lansarea cea mai nouă (card mare, toată lățimea) ────────────┐
   └───────────────────────────────────────────────────────────────────────────┘
   ┌ card ┐ ┌ card ┐ ┌ card ┐
   ┌ card ┐ ┌ card ┐ ┌ card ┐
   ─── În curând ───
   ┌ card (în curând) ┐ ┌ card (în curând) ┐
```
- Filtrul principal e după **nevoie** (aceleași categorii ca la Tools, ca să fie un singur vocabular). Tipul e filtru secundar.
- Filtrele sunt linkuri cu URL (`?nevoie=focus`), deci se pot trimite și funcționează fără JS.
- „În curând” e o secțiune separată la final, nu amestecată.

Mobil: titlu, apoi pastilele de filtru pe un rând care glisează orizontal, apoi cardurile într-o singură coloană. Fără sidebar.

---

## 4. Mini-diagnosticul: o experiență, nu un formular

**Intrare:** un card în plus lângă intenții: „Nu știi de unde să începi? 3 întrebări, 30 de secunde.” Și un link în vitrină.
**Formă:** overlay (sticlă pe margine, conținut pe suprafață solidă). Pe mobil: foaie care urcă de jos pe tot ecranul. Pe desktop: panou centrat, 640 px.

```
 ┌─────────────────────────────────────┐
 │  ● ○ ○                         ✕    │   progres discret, ieșire mereu vizibilă
 │                                     │
 │  Ce te frământă cel mai mult        │   o întrebare pe ecran, mare, caldă,
 │  acum?                              │   în vocea lui Alex
 │                                     │
 │  ┌───────────────────────────────┐  │
 │  │ Nu-mi găsesc focusul          │  │   3–4 răspunsuri ca plăci mari
 │  └───────────────────────────────┘  │   (un tap = răspuns + trecere la următoarea)
 │  ┌───────────────────────────────┐  │
 │  │ Echipa mea nu merge în ritm   │  │
 │  └───────────────────────────────┘  │
 │  ┌───────────────────────────────┐  │
 │  │ Vreau să-mi schimb direcția   │  │
 │  └───────────────────────────────┘  │
 │  ← Înapoi                           │
 └─────────────────────────────────────┘
```
Ce o face să pară experiență:
1. **O întrebare pe ecran**, formulată ca într-o conversație, nu „Selectați categoria”.
2. **Un tap e suficient.** Fără butonul „Următorul”. Tranziție scurtă (200 ms, alunecare + estompare) între întrebări.
3. **Mic ecou după fiecare răspuns**, o linie: „Te înțeleg. Și cât timp ai?” Arată că cineva ascultă.
4. **Întrebările:** (1) ce te frământă; (2) cât timp ai (5 minute / o oră / câteva săptămâni); (3) pentru cine e (pentru mine / pentru echipa mea). Răspunsurile se potrivesc cu câmpurile cardului (`nevoie`, `efort`, `pentru_cine`), deci logica e o filtrare simplă, fără AI.
5. **Rezultatul e un cadou, nu o poartă.** Fără email înainte de rezultat. „Pentru tine, acum:” + 1 recomandare mare + 2 mici, cu motivul în cuvintele omului: „Ai spus că vrei focus și ai 5 minute.” Dedesubt, discret: „Dacă vrei să vorbim despre asta: Rezervă o sesiune.”
6. **Refacere și ieșire oricând.** Esc închide. „Ia-o de la capăt” pe ecranul de rezultat.
7. **Nu salvăm nimic** în afară de, eventual, ultimul rezultat în browser, ca să-l vadă dacă revine.

Accesibilitate: fiecare întrebare e un `fieldset` cu `legend` și butoane radio stilizate ca plăci. Focusul trece pe titlul întrebării la fiecare pas. Progresul e anunțat („Întrebarea 2 din 3”) pentru cititoarele de ecran.

---

## 5. Accesibilitate și performanță (reguli specifice)

### Mișcare
- Doar `transform` și `opacity`. Nu animăm niciodată `backdrop-filter`, `width`, `top`.
- `prefers-reduced-motion: reduce`: fără apariții la scroll, fără ridicare la hover, fără schimbarea tonului fundalului. Rămân doar estompări de maxim 150 ms (sau nimic).
- Animațiile legate de scroll doar în `@supports (animation-timeline: view())`. Fără suport, conținutul e pur și simplu vizibil.
- Nimic nu se mișcă singur: fără autoplay în carusele, fără bucle. Un video, dacă există, are pauză și afișează doar posterul la mișcare redusă.

### Contrast
- Text normal 4,5:1, text mare (24 px+ sau 19 px bold) 3:1, borduri de focus și controale 3:1 (WCAG 2.2 AA).
- Testăm contrastul pe sticlă în cel mai rău caz: fundalul cel mai luminos (sau cel mai întunecat, în dark) de sub card.
- Sticla implicită trece AA fără fallback-uri (Safari nu respectă `prefers-reduced-transparency`).
- Statusul nu e comunicat doar prin culoare: are mereu text („Nou”, „În curând”).

### Sticlă
- Buget: maxim ~6 elemente cu `backdrop-filter` vizibile simultan pe ecran. Blur între 12 și 24 px.
- Fără sticlă pe elemente care se mișcă (cardurile din bandă glisează, deci pe mobil, în bandă, sticla devine suprafață solidă dacă scăderea de fluiditate se vede la test).
- Fallback-uri: `@supports not`, `prefers-reduced-transparency`, `prefers-contrast: more` (vezi secțiunea 2).

### Imagini
- AVIF cu WebP ca rezervă, `srcset` cu 3 lățimi (480 / 960 / 1600), `sizes` corect.
- `width`, `height` sau `aspect-ratio` pe fiecare imagine (CLS sub 0,1).
- `loading="lazy"` pe tot ce e sub prima ecranare, `fetchpriority="high"` doar pe imaginea principală.
- Ținte de greutate: copertă de card ≤ 120 KB, imagine hero ≤ 250 KB.
- `alt` obligatoriu în fișierul de conținut. Mike poate bloca build-ul dacă lipsește.

### Bugete
- LCP < 2,5 s, CLS < 0,1, INP < 200 ms pe mobil mediu.
- JavaScript pentru toată descoperirea (bandă, filtre, diagnostic): ≤ 15 KB. Fără biblioteci de animație.
- Banda, recomandările și vitrina funcționează și fără JavaScript (HTML static generat de Astro). JS doar pentru diagnostic și pentru filtrarea instantanee.

### Tastatură și cititoare de ecran
- Banda: `section` cu `aria-label`, toate cardurile accesibile cu Tab, butoane „anterior / următor” pe desktop.
- Overlay-ul diagnosticului: `dialog` nativ, focus capturat, Esc închide, focusul revine pe butonul de pornire.

---

## 6. Două direcții vizuale

### A. Galerie calmă
Ca o expoziție mică într-o galerie luminoasă. Fundal cald, aproape alb (travertin), multă respirație, o lansare pe ecran, imagini mari și tipografie editorială. Sticla apare puțin: navigarea, pastilele, cardurile peste un câmp de culoare foarte moale. Mișcarea e lentă și rară. Inspirația vine din calitate și din liniște: omul simte că fiecare lucru a fost ales cu grijă. Avantaje: arată premium, îmbătrânește frumos, leagă fațetele lui Alex într-un singur ton, se actualizează ușor. Risc: poate părea static dacă lansările sunt rare, și cere o copertă bună pentru fiecare invenție.

### B. Laborator viu
Ca atelierul unui inventator, cu ușa deschisă. Mai multă culoare (fiecare tip are accentul lui), statusuri vizibile (idee, prototip, lansat), un „jurnal de lansări” ca o cronologie, mici previzualizări ale aplicațiilor, notițe de la Alex despre ce testează acum. Inspirația vine din energie și din proces: omul vede că se construiește ceva chiar acum. Avantaje: transmite direct „inventator”, invită la încercat, face și lucrurile neterminate valoroase. Riscuri: zgomot vizual ușor de atins, cere conținut nou des (altfel laboratorul pare abandonat) și se ciocnește mai ușor cu tonul calm al restului site-ului.

### Recomandarea mea: A, cu o picătură din B
Galeria calmă ca bază, plus două lucruri din laborator: vocabularul de status („Nou”, „În curând”) și o linie de jurnal de lansări în vitrină. Motivele: (1) site-ul trebuie să țină împreună coaching, patru business-uri, carte și tool-uri, iar calmul le unește, pe când energia le-ar fragmenta; (2) dacă lansările vin rar, galeria arată tot bine, pe când laboratorul arată gol; (3) energia din B poate veni din conținut (nota lui Alex, statusurile), nu din design. Dacă Alex lansează des (lunar sau mai des) și vrea să-și arate procesul, B devine o alegere bună.
Mock-ul are un comutator A/B, ca Alex să le vadă pe aceleași carduri.

---

## Ce am nevoie ca să trec la v1
- Alex: alegerea A sau B (sau „A cu ceva din B”).
- Alex: lista invențiilor (întrebarea 20) și 2–3 site-uri care îi plac (întrebarea 16).
- Radu: mecanismele finale și câmpurile fișierului de conținut.
- Maria: numele secțiunilor și tonul întrebărilor din diagnostic.

## Surse (verificate 2026-11-15)
Trenduri și clișee (bloguri de agenții, semnale, nu dovezi):
- [Clay: web design trends 2026](https://clay.global/blog/web-design-guide/web-design-trends)
- [Bubble: web design trends 2026, what's in, what's out](https://bubble.io/blog/web-design-trends/)
- [Creative Boom: 10 trends creatives are so over in 2026](https://creativeboom.com/insight/10-trends-creatives-are-so-over-in-2026/)
- [StudioMeyer: webdesign trends 2026 reality check](https://studiomeyer.io/en/blog/webdesign-trends-2026-reality-check)
- [DesignRush: web design trends 2026](https://www.designrush.com/agency/website-design-development/trends/web-design-trends)

Tehnic (mișcare, sticlă, suport browsere):
- [Chrome for Developers: scroll-triggered animations](https://developer.chrome.com/blog/scroll-triggered-animations)
- [BuildMVPFast: CSS scroll-driven animations cross-browser](https://www.buildmvpfast.com/blog/css-scroll-driven-animations-replace-js-2026)
- [CoderCops: CSS view transitions și scroll animations 2026](https://blog.codercops.com/blog/css-view-transitions-scroll-animations-2026)
- [Chrome for Developers: prefers-reduced-transparency](https://developer.chrome.com/blog/css-prefers-reduced-transparency)
- [caniuse: prefers-reduced-transparency](https://caniuse.com/mdn-css_at-rules_media_prefers-reduced-transparency) (Safari: nesuportat până la 27.x)
- Din research-ul de kickoff: [Axess Lab: glassmorphism și accesibilitate](https://axesslab.com/?p=5111), [backdrop-filter recipes 2026](https://www.buildmvpfast.com/blog/liquid-glass-css-backdrop-filter-recipes-2026)

Notă: sursele secundare se contrazic la versiunile exacte de browser pentru animațiile legate de scroll. Mike verifică pe caniuse sau MDN înainte de implementare; designul nu depinde de ele (sunt îmbunătățire progresivă).
