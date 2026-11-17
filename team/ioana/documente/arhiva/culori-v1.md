# Culorile atelierului, v1

Autor: Ioana. Data: 2026-11-17. Status: propunere, așteaptă alegerea lui Alex (nivel 2).
Pagina de comparat: [culori-v1.html](culori-v1.html). Nimic din `site/` nu s-a schimbat.

## Cererea
Alex, 2026-11-17: „Nu-mi dau seama dacă la culori lucrurile au sens. Și nici nu știu cum să aleg.”
Feedback venit în timpul lucrului, tot de la Alex, în aceeași zi:
1. „Fiind foarte închis la culori, eu îmi doresc să pun și niște cursuri online și nu mi se pare la fel de plăcut pentru ochi, ca oamenii să-și dorească să parcurgă un curs online pe site.”
2. „Îmi place că este compact.”
3. „Îmi place că este interactiv, dinamic.”

Ce înseamnă: problema de fond e cât de închis e site-ul, nu doar sensul culorilor. Nicio variantă nu pierde scena 3D, mișcarea sau densitatea.

## Diagnostic, pe scurt

**Contrastul e bun peste tot (WCAG AA trecut cu rezervă):**

| Pereche | Raport | AA (4,5:1) |
|---|---|---|
| Text `#F3F1EC` pe fundal `#070910` | 17,6:1 | da |
| Text secundar `#AEB3C4` pe panou `#10131E` | 8,9:1 | da |
| Mentă `#7CF5C8` pe panou | 13,9:1 | da |
| Scris pe buton `#06110C` pe mentă | 14,4:1 | da |
| Chihlimbar `#FFC37A` pe panou | 11,8:1 | da |
| Coral `#FF8A65` pe panou | 8,0:1 | da |
| Cerneală `#2A1F17` pe hârtie `#F3EBDF` | 13,6:1 | da |
| Maro `#8A4F27` pe hârtie | 5,5:1 | da |
| Linia `#C98B5E` pe hârtie | 2,4:1 | decorativă, nu e text |

**Ce nu are sens:**
1. **Totul e pe noapte.** Pentru scena 3D e bine. Pentru lecții de 10–20 de minute nu: majoritatea oamenilor citesc mai repede și mai corect text închis pe fundal deschis (vezi Surse).
2. **Menta face nouă treburi:** butonul, linkurile, numele mărcii, „în lucru”, „gata”, „în pregătire”, agenții, etichetele, focusul. Butonul principal concurează cu tot restul.
3. **„În lucru” și „gata” au aceeași culoare** (diferă doar conturul față de umplutură).
4. **Daltonism roșu-verde (cam 1 din 12 bărbați):** menta devine aproape albă, ca textul (diferență ΔE 9,8), iar chihlimbarul („om”) și coralul („blocat”) devin două nuanțe de galben (ΔE 11,8). Simulare Machado 2009, calculată de mine.
5. **Alex are două culori:** numele lui e alb în Live, dar „așteaptă decizia lui Alex” e chihlimbar, iar oamenii din scenă sunt chihlimbar.
6. **Culori fără nume:** maroul din My Journey (`#C98B5E`, `#8A4F27`), fundalul `#121833`, fundalul cald din scenă `#160D08`, luminile portocalii, culorile planșei. Mike le mută acum în tokeni.

**Ce are sens:** My Journey ca singura cameră caldă (hârtie, serif); chihlimbar pentru oameni și coral pentru blocaje, ca idee.

## Regulile de sens (aceleași în toate variantele)

| Rol | Ce înseamnă | Unde apare | Unde NU mai apare |
|---|---|---|---|
| `--accent` | aici apeși, se lucrează acum | butonul principal, „în lucru”, agenții AI, focusul, punctul Live | marca „Alex · Atelier”, linkurile în repaus, etichete, „gata”, „în pregătire” |
| `--human` | un om, inclusiv Alex | numele oamenilor și al lui Alex, „așteaptă decizia lui Alex” | |
| `--alert` | blocat | doar statusul „blocat” | decorul din fallback-ul fără 3D |
| `--muted` | informație liniștită | „gata” (cu ✓), „propus”, „în pregătire” (contur punctat), etichete | |

