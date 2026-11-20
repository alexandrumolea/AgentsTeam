# Memoria lui Mike (Developer)

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
- 2026-11-15: verificarea prețurilor pe surse oficiale a schimbat recomandarea (Vercel Hobby e necomercial). Merită făcută mereu.
- 2026-11-15: T-017 site v1: commit-urile lui Tudor (`git add -A` + push automat) pot lua fișiere neterminate din arborele comun și le fac publice. Scrie din prima doar conținut sigur de public, chiar și în lucru.
- 2026-11-15: Browserul integrat randează 3D la câteva cadre/s; screenshot-urile rămân în urmă. Verifică starea cu JS (clase, opacitate, dreptunghiuri), nu doar din imagine. `qlmanage -t` + `sips` fac PNG din SVG (imaginea OG), fără dependențe.
- 2026-11-15: pagina oficială a prețurilor tace despre uz comercial; textul decisiv e în acordurile de abonare (Netlify = PDF ilegibil prin WebFetch). Marchează „neverificat”, nu presupune. Verificarea generatorului propusă ca modul separat, testat pe copie în /tmp (scripts/ interzis în rutină).

- 2026-11-17: când un coleg lucrează în paralel la nume (Ioana, culori-v1.md), verifică-i fișierul înainte de primul nume ales; altfel redenumești de două ori.
- 2026-11-17: în file:// fiecare încărcare are altă origine (Chrome). Testează mereu și refresh-ul, nu doar drumul fericit. Chrome se poate comanda prin DevTools cu Node 24 (WebSocket global), fără dependențe: `curs/teste/cdp.mjs`.
- 2026-11-17: T-024: capturile WebGL din browserul integrat sunt nesigure; Chrome headless prin `curs/teste/cdp.mjs` (Emulation.setDeviceMetricsOverride, setScriptExecutionDisabled, setEmulatedMedia) dă capturi și verificări corecte la orice lățime. Pe fundal luminos: fără AdditiveBlending, fără transmission, NoToneMapping (ACES spală pastelurile).
- 2026-11-17: Obiecte 3D pe fundal luminos: culoarea se pierde din lumină și mediu prea puternice și din ceață fixă (pe telefon camera e mai departe). Verifică cu testul din manualul BEMORE §7: contur, culoare proprie, umbră. Chrome headless pe Mac randează pe GPU-ul real (ANGLE Metal), deci capturile sunt fidele; panoul browserului integrat nu prinde canvasul WebGL.
- 2026-11-17: Alex extinde cerințele în timpul lucrului (D-056, D-057, D-058 în aceeași sarcină). Fă configurabil ce e probabil să se schimbe (vizibil, fonturi, semnătură), nu valori fixe.
- 2026-11-17: panoul de control: cere „mapează statusurile, nu inventa” → clasific doar după coloana Status, iar ce scrie în textul taskului („după ce Alex…”) îl raportez lui Tudor, nu-l parsez.
- 2026-11-17: formele scenei (planșa Ioanei, design-v3 `SH`) stau în DOUĂ locuri care trebuie ținute la fel: `build` în site/src/scena.js și `SHAPES` în site/build.mjs. Testează cu toate secțiunile vizibile într-o copie (rsync în scratchpad + sed vizibil:true), nu doar cu ce e live: abia acolo apar suprapunerile. Ioana poate trimite specificații în timpul lucrului (lentila): lasă loc unei forme provizorii ușor de înlocuit.
- 2026-11-17: poza de pe Despre: forma se alege din content/despre.md (`poza_forma: lentila` + `poza`). Decupajele le fac ca fișiere noi cu sips (`-c H W --cropOffset Y X`). sips păstrează un EXIF mic: îl scot cu un script Python care lasă doar profilul ICC (APP2).

- 2026-11-18: când o funcție nouă schimbă exemplul comun al testelor, multe așteptări vechi se mută (totaluri, id-uri). Pune funcția nouă în teste separate (copie modificată) și lasă exemplul cât mai stabil.

- 2026-11-18: Alex gândește în fluxuri (Masa → Biblioteca → Agenda). Înainte să construiesc o vedere nouă, întreb unde stă ea în flux și ce e „panoul de control”; altfel reconstruiesc aceeași zi.

