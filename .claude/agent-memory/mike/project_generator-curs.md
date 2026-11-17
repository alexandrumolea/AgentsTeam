---
name: project-generator-curs
description: Generatorul de curs din curs/ (T-022, 2026-11-17, v1.2 piese D-053): cum merge Prezintă din file://, modelul piese/agenda, ce e verificat, ce lipsește până la 23
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

2026-11-17: v1.2 (D-053, 1.9 la Radu): unitatea e piesa (`piese/<id>.md`), modulul e secvență cu titlu (`piese: {implicite, alternative}`, `::piese`, durata poate fi 0). Agenda: modul, piesă singură (id simplu; id-uri unice în tot cursul) sau `pauza: N`. Pauza e și piesă (tip pauza, familia punte). `c.total` ține totalul zilei și cât rămâne. Cuvintele vechi (`exercitii`, `::exercitii`, `exercitii/`, `sari_peste`) opresc build-ul cu mesaj de migrare. Biblioteca (fosta Bancă) e UX-ul Ioanei: îi păstrez structura (details.ex, chip-uri, data-*), adaug doar date.
2026-11-17: Fals pozitiv reparat: verificarea „notă de trainer în export” prindea titlurile pieselor pomenite în note. Titlurile modulelor și pieselor sunt excluse (sunt publice).
2026-11-17: Obiectivele zilei (Alex): `obiective` în curs.yml, ediția le înlocuiește; bife în localStorage după text (cheie slug+data+`:obiective`), niciodată în sală; după click, bifa face blur, ca Spațiul de la telecomandă să nu debifeze. Depășirea zilei e avertisment, nu eroare (Tudor, 476eb32, la cererea lui Alex).
2026-11-17: Etichete (Alex): `etichete` pe piese/module, cheie = normal() (fără majuscule/diacritice), afișez prima formă; c.etichete cu numărul de piese; nu intră în sală/export (cheia `etichete` e și în lista interzisă a exportului). Daria scrie piese reale în privat/ cu etichete: nu le ating.
2026-11-17: T-031: temele dau doar tokeni (`--font`, `--font-titlu`, greutăți, `--cronometru-panou-*`); regulile stau în stil.css. Imaginile din sală: `.ecran-continut:has(img)` coloană flex cu min-height 0, `p.doar-imagine` (randare.mjs, doar pe ecranele din sală) ia spațiul rămas. Test: `teste/chrome-imagini.mjs`.
2026-11-17: 1.10 mută/ascunde ecrane: `pregatesteEcrane(c)` (trainer.mjs) dă id-uri și aplică `ecrane:` din ediție; build-ul oprește la id greșit. În browser: TOATE (ordinea ediției) → ECRANE (ordine locală, fără ascunse); sala primește `id`, nu index; `st.id` ține ecranul curent. „Copiază pentru ediție” scrie mutări minime (LIS pe `nat`). Am ales: piesa cu toate ecranele ascunse rămâne în total, cu avertisment.
2026-11-17: 1.11 editor local: `curs/editor.mjs` + `lib/editor-sursa.mjs` (găsește blocul după `id#n`/`id#notaN`, numărul vine din `s.nr` pus în sursa.mjs) + `lib/editor-client.js`/`editor.css` injectate doar la servire. Build eșuat după salvare → fișierul revine. Pagina cursului online pe site (A) și „Trimite spre site” (B) au fost ANULATE de Alex (2026-11-17): cursul nu e gata.