Culoarea nu poartă singură sensul (WCAG 1.4.1): „în lucru” are punct, „om” are romb, „gata” are ✓, „blocat” are „!”, iar toate au cuvântul scris.

## Variantele

### A · Laborator (reper)
Site-ul de azi, pus în ordine. Totul rămâne pe noapte, inclusiv lecțiile. Nu o recomand; e reperul cu care compari.

| Rol | Valoare | Contrast |
|---|---|---|
| bg / bg-glow / surface | `#070910` / `#121833` / `#10131E` | |
| text / muted | `#F3F1EC` / `#AEB3C4` | 16,4 / 8,9 pe surface |
| accent / on-accent | `#7CF5C8` / `#06110C` | 13,9 / 14,4 |
| human / alert | `#FFC37A` / `#FF8A65` | 11,8 / 8,0 |
| warm-bg / warm-text / warm-muted / warm-accent / warm-line | `#F3EBDF` / `#2A1F17` / `#6B5646` / `#8A4F27` / `#C98B5E` | 13,6 / 5,8 / 5,5 |
| page-* | la fel ca scena (închis) | |

### B · Noapte și zi (recomandată)
Scena rămâne noaptea, albastru-cerneală cu lumină de lămâie pentru oameni. Paginile de citit și lecțiile trec pe lumină. Regula: **scena e noaptea; orice pagină pe care o citești e ziua.** Panourile scurte de peste scenă rămân închise; paginile interioare (Live, Despre, camerele, cursurile) sunt deschise, cu banda de sus în albastrul nopții, ca legătură.

Scena și panourile (închis):

| Rol | Valoare | Contrast |
|---|---|---|
| bg / bg-glow / surface | `#0A1626` / `#16305A` / `#0F1D31` | |
| text / muted | `#F4F1EA` / `#A9B8D6` | 15,0 / 8,5 pe surface |
| accent / on-accent | `#8DB4F7` / `#0A1626` | 8,1 / 8,7 |
| human / alert | `#F1C436` / `#FF8A9A` | 10,2 / 7,5 |
| warm-bg / warm-text / warm-muted / warm-accent / warm-line | `#F2ECE1` / `#2A2620` / `#6E6658` / `#7A5200` / `#C9A21F` | 12,8 / 4,8 / 5,9 |

Paginile și lecțiile (deschis):

| Rol | Valoare | Contrast |
|---|---|---|
| page-bg / page-surface | `#F3F5F8` / `#FFFFFF` | |
| page-text / page-muted | `#13233D` / `#556178` | 14,4 / 5,7 |
| page-accent / page-on-accent | `#2F5FC4` / `#FFFFFF` | 5,4 pe fundal / 5,9 pe buton |
| page-human / page-alert | `#8A6100` / `#B3264F` | 5,1 / 5,8 |
| page-track / bar-bg / bar-text | `#D5DBE5` / `#0A1626` / `#F4F1EA` | |

Daltonism: albastru și lămâie rămân clar diferite (ΔE peste 100 în simulare), la fel lămâie și roz-roșu (ΔE 54).
De unde vine: familia BEMORE LS (Amalfi Tile `#2E5AA7`, Cornflower String `#5C88CD`, Mellow Citron `#F1C436`) și Innersis (cerneală `#0B1E30`). Le înrudesc, nu le copiez: albastrul e mai închis și mai aproape de noapte, cornflower e luminat ca să treacă AA pe închis. Asta respectă regula din `vocea-alex`: site-ul personal prezintă business-urile, nu le copiază.

### C · Planșă
Totul pe lumină: invenția ca desen tehnic, pe hârtie de inginer cu grilă albastră. My Journey devine seara, la lampă (singura cameră închisă).

| Rol | Valoare | Contrast |
|---|---|---|
| bg / surface / grid | `#EDF1F5` / `#FFFFFF` / albastru 7,5% | |
| text / muted | `#0E1A2E` / `#4A5870` | 15,3 / 6,3 pe fundal |
| accent / on-accent | `#1F4FD8` / `#FFFFFF` | 5,8 pe fundal / 6,6 pe buton |
| human / alert | `#9A5A00` / `#B3264F` | 4,8 / 5,6 pe fundal |
| warm-bg / warm-text / warm-muted / warm-accent / warm-line | `#1C1510` / `#F3E9DC` / `#C2B19C` / `#F2A65E` / `#9A6438` | 15,0 / 8,6 / 8,9 |
| page-* | la fel ca scena | |

