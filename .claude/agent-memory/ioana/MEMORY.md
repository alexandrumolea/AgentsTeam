# Memoria lui Ioana (Designer UI/UX)

> **Regula datelor (de la 2026-11-15):** fiecare intrare nouă începe cu data adăugării, `AAAA-LL-ZZ:`. Intrările de mai jos fără dată au fost adăugate pe 2026-11-15.

Păstrează sub 150 de rânduri. Comprimă când crește. Fapte, nu povești.

## Despre Alex
- Coach, fondator, inventator. Implicat în BEMORE, Wise Teams, LIFT, Innersis. Construiește tool-uri, aplicații, cursuri; conduce o echipă de agenți AI.
- Vrea: site ușor de navigat și de actualizat, carte, tool-uri, rezervare de sesiuni de coaching.
- Lucrează în română. Navigare pe limba utilizatorului: „Ai nevoie de X? Mergi aici.”
- Detalii de profil și voce: skill-ul `vocea-alex`.
- 2026-11-15: Misiunea lui (D-026) e fundația: „Necunoscutul creează monștri. Educația creează poduri.” Nu o ilustra la propriu, nu o reformula pe site (formulările sunt ale Mariei).

## Preferințe confirmate
- [Inovație, nu calm](feedback_inovatie-nu-calm.md) — „prea banale” (2026-11-15); vrea viitor, un wow clar; a11y și viteza sunt limite
- 2026-11-15: Alex a ales **Spațiu** (D-023): „Ioana a făcut treabă bună acum.”
- 2026-11-15: I-au plăcut: feed-ul cu taskurile dintre agenți (din Sistem viu), introducerea scrisă din mock (păstreaz-o exact), metafora „acces în atelierul meu de inovație, work & living”.

## Ce a mers / ce nu
- Mock HTML cu comutator între direcții = mod bun de a-l lăsa pe Alex să aleagă.
- Capcană în mock-uri: `.hero{padding:X 0}` suprascrie padding-ul lateral din `.wrap`. Folosește padding-top/bottom.
- Browserul integrat ascuns încetinește rAF, tranzițiile și WAAPI aproape până la zero. Pentru animații: `show_pane preview`, `dt` limitat generos (0,2–0,25 s) și o plasă `setTimeout` care termină animațiile critice.
- 2026-11-15: WebGL în browserul integrat rulează ~3–4 cadre/s chiar și vizibil (fără GPU real, la fel și v1). Nu măsura performanța 3D acolo; cere test pe telefon real.
- 2026-11-15: `element.focus()` din JS nu declanșează `focusin` dacă documentul nu are focus. Testează focusul cu click real + Tab.
- 2026-11-15: Elementele ascunse cu `opacity:0` rămân în ordinea de Tab. Adaugă `visibility:hidden` cu tranziție întârziată.
- 2026-11-15: Pe mobil, cu panou deschis, ascunde titlul și ridică obiectul ales deasupra panoului (altfel scena dispare sub panou).
- 2026-11-15: Brief-ul s-a schimbat de 5 ori în timpul sarcinii (colegii lucrează în paralel). Construiește în straturi, iar ID-urile din `docs/taskuri.md` le verifici chiar înainte de scriere.
- Tranziția CSS a `clip-path` cu `var()` nu s-a desenat în Chromium; WAAPI cu valori explicite merge.

## Proiecte și referințe
- [Spațiu v2](project_spatial-v2.md) — prototipul curent; deschise: rândurile din Live, propoziția „pod”, test pe telefon
- [Direcții v1](project_directii-v1.md) — Dialog / Spațiu / Sistem viu; Alex a ales Spațiu
- [Descoperire v0](project_descoperire-v0.md) — logica UX rămâne; stilul A/B respins
- [Suport browsere sticlă](reference_browser-support-glass.md) — Safari nu suportă prefers-reduced-transparency

## Deschis
- Vezi `docs/intrebari-pentru-alex.md`.
- Profilul meu (`team/ioana/profil.md`, „calm”) și estetica din `vocea-alex` trebuie actualizate după feedback (T-006 la Maria; profilul, semnalat lui Tudor).
