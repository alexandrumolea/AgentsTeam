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

- 2026-11-15: Rutina de dimineață merge pe GitHub Actions (secret CLAUDE_CODE_OAUTH_TOKEN, scope workflow). Lecții: tokenul trebuie lipit pe un singur rând; agenții se pornesc în prim-plan (run_in_background: false), altfel munca se pierde la finalul rulării. Prima rulare completă: issue #2, 4 taskuri gata.

- 2026-11-15: Cartea rămâne în backlog, cu prioritate după site (D-035 corectată). Alex vrea să fie întrebat de ea. PRIORITATEA NR. 1 (D-036): site-ul v1 pe GitHub Pages. Ordinea logică e în docs/prioritati.md, nu vechimea.

- 2026-11-15: Site-ul = centralizator (D-037). Dacă devine comercial, îl mutăm de pe GitHub Pages. Adresa NU va fi sub /AgentsTeam/ (D-038): domeniu propriu sau alexandrumolea.github.io.

- 2026-11-15: SITE-UL V1 E LIVE: https://alexandrumolea.github.io/AgentsTeam/ (workflow site.yml, poarta: domeniu sau publica_pe_link_github). Urmează domeniul alexandrumolea.com (docs/domeniu.md): setezi custom domain în Settings → Pages, pentru că CNAME-ul e ignorat la publicarea prin Actions.

- 2026-11-15: Misiunea v2 (D-039) și camerele redenumite (D-040: Innovations, Latest Workshops, Knowledge Base). Alex a întrebat de unde vine „coach, fondator și inventator”: aștept formularea lui.

## Stare proiect
- Etapa curentă: 1. Onboarding Alex (vezi docs/charter.md). Așteaptă alegeri de la Alex: direcția vizuală A/B, numele Atelier, taxonomia nevoilor.
- Repo pe GitHub, public: https://github.com/alexandrumolea/AgentsTeam. gh CLI e în ~/.local/bin, logat ca alexandrumolea, iar git folosește credențialele gh. Push după fiecare commit; hook-ul pre-push verifică datele private. Commit-urile folosesc adresa noreply GitHub.

## Deschis
- Vezi `docs/intrebari-pentru-alex.md`.

- 2026-11-15: rutina (rulare repetată): T-002, T-003 (Mike), T-004 (Maria), T-005 (Victor) gata. Taskurile „în lucru” rămase fără agent se resetează pe „de făcut”. Patch-ul verificării generatorului așteaptă o sesiune cu drept pe scripts/.

- 2026-11-16: Rutina de dimineață mutată la 7:30 ora României, tot anul (D-041). Alex se aștepta la 7:30; ora veche era 9:00. GitHub poate întârzia rulările programate cu 5–30 min.

- 2026-11-16: camera poveștilor = „My Journey” (D-042). Cinci nume publice sunt în engleză (Innovations, Latest Workshops, Knowledge Base, My Journey, Live); restul site-ului e în română.

- 2026-11-16: Alex a dat 4 dorințe noi: BEMORE (nesigur), aplicații în Innovations cu MyAgenda prima, vânzarea Wise Teams cu echipă proprie, cursul Change & Self Management with AI cu echipă proprie. Notate I-015…I-019, harta în team/tudor/documente/harta-2026-11-16.md. Alex numește echipa noastră „CORE”. Propus de pornit: I-019 (modelul de echipe) și I-016 (MyAgenda). D-043 (repo privat) de luat.

- 2026-11-16: PRIORITATEA NR. 1 (D-044): workshop-urile Change Agility (23.11) și Self-management în relația cu AI (25.11), din cursul I-018. Echipa Studio propusă (D-045): Daria, Matei, Irina. Skill-urile lui Alex pentru training: training-flow-design, innersis-ive, bemore-ls-ive (cont claude.ai, nu pe disc). Materialele pentru client nu intră în repo-ul public; numele clientului e doar în agent-memory-local.

- 2026-11-16: Alex a cumpărat alexandrumolea.com (GoDaddy, D-046); aștept DNS-ul și verificarea lui în GitHub, apoi leg domeniul. Roluri (D-047): BEMORE owner, Wise Teams partener, Innersis Leadership Trainer, LIFT colaborator. Coaching: față în față și online, oameni și echipe, prima conversație gratuită; lipsește linkul de rezervare (întrebarea 45). Lista de tool-uri: amânată de Alex.

- 2026-11-16: SITE-UL E LIVE PE https://alexandrumolea.com (D-046). Custom domain setat prin API, HTTPS obligatoriu, github.io redirecționează. Lipsește CNAME www → alexandrumolea.github.io (Alex). Build-ul folosește domeniul din site.yml pentru adresa publică.

- 2026-11-16: www CNAME pus de Alex; se propagă. Certificatul HTTPS nu include încă www (T-021: verific la următoarea sesiune; dacă lipsește după 24 h, scot și repun domeniul).
