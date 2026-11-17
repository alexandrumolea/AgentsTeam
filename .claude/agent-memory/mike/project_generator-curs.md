---
name: project-generator-curs
description: Generatorul de curs din curs/ (T-022, 2026-11-17): cum merge modul Prezintă din file://, ce e verificat, ce lipsește până la 23 noiembrie
metadata:
  type: project
---
Adăugat: 2026-11-17

2026-11-17: Mike deține `curs/` (generatorul de curs, D-048–D-051). Conținutul real stă în `privat/cursuri/` (gitignored, D-050); în repo doar codul și `exemple/change-agility-exemplu` [EXEMPLU]. `site/` nu se atinge (exportul ajunge pe site prin PR separat).
**Why:** repo public; workshop-urile din 23 și 25.11 (D-044) sunt prioritatea nr. 1.
**How to apply:** orice schimbare de format trece prin `npm test` și `npm run test:chrome` din `curs/`.

2026-11-17: Prezintă din file:// = același HTML deschis cu `#sala` + postMessage. Scrierea directă într-o fereastră about:blank merge în Chrome până la primul refresh al ecranului de comandă: Chrome dă fiecărei încărcări file:// altă origine opacă, iar fereastra veche devine străină (nici navigarea ei la about:blank nu ajută). `window.open('', nume)` întoarce fereastra existentă fără s-o reîncarce: o refolosim, ca să rămână fullscreen pe proiector.
**Why:** criteriul lui Radu: dublu-click, mod avion, laptopul lui Alex.

2026-11-17: Safari nu se poate automatiza aici: safaridriver cere „Allow remote automation” (setare pe care n-o schimb eu). Testul Safari e la Alex, sau el activează setarea și scriu testul WebDriver.
2026-11-17: La tipar (Chrome --print-to-pdf), elementele mari cu transform: scale ies tăiate/negre; pentru previzualizări statice folosesc `zoom`. PDF-urile le verific cu PDFKit printr-un script swift (pdftoppm nu e instalat).
2026-11-17: I-021 făcut (format: secțiunea 1.8 la Radu): `exercitii/<id>.md`, agenda în ediție, `sari_peste` respins. Totul pleacă din `c.agenda` + `desfasoara(r)` (exercițiile puse la `::exercitii`). Exportul = o ediție. Meniul live de schimbare a exercițiului l-am amânat după 23: orele și vederile statice se calculează la build, iar o schimbare în browser ar fi cerut același calcul și acolo. Pentru 23: editezi agenda și rulezi build-ul. Drag and drop: după 23. Vezi [[project-tema-culori]].
