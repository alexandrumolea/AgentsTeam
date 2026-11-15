# Spațiu v2: atelierul în care intri

> Autor: Ioana. Dată: 2026-11-15. Status: **propunere, de văzut de Alex**.
> Pornește de la D-023 (Alex a ales direcția Spațiu) și integrează D-024 (scopul extins), I-010 (Live), I-011 (Knowledge, acum „Învață”), I-012 (poveștile, acum „Ce m-a crescut”), D-025 (numele propuse de Maria), D-026 și D-027 (misiunea) și D-028 (arhitectura v2 a lui Radu).
> Prototip: [`prototip-v2-spatial.html`](prototip-v2-spatial.html). Tot conținutul e **fictiv**. Etichetele de categorii sunt **propuse** (D-025), iar titlurile celor două familii („Drumuri directe”, „Camerele atelierului”) sunt **de lucru**.

## Cum îl vezi
Deschide fișierul în Chrome sau Safari, pe desktop sau pe telefon. Bara neagră de sus are trei legături: `v1` (prototipul ales de Alex), `v2` și `fără 3D` (aceeași pagină cu `?nogl`, ca să vezi varianta pentru browsere fără WebGL).

Ce să încerci, în ordinea asta:
1. Așteaptă 2 secunde: camera trece printr-un prag de lumină și intră în atelier.
2. „Desfă invenția” (primul moment wow, păstrat din v1).
3. Bara „Live” din dreapta sus sau „Live” din bara de jos (al doilea moment wow).
4. „Învață”, apoi deschide un principiu: placa lui se ridică în obiectul 3D.
5. „Ce m-a crescut”: tot atelierul se încălzește.
6. Deschide 2–3 camere una după alta, apoi închide panoul: între ele au rămas poduri de lumină.

---

## Ce am schimbat față de v1

| Ce | v1 | v2 |
|---|---|---|
| Structura | 6 intenții pe orbită | **7 obiecte în două familii** (D-028): drumuri directe (Coaching, Compania mea, Speaking) și camerele atelierului (Invenții, Live, Ce m-a crescut, Învață). „Despre” e numele lui Alex din titlu, nu obiect |
| Senzația | „navighez un site 3D” | **„am intrat în atelierul cuiva”**: prag la intrare, camerele își aruncă lumina pe planșă, scena își schimbă lumina după camera în care ești |
| Introducerea | cea aprobată | **aceeași, neschimbată**, plus inscripția misiunii (D-027) în ordinea dată de Maria |
| Live | ticker cu agenți | **obiect nou** (lanternă de sticlă cu lumini care lucrează) + **rețeaua echipei** + **Jurnalul atelierului**, în forma din `docs/taskuri.md` |
| Knowledge | nu exista | **„Învață”**: un teanc de plăci de sticlă (straturi) care se desfac |
| Povești | nu exista | **„Ce m-a crescut”**: singurul obiect care nu e din sticlă: o piatră caldă, mată. Panoul e din hârtie, cu serif |
| Ticker | fără pauză | **pauză la hover, la focus și cu buton** (WCAG 2.2.2); dă click și intri în Live |
| Fără WebGL | doar bara de jos | **aceleași 7 categorii** ca listă de carduri sub două titluri (desktop) sau bara cu titlurile familiilor (telefon), aceleași panouri |
| Mobil | bara derulabilă, unele intenții ascunse | **toate cele 7 vizibile fără derulare** (două rânduri), obiectul ales urcă deasupra panoului |
| Rezervare | lipsea | buton fix **„Rezervă o sesiune”** (1 interacțiune de oriunde, cerința din D-028) |
| Performanță | three.js neminificat, rezoluție fixă | three.js minificat, **rezoluție adaptivă**, cadre la jumătate pe telefon când panoul acoperă scena, oprire în tab ascuns, `Save-Data` → fără 3D |

---

## Obiectele noi

