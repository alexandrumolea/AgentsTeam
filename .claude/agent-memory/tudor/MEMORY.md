# Memoria lui Tudor (Chief of Staff)

> **Regula datelor (de la 2026-11-15):** fiecare intrare nouă începe cu data adăugării, `AAAA-LL-ZZ:`. Intrările de mai jos fără dată au fost adăugate pe 2026-11-15.

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

- 2026-11-15: SCOP EXTINS (D-024): conducem business-ul lui Alex în ansamblu, iar site-ul e doar oglinda. Prioritate: obiectivele pe business (întrebările 23–26) și rolurile care lipsesc (I-009, T-007).
- 2026-11-15: Regulă de la Alex: orice intrare în orice memorie începe cu data adăugării.
- 2026-11-15: Ioana a livrat prototipurile v1 (Viu, Dialog, Spațiu). Alex alege la D-023 când ajunge la calculator. Push-ul workflow-ului e blocat: lipsește scope-ul `workflow`, iar codul de refresh a expirat; trebuie generat altul.

- 2026-11-15: Alex a ales direcția Spațiu (D-023). I-au plăcut și feed-ul live cu taskurile dintre agenți (din prototipul Sistem viu) și ideea de Povești trimestriale (I-012, DRI Maria). Radu, Maria și Ioana lucrează la v2 cu aceste cerințe.

- 2026-11-15: MISIUNEA lui Alex (D-026), citat exact în charter și vocea-alex: educația care face bine, fiecărei persoane și între oameni. „Necunoscutul creează monștri. Educația creează poduri.” Tot ce facem pornește de aici.

- 2026-11-15: REGULĂ Alex: ideile noi intră în backlog (`docs/idei.md`, status „nouă”), nu le implementăm pe toate odată. La triere propun cel mult 1–2, iar Alex alege. Excepție: dacă Alex cere explicit să pornim.

- 2026-11-15: MODEL DE LUCRU (D-029): fiecare flux devine, pe parcurs, proces automat din GitHub. Alex doar revizuiește (PR pentru nivelurile 2–3). Agenți noi unde un proces trebuie să meargă cap-coadă. Șablon: docs/procese/automatizare.md.

- 2026-11-15: Alex se descrie ca „curious mind”. Notat în vocea-alex. Folosirea publică o decide Maria (T-016).

## Stare proiect
- Etapa curentă: 1. Onboarding Alex (vezi docs/charter.md). Așteaptă alegeri de la Alex: direcția vizuală A/B, numele Atelier, taxonomia nevoilor.
- Repo pe GitHub, public: https://github.com/alexandrumolea/AgentsTeam. gh CLI e în ~/.local/bin, logat ca alexandrumolea, iar git folosește credențialele gh. Push după fiecare commit; hook-ul pre-push verifică datele private. Commit-urile folosesc adresa noreply GitHub.

## Deschis
- Vezi `docs/intrebari-pentru-alex.md`.
