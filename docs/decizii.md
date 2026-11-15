# Jurnalul deciziilor

> **DRI:** Tudor. Alex aprobă sau respinge deciziile din pagina echipei (secțiunea „Decizii de luat”), iar Tudor trece aici verdictul și notițele.
> Procesul: [procese/decizii.md](procese/decizii.md).

**Statusuri:**
- **de luat:** Alex trebuie să aleagă
- **de confirmat de Alex:** propunere a echipei, așteaptă un da sau un nu
- **activ:** decis și în vigoare
- **aprobată de Alex** / **respinsă de Alex:** cu data și notița lui
- **de discutat:** Alex vrea să vorbim întâi

| ID | Dată | Decizie | De ce | Cine propune / decide | Status | Document |
|---|---|---|---|---|---|---|
| D-001 | 2026-11-15 | Tudor = sesiunea principală, ceilalți = subagenți | Subagenții nu pot delega mai departe; coordonatorul trebuie să fie sesiunea principală | Tudor (propunere) | de confirmat de Alex | CLAUDE.md |
| D-002 | 2026-11-15 | Memoria agenților în `.claude/agent-memory/` (în git) | Mecanismul nativ Claude Code, versionat și vizibil | Tudor | activ | team/tudor/documente/research-2026-11-kickoff-skills.md |
| D-003 | 2026-11-15 | Emailuri, evenimente și `git push` cer mereu confirmare | Nimic nu pleacă în lume fără Alex | Tudor | activ | .claude/settings.json |
| D-004 | 2026-11-15 | Liquid Glass doar pe navigare și carduri, nu pe text lung | Contrast și performanță (vezi research kickoff) | Ioana / Tudor | de confirmat de Alex | team/tudor/documente/research-2026-11-kickoff-skills.md |
| D-005 | 2026-11-15 | Stack propus: Astro + Markdown + Vercel/Netlify + Cal.com | Rapid, ieftin, ușor de actualizat | Radu / Mike | de confirmat de Alex | team/radu/documente/arhitectura-v1.md |
| D-006 | 2026-11-15 | Arhitectura v1: strat de descoperire cu 4 mecanisme (banda „Nou” sub cardurile de intenție, recomandări din etichete de nevoie după CTA, vitrina `/creatii` cu filtru pe nevoie, abonare la lansări). Un fișier per invenție în `content/lansari/` (înlocuiește `content/tools/`). Taxonomie de 8 nevoi în `content/nevoi.yml`. Diagnosticul de 3 întrebări și ideea săptămânii amânate | Obiectivul 2 din charter fără să lungească niciun drum de intenție; zero întreținere manuală pe bandă, vitrină și recomandări (vezi `team/radu/documente/arhitectura-v1.md`) | Radu | de confirmat de Alex | team/radu/documente/arhitectura-v1.md |
| D-007 | 2026-11-15 | **Reconciliere Tudor, nume:** în meniu rămâne eticheta clară „Tools și cursuri” (Radu). Pagina se numește „Atelier” cu subtitlul Mariei, adresa devine `/atelier` (în loc de `/creatii`), iar banda se numește „Nou în atelier” | Meniul vorbește pe limba vizitatorului, iar numele de brand trăiește în pagină. Așa evităm confuzia cu BEMORE Learning Studio | Tudor (Maria + Radu) | de confirmat de Alex | team/maria/documente/inspiratie-v0.md |
| D-008 | 2026-11-15 | **Reconciliere Tudor, câmpuri:** lista lui Radu e cea oficială. Câmpurile Ioanei se mapează: `nume`→`titlu`, `nevoie`→`nevoi`, `alt`→`imagine_alt`, `cta_text`→`buton`, `nota_alex`→`de_ce`. Se adaugă opțional `efort` (ex.: „5 minute”, „4 săptămâni”), cerut de cardul Ioanei | Un singur model de conținut, ca Mike să nu primească două specificații | Tudor | de confirmat de Alex | team/radu/documente/arhitectura-v1.md |
| D-009 | 2026-11-15 | **Reconciliere Tudor, cât timp e ceva „nou”:** o singură setare, `zile_nou`. Pornește la 90 de zile (Radu), cât lansările sunt rare, și scade la 30 (Ioana) când Alex lansează lunar | Radu și Ioana propuseseră valori diferite. Valoarea corectă depinde de ritmul lansărilor | Tudor | de confirmat de Alex | team/radu/documente/arhitectura-v1.md |
| D-010 | 2026-11-15 | **Reconciliere Tudor, diagnostic:** în v1 intră doar rândul „Ce te frământă acum?”, adică filtrul cu zero întrebări. Designul Ioanei pentru diagnosticul de 3 întrebări e păstrat pentru când avem cel puțin 8 lansări | Fără destule invenții, un quiz e un ocol (Radu) | Tudor | de confirmat de Alex | team/ioana/documente/descoperire-v0.md |
| D-011 | 2026-11-15 | Sticla implicită trebuie să treacă singură contrastul AA, fără să se bazeze pe fallback, pentru că Safari nu suportă `prefers-reduced-transparency` | Verificat pe caniuse de Ioana | Ioana | de confirmat de Alex | team/ioana/documente/descoperire-v0.md |
| D-012 | 2026-11-15 | Repo-ul AgentsTeam rămâne **public**. Totul e la vedere, cu excepțiile din `docs/procese/ce-iese-public.md` | Alex vrea ca lumea să vadă cum s-a organizat (ideea I-001) | Alex | activ | docs/procese/ce-iese-public.md |
| D-013 | 2026-11-15 | Structură în stil Mochary: arii de responsabilitate cu DRI și backup (`docs/aor.md`), procese scrise (`docs/procese/`), lista de idei cu DRI (`docs/idei.md`) | Fiecare lucru are un singur responsabil și nimic nu rămâne doar în capul cuiva | Alex (cerință), Tudor (structură) | activ | docs/aor.md |
| D-014 | 2026-11-15 | Fiecare agent își ține documentele în `team/<nume>/documente/`, iar rapoartele lui Tudor în `team/tudor/rapoarte/` | Fiecare agent are documentele lui, vizibile într-un singur loc | Alex | activ | ECHIPA.md |
| D-015 | 2026-11-15 | Lista de idei e deținută de Tudor (DRI), cu Radu ca backup | Alex trebuie să-și spună ideea o singură dată, unui singur om. Tudor o redirecționează către DRI-ul potrivit | Tudor | de confirmat de Alex | docs/idei.md |
| D-016 | 2026-11-15 | Direcția vizuală pentru site: **A. Galerie calmă** (recomandarea Ioanei, cu statusurile din B) sau **B. Laborator viu** | Stabilește cum arată descoperirea și Atelierul | Ioana | de luat | team/ioana/documente/mock-descoperire.html |
| D-017 | 2026-11-15 | Numele vitrinei de invenții: **Atelier**, cu banda **Nou în atelier** | Numele trăiește în pagină. În meniu rămâne „Tools și cursuri” | Maria | de luat | team/maria/documente/inspiratie-v0.md |
| D-018 | 2026-11-15 | Cele 8 nevoi după care se filtrează tot: claritate, focus, obiceiuri, carieră, comunicare, leadership, echipă, dezvoltarea oamenilor | Pe ele se bazează recomandările și Atelierul. Scrie în notițe ce lipsește sau ce redenumim | Radu | de luat | team/radu/documente/arhitectura-v1.md |
| D-019 | 2026-11-15 | Numele agenților propuși: **Ioana** (designer), **Radu** (arhitect), **Victor** (impresar), **Elena** (coach extern) | Ai dat nume doar lui Tudor, Sofia, Mike și Maria. Scrie în notițe alte nume, dacă vrei | Tudor | de luat | ECHIPA.md |
| D-020 | 2026-11-15 | Interpretarea inspirației: **constructorul care îți pune unealta în mână** (o posibilitate nouă + un pas concret) | E fundația tonului pentru tot site-ul | Maria | de luat | team/maria/documente/inspiratie-v0.md |
| D-021 | 2026-11-15 | I-001: pagina publică despre echipă arată **organigrama, procesele și lecțiile**, dar nu memoria și scorecard-urile | Cât de mult deschidem din sistem. Scrie în notițe dacă vrei totul la vedere | Tudor | de luat | team/tudor/documente/idee-I-001-echipa-la-vedere.md |
| D-022 | 2026-11-15 | Commit-urile folosesc adresa anonimă de la GitHub în loc de Gmail, înainte de primul push | Repo-ul e public, iar adresa din commit-uri devine vizibilă | Tudor | de luat | docs/procese/ce-iese-public.md |