### Live: lanterna și rețeaua (al doilea moment wow)
**Pe orbită:** o lanternă de sticlă în care se mișcă trei lumini mici. E singurul obiect în care se întâmplă ceva înăuntru.

**Când intri în Live:** luminițele agenților, care pluteau tot timpul pe orbitele lor ca decor, **zboară și se așază într-o rețea**. Alex stă în centru, Tudor lângă el, ceilalți agenți în jur. Restul atelierului se retrage. Fiecare task nou din jurnal **traversează rețeaua ca un impuls**, de la cine îl dă la cine îl primește, iar ținta se aprinde când îl primește. În dreapta (pe telefon, dedesubt): „Pe banc acum” și Jurnalul atelierului.

**Rândul din jurnal** are forma cerută de Maria: `data · cine → cui · ce · stadiu`, cu stadiile reale din `docs/taskuri.md` (nou, de făcut, în lucru, gata, blocat, la Alex). Din când în când un rând existent trece în „gata” și clipește. Fără oră, pentru că în prototip nu e reală.

**De ce trece pragul de al doilea wow.** L-am păstrat pentru că îndeplinește aceleași trei condiții ca „Desfă invenția”:
1. E legat de ce e Alex: conduce o echipă de agenți (I-001, I-010), iar ideea e a lui.
2. Explică ceva, nu e decor: cine lucrează la ce, acum.
3. Dă sens retroactiv decorului: luminițele pe care le vezi de la intrare se dovedesc a fi echipa. Costul e mic, pentru că luminițele există deja.

Ca să nu concureze cu primul: „Desfă invenția” e pe prima pagină (cardul invenției), iar Live e în spatele unei alegeri (ticker, bara de jos, obiectul). Prima impresie rămâne un singur wow.

**Regulile respectate (Maria, Radu):**
- **Luminițe doar pentru agenți.** Alex apare ca un punct solid, fără strălucire. Colaboratorii nu apar deloc în 3D.
- **Oamenii apar doar în textul jurnalului, după cel puțin 24 de ore, cu ziua și cu rolul** (Facilitator, Editor, Dezvoltator), niciodată cu numele. Fără „online acum”. Impulsurile în timp real există doar între agenți.
- Legenda din panou spune deschis regula: „agent AI · în timp real” și „om · după 24 h, cu ziua”.

### Învață: straturi
Pe orbită: patru plăci subțiri de sticlă, așezate una peste alta, cu spații între ele. Când alegi Învață, plăcile se desfac în evantai. Panoul arată „Începe de aici” (3 principii), „Ce te frământă?” (nevoi) și, fix, „Cartea” (D-028).

Fiecare principiu are trei straturi care se deschid în trepte: **Ideea → De unde vine → Încearcă azi**. Când deschizi un principiu, placa lui se ridică și se aprinde în obiectul 3D. Asta e „învață de la mine, în loc de cărți”: nu citești de la capăt la capăt, cobori doar cât îți trebuie, iar la final ai un pas concret pentru azi (testul din `vocea-alex`).

Am ales straturile, nu o bibliotecă spațială, pentru că biblioteca înseamnă tot cărți. Straturile vorbesc aceeași limbă ca „Desfă invenția”: **în atelierul lui Alex, totul se poate desface**. Asta devine gramatica direcției.

### Ce m-a crescut: piatra caldă (contrast intenționat)
Toate obiectele din atelier sunt din sticlă rece. Acesta e **o piatră mată, caldă, care respiră încet**. Când intri în cameră, **tot atelierul își schimbă lumina**: fundalul și ceața trec spre maro închis, lumina devine chihlimbar, luminițele agenților se estompează, iar podeaua se încălzește.

Panoul e singurul fără sticlă: **hârtie** (`#F3EBDF`), cerneală caldă, serif (Fraunces), italic în titlu. Povestea are trei mișcări, fiecare cu o linie verticală de culoarea pietrei: Ce am trăit / Ce m-a durut / Ce am învățat. Dedesubt: data următoarei povești (o dată la 3 luni) și arhiva.

