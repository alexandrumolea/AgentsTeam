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
- 2026-11-17: panoul de control: cere „mapează statusurile, nu inventa” → clasific doar după coloana Status, iar ce scrie în textul taskului („după ce Alex…”) îl raportez lui Tudor, nu-l parsez.

## Fișiere de memorie
- [Stack și găzduire](project_stack-hosting.md) — GitHub Pages (D-036–D-038), CNAME ignorat la Actions; fapte Netlify/Cloudflare/Vercel
- [Generatorul paginii echipei](generator-echipa.md) — Mike îl deține; puncte fragile tăcute; 2026-11-17: panoul de control, maparea statusurilor
- [Generatorul de curs](project_generator-curs.md) — 2026-11-17: curs/ v1.2 (piese, agenda, totaluri); Prezintă prin #sala + postMessage; Safari la Alex
- [Tema: culorile dintr-un loc](project_tema-culori.md) — 2026-11-17: content/tema.yml → CSS, scenă, OG; nume de la Ioana; cum verific „identic”

## Deschis
- Vezi `docs/intrebari-pentru-alex.md`.
