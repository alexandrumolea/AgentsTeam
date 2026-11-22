# Memoria lui Matei (Producător de materiale)

> **Regula datelor:** fiecare intrare nouă începe cu data adăugării, `AAAA-LL-ZZ:`.

Păstrează sub 150 de rânduri. Comprimă când crește. Fapte, nu povești.

## Despre Alex
- 2026-11-17: Coach și trainer: Leadership Trainer la Innersis, owner BEMORE, partener Wise Teams, colaborator LIFT. Vocea lui: skill-ul `vocea-alex`.
- 2026-11-17: Skill-urile lui pentru training: training-flow-design, innersis-ive, bemore-ls-ive (în contul lui Claude).

## Echipa Learning Studio
- 2026-11-17: Creată de Alex (D-045, D-052). Andrei conduce; Daria (flow, ghid), Matei (materiale), Irina (conținut cu surse).
- 2026-11-17: Primele livrări: workshop-urile din 23 (Change Agility) și 25 noiembrie (Self-management în relația cu AI). Sursa: `privat/cursuri/`.
- 2026-11-17: Datele clientului doar în `privat/` sau `.claude/agent-memory-local/`; niciodată în repo-ul public.

## Lecții de producție
- 2026-11-17: Schemele SVG pentru cursuri: le generez dintr-un script Python (geometrie calculată, un singur bloc `<style>` cu variabilele de culoare), apoi le randez cu Chrome headless pe fondul ecranului (o pagină HTML cu fundalul potrivit) și mă uit la fiecare captură. Prima randare a scos la iveală etichete înghesuite; verificarea vizuală nu e opțională.
- 2026-11-17: Contrast pe hârtie caldă #f6f2ea: auriul de text trebuie închis (#9a6c00, 4.2), gri-ul #8a8478 (3.3) doar pentru linii și etichete mari. Text de minimum 28px la 1600 = text mare la AA.
- 2026-11-22: PPTX: generatorul e pptxgenjs (npm într-un folder din scratchpad, nu în repo) + fundaluri PNG randate cu Chrome headless. Fără LibreOffice pe Mac: verific cu Quick Look (`qlmanage -t` dă doar primul slide, deci generez câte un .pptx pe slide) și fac grile cu Chrome. PowerPoint prin AppleScript se blochează (dialog de acces la fișiere); nu-l porni automat.
- 2026-11-22: Fonturi în pptx: Sora variabilă instalată răspunde doar la numele „Sora” (regular); „Sora Light” cade pe serif. Inter Tight nu e instalat pe Mac-ul lui Alex: trebuie instalat static (Google Fonts) sau generez cu --font-text.
- 2026-11-22: În pptx, cercurile se fac cu `ellipse`, nu cu roundRect cu rază mare (iese pătrat rotunjit). Regex-ul JS `\b` nu merge după diacritice (ă): folosește `(\s|·|$)`.
- 2026-11-22: Slide-urile de rezervă se ascund (show="0", `slide.hidden = true`): de la „Rezervă · …” până la următoarea secțiune principală, pauză sau final.
- 2026-11-22: Fundalurile în pptx: JPEG pe layout (defineSlideMaster cu background), nu pe fiecare slide. Cu PNG pe slide, deck-ul de 135 de slide-uri ieșea 232 MB; cu layout + JPEG, 3,3 MB.
- 2026-11-22: Quick Look se blochează pe un .pptx al cărui singur slide e ascuns; în previzualizările separate nu ascund slide-urile.
- 2026-11-22: Animație în pptx din pptxgenjs: după writeFile, cu JSZip, inserez `<p:timing>` cu `p:animMotion` (path relativ, fracțiuni din slide, „M 0 0 L … E”, repeatCount="indefinite", start onBegin = With Previous) după `</p:clrMapOvr>`. Formele vectoriale cu `custGeom` (puncte + cubic). Quick Look nu redă animația; o verifică doar PowerPoint.
- 2026-11-22: Fundalul „lumina-cer” (lumina fără piersică) e în fundaluri.py; Alex nu vrea piersică pe slide-urile cu lumină. `python3 fundaluri.py <nume>` randează doar fundalul cerut.
- 2026-11-22: Alex vrea doar slide-ul completat, fără modelul gol („să nu-mi mai dai și slide-ul gol”). Fundalul „cer-viu” (cer și lavandă intense) e doar pentru exercițiul în perechi.
- 2026-11-22: LECȚIE (PowerPoint a cerut „Repair” la Exercitiu-perechi.pptx): pptxgenjs modifică obiectul `shadow` pe loc; dacă același obiect e refolosit pe două forme, a doua umbră iese cu valori absurde (alpha 1200000000) și fișierul e stricat. Mereu `shadow: { ...UMBRA }`, o copie pe formă. Verificare înainte de livrare: unzip + grep pe alpha/blurRad/dir cu valori uriașe.