Am ales roz-roșu (`#B3264F`) pentru „blocat” în loc de roșu-cărămiziu, pentru că `#C2362B` se amesteca cu chihlimbarul la daltonism (ΔE 8,7; cu `#B3264F` e 34).

## Merge scena 3D pe fundal deschis?
Am citit `site/src/scena.js`. Pe scurt: **se poate, dar nu e o schimbare de culori, e o refacere.** De aceea varianta luminoasă pe care o recomand acum e hibridul (B).

| Ce e în scenă | Pe fundal închis (A, B) | Pe fundal deschis (C) |
|---|---|---|
| Fundalul și ceața (`scene.background`, `scene.fog`) | token | token, merge direct |
| Planșa (textură desenată în canvas, fundal `#0a0d17`, linii `#1f3b44`, `#141f2e`) | token | token: hârtie deschisă, linii albastre |
| Sticla obiectelor (`MeshPhysicalMaterial` cu `transmission: 1` pe desktop) | merge | sticla lasă fundalul să treacă, deci pe alb obiectele devin palide. Trebuie culori de atenuare mai închise, distanță mai mică, poate muchii |
| Sticla pe telefon (material transparent cu nuanța înmulțită cu 0,35) | merge | pe alb arată ca pete gri; trebuie reglată separat |
| Luminițele agenților și petele de lumină ale camerelor (`AdditiveBlending`) | merge | **nu se văd**: lumina adunată peste alb rămâne alb. Trebuie alt mod de amestec (normal) și culori saturate. Ideea de „luminițe care lucrează” slăbește ziua |
| Inelul și cristalul care strălucesc (`emissive`) | merge | strălucirea se pierde; arată plat |
| Etichetele din scenă (`.tag`, `.ntag`, vigneta din spatele titlului) | fundal închis | trebuie variante deschise |

Concluzie: C cere muncă de cod în scenă și test pe telefon real (memoria mea: browserul integrat nu măsoară 3D corect). B nu atinge logica scenei, doar valorile.

### Rolurile de culoare de care are nevoie scena (pentru Mike)
Le dau pe roluri, ca să le potrivim cu ce face Mike acum în cod.

| Rol | A (azi) | B | Ce face |
|---|---|---|---|
| `--scene-bg` | `#070910` | `#0A1626` | fundal și ceață |
| `--scene-bg-warm` | `#160D08` | `#17120A` | fundal și ceață în My Journey |
| `--scene-sky` / `--scene-ground` | `#9FB4FF` / `#120C08` | `#9FB4FF` / `#120C08` | lumina de emisferă |
| `--scene-sky-warm` | `#FFB37A` | `#FFC970` | emisfera în My Journey |
| `--scene-key` / `--scene-key-warm` | `#FFFFFF` / `#FFD2A8` | `#FFFFFF` / `#FFE2A8` | lumina principală |
| `--scene-glow` | `#7CF5C8` | `#8DB4F7` | lumina din centru = `--accent` |
| `--scene-glow-warm` | `#FF9A4A` | `#F1C436` | lumina din centru în My Journey |
| `--scene-grid-bg` / `--scene-grid-edge` / `--scene-grid-line` | `#0A0D17` / `#1F3B44` / `#141F2E` | `#0B1729` / `#1E3A5C` / `#132640` | planșa |
| `--scene-floor-warm` | `#E0B48E` | `#E6C88E` | nuanța planșei în My Journey |
| `--scene-agent` | `#7CF5C8` | `#8DB4F7` | luminițele agenților = `--accent` |
| `--scene-human` | `#FFC37A` | `#F1C436` | oamenii și Alex = `--human` |
| `--scene-pulse` | `#E6FFF6` | `#EAF1FF` | impulsurile taskurilor |
| `--scene-core` / `--scene-core-emissive` | `#C9FFF0` / `#2FD69C` | `#DCE8FF` / `#4F7FD6` | cristalul și inelul din centru |
| `--scene-pebble` / `--scene-pebble-glow` | `#D9A273` / `#FF8A3D` | `#D9A273` / `#E0A020` | piatra caldă din My Journey |
| nuanțele de sticlă (`#BFEFFF`, `#D8CCFF`, `#FFD2C2`, `#C9FFF0`, `#D6FFF1`, `#D8D2FF`, `#FFE9C2`, `#C9E4FF`, `#FFF3C2`) | la fel | la fel | material, nu sens. Pot rămâne constante; un singur token `--scene-glass-tints` (listă) e de ajuns |

