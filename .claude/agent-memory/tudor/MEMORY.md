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

- 2026-11-17: Alex vrea 3 ieșiri pentru cursuri (curs online, material trainer legat de el, schiță). Radu a propus „o sursă, trei ieșiri” (D-048–D-051, de luat). După aprobare: T-022 Mike (generatorul), T-023 Ioana (designul schiței, după 23). În lucru, în paralel, e o altă sesiune pe culori/site (fișiere necomise în site/; nu le comite eu).

- 2026-11-17: Culorile site-ului sunt toate în `content/tema.yml` (Mike); o paletă nouă = un fișier, plus `npm run imagini` pe Mac pentru og.png și iconiță. Ioana a dat 3 variante (https://claude.ai/artifact/BzqmTAH4bYJNh1ZxZ3t7e1), recomandă B „Noapte și zi”; Alex alege (T-024). Alex: site-ul e prea închis pentru cursuri online; îi plac compactul și interactivul.
- 2026-11-17: Alex vrea un Head of Learning (D-052, propus „Andrei”, șeful Studio). Cursuri online cu acces sau cumpărare: I-020, Radu.
- 2026-11-17: LECȚIE: altă sesiune lucrează în paralel în același repo. Înainte să dau un număr nou (D-, I-, T-), verific ultimul număr din fișier chiar atunci; fac commit doar pe fișierele mele.
- 2026-11-17: Alex vrea site-ul „mai aerisit” și design-uri din paleta BEMORE IVE. Ioana: design v2 (https://claude.ai/artifact/H69gfZzRsRoZSd9WKRygVW): A Amalfi, B Planșa, C Lămâia. Alex alege; plus propoziția de pe homepage și fontul (Inter Tight sau Onest). Pagina din dist e servită fără charset local; publicată merge.
- 2026-11-17: Alex a aprobat D-048–D-051 și formatul I-021 (banca de exerciții). Generatorul e în `curs/` (Mike, T-022): banca, agenda din ediție, modul Prezintă testat doar în Chrome. Conținutul real merge în `privat/cursuri/` (ignorat). Aștept: testul lui Alex în Safari, cu proiector și telecomandă; brief-ul 40–44; acordul pentru repo-ul privat.
- 2026-11-17: Alex despre Banca v2 (Ioana): „Bun! Îmi place mai mult acum.” Îi plac listele compacte, cu detalii la cerere și filtre-buton.
- 2026-11-17: Panoul de control (Mike) e sus pe pagina echipei: așteaptă după Alex / în lucru / alt input / terminate, din decizii.md, intrebari-pentru-alex.md, taskuri.md. Ca un task să apară „la Alex”, statusul trebuie să fie „blocat: așteaptă Alex (…)” sau „la Alex (…)”. Multe decizii și întrebări din 15.11 par depășite: de propus curățenie.
- 2026-11-17: Ofertele pentru clienți se scriu doar în .claude/agent-memory-local/ (fără nume, sume sau tarife în repo). Rol propus: Ofertare și clienți (ECHIPA.md).
- 2026-11-17: repo-ul privat BEMORE-STUDIO (D-050) e creat de Alex (era public, l-am făcut privat cu acordul lui), clonat în privat/. Clona folosește doar gh pentru credențiale (osxkeychain dădea 403). Scheletul Change Agility e acolo; brandul și limba sunt de confirmat.
- 2026-11-17: Alex a aprobat D-043 (repo privat pe echipă de business), D-045 (Studio) și D-052 (Head of Learning). Agenți noi: andrei (șeful Studio, raportează lui Tudor), daria, matei, irina (raportează lui Andrei). Repo-ul privat al Studio există deja: BEMORE-STUDIO, în `privat/` (D-050). Wise Teams primește repo privat când pornește I-017.
- 2026-11-17: Alex vrea să vadă la fiecare task sesiunea în care se lucrează. Coloana „Sesiune” în docs/taskuri.md (link claude://claude.ai/epitaxy/<id>); sesiunea mea: „Echipă de agenți pentru brand personal” (local_e5624f6c-…). Panoul o arată cu ⌘.
- 2026-11-17: Design v3 (Ioana, https://claude.ai/artifact/UjPCJ6HDnoiqajzdacDZui): Liquid Glass peste gradient mesh granulat; obiectele metaforice din Planșa + structura lecției din Studio; 4 palete (BEMORE Ive topit, Sora, navy-roz, verde-teal). Alex: D era „prea literar”; îi place esența, nu obiectele.
- 2026-11-17: Alex a ales prima pagină „1 · Sticlă colorată” din design v3.1 („Love it”), cu paleta și fontul Sora (D-054). T-024 (Mike aplică) e deblocat. Încă deschise: Sora peste tot sau + Inter Tight; sage în lecție. Despre: parcursul și formarea de pe vechiul alexandrumolea.github.io/home, plus poza lui (site/static/alex.jpg).
- 2026-11-17: REGULA LUI ALEX pentru Tudor: „Scopul tău este simplificare continuă, structură, vizibilitate ușoară pentru mine pentru lucrurile în paralel.” Fac curățenie după fiecare lucru: nicio informație împrăștiată care nu mai e relevantă, nicio decizie care a devenit irelevantă rămasă deschisă. Documentele înlocuite merg în `arhiva/`; deciziile depășite se închid cu „înlocuită de D-xxx”.
- 2026-11-17: D-057: designul Sora (paleta Sora, Sora la titluri + Inter Tight la text, Liquid Glass) e NOUL BRANDING BEMORE; site-ul lui Alex îl folosește ca owner. Manualul I-022 = manualul BEMORE. T-028 (Ioana, tema curs) deblocat, urgent pentru 23.11. D-056: pe site se văd doar Latest Workshops, Coaching, Despre (restul cu vizibil: false).
- 2026-11-17: Manualul BEMORE gata (I-022): vizual Ioana (https://claude.ai/artifact/Q3MKSq7BRzSp4q4KP4HUtc), poziționare Maria, skill .claude/skills/brand-bemore. T-028 gata: curs/tema/bemore.css (Sora + Inter Tight în fișier, offline). Alex: primul obiectiv (workshop Change Agility, presupun): „Schimbarea convingerii că este normal să fim rezistenți la schimbare.”
- 2026-11-17: Site-ul publicat pe noul branding BEMORE (T-024): Sticlă colorată, Sora + Inter Tight, 3 secțiuni vizibile, semnătura „Alex · Atelier de învățare”. Rămân: T-033 test pe telefon real, T-034 Lighthouse, T-035 rezerva fără WebGL.
- 2026-11-17: Publicat: obiectele 3D după schițele Ioanei (disc cu inel, cupolă, lentila Despre, cub, plăci, discuri) și poza lentilă pe Despre (D-060). T-036 (Ioana: nuanța lentilei, mărimea plăcilor) rămâne.
- 2026-11-17: Pagina cursului online pe site + butonul „Trimite spre site” sunt AMÂNATE de Alex („nu e gata cursul”). Specificația e pregătită (șablonul lesson() al Ioanei, D-056 noindex, PR aprobat de Alex). O pornim când conținutul e gata.
- 2026-11-18: Bug raportat de Alex: la prima încărcare clipea desenul de rezervă (orbitele mov) până se încărca scena, pentru că „no-js” se scotea abia în scena.js. Reparat cu script inline în body (hash adăugat în CSP). Lecție: orice rezervă legată de clase setate din JS se verifică la încărcare lentă.
- 2026-11-18: Rama mov raportată de Alex era „pragul” din scena.js (o ramă din designul Spațiu prin care trecea camera la intrare). Scos. Prima mea reparație (no-js) a fost corectă, dar nu era cauza principală. Lecție: când Alex raportează ceva vizual, cer captura înainte să ghicesc.
- 2026-11-18: FEEDBACK ALEX: am pus pachetul Rezultate/Colaborare/Umanitate pe Despre fără să gândesc ansamblul („aruncat în mijloc”). Regulă: orice element vizual nou trece întâi pe la Ioana (compoziția paginii întregi, cum îl elevăm), Alex vede, apoi Mike construiește. Nu mai fac singur schimbări vizuale pe site.
- 2026-11-18: Despre publicat în compoziția A cu Orbita drumului (D-063). Lumina orbitei face o singură trecere până „azi”, haloul respiră doar la hover (WCAG 2.2.2). Rămân: T-038 (Maria, formulări), T-039 (buton global de oprire a mișcării), anul LIFT de la Alex.
- 2026-11-18: Alex despre Despre (D-063): orbita îi place ca idee nouă, dar e prea complexă; golurile dintre secțiuni (~180 px) și cardul de sus gol nu merg. Îi place mult lentila cu poza. Cere altă structură: compactă, primul ecran plin. Ioana face Despre v2 (2–3 variante), apoi Alex alege, apoi Mike.
- 2026-11-18: Echipa = **Learning Studio** (nu „Studio”), D-066. Etapa A a cursului = **Laboratorul**: ~o lună de imersie, cu practicianul (trainerul care livrează; trebuie să fie practician, nu doar curios), researcherul și partenerii de gândire (AI, oameni din publicul țintă, peers). Masa = panoul Laboratorului (numele „Masa” l-am propus noi, nu Alex). Procesul vizual: https://claude.ai/artifact/26Jm98isMEfzt5khrN5qU3 (docs/procese/curs-nou-vizual.html).
- 2026-11-18: Pasul 3 = **Viziune și obiective** (Alex): viziunea e transformarea dorită, clară și simplă; obiectivele duc spre ea. Change Agility are încă doar promisiune [DE CONFIRMAT] + un obiectiv; viziunea e de formulat cu Alex.
- 2026-11-18: Etapele cursului (D-067): A Viziune și obiective ⇄ B Laboratorul (ciclu, se întăresc reciproc) → poarta → C Producția.
- 2026-11-18: D-068: Masa → **Harvest**. Etape: A Viziune ⇄ B Laborator (final: harvest) → C Harvest/Curate/Flow (final: firul roșu) → poarta (Alex aprobă firul roșu) → D Producția. Fișierul rămâne masa.yml.
- 2026-11-18: Despre v2 LIVE (D-069): orbita în jurul lentilei, cărțile ca pe vechiul site (cuvântul pe carte, rotație continuă, fără pauză proprie, cerut de Alex), butonul global „Oprește mișcarea” (site/src/miscare.js, clasa still). Roluri D-064: Wise Teams fondator din 2025, BEMORE LS continuă, LIFT din 2025. LECȚIE: nu înlocui un element dinamic care i-a plăcut lui Alex cu unul static ca să „simplifici”; simplificarea e la structură și spații, nu la mișcare.
- 2026-11-18: D-069: ziua = 9:30–11:00, pauză, 11:15–12:45, prânz 12:45–13:45, 13:45–15:15, pauză, 15:30–17:30 (blocuri 90/90/90/120).
