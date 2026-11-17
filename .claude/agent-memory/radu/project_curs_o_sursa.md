---
name: project-curs-o-sursa
description: Modelul pentru cursuri/workshop-uri (Change Agility, 23.11): o sursă = un fișier pe modul, trei ieșiri (curs participanți, material trainer, schiță); Excel = output; sursa privată
metadata:
  type: project
---
Adăugat: 2026-11-17

2026-11-17: Propunere v0 în `team/radu/documente/arhitectura-curs-change-agility-v0.md`, nimic construit, 4 decizii la Alex.
- Curs (reutilizabil, fără client) vs. Ediție (o livrare: dată, ora start, `nume_interzise`; privat).
- Modul = Markdown cu antet (`id`, `durata`, `tip` = lumile Ive, `ancora`, `schita` max 3×8 cuvinte). Blocuri `:::trainer` / `:::participant`; bloc necunoscut sau neînchis = build oprit.
- Flow-ul Excel (training-flow-design) = design inițial, importat o dată, apoi doar ieșire. Slide-urile = ieșire la cerere.
- Site: build.mjs primește doar exportul pentru participanți (`content/cursuri/<slug>.json`) prin PR; `/cursuri/<slug>/`; `public: nu/link/da`. Curs în Innovations, ediția în Latest Workshops.
- Recomandat: varianta B (sursa în repo privat Studio, curs public generic, nelistat pentru 23). Material trainer = HTML offline + PDF pe Drive, vederi Ziua/Modul/Schiță.

2026-11-17 (v1): materialul trainerului e și prezentarea: mod Prezintă cu două ferestre (sală + comandă cu note, timp, schiță), offline din fișier. Straturi noi `:::sala` (doar ecranul din sală, un bloc = un ecran, `cronometru=N`) și `:::sala-si-curs`. Stilul Ive devine temă a ecranelor; PPTX doar la cerere sau ca plan B vineri 20.

2026-11-17 (v1.1): D-048–D-051 aprobate. Banca de exerciții (I-021, doar formatul): `exercitii/<id>.md`; modulul are `exercitii.implicite/alternative` și linia `::exercitii`; ediția are `agenda` (module, `pauza: N`, exerciții alese) = sursa agendei; `durata` modulului fără exerciții. Online = doar exercițiile ediției publicate. Drag and drop după 23.

2026-11-17 (v1.2, propunere 1.9): piesa = unitatea de bază (tip: teorie/model/poveste · exercitiu/reflectie/energizant · deschidere/inchidere/mesaj). Piese locale `piese/` acum, `comun/<id>` din `privat/piese/` după 25. Modulul = secvență subțire (titlu, ancora, schita, `piese.implicite/alternative`, `::piese`). Agenda: modul, piesă singură sau pauză; id-uri unice în curs. Mike: 4–6 h, termen Mi 18 seara, altfel îngheț v1.1.

**Why:** Alex (2026-11-17) vrea ca o modificare în materialul trainerului să schimbe și cursul participanților; GitHub Pages nu are parole; repo-ul e public.
**How to apply:** Pentru 25.11 (Self-management cu AI) și orice curs nou: același format, folder nou, fără cod. Actualizează după deciziile lui Alex. Taskuri: T-022 (Mike), T-023 (Ioana). Vezi [[project-arhitectura-v2]].