## Recomandarea mea
**B · Noapte și zi.** Păstrează ce îi place lui Alex (scena închisă, vie, compactă), face lecțiile plăcute de citit, dă fiecărei culori un singur sens, rămâne lizibilă pentru daltoniști, iese din tiparul „negru cu verde neon” și îl leagă de BEMORE și Innersis fără să le copieze. Costul e mic: doar valori în tokeni.
C e pasul următor posibil, dacă după B Alex vrea și scena ziua. Atunci planificăm refacerea scenei și testul pe telefon.
Mai târziu (nivel 2, pentru Alex): un comutator de mod închis doar pentru lecții, pentru cei care citesc seara sau au nevoie de el. NN/g recomandă să existe opțiunea, nu să fie implicită.

## Tokenii propuși (de potrivit cu Mike)
Numele sunt pe roluri, nu pe culori, ca varianta aleasă să se aplice dintr-un singur loc.

**Scena și navigarea:** `--bg`, `--bg-glow`, `--surface`, `--glass`, `--line`, `--text`, `--muted`, `--accent`, `--on-accent`, `--human`, `--alert`, `--pressed-bg`, `--pressed-fg`.
**Paginile și lecțiile:** `--page-bg`, `--page-surface`, `--page-line`, `--page-text`, `--page-muted`, `--page-accent`, `--page-on-accent`, `--page-human`, `--page-alert`, `--page-track`, `--bar-bg`, `--bar-text`, `--bar-line`.
**My Journey:** `--warm-bg`, `--warm-text`, `--warm-muted`, `--warm-accent`, `--warm-line` (plus `--scene-bg-warm` etc. în scenă).
**Scena 3D:** tabelul de mai sus (`--scene-*`).
**Statusuri (mapare, nu culori noi):** în lucru → `--accent` + punct; gata → `--muted` + ✓; propus și de făcut → `--muted` / `--text`; așteaptă decizia lui Alex → `--human` + romb; blocat → `--alert` + „!”; în pregătire → `--muted`, contur punctat.
Focusul folosește `--accent` pe scenă și `--page-accent` pe pagini. Sticla rămâne doar pe dock, panouri și cardul din scenă; textul stă pe straturi aproape opace (`--glass` la 0,92), cu fallback solid pentru browsere fără `backdrop-filter` și pentru `prefers-reduced-transparency`.

## Surse
- WCAG 2.2, contrast minim (1.4.3): https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- WCAG 2.2, contrast pentru elemente grafice (1.4.11): https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- WCAG 2.2, culoarea nu e singurul semn (1.4.1): https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
- Nielsen Norman Group, „Dark Mode vs. Light Mode: Which Is Better?”: https://www.nngroup.com/articles/dark-mode/ (rezumă Piepenbrock, Mayr, Mund, Buchner 2013, Ergonomics; Piepenbrock, Mayr, Buchner 2013, Human Factors; recomandă modul închis ca opțiune, nu implicit)
- Machado, Oliveira, Fernandes (2009), „A Physiologically-based Model for Simulation of Color Vision Deficiency”, IEEE TVCG. Modelul folosit pentru simulările de daltonism.
- Colour Blind Awareness, frecvența daltonismului (cam 1 din 12 bărbați): https://www.colourblindawareness.org/colour-blindness/
- Paletele lui Alex: skill-urile `bemore-ls-ive` și `innersis-ive` (contul lui Claude, nu sunt în repo).
- Contrastele și simulările sunt calculate cu formula WCAG; pagina HTML le recalculează din aceleași valori.