Textul poveștii din prototip e **fictiv** și scris doar ca să se vadă forma. Povestea reală o scrie Alex.

---

## Misiunea în atelier (D-026, D-027)
**Inscripția.** Textul Mariei, exact și în ordinea dată, stă în introducere, dar ca **inscripție separată**: altă voce tipografică (Fraunces italic), cu o linie verticală subțire, care apare la o secundă după intrare. Așa introducerea nu pare plină, iar misiunea se citește ca o inscripție la intrarea în atelier, nu ca un slogan.

**Gestul: poduri care se construiesc din explorarea ta.** Când treci dintr-o cameră în alta, între cele două obiecte se construiește un arc subțire de lumină, de la un capăt la altul. Rămâne acolo. După câteva alegeri, atelierul arată drumul tău prin el: ce ai explorat s-a legat. E discret (o linie de 1 px), nu e ilustrat la propriu (fără pod desenat, fără monstru) și nu are text. Costă aproape nimic: un arc de 17 puncte pe legătură, cel mult 10.

**Ce propun, dar NU am pus în prototip: schimbarea perspectivei.** Ideea: în Învață, fiecare principiu are două fețe. Rotești placa (tragi de ea) și pe spate găsești același principiu **din perspectiva celuilalt** (de exemplu „ce simte omul căruia îi delegi”). „Nu putem vedea lucrurile din perspective pe care nu le înțelegem”, iar aici rotirea arată exact ce nu vedeai. Nu l-am construit acum din trei motive: (1) cere conținut nou pentru fiecare principiu (Maria și Alex); (2) două gesturi noi deodată (poduri și rotire) ar fi deja decor; (3) e mai bun ca pagină a unui principiu decât ca scenă. Îl propun pentru v3, dacă Alex vrea.

---

## Note rezolvate din runda trecută
| Notă v1 | Ce am făcut | Verificat |
|---|---|---|
| Ticker fără pauză (WCAG 2.2.2) | Se oprește la hover și la focus (pe ticker și pe jurnal) și are buton de pauză, în ticker și în panoul Live. Butoanele sunt sincronizate. Cu „mișcare redusă”, actualizările pornesc oprite | Hover și buton: da (în browser). Focus: da, cu tastatura reală (Tab până la ticker, conținutul nu se mai schimbă) |
| Fără WebGL și mobilul au aceleași categorii | Toate variantele citesc aceeași listă (`INTENTS`), în ordinea D-028: drumurile directe întâi, camerele după. Fără 3D pe desktop: carduri sub două titluri, fiecare cu buton. Pe telefon: bara cu titlurile familiilor. Panourile sunt aceleași | Da, `?nogl` pe 1440 și 375 px |
| Performanță pe telefoane medii | Vezi secțiunea de mai jos | Parțial: browserul integrat nu are GPU real (și v1 rulează aici la ~3–4 cadre/s), deci cifrele de cadre se măsoară pe telefon (taskul pentru Mike) |

### Ce face pentru viteză
- three.js **0.160.0 minificat** de pe jsDelivr: ~167 KB gzip (față de ~258 KB în v1). Pagina: ~70 KB, ~23 KB gzip.
- **Rezoluție adaptivă:** pornește cu 2× pe desktop, 1,5× pe telefon și 1× pe telefoanele cu memorie mică sau puține nuclee. Dacă media cadrelor trece de ~26 ms, coboară treptat până la 1×. Valorile se văd în consolă: `window.__perf`.
- **Pe telefon, sticla nu refractă** (fără `transmission`, care cere încă o randare a scenei). Geometria are jumătate din segmente.
- Când pe telefon un panou acoperă scena și nimic nu se mișcă, **desenează la jumătate din cadre**.
- Oprește bucla în tab ascuns. Lățimile etichetelor și pozițiile UI sunt măsurate o dată, nu la fiecare cadru.
- **Fără 3D automat** dacă: nu există WebGL2, `Save-Data` e activ sau adresa are `?nogl`.

