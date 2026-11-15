# Panoul de taskuri al echipei

> **DRI:** Tudor. Orice agent poate adăuga taskuri pentru alt agent sau pentru el însuși. Tudor le triază și le deleagă.
> Procesul și nivelurile de autonomie: [procese/initiativa.md](procese/initiativa.md).

**Statusuri:**
- **nou:** propus, netriat
- **de făcut:** aprobat de Tudor, intră la următoarea rulare
- **în lucru**
- **gata:** cu link la rezultat
- **blocat:** spune de ce și de cine depinde
- **la Alex:** cere o decizie, a intrat în panoul „Decizii de luat”
- **anulat:** cu motiv

**Nivel:**
- **1** = fac și raportez
- **2** = propun și aștept
- **3** = doar Alex

| ID | Data | De la | Pentru | Task | De ce | Nivel | Status | Rezultat |
|---|---|---|---|---|---|---|---|---|
| T-001 | 2026-11-15 | Tudor | Ioana | 3 prototipuri vii, orientate spre viitor, după feedbackul „prea banale” | D-016 respinsă de Alex | 1 | gata | [directii-v1.md](../team/ioana/documente/directii-v1.md) |
| T-002 | 2026-11-15 | Mike | Mike | Verificare în generator care avertizează la secțiuni, tabele sau ID-uri schimbate (I-008) | Pagina echipei nu are voie să piardă informații fără să observe nimeni | 1 | gata | [verificare-generator-v0.md](../team/mike/documente/verificare-generator-v0.md) (patch propus; aplicarea în `scripts/` cere sesiune cu drept pe `scripts/`) |
| T-003 | 2026-11-15 | Mike | Mike | Verifică dacă Netlify și Cloudflare Pages permit uz comercial pe planul gratuit și dacă Cal.com Free permite embed | Rămăsese neverificat în stack-tehnic-v0 | 1 | gata | [hosting-uz-comercial-v0.md](../team/mike/documente/hosting-uz-comercial-v0.md) (Netlify: acordul neverificat) |
| T-004 | 2026-11-15 | Tudor | Maria | Propune formatul paginii „Acum” (I-005) | Idee nouă, fără document | 1 | gata | [pagina-acum-v0.md](../team/maria/documente/pagina-acum-v0.md) |
| T-005 | 2026-11-15 | Tudor | Victor | Schița strategiei cărții: întrebările de pus lui Alex și scenarii de subiect, marcate ca ipoteze (I-003) | Cartea nu are încă niciun document | 1 | gata | [strategia-cartii-v0.md](../team/victor/documente/strategia-cartii-v0.md) |
| T-006 | 2026-11-15 | Ioana | Maria | După alegerea lui Alex (D-023), actualizează secțiunea de estetică din `vocea-alex`, care spune încă „Liquid Glass, calm” | Contradicție între profilul lui Alex și noua direcție | 1 | gata | [vocea-alex/SKILL.md](../.claude/skills/vocea-alex/SKILL.md) (secțiunea „Esteticul vizual”) |
| T-007 | 2026-11-15 | Tudor | Tudor | Research: ce roluri și skill-uri are nevoie o echipă de agenți care ajută la conducerea unui business cu mai multe linii (I-009). Propunere pentru Alex | Scop extins (D-024) | 1 | de făcut | – |
| T-008 | 2026-11-15 | Maria | Radu | Integrează în `arhitectura-v2.md` numele din D-025 (Atelierul = tot spațiul; Invenții, Învață, Live, Ce m-a crescut, Jurnalul atelierului). Decide dacă Live și pagina „Acum” (I-005) sunt o singură pagină și unde stau poveștile. Revezi D-007 (`/atelier`, meniul „Tools și cursuri”) | Numele s-au schimbat odată cu direcția Spațiu; structura e a lui Radu | 1 | gata | [arhitectura-v2.md](../team/radu/documente/arhitectura-v2.md), secțiunea 1.4 (D-028) |
| T-009 | 2026-11-15 | Maria | Mike | Propune filtrul pentru Live și Jurnalul atelierului: apar doar sarcini reale cu sursă în repo, fără nume de oameni fără acord, fără clienți, ora doar dacă e reală | Live nu are voie să devină supraveghere sau teatru (secțiunile 3 și 7 din document) | 2 | la Alex (D-032) | [knowledge-si-live-v0.md](../team/maria/documente/knowledge-si-live-v0.md) |
| T-010 | 2026-11-15 | Tudor | Maria | Misiunea lui Alex (D-026): 3 formulări scurte pentru site (hero, Despre, o propoziție), plus cum se leagă de Atelier, Învață și Povești. Cuvintele lui rămân sursa și se citează exact | Misiunea e nouă și trebuie să se vadă pe site | 2 | gata | [misiunea-v0.md](../team/maria/documente/misiunea-v0.md) (D-027, de confirmat de Alex) |
| T-011 | 2026-11-15 | Radu | Mike | După aprobarea D-028: alege cum se împrospătează Live fără deploy al site-ului la fiecare eveniment (cerințele din `arhitectura-v2.md`, 4.5): întârziere de cel mult 15 min după push, fără server, cu variantă de rezervă inclusă la build. Verifică și dacă un deploy pe zi încape în creditele Netlify Free | Un deploy costă 15 din 300 de credite pe lună; un deploy pe zi lucrătoare depășește planul | 2 | la Alex (D-033) | – |
| T-012 | 2026-11-15 | Radu | Ioana | Adaptează scena Spațiu la structura v2: 7 obiecte în două familii (3 drumuri directe + 4 camere), invenția din centru din `straturi`, luminițe doar pentru agenți, varianta fără 3D cu două titluri (`arhitectura-v2.md`, 1.2 și 1.5–1.7) | Prototipul are 6 intenții și activitate simulată; v2 schimbă numărul și cere date reale | 1 | gata | [prototip-v2-spatial.html](../team/ioana/documente/prototip-v2-spatial.html), diferențele în [spatial-v2.md](../team/ioana/documente/spatial-v2.md) |
| T-013 | 2026-11-15 | Tudor | Radu | Adaugă în arhitectura v2 o secțiune scurtă „Pregătit pentru aplicații” (D-030): conținut ca JSON, tokeni de design comuni, PWA ca prim pas, ce rămâne pentru nativ | Alex vrea iOS și Android după site (I-014) | 1 | de făcut | – |
| T-014 | 2026-11-15 | Ioana | Mike | Testează `prototip-v2-spatial.html` pe un Android de gamă medie și pe un iPhone: cadre/s cu Live deschis (ținta ≥ 45), `window.__perf`, mișcare redusă și transparență redusă din setările sistemului | Browserul integrat nu are GPU real, iar mișcarea redusă nu se poate emula acolo | 1 | de făcut | – |
| T-015 | 2026-11-15 | Ioana | Maria | Propoziția „pod” pentru fiecare cameră (Invenții, Live, Ce m-a crescut, Învață), în vocea lui Alex, pentru panoul din spațiu, plus nume pentru cele două familii („Drumuri directe”, „Camerele atelierului”, acum de lucru) | Câmpul `pod` din D-028 e gol în prototip; textele din `misiunea-v0.md` sunt descrieri interne | 1 | de făcut | – |
| T-016 | 2026-11-15 | Tudor | Maria | Alex e un „curious mind”. Decide dacă și unde folosim „pentru curious minds” (publicul, hero-ul, Învață, numele) sau doar ca informație despre el. Legătura cu misiunea: curiozitatea vede din perspective noi | Alex: „Nu eu decid, cred că Maria se ocupă.” | 2 | la Alex (D-034) | – |
| T-017 | 2026-11-15 | Tudor | Mike | Site-ul v1 pe GitHub Pages: direcția Spațiu (prototip-v2), structura v2, doar conținut real, deploy automat la push | D-036: prioritatea nr. 1 | 1 | în lucru | – |
| T-018 | 2026-11-15 | Tudor | Tudor | Activează GitHub Pages, verifică site-ul live și raportează linkul | D-036 | 1 | de făcut | – |
