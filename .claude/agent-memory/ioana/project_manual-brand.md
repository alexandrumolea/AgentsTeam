---
name: project-manual-brand
description: Manualul de brand BEMORE v1 (I-022, 2026-11-17): Sora e noul branding BEMORE (D-057), Sora la titluri + Inter Tight la text; tema de curs bemore.css (T-028)
metadata:
  type: project
---
Adăugat: 2026-11-17

2026-11-17: Livrat `team/ioana/documente/manual-brand-v1.md` + `manual-brand-v1.html` (planșe, nepublicat; îl publică Tudor) și `curs/tema/bemore.css` (T-028, gata). Maria are poziționarea în `team/maria/documente/manual-brand-pozitionare-v1.md`; nu dubla, trimite la secțiunile ei 2 și 3.
- D-057 (Alex): „Designul Sora cu cele 2 tipuri de scris e noul branding bemore.” Sora la titluri și cifre mari (nu sub 26 px), Inter Tight la text (lecția 20 px / 1,7). Site-ul lui Alex îl folosește ca owner; diferă doar semnătura și vocea. „Sora peste tot” din v3.1 nu mai e valabil.
- Ecranele din sală BEMORE: teorie Ceață `#F3EEF6`, exercițiu alb + panou piersică `#F7B79A`, reflecție Noapte `#0D1333`, mesaj cheie = singurul gradient (cer deschis → cer → lavandă), pauză masă sage `#E9EFE4`. Fără sticlă și granulație pe proiector.
- Deschise: semnul BEMORE (logo vechi sau cuvântul în Sora cu punct), semnătura de pe site, soarta `bemore-ls-ive` (întrebări la Maria, §13 din manual). T-031 (`--font-titlu` în stil.css), T-032 (test pe proiector și tipar).

**Why:** Alex a întrebat dacă regulile mele pot fi folosite de echipa de training; erau împrăștiate în v2, v3 și slide-tipuri. Brief-ul s-a schimbat de două ori în timpul sarcinii (D-055, apoi D-057).
**How to apply:** orice material BEMORE pornește din manual; valorile pentru site le citești din `content/tema.yml`, pentru sală din `curs/tema/bemore.css`. Legat de [[project-design-v2]], [[feedback-scris-mic]].

2026-11-17 (tehnic): Fonturile sunt în `site/node_modules/@fontsource-variable/{sora,inter-tight}` (Mike, OFL); nu e nevoie de descărcare. Generatorul de curs inline-uiește tema în HTML, deci fonturile intră ca `data:` woff2 (latin + latin-ext, ~250 KB). `stil.css` vine după temă: pentru override în temă folosește `:root .selector`. Sora e cu ~11 % mai lată decât Helvetica: cronometrul din panou a trecut de la 150 la 124 px.

2026-11-17 (Despre): Alex nu-și place poza „pusă” ca dreptunghi plutitor; a cerut cerc „sau altă formă” și a spus că pe home elementele din drafturile mele erau „mai futuristice” (Mike reface obiectele după v3.1). Am adăugat în §7 lentila pentru „Despre mine” (cer → piersică, verticală, punctul-semnătură în centru, hover: se întoarce spre tine). Variantele pozei: `poza-forme-v1.html` (A cerc, B arcadă, C lentilă = cerc cu ramă de sticlă și halo; recomand C). §8 se schimbă doar după alegerea lui Alex. Decupaje pe original 900 × 1200: pătrat x 60, y 250, 560; 4 : 5 x 40, y 60, 600 × 750 (sub y ≈ 815 apare textul de pe tricou).