---

## Sistemul vizual al direcției Spațiu (baza pentru Mike)

### Principii
1. **Intri într-un loc, nu deschizi o pagină.** Pragul, lumina camerelor, lumina care se schimbă cu camera.
2. **Totul se poate desface.** Invenția în straturi, Învață în straturi, Live în rețea. Un singur verb pentru toată direcția.
3. **Sticla e pentru obiecte și pentru bare, textul stă pe suprafețe solide.** Panourile au 94% opacitate, iar textul trece AA și fără blur.
4. **Un singur material cald.** Doar „Ce m-a crescut” e cald și mat. Dacă se folosește peste tot, își pierde sensul.

### Tipografie
| Rol | Font | Unde |
|---|---|---|
| Display | **Unbounded** 300/400/500 | titluri, numele obiectelor din carduri, cifre mari |
| Text | **Onest** 400/500/600 | tot textul de citit, butoane |
| Date | **JetBrains Mono** 400/500 | etichete, jurnal, stadii, eyebrow (majuscule, spațiere .1em) |
| Inscripție și povești | **Fraunces** (opsz 9–144, 300–500, italic) | doar inscripția misiunii și camera „Ce m-a crescut” |

Mărimi: titlu principal `clamp(28px, 3.1vw, 46px)` / 1.08; titlu de panou `clamp(24px, 2.4vw, 32px)`; text 16–17 px / 1.5; etichete 11–12 px mono. Toate de pe Google Fonts, cu `display=swap`.

### Culori (tokens în `:root`)
| Token | Valoare | Rol | Contrast verificat |
|---|---|---|---|
| `--space` | `#070910` | fundalul atelierului | – |
| `--panel` / `--panel-solid` | `rgba(16,19,30,.94)` / `#10131E` | panouri, carduri, bare | – |
| `--text` | `#F3F1EC` | text principal | 16,4:1 pe panou |
| `--muted` | `#AEB3C4` | text secundar | 8,9:1 pe panou, 9,5:1 pe fundal, 9,2:1 pe fundalul cald |
| `--mint` | `#7CF5C8` | accent: agenți, focus, butonul principal | 13,9:1 pe panou; text `#06110C` pe mint 14,4:1 |
| `--amber` | `#FFC37A` | oameni (în jurnal), camera caldă | 11,8:1 pe panou |
| `--coral` | `#FF8A65` | „blocat”, acul busolei | 8,0:1 pe panou |
| `--paper` / `--ink` | `#F3EBDF` / `#2A1F17` | „Ce m-a crescut” | 13,6:1 |
| `--ink-muted` | `#6B5646` | text secundar pe hârtie | 5,8:1 |
| brun titlu de mișcare | `#8A4F27` | etichetele din poveste | 5,5:1 |

Lumina caldă din 3D (nu e text): fundal `#160D08`, lumină `#FFB37A`/`#FF9A4A`.

### Materiale
| Material | Unde | Desktop | Telefon |
|---|---|---|---|
| **Sticlă** | obiectele, busola | `MeshPhysicalMaterial` cu `transmission`, iridescență ușoară, tentă pe obiect | fără `transmission`: transparență + clearcoat (mai ieftin) |
| **Sticlă UI** | panouri, bara de jos, cardul invenției | `backdrop-filter: blur(18–24px) saturate(1.3)` peste 94% opacitate | la fel |
| **Solid** | fallback: fără `backdrop-filter` sau `prefers-reduced-transparency` | `#10131E` opac | la fel |
| **Piatră caldă** | doar „Ce m-a crescut” | mat (`roughness .85`), emisie caldă slabă | la fel |
| **Hârtie** | doar panoul „Ce m-a crescut” | `#F3EBDF`, fără blur | la fel |
| **Lumină** | agenți (mentă), lumina camerelor pe planșă, poduri | sprite-uri aditive, fără lumini reale în plus | la fel |

