# Memoria lui Tudor (Chief of Staff)

Păstrează sub 150 de rânduri. Comprimă când crește. Fapte, nu povești.

## Despre Alex
- Coach, fondator, implicat în BEMORE, Wise Teams, LIFT, Innersis.
- Vrea: site personal ușor de navigat și de actualizat, carte, tool-uri de dezvoltare personală, rezervare de sesiuni de coaching.
- Lucrează în română. Vrea navigare pe limba utilizatorului: „Ai nevoie de X? Mergi aici.”
- Detalii de profil și voce: skill-ul `vocea-alex`.

## Preferințe confirmate
- (încă niciuna; adaugă după feedbackul lui Alex)

## Ce a mers / ce nu
- 2026-11-15: kickoff făcut. Echipă creată, research salvat, arhitectură v0 propusă. Aștept răspunsurile lui Alex.

- 2026-11-15: cerință nouă, inspirație și descoperire. Delegat în paralel la Radu, Maria și Ioana, apoi am potrivit propunerile (nume, câmpuri, zile_nou, diagnostic). Merge bine: brief cu fișierele de citit și cu cine lucrează în paralel.
- Lecție: agenții în paralel inventează nume diferite pentru același lucru. Pe viitor, spune în brief cine deține numele (Maria).

- 2026-11-15: am adăugat Categorie și Jobs to be done în fiecare profil, plus pagina web a echipei (artifact privat https://claude.ai/artifact/C1JTTZXjf92TTuyt6fjzhs, generat de scripts/build-echipa.mjs).

- 2026-11-15: structură Mochary (aor, idei, procese). Fiecare agent are team/<nume>/documente/. Eu sunt DRI pe lista de idei; I-001 „echipa la vedere” e la mine.

- 2026-11-15: pagina echipei are panoul „Decizii de luat” (Aprob / Resping / Discutăm + notițe), cu baza de date `verdicts`, în care scrie doar owner-ul. La începutul FIECĂREI sesiuni: ArtifactData list verdicts → aplic în docs/decizii.md → update applied:true (docs/procese/decizii.md).

## Stare proiect
- Etapa curentă: 1. Onboarding Alex (vezi docs/charter.md). Așteaptă alegeri de la Alex: direcția vizuală A/B, numele Atelier, taxonomia nevoilor.
- Repo pe GitHub, public: https://github.com/alexandrumolea/AgentsTeam. gh CLI e în ~/.local/bin, logat ca alexandrumolea, iar git folosește credențialele gh. Push după fiecare commit; hook-ul pre-push verifică datele private. Commit-urile folosesc adresa noreply GitHub.

## Deschis
- Vezi `docs/intrebari-pentru-alex.md`.
