# Memoria lui Ioana (Designer UI/UX)

> **Regula datelor (de la 2026-11-15):** fiecare intrare nouă începe cu data adăugării, `AAAA-LL-ZZ:`. Intrările de mai jos fără dată au fost adăugate pe 2026-11-15.

Păstrează sub 150 de rânduri. Comprimă când crește. Fapte, nu povești.

## Despre Alex
- Coach, fondator, inventator. Implicat în BEMORE, Wise Teams, LIFT, Innersis. Construiește tool-uri, aplicații, cursuri; conduce o echipă de agenți AI.
- Vrea: site ușor de navigat și de actualizat, carte, tool-uri, rezervare de sesiuni de coaching.
- Lucrează în română. Navigare pe limba utilizatorului: „Ai nevoie de X? Mergi aici.”
- Detalii de profil și voce: skill-ul `vocea-alex`.

## Preferințe confirmate
- [Inovație, nu calm](feedback_inovatie-nu-calm.md) — „prea banale” (2026-11-15); vrea viitor, un wow clar; a11y și viteza sunt limite

## Ce a mers / ce nu
- Mock HTML cu comutator între direcții = mod bun de a-l lăsa pe Alex să aleagă (păstrat în v1 ca bară de legături).
- Capcană în mock-uri: `.hero{padding:X 0}` suprascrie padding-ul lateral din `.wrap`. Folosește padding-top/bottom.
- Browserul integrat ascuns încetinește rAF, tranzițiile și WAAPI aproape până la zero. Pentru animații: `show_pane preview`, pas `dt` limitat generos (0,2–0,25 s) și o plasă `setTimeout` care termină animațiile critice.
- Tranziția CSS a `clip-path` cu `var()` nu s-a desenat în Chromium; WAAPI cu valori explicite merge.

## Proiecte și referințe
- [Direcții v1](project_directii-v1.md) — Dialog / Spațiu / Sistem viu; recomand Sistem viu; așteaptă alegerea lui Alex
- [Descoperire v0](project_descoperire-v0.md) — logica UX rămâne; stilul A/B respins
- [Suport browsere sticlă](reference_browser-support-glass.md) — Safari nu suportă prefers-reduced-transparency

## Deschis
- Vezi `docs/intrebari-pentru-alex.md`.
- Profilul meu (`team/ioana/profil.md`, „calm”) și estetica din `vocea-alex` trebuie actualizate după feedback (semnalat lui Tudor).
- 2026-11-15: Alex a ales direcția **Spațiu** (D-023): „Mă inspiră varianta spațială. Pe direcția aceea vom merge. Ioana a făcut treabă bună acum.” Asta confirmă lecția: inovație și viitor, nu sigur și calm.