### Mișcare
| Ce | Durată | Easing |
|---|---|---|
| Intrarea prin prag | 2,2 s, o singură dată | cubic out |
| Desfă invenția | ~1 s (amortizare k=3,2) | exponențial |
| Intră în Live (luminițele se așază) | ~1,2 s (k=2,6) | exponențial |
| Lumina caldă | ~1,4 s (k=2,2) | exponențial |
| Impulsul unui task | 1,1 s | ease-in-out, arc |
| Pod nou | 0,9 s, se construiește de la un capăt | liniar |
| Panouri, bare | 0,35–0,45 s | `cubic-bezier(.2,.7,.1,1)` |
| Inscripția | apare după 1,3 s, în 1,4 s | același |

**Mișcare redusă** (`prefers-reduced-motion`): fără prag, orbită, plutire sau impulsuri. Totul ajunge direct în poziția finală, iar jurnalul pornește oprit. Codul tratează cazul peste tot. Nu l-am putut emula în browserul integrat, deci Mike îl testează din setările sistemului.

### Aranjare
- **Desktop:** introducerea în stânga sus, Rezervă și ticker-ul în dreapta sus, cardul invenției în stânga jos, bara cu cele două familii jos pe centru, panourile în dreapta (420 px; 480 px pentru hârtie).
- **Telefon (≤ 760 px):** toate cele 7 categorii pe două rânduri, fără derulare. Când e ceva deschis, bara devine un singur rând derulabil, introducerea se ascunde, iar obiectul ales urcă deasupra panoului. Panoul se deschide de jos (max. 62% din înălțime; 46% în Live, ca rețeaua să se vadă). Pe telefoanele scunde (≤ 740 px) dispare ticker-ul (Live rămâne în bară), nu textul.
- Elementele ascunse ies și din ordinea de Tab (`visibility: hidden`). La închiderea unui panou, focusul revine pe butonul din bară.

---

## Diferențe față de arhitectura v2 (Radu, D-028)
| Cerința | În prototip | De ce |
|---|---|---|
| Panoul Live arată ultimele **3** rânduri | arată „Pe banc acum” (3) + ultimele **12** rânduri, cu derulare | Alex a cerut explicit feed-ul cu ultimele taskuri. 3 rânduri nu se simt ca un feed. Propun: 3 pe pagina principală, feed în panou. **De decis cu Radu** |
| Rândurile au **ora reală** | doar ziua | în prototip ora nu e reală (regula Mariei). Pe site, ora apare când vine din date |
| Luminiță stinsă = fără rând în 24 h | toate aprinse | în prototip toți agenții au rânduri. Forma pentru „stinsă”: sprite la 25% și fără puls (de implementat de Mike) |
| Rândurile cu Alex | tratate ca rândurile cu oameni (după 24 h, fără impulsuri) | regula scrisă e pentru colaboratori. Am aplicat-o și lui Alex ca să nu arate „Alex e activ acum”. **De confirmat cu Radu și Maria** |
| Propoziția „pod” pe fiecare cameră | lipsește | textele din `misiunea-v0.md` (secțiunea 3) sunt descrieri interne, despre Alex, la persoana a treia. Pentru panou trebuie versiunea lui Maria, în vocea lui Alex. Câmpul e gata să le primească |
| „Despre” din titlu sau din bară | ambele: numele din introducere e link, iar „Despre mine” e ultimul în bară, separat, fără obiect | conform 1.5 |

Momentele wow nu sunt afectate de nicio diferență.

---