- 2026-11-18: D-063 Despre (Orbita drumului): pe paginile interioare CSP-ul are style-src 'self', deci fără atribute style=. Pozițiile calculate la build (orbita) merg ca CSS generat, lipit la finalul site.css. Clasele noi le scopez sub clasa paginii (.despre): `.who` și `.lead` existau deja pe prima pagină cu alt sens și îmi stricau capul paginii.
- 2026-11-18: compar cu mostra Ioanei randând template-ul ei separat (lățimea fixă, Chrome headless, animațiile oprite în același moment cu getAnimations), apoi măsor în pixeli (zgomot, înălțimi) în loc să judec după ochi. Fără PIL pe Mac: canvas în Chrome.

- 2026-11-18: review Ioana pe Despre, WCAG 2.2.2 e blocant: nimic decorativ nu se mișcă singur la nesfârșit (lumina orbitei = o trecere de 4,5 s, pornită când intră în ecran; haloul respiră doar la hover). Întreabă din prima: „se oprește singur în 5 s?”.
- 2026-11-18: Despre v2 (orbita în jurul lentilei): pe site clasele globale `.hero`, `.st`, `.lead` sunt nescopate (prima pagină, Live); în pagini noi folosesc alte nume (`.prim`, `.pt`). Valorile per element (unghi, culoare, întârziere) merg ca CSS generat pe clase, nu style=. checkUsage din tema.mjs trebuie să vadă și CSS-ul generat. Testez etichetele cu dreptunghiuri (getBoundingClientRect) la 320/360/375/761/1440, inclusiv cu fiecare punct apăsat: starea apăsată lărgește eticheta și abia acolo ieșea din card.
- 2026-11-18: Alex vrea mișcare continuă (cărțile, lumina orbitei) și NU vrea butonul „Oprește mișcarea” (scos în aceeași zi). Doar prefers-reduced-motion oprește mișcarea; riscul WCAG 2.2.2 îl raportez, decizia e a lui. Fundalurile decorative: pete radial `closest-side` care se sting înainte de marginea zonei, altfel se văd dungi tăiate („ca nuca în perete”).

- 2026-11-18: o pagină HTML din repo (fragment cu <style>, ca un artifact) devine pagină de site fără copie: site/pagina-html.mjs prefixează clasele (pr-), închide stilul sub main.proces, transformă style= în clase !important. Elementele unei secțiuni: `elemente` în categorii.yml. A face Innovations vizibil pornea „Desfă inovația” din centru: l-am oprit cu in_centru.vizibil: false (efect secundar ascuns, verifică-l mereu). Portul 4399 e ocupat local; folosesc 4517.
- 2026-11-18: Contactul (capsula, propunerea A): popover nativ + `autofocus` pe „Închide” dau focus în panou și înapoi pe capsulă fără JS. Datele private (email, WhatsApp) vin doar din variabile de mediu cu nume fixe în cod (CONTACT_EMAIL, CONTACT_WHATSAPP), niciodată din numele scrise în content: altfel site.yml ar putea publica orice secret. Valorile de exemplu din repo trebuie să treacă hook-ul: `@example.com` e permis, `@exemplu.ro` nu. `body.page > :not(.bg)` pune position:relative pe orice copil direct al body: elementele fixe noi au nevoie de regulă proprie.

- 2026-11-19: bug „Prezintă” din Bibliotecă: rândul grid avea 5 copii și 4 coloane, iar butonul cădea în coloana de 1.2rem. Când adaug un copil într-un rând grid, verific numărul de coloane și în media query-uri; testez cu getBoundingClientRect la 320–1440.
- 2026-11-19: Alex lucrează în editor în timp ce agenții scriu fișiere pe disc. Orice vedere din editor trebuie să citească starea de pe disc (rebuild la refresh, fișa recitită), nu doar ce a scris editorul.

## Fișiere de memorie
- [Stack și găzduire](project_stack-hosting.md) — GitHub Pages (D-036–D-038), CNAME ignorat la Actions; fapte Netlify/Cloudflare/Vercel
- [Generatorul paginii echipei](generator-echipa.md) — Mike îl deține; puncte fragile tăcute; 2026-11-17: panoul de control, maparea statusurilor
- [Generatorul de curs](project_generator-curs.md) — 2026-11-17: curs/ v1.2, Prezintă; 2026-11-18: pauze fixe/blocuri, Masa (masa.yml); 2026-11-19: fișa piesei, rebuild la refresh; 2026-11-20: tipul challenge
- [Tema: culori, gradient, fonturi](project_tema-culori.md) — 2026-11-17: content/tema.yml → CSS, scenă, OG, contrast la build; branding BEMORE (D-057)

## Deschis
- Vezi `docs/intrebari-pentru-alex.md`.