## Riscuri
1. **Al doilea wow promite date reale.** Rețeaua Live e spectaculoasă doar dacă jurnalul e viu. Cu 2 rânduri pe săptămână, devine o scenă goală. Regula lui Radu, „luminiță stinsă, fără text inventat”, e corectă, dar înseamnă că Live poate arăta pustiu. Recomand: Live apare ca obiect pe orbită doar dacă jurnalul are rânduri în ultimele 7 zile.
2. **Performanța pe Android-uri medii e încă nemăsurată.** Browserul integrat nu are GPU real. Bugetul de verificat: ≥ 45 de cadre/s pe un Android de gamă medie, cu Live deschis.
3. **Contrastul cald/rece poate părea alt site.** Camera „Ce m-a crescut” e intenționat diferită. Dacă Alex o simte ruptă de restul, scădem diferența din panou (hârtie mai închisă), nu din lumină.
4. **Numele familiilor sunt de lucru.** „Drumuri directe” și „Camerele atelierului” apar doar fără 3D și le decide Maria.
5. **Etichetele sunt lungi pe telefon.** „Ce m-a crescut” încape la 360 px, dar strâns. Un nume mai lung de ~16 caractere ar rupe rândul camerelor.
6. **Poduri invizibile pentru cine nu explorează.** E în regulă: gestul e o răsplată, nu o instrucțiune. Dar nu are echivalent fără 3D. În varianta fără 3D, misiunea rămâne doar inscripția.
7. **Mișcare redusă și Safari** sunt testate doar prin cod (vezi și `prefers-reduced-transparency`, nesuportat în Safari: de aceea panourile trec AA și fără el).

## Cost pentru Mike
Rămâne **mare**, ca în v1, cu trei adăugiri:

| Bucată | Efort | Note |
|---|---|---|
| Scena (din v1) + 7 obiecte, două familii | mare | majoritatea codului există în prototip |
| Live: rețea, impulsuri, jurnal | mediu | 3D-ul e ieftin (sprite-uri și linii). Partea grea e **sursa de date** (`live.json` din `taskuri.md` la build, taskurile T-009 și T-011) și filtrul pentru oameni (24 h, rol, acord) |
| Învață: plăci + accordion în straturi | mic | `<details>` nativ, accesibil |
| Ce m-a crescut: lumina caldă + panoul de hârtie | mic | interpolare de culori, fără lumini noi |
| Poduri | foarte mic | — |
| Fără 3D: carduri din aceeași listă | mic | se generează din `categorii.yml` |
| Testare pe telefon real, mișcare redusă, Safari | mediu | obligatoriu înainte de lansare |

Fiecare invenție nouă tot cere straturi pentru „Desfă invenția” (câmpul `straturi` din D-028). Recomand un șablon generic „obiect în straturi” (discuri cu etichete), ca să nu trebuiască un model 3D la fiecare lansare.

## Ce am nevoie
- **De la Alex:** dacă al doilea wow (Intră în Live) rămâne; dacă piatra caldă și hârtia îl reprezintă pentru „Ce m-a crescut”; dacă vrea perspectiva rotită din Învață în v3.
- **De la Maria:** propoziția „pod” pentru fiecare cameră, în vocea lui Alex; numele celor două familii.
- **De la Radu:** câte rânduri arată panoul Live; dacă rândurile lui Alex intră sub regula de 24 h.
- **De la Mike:** testul pe un Android mediu și pe iPhone, cu mișcare redusă din setări.

## Tehnic
- Un singur fișier HTML. CDN-uri permise, versiuni fixe: three.js `0.160.0` (jsDelivr, `three.module.min.js` și `RoomEnvironment.js`), fonturi de pe Google Fonts.
- Verificat în browserul integrat: desktop 1440 × 900, telefon 375 × 812 și 360 × 667, cu și fără 3D. Zero erori în consolă. Fără scroll orizontal.
- Ca să-l pornești local: `.claude/launch.json` are configurația `documente-ioana` (server static pe portul 8765, doar pentru `team/ioana/documente`).
